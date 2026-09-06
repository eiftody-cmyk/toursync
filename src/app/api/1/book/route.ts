import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { sendEmail } from "@/lib/email/client";
import { bookingConfirmationEmail } from "@/lib/email/booking-confirmation";
import { operatorNotificationEmail } from "@/lib/email/operator-notification";
import type { GygBookingResponse, GygErrorResponse, GygTicket } from "@/lib/gyg/types";

function normalizeTime(t: string | null): string {
  if (!t) return "00:00";
  return t.length > 5 ? t.slice(0, 5) : t;
}

export async function POST(req: NextRequest) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const data = body?.data;

  if (!data?.productId || !data?.reservationReference || !data?.gygBookingReference ||
      !data?.dateTime || !data?.bookingItems || !data?.travelers) {
    return NextResponse.json(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required fields" },
      { status: 200 }
    );
  }

  const supabase = createServiceClient();

  // Look up tour
  const { data: listing } = await supabase
    .from("tour_channel_listings")
    .select("tour_id, tours(*)")
    .eq("external_product_code", data.productId)
    .eq("channel", "gyg")
    .eq("is_active", true)
    .single();

  if (!listing?.tours || !Array.isArray(listing.tours) || listing.tours.length === 0) {
    return NextResponse.json(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${data.productId}` },
      { status: 200 }
    );
  }

  const tour = listing.tours[0] as {
    id: string;
    user_id: string;
    name: string;
    capacity: number;
    price: number | null;
    currency: string;
    cutoff_minutes: number;
    product_type: "time_point" | "time_period";
    ticket_type: "individual" | "group";
  };

  const isGroup = tour.ticket_type === "group";

  // Check idempotency
  const { data: existingBooking } = await supabase
    .from("bookings")
    .select("id, notes")
    .eq("tour_id", tour.id)
    .eq("source", "gyg")
    .like("notes", `%${data.gygBookingReference}%`)
    .eq("status", "confirmed")
    .maybeSingle();

  if (existingBooking) {
    const tickets = generateTickets(existingBooking.id, data.bookingItems, isGroup);
    return NextResponse.json(
      { data: { bookingReference: existingBooking.id, tickets } },
      { status: 200 }
    );
  }

  // Verify reservation exists and hasn't expired
  const { data: reservation } = await supabase
    .from("gyg_reservations")
    .select("id, expires_at")
    .eq("reservation_reference", data.reservationReference)
    .maybeSingle();

  if (!reservation) {
    return NextResponse.json(
      { errorCode: "INVALID_RESERVATION", errorMessage: "Reservation not found" },
      { status: 200 }
    );
  }

  if (new Date(reservation.expires_at) < new Date()) {
    return NextResponse.json(
      { errorCode: "INVALID_RESERVATION", errorMessage: "Reservation has expired" },
      { status: 200 }
    );
  }

  // Parse dateTime
  const dt = new Date(data.dateTime);
  const dateStr = dt.toISOString().split("T")[0];
  const hours = String(dt.getUTCHours() + 9).padStart(2, "0");
  const minutes = String(dt.getUTCMinutes()).padStart(2, "0");
  const startTime = tour.product_type === "time_period" ? null : `${hours}:${minutes}`;

  // Calculate total guests
  let totalGuests = 0;
  for (const item of data.bookingItems) {
    if (item.category === "GROUP") {
      totalGuests += (item.groupSize || 0) * (item.count || 0);
    } else {
      totalGuests += item.count || 0;
    }
  }

  // Check capacity (belt and suspenders)
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("guest_count")
    .eq("tour_id", tour.id)
    .eq("date", dateStr)
    .eq("start_time", startTime)
    .eq("status", "confirmed");

  const totalBooked = (existingBookings ?? []).reduce(
    (sum, b) => sum + (b.guest_count ?? 0),
    0
  );

  if (totalBooked + totalGuests > tour.capacity) {
    return NextResponse.json(
      { errorCode: "NO_AVAILABILITY", errorMessage: "Insufficient availability at time of booking" },
      { status: 200 }
    );
  }

  // Build customer info from first traveler
  const leadTraveler = data.travelers[0];
  const customerName = leadTraveler
    ? `${leadTraveler.firstName} ${leadTraveler.lastName}`.trim()
    : null;
  const customerEmail = leadTraveler?.email ?? null;

  // Build notes with GYG details
  const notes = JSON.stringify({
    gyg_booking_ref: data.gygBookingReference,
    reservation_ref: data.reservationReference,
    items: data.bookingItems,
    travelers: data.travelers,
    comment: data.comment || "",
    currency: data.currency,
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
    })
    .select("id")
    .single();

  if (insertError || !booking) {
    console.error("[GYG book] Insert failed:", insertError?.message);
    return NextResponse.json(
      { errorCode: "INTERNAL_SYSTEM_FAILURE", errorMessage: "Failed to create booking" },
      { status: 200 }
    );
  }

  // Delete reservation hold
  await supabase
    .from("gyg_reservations")
    .delete()
    .eq("id", reservation.id);

  // Send confirmation email to lead traveler
  if (customerEmail && tour.price) {
    const confirmationEmail = bookingConfirmationEmail({
      tourName: tour.name,
      date: dateStr,
      startTime: startTime ?? "",
      guestCount: totalGuests,
      currency: tour.currency || "JPY",
      pricePerGuest: tour.price,
      bookingId: booking.id,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://toursync1.vercel.app",
    });
    sendEmail({
      to: customerEmail,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
    }).catch((e) => console.error("[GYG book] Confirmation email failed:", e));
  }

  // Send notification email to operator
  const { data: operatorProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", tour.user_id)
    .single();

  if (operatorProfile?.email) {
    const notificationEmail = operatorNotificationEmail({
      operatorEmail: operatorProfile.email,
      tourName: tour.name,
      date: dateStr,
      startTime: startTime ?? "",
      guestCount: totalGuests,
      customerEmail,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://toursync1.vercel.app",
    });
    sendEmail({
      to: notificationEmail.to,
      subject: notificationEmail.subject,
      html: notificationEmail.html,
    }).catch((e) => console.error("[GYG book] Operator notification email failed:", e));
  }

  // Insert in-app notification
  const guestWord = totalGuests === 1 ? "guest" : "guests";
  supabase
    .from("notifications")
    .insert({
      user_id: tour.user_id,
      type: "new_booking",
      title: `New Booking — ${tour.name}`,
      message: isGroup
        ? `${totalGuests} ${guestWord} (${data.bookingItems.filter((i: { category: string }) => i.category === "GROUP").reduce((s: number, i: { count: number }) => s + i.count, 0)} groups) on ${dateStr}${startTime ? ` at ${startTime}` : ""} (via GetYourGuide)`
        : `${totalGuests} ${guestWord} on ${dateStr}${startTime ? ` at ${startTime}` : ""} (via GetYourGuide)`,
      link: "/dashboard",
    })
    .then(({ error: notifError }) => {
      if (notifError) console.error("[GYG book] Notification insert failed:", notifError.message);
    });

  // Check auto-block
  const { data: allBookingsForSlot } = await supabase
    .from("bookings")
    .select("guest_count")
    .eq("tour_id", tour.id)
    .eq("date", dateStr)
    .eq("start_time", startTime)
    .eq("status", "confirmed");

  const totalForSlot = (allBookingsForSlot ?? []).reduce(
    (sum, b) => sum + (b.guest_count ?? 0),
    0
  );

  if (totalForSlot >= tour.capacity) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://toursync1.vercel.app";
    try {
      await fetch(`${baseUrl}/api/calendar/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tour.id,
          date: dateStr,
          start_time: startTime,
          reason: "Full — via GYG booking",
        }),
      });
    } catch (e) {
      console.error("[GYG book] Auto-block failed:", e);
    }
  }

  // Generate tickets
  const tickets = generateTickets(booking.id, data.bookingItems, isGroup);

  console.log(`[GYG book] Booking confirmed: ${booking.id} for ${data.gygBookingReference}`);

  return NextResponse.json(
    { data: { bookingReference: booking.id, tickets } },
    { status: 200 }
  );
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
