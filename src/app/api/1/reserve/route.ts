import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { createGygLogger, logResponse } from "@/lib/gyg/logger";
import { gygJson } from "@/lib/gyg/response";
import { lookupTourByProductId } from "@/lib/gyg/lookup";
import type { GygReservationResponse, GygErrorResponse } from "@/lib/gyg/types";

function normalizeTime(t: string | null): string {
  if (!t) return "00:00";
  return t.length > 5 ? t.slice(0, 5) : t;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ctx = createGygLogger("reserve", req);

  try {
    return await POST_inner(req, startTime, ctx);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[GYG reserve] Unhandled error:", msg);
    const err = { errorCode: "INTERNAL_SYSTEM_FAILURE" as const, errorMessage: "Internal system failure" };
    logResponse(ctx, 200, err, startTime);
    return gygJson(err, { status: 200 });
  }
}

async function POST_inner(req: NextRequest, startTime: number, ctx: ReturnType<typeof createGygLogger>) {
  const authError = verifyGygAuth(req);
  if (authError) {
    logResponse(ctx, 200, { errorCode: "AUTHORIZATION_FAILURE" }, startTime);
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
  const data = (body as Record<string, unknown>) as { data?: Record<string, unknown> } | undefined;
  const requestData = (data?.data ?? {}) as {
    productId?: string;
    dateTime?: string;
    bookingItems?: Array<{ category: string; count: number; groupSize?: number; retailPrice?: number }>;
    gygBookingReference?: string;
    gygActivityReference?: string;
  };

  if (!requestData.productId || !requestData.dateTime || !requestData.bookingItems || !requestData.gygBookingReference) {
    return gygJson(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required fields: productId, dateTime, bookingItems, gygBookingReference" },
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

  // Validate ticket categories (only if categories are configured for this tour)
  const { data: pricingCategories } = await supabase
    .from("tour_pricing_categories")
    .select("category")
    .eq("tour_id", tour.id);

  const supportedCategories = (pricingCategories ?? []).map((c: { category: string }) => c.category);

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

  // Parse dateTime — extract date and time directly from ISO string (avoid UTC conversion)
  const dateStr = requestData.dateTime.split("T")[0];
  const timePart = requestData.dateTime.split("T")[1]?.split("+")[0]?.split("-")[0] ?? "00:00:00";
  const [h, m] = timePart.split(":");
  const tourStartTime = tour.product_type === "time_period" ? null : `${h}:${m}`;

  // For time_point: validate that the requested dateTime matches an actual schedule slot
  if (tour.product_type === "time_point") {
    const requestDate = new Date(dateStr + "T12:00:00+09:00");
    const dayOfWeek = requestDate.getDay();

    const { data: daySchedules } = await supabase
      .from("tour_schedules")
      .select("start_time")
      .eq("tour_id", tour.id)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);

    const hasSchedule = (daySchedules ?? []).some(
      (s) => normalizeTime(s.start_time) === tourStartTime
    );

    if (!hasSchedule) {
      return gygJson(
        { errorCode: "NO_AVAILABILITY", errorMessage: `No schedule for ${dateStr} at ${tourStartTime}` },
        { status: 200 }
      );
    }
  }

  // Calculate total guests from bookingItems
  // For GROUP: each bookingItem with category "GROUP" has count=1 and groupSize=N
  // For Individual: sum of all count values
  let totalGuests = 0;
  let totalGroups = 0;

  for (const item of requestData.bookingItems) {
    if (item.category === "GROUP") {
      totalGroups += item.count || 0;
      totalGuests += (item.groupSize || 0) * (item.count || 0);
    } else {
      totalGuests += item.count || 0;
    }
  }

  if (totalGuests <= 0 && totalGroups <= 0) {
    return gygJson(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Total guest/group count must be greater than 0" },
      { status: 200 }
    );
  }

  // Validate group sizes
  if (isGroup) {
    for (const item of requestData.bookingItems) {
      if (item.category === "GROUP" && item.groupSize) {
        if (item.groupSize < tour.group_size_min) {
          return gygJson(
            {
              errorCode: "INVALID_PARTICIPANTS_CONFIGURATION",
              errorMessage: `Group size ${item.groupSize} is below minimum ${tour.group_size_min}`,
              participantsConfiguration: { min: tour.group_size_min, max: tour.group_size_max },
              groupConfiguration: { max: Math.floor(tour.capacity / tour.group_size_min) },
            },
            { status: 200 }
          );
        }
        if (item.groupSize > tour.group_size_max) {
          return gygJson(
            {
              errorCode: "INVALID_PARTICIPANTS_CONFIGURATION",
              errorMessage: `Group size ${item.groupSize} exceeds maximum ${tour.group_size_max}`,
              participantsConfiguration: { min: tour.group_size_min, max: tour.group_size_max },
              groupConfiguration: { max: Math.floor(tour.capacity / tour.group_size_min) },
            },
            { status: 200 }
          );
        }
      }
    }
  } else {
    // Validate individual participant count against min/max
    const minParticipants = tour.group_size_min ?? 1;
    const maxParticipants = tour.group_size_max ?? tour.capacity;
    if (totalGuests < minParticipants) {
      return gygJson(
        {
          errorCode: "INVALID_PARTICIPANTS_CONFIGURATION",
          errorMessage: `The activity requires a minimum of ${minParticipants} participants`,
          participantsConfiguration: { min: minParticipants, max: maxParticipants },
        },
        { status: 200 }
      );
    }
    if (totalGuests > maxParticipants) {
      return gygJson(
        {
          errorCode: "INVALID_PARTICIPANTS_CONFIGURATION",
          errorMessage: `The activity cannot be reserved for more than ${maxParticipants} participants`,
          participantsConfiguration: { min: minParticipants, max: maxParticipants },
        },
        { status: 200 }
      );
    }
  }

  // Check capacity (confirmed bookings + active reservations)
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("guest_count")
    .eq("tour_id", tour.id)
    .eq("date", dateStr)
    .is("start_time", tourStartTime)
    .eq("status", "confirmed");

  const { data: existingReservations } = await supabase
    .from("gyg_reservations")
    .select("booking_items")
    .eq("tour_id", tour.id)
    .eq("date", dateStr)
    .is("start_time", tourStartTime)
    .gt("expires_at", new Date().toISOString());

  let totalBooked = (existingBookings ?? []).reduce(
    (sum, b) => sum + (b.guest_count ?? 0),
    0
  );

  for (const r of existingReservations ?? []) {
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
      { errorCode: "NO_AVAILABILITY", errorMessage: `Insufficient availability. Requested: ${totalGuests}, Available: ${Math.max(0, tour.capacity - totalBooked)}` },
      { status: 200 }
    );
  }

  // Check for existing active reservation for this GYG booking reference
  const { data: existingRes } = await supabase
    .from("gyg_reservations")
    .select("id, reservation_reference")
    .eq("gyg_booking_reference", requestData.gygBookingReference)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (existingRes) {
    const reservationExpiration = new Date(Date.now() + (tour.cutoff_minutes ?? 60) * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, "+00:00");
    return gygJson(
      { data: { reservationReference: existingRes.reservation_reference, reservationExpiration } },
      { status: 200 }
    );
  }

  // Create reservation
  const reservationReference = `res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const reservationExpiration = new Date(Date.now() + (tour.cutoff_minutes ?? 60) * 60 * 1000);

  const { error: insertError } = await supabase
    .from("gyg_reservations")
    .insert({
      reservation_reference: reservationReference,
      gyg_booking_reference: requestData.gygBookingReference,
      tour_id: tour.id,
      date: dateStr,
      start_time: tourStartTime,
      product_id: requestData.productId,
      booking_items: requestData.bookingItems,
      expires_at: reservationExpiration.toISOString().replace(/\.\d{3}Z$/, "+00:00"),
    });

  if (insertError) {
    console.error("[GYG reserve] Insert failed:", insertError.message);
    return gygJson(
      { errorCode: "INTERNAL_SYSTEM_FAILURE", errorMessage: "Failed to create reservation" },
      { status: 200 }
    );
  }

  const response: GygReservationResponse = {
    data: {
      reservationReference,
      reservationExpiration: reservationExpiration.toISOString().replace(/\.\d{3}Z$/, "+00:00"),
    },
  };

  logResponse(ctx, 200, response, startTime);
  return gygJson(response, { status: 200 });
}
