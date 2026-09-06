import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { createGygLogger, logResponse } from "@/lib/gyg/logger";
import type { GygReservationResponse, GygErrorResponse } from "@/lib/gyg/types";

function normalizeTime(t: string | null): string {
  if (!t) return "00:00";
  return t.length > 5 ? t.slice(0, 5) : t;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ctx = createGygLogger("reserve", req);

  const authError = verifyGygAuth(req);
  if (authError) {
    logResponse(ctx, 200, { errorCode: "AUTHORIZATION_FAILURE" }, startTime);
    return authError;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
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
    return NextResponse.json(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required fields: productId, dateTime, bookingItems, gygBookingReference" },
      { status: 200 }
    );
  }

  const supabase = createServiceClient();

  // Look up tour
  const { data: listing } = await supabase
    .from("tour_channel_listings")
    .select("tour_id, tours(*)")
    .eq("external_product_code", requestData.productId)
    .eq("channel", "gyg")
    .eq("is_active", true)
    .single();

  if (!listing?.tours) {
    return NextResponse.json(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${requestData.productId}` },
      { status: 200 }
    );
  }

  const tour = (Array.isArray(listing.tours) ? listing.tours[0] : listing.tours) as {
    id: string;
    capacity: number;
    cutoff_minutes: number;
    product_type: "time_point" | "time_period";
    ticket_type: "individual" | "group";
    group_size_min: number;
    group_size_max: number;
  };

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
        return NextResponse.json(
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
    return NextResponse.json(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Total guest/group count must be greater than 0" },
      { status: 200 }
    );
  }

  // Validate group sizes
  if (isGroup) {
    for (const item of requestData.bookingItems) {
      if (item.category === "GROUP" && item.groupSize) {
        if (item.groupSize < tour.group_size_min) {
          return NextResponse.json(
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
          return NextResponse.json(
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
  }

  // Check capacity (confirmed bookings + active reservations)
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("guest_count")
    .eq("tour_id", tour.id)
    .eq("date", dateStr)
    .eq("start_time", tourStartTime)
    .eq("status", "confirmed");

  const { data: existingReservations } = await supabase
    .from("gyg_reservations")
    .select("booking_items")
    .eq("tour_id", tour.id)
    .eq("date", dateStr)
    .eq("start_time", tourStartTime)
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
    return NextResponse.json(
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
    const reservationExpiration = new Date(Date.now() + (tour.cutoff_minutes ?? 60) * 60 * 1000).toISOString();
    return NextResponse.json(
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
      expires_at: reservationExpiration.toISOString(),
    });

  if (insertError) {
    console.error("[GYG reserve] Insert failed:", insertError.message);
    return NextResponse.json(
      { errorCode: "INTERNAL_SYSTEM_FAILURE", errorMessage: "Failed to create reservation" },
      { status: 200 }
    );
  }

  const response: GygReservationResponse = {
    data: {
      reservationReference,
      reservationExpiration: reservationExpiration.toISOString(),
    },
  };

  logResponse(ctx, 200, response, startTime);
  return NextResponse.json(response, { status: 200 });
}
