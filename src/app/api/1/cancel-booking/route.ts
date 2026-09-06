import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import type { GygEmptySuccessResponse, GygErrorResponse } from "@/lib/gyg/types";

export async function POST(req: NextRequest) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const data = body?.data;

  if (!data?.bookingReference || !data?.gygBookingReference || !data?.productId) {
    return NextResponse.json(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required fields: bookingReference, gygBookingReference, productId" },
      { status: 200 }
    );
  }

  const supabase = createServiceClient();

  // Look up tour
  const { data: listing } = await supabase
    .from("tour_channel_listings")
    .select("tour_id")
    .eq("external_product_code", data.productId)
    .eq("channel", "gyg")
    .eq("is_active", true)
    .single();

  if (!listing) {
    return NextResponse.json(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${data.productId}` },
      { status: 200 }
    );
  }

  // Find booking
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, tour_id, date, start_time, status, guest_count")
    .eq("id", data.bookingReference)
    .eq("tour_id", listing.tour_id)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json(
      { errorCode: "INVALID_BOOKING", errorMessage: "Booking not found" },
      { status: 200 }
    );
  }

  // Check if already cancelled
  if (booking.status === "cancelled") {
    return NextResponse.json(
      { errorCode: "BOOKING_ALREADY_CANCELED", errorMessage: "Booking has already been cancelled" },
      { status: 200 }
    );
  }

  // Check if booking is in the past
  const [y, m, d] = booking.date.split("-").map(Number);
  const startTime = booking.start_time || "00:00";
  const [h, min] = startTime.split(":").map(Number);
  const tourStart = new Date(y, m - 1, d, h, min);
  if (tourStart < new Date()) {
    return NextResponse.json(
      { errorCode: "BOOKING_IN_PAST", errorMessage: "Cannot cancel a booking for a tour that has already taken place" },
      { status: 200 }
    );
  }

  // Cancel booking
  const { error: cancelError } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", booking.id);

  if (cancelError) {
    console.error("[GYG cancel-booking] Cancel failed:", cancelError.message);
    return NextResponse.json(
      { errorCode: "INTERNAL_SYSTEM_FAILURE", errorMessage: "Failed to cancel booking" },
      { status: 200 }
    );
  }

  // Check if we should un-auto-block
  const { data: tour } = await supabase
    .from("tours")
    .select("capacity")
    .eq("id", booking.tour_id)
    .single();

  const { data: remainingBookings } = await supabase
    .from("bookings")
    .select("guest_count")
    .eq("tour_id", booking.tour_id)
    .eq("date", booking.date)
    .eq("start_time", booking.start_time || null)
    .eq("status", "confirmed");

  const totalBooked = (remainingBookings ?? []).reduce(
    (sum, b) => sum + (b.guest_count ?? 0),
    0
  );

  if (tour && totalBooked < tour.capacity) {
    // Find and remove the auto-block if it exists
    const { data: autoBlock } = await supabase
      .from("blocked_dates")
      .select("id, google_calendar_event_id, calendar_id")
      .eq("tour_id", booking.tour_id)
      .eq("date", booking.date)
      .eq("start_time", booking.start_time || null)
      .eq("is_auto_blocked", true)
      .maybeSingle();

    if (autoBlock) {
      if (autoBlock.google_calendar_event_id && autoBlock.calendar_id) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://toursync1.vercel.app";
          await fetch(`${baseUrl}/api/calendar/unblock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tour_id: booking.tour_id,
              date: booking.date,
              start_time: booking.start_time || null,
            }),
          });
        } catch (e) {
          console.error("[GYG cancel-booking] Un-auto-block calendar failed:", e);
        }
      }
    }
  }

  console.log(`[GYG cancel-booking] Booking cancelled: ${booking.id} (${data.gygBookingReference})`);

  const response: GygEmptySuccessResponse = { data: {} };
  return NextResponse.json(response, { status: 200 });
}
