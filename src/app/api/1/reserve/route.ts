import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import type { GygReservationResponse, GygErrorResponse } from "@/lib/gyg/types";

function normalizeTime(t: string | null): string {
  if (!t) return "00:00";
  return t.length > 5 ? t.slice(0, 5) : t;
}

export async function POST(req: NextRequest) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const data = body?.data;

  if (!data?.productId || !data?.dateTime || !data?.bookingItems || !data?.gygBookingReference) {
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
    capacity: number;
    cutoff_minutes: number;
    product_type: "time_point" | "time_period";
    ticket_type: "individual" | "group";
    group_size_min: number;
    group_size_max: number;
  };

  const isGroup = tour.ticket_type === "group";

  // Parse dateTime to extract date and start_time
  const dt = new Date(data.dateTime);
  const dateStr = dt.toISOString().split("T")[0];
  const hours = String(dt.getUTCHours() + 9).padStart(2, "0"); // JST offset
  const minutes = String(dt.getUTCMinutes()).padStart(2, "0");
  const startTime = tour.product_type === "time_period" ? null : `${hours}:${minutes}`;

  // Calculate total guests from bookingItems
  // For GROUP: each bookingItem with category "GROUP" has count=1 and groupSize=N
  // For Individual: sum of all count values
  let totalGuests = 0;
  let totalGroups = 0;

  for (const item of data.bookingItems) {
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
    for (const item of data.bookingItems) {
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

  // Check capacity
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
      { errorCode: "NO_AVAILABILITY", errorMessage: `Insufficient availability. Requested: ${totalGuests}, Available: ${Math.max(0, tour.capacity - totalBooked)}` },
      { status: 200 }
    );
  }

  // Check for existing active reservation for this GYG booking reference
  const { data: existingRes } = await supabase
    .from("gyg_reservations")
    .select("id, reservation_reference")
    .eq("gyg_booking_reference", data.gygBookingReference)
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
      gyg_booking_reference: data.gygBookingReference,
      tour_id: tour.id,
      date: dateStr,
      start_time: startTime,
      product_id: data.productId,
      booking_items: data.bookingItems,
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

  return NextResponse.json(response, { status: 200 });
}
