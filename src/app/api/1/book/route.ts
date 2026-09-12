import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { sendEmail } from "@/lib/email/client";
import { bookingConfirmationEmail } from "@/lib/email/booking-confirmation";
import { operatorNotificationEmail } from "@/lib/email/operator-notification";
import { createGygLogger, logResponse } from "@/lib/gyg/logger";
import { gygJson } from "@/lib/gyg/response";
import { lookupTourByProductId } from "@/lib/gyg/lookup";
import type { GygBookingResponse, GygErrorResponse, GygTicket } from "@/lib/gyg/types";

function normalizeTime(t: string | null): string {
  if (!t) return "00:00";
  return t.length > 5 ? t.slice(0, 5) : t;
}

// Normalize booking items to a canonical string (jsonb may reorder keys).
function normalizeItems(items: unknown): string {
  if (!Array.isArray(items)) return "";
  return JSON.stringify(
    items.map((it) => {
      const o = it as Record<string, unknown>;
      return {
        category: o.category,
        count: o.count,
        groupSize: o.groupSize ?? null,
        retailPrice: o.retailPrice ?? null,
      };
    })
  );
}

export async function POST(req: NextRequest) {
  const reqStart = Date.now();
  const ctx = createGygLogger("book", req);

  try {
    return await POST_inner(req, reqStart, ctx);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[GYG book] Unhandled error:", msg);
    const err = { errorCode: "INTERNAL_SYSTEM_FAILURE" as const, errorMessage: "Internal system failure" };
    logResponse(ctx, 200, err, reqStart);
    return gygJson(err, { status: 200 });
  }
}

async function POST_inner(req: NextRequest, reqStart: number, ctx: ReturnType<typeof createGygLogger>) {
  const authError = verifyGygAuth(req);
  if (authError) {
    logResponse(ctx, 200, { errorCode: "AUTHORIZATION_FAILURE" }, reqStart);
    return authError;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return gygJson(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Invalid JSON body" },
      { status: 200 }
    );
  }
  const bodyObj = (body ?? {}) as Record<string, unknown>;
  const data = bodyObj.data && typeof bodyObj.data === "object" ? bodyObj.data as Record<string, unknown> : bodyObj;
  const requestData = data as {
    productId?: string;
    reservationReference?: string;
    gygBookingReference?: string;
    gygActivityReference?: string;
    currency?: string;
    dateTime?: string;
    bookingItems?: Array<{ category: string; count: number; retailPrice: number; groupSize?: number }>;
    travelers?: Array<{ firstName: string; lastName: string; email: string; phoneNumber: string }>;
    comment?: string;
    language?: string;
    travelerHotel?: string;
  };

  if (!requestData.productId || !requestData.reservationReference || !requestData.gygBookingReference ||
      !requestData.dateTime || !requestData.bookingItems || !requestData.travelers) {
    return gygJson(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required fields" },
      { status: 200 }
    );
  }

  const supabase = createServiceClient();

  // Look up tour (handles T-1221780 and 1221780)
  const result = await lookupTourByProductId(requestData.productId!);
  if (!result) {
    return gygJson(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${requestData.productId}` },
      { status: 200 }
    );
  }

  const tour = result.tour;

  const isGroup = tour.ticket_type === "group";

  // Parse dateTime early so we can parallelize
  const dateStr = requestData.dateTime.split("T")[0];
  const timePart = requestData.dateTime.split("T")[1]?.split("+")[0]?.split("-")[0] ?? "00:00:00";
  const [h, m] = timePart.split(":");
  const startTime = tour.product_type === "time_period" ? null : `${h}:${m}`;

  // Calculate total guests
  let totalGuests = 0;
  for (const item of requestData.bookingItems) {
    if (item.category === "GROUP") {
      totalGuests += (item.groupSize || 0) * (item.count || 0);
    } else {
      totalGuests += item.count || 0;
    }
  }

  // Parallelize: pricing categories, idempotency check, reservation lookup
  const [pricingResult, existingBookingResult, reservationResult] = await Promise.all([
    supabase.from("tour_pricing_categories").select("category").eq("tour_id", tour.id),
    supabase
      .from("bookings")
      .select("id, date, start_time, guest_count, notes")
      .eq("tour_id", tour.id)
      .eq("source", "gyg")
      .eq("gyg_booking_reference", requestData.gygBookingReference)
      .eq("reservation_reference", requestData.reservationReference)
      .eq("status", "confirmed")
      .maybeSingle(),
    supabase
      .from("gyg_reservations")
      .select("id, expires_at")
      .eq("reservation_reference", requestData.reservationReference)
      .maybeSingle(),
  ]);

  const supportedCategories = (pricingResult.data ?? []).map((c: { category: string }) => c.category);

  if (supportedCategories.length > 0) {
    for (const item of requestData.bookingItems) {
      if (!supportedCategories.includes(item.category)) {
        return gygJson(
          {
            errorCode: "INVALID_TICKET_CATEGORY",
            errorMessage: `The ticket category ${item.category} is not sellable.`,
            ticketCategory: item.category,
          },
          { status: 200 }
        );
      }
    }
  }

  // Exact match: same reservation reference AND same date/time/items →
  // return existing tickets (idempotent retry). If the details differ, fall
  // through to the modification branch instead of silently re-issuing old tickets.
  if (existingBookingResult.data) {
    const existing = existingBookingResult.data;
    let storedItems: Array<Record<string, unknown>> | null = null;
    try {
      const parsed = JSON.parse(existing.notes ?? "null");
      storedItems = Array.isArray(parsed?.items) ? parsed.items : null;
    } catch {
      storedItems = null;
    }

    const sameSlot =
      existing.date === dateStr &&
      normalizeTime(existing.start_time) === normalizeTime(startTime) &&
      (existing.guest_count ?? 0) === totalGuests;

    const sameItems =
      normalizeItems(storedItems) === normalizeItems(requestData.bookingItems);

    if (sameSlot && sameItems) {
      const tickets = generateTickets(existing.id, requestData.bookingItems, isGroup);
      return gygJson(
        { data: { bookingReference: existing.id, tickets } },
        { status: 200 }
      );
    }

    console.log(`[GYG book] Booking ${existing.id} exists but details differ (date/time/items) — treating as modification`);
  }

  // GYG modify flow: same gyg_booking_reference, different reservation_reference
  // Find any existing confirmed booking for this GYG reference and cancel it
  const { data: existingModifyBooking } = await supabase
    .from("bookings")
    .select("id")
    .eq("tour_id", tour.id)
    .eq("source", "gyg")
    .eq("gyg_booking_reference", requestData.gygBookingReference)
    .eq("status", "confirmed")
    .maybeSingle();

  if (existingModifyBooking) {
    console.log(`[GYG book] Modify detected: cancelling old booking ${existingModifyBooking.id} for ${requestData.gygBookingReference}`);
    await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", existingModifyBooking.id);
  }

  const reservation = reservationResult.data;
  if (!reservation) {
    return gygJson(
      { errorCode: "INVALID_RESERVATION", errorMessage: "Reservation not found" },
      { status: 200 }
    );
  }

  if (new Date(reservation.expires_at) < new Date()) {
    return gygJson(
      { errorCode: "INVALID_RESERVATION", errorMessage: "Reservation has expired" },
      { status: 200 }
    );
  }

  // Parallelize: capacity check (bookings + active reservations)
  const [bookingsResult, reservationsResult] = await Promise.all([
    supabase.from("bookings").select("guest_count").eq("tour_id", tour.id).eq("date", dateStr).is("start_time", startTime).eq("status", "confirmed"),
    supabase.from("gyg_reservations").select("booking_items").eq("tour_id", tour.id).eq("date", dateStr).is("start_time", startTime).gt("expires_at", new Date().toISOString()).neq("reservation_reference", requestData.reservationReference),
  ]);

  let totalBooked = (bookingsResult.data ?? []).reduce(
    (sum, b) => sum + (b.guest_count ?? 0),
    0
  );

  for (const r of reservationsResult.data ?? []) {
    const items = r.booking_items as Array<{ category: string; count: number; groupSize?: number }> | null;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.category === "GROUP") {
          totalBooked += (item.groupSize || 0) * (item.count || 0);
        } else {
          totalBooked += item.count || 0;
        }
      }
    }
  }

  if (totalBooked + totalGuests > tour.capacity) {
    return gygJson(
      { errorCode: "NO_AVAILABILITY", errorMessage: "Insufficient availability at time of booking" },
      { status: 200 }
    );
  }

  // Build customer info from first traveler
  const leadTraveler = requestData.travelers[0];
  const customerName = leadTraveler
    ? `${leadTraveler.firstName} ${leadTraveler.lastName}`.trim()
    : null;
  const customerEmail = leadTraveler?.email ?? null;

  // Build notes with GYG details
  const notes = JSON.stringify({
    gyg_booking_ref: requestData.gygBookingReference,
    reservation_ref: requestData.reservationReference,
    items: requestData.bookingItems,
    travelers: requestData.travelers,
    comment: requestData.comment || "",
    currency: requestData.currency,
  });

  // Create booking
  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      tour_id: tour.id,
      user_id: tour.user_id,
      date: dateStr,
      start_time: startTime,
      guest_count: totalGuests,
      source: "gyg",
      customer_name: customerName,
      customer_email: customerEmail,
      status: "confirmed",
      notes,
      gyg_booking_reference: requestData.gygBookingReference,
      reservation_reference: requestData.reservationReference,
    })
    .select("id")
    .single();

  if (insertError || !booking) {
    console.error("[GYG book] Insert failed:", insertError?.message);
    return gygJson(
      { errorCode: "INTERNAL_SYSTEM_FAILURE", errorMessage: "Failed to create booking" },
      { status: 200 }
    );
  }

  // Delete reservation + fetch operator profile in parallel
  const [, operatorProfileResult] = await Promise.all([
    supabase.from("gyg_reservations").delete().eq("id", reservation.id),
    supabase.from("profiles").select("email").eq("id", tour.user_id).single(),
  ]);

  // Send confirmation email to lead traveler (non-blocking)
  if (customerEmail && tour.price) {
    const confirmationEmail = bookingConfirmationEmail({
      tourName: tour.name,
      date: dateStr,
      startTime: startTime ?? "",
      guestCount: totalGuests,
      currency: tour.currency || "JPY",
      pricePerGuest: tour.price,
      bookingId: booking.id,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://osakacastletours.com",
    });
    sendEmail({
      to: customerEmail,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
    }).catch((e) => console.error("[GYG book] Confirmation email failed:", e));
  }

  // Send notification email to operator
  const operatorProfile = operatorProfileResult.data;
  if (operatorProfile?.email) {
    const notificationEmail = operatorNotificationEmail({
      operatorEmail: operatorProfile.email,
      tourName: tour.name,
      date: dateStr,
      startTime: startTime ?? "",
      guestCount: totalGuests,
      customerName,
      customerEmail,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://osakacastletours.com",
    });
    sendEmail({
      to: notificationEmail.to,
      subject: notificationEmail.subject,
      html: notificationEmail.html,
    }).catch((e) => console.error("[GYG book] Operator notification email failed:", e));
  }

  // Insert in-app notification (non-blocking)
  const guestWord = totalGuests === 1 ? "guest" : "guests";
  const isModify = !!existingModifyBooking;
  supabase
    .from("notifications")
    .insert({
      user_id: tour.user_id,
      type: isModify ? "new_booking" : "new_booking",
      title: isModify ? `Booking Modified — ${tour.name}` : `New Booking — ${tour.name}`,
      message: isGroup
        ? `${totalGuests} ${guestWord} (${requestData.bookingItems.filter((i: { category: string }) => i.category === "GROUP").reduce((s: number, i: { count: number }) => s + i.count, 0)} groups) on ${dateStr}${startTime ? ` at ${startTime}` : ""} (via GetYourGuide${isModify ? " — modified" : ""})`
        : `${totalGuests} ${guestWord} on ${dateStr}${startTime ? ` at ${startTime}` : ""} (via GetYourGuide${isModify ? " — modified" : ""})`,
      link: "/dashboard",
    })
    .then(({ error: notifError }) => {
      if (notifError) console.error("[GYG book] Notification insert failed:", notifError.message);
    });

  // Auto-block if slot is now full (totalBooked already includes pre-existing bookings)
  const totalForSlot = totalBooked + totalGuests;
  if (totalForSlot >= tour.capacity) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://osakacastletours.com";
    fetch(`${baseUrl}/api/calendar/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tour_id: tour.id,
        date: dateStr,
        start_time: startTime,
        reason: "Full — via GYG booking",
      }),
    }).catch((e) => {
      console.error("[GYG book] Auto-block failed:", e);
    });
  }

  // Generate tickets
  const tickets = generateTickets(booking.id, requestData.bookingItems, isGroup);

  const responseData = { data: { bookingReference: booking.id, tickets } };
  console.log(`[GYG book] Booking confirmed: ${booking.id} for ${requestData.gygBookingReference}`);

  logResponse(ctx, 200, responseData, reqStart);
  return gygJson(responseData, { status: 200 });
}

function generateTickets(
  bookingId: string,
  bookingItems: Array<{ category: string; count: number; groupSize?: number }>,
  isGroup: boolean
): GygTicket[] {
  if (isGroup) {
    // Return 1 COLLECTIVE ticket per GYG spec
    return [{
      category: "COLLECTIVE",
      ticketCode: `TS-${bookingId.substring(0, 8)}`,
      ticketCodeType: "QR_CODE",
    }];
  }
  // Individual: one ticket per person per category
  const tickets: GygTicket[] = [];
  for (const item of bookingItems) {
    for (let i = 0; i < item.count; i++) {
      tickets.push({
        category: item.category as GygTicket["category"],
        ticketCode: `TS-${bookingId.substring(0, 8)}-${item.category}-${i + 1}`,
        ticketCodeType: "QR_CODE",
      });
    }
  }
  return tickets;
}
