import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { createGygLogger, logResponse } from "@/lib/gyg/logger";
import type { GygEmptySuccessResponse, GygErrorResponse } from "@/lib/gyg/types";

export async function POST(req: NextRequest) {
  const reqStart = Date.now();
  const ctx = createGygLogger("cancel-booking", req);

  const authError = verifyGygAuth(req);
  if (authError) {
    logResponse(ctx, 200, { errorCode: "AUTHORIZATION_FAILURE" }, reqStart);
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
  const requestData = data?.data;

  if (!requestData?.bookingReference || !requestData?.gygBookingReference || !requestData?.productId) {
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
    .eq("external_product_code", requestData.productId)
    .eq("channel", "gyg")
    .eq("is_active", true)
    .single();

  if (!listing) {
    return NextResponse.json(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${requestData.productId}` },
      { status: 200 }
    );
  }

  // Find booking
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, tour_id, date, start_time, status, guest_count")
    .eq("id", requestData.bookingReference)
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

  // Check if booking is in the past (JST-aware)
  const [y, m, d] = booking.date.split("-").map(Number);
  const startTime = booking.start_time || "00:00";
  const [h, min] = startTime.split(":").map(Number);
  const nowInJST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const tourStartInJST = new Date(y, m - 1, d, h, min);
  if (tourStartInJST < nowInJST) {
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

  console.log(`[GYG cancel-booking] Booking cancelled: ${booking.id} (${requestData.gygBookingReference})`);

  const response: GygEmptySuccessResponse = { data: {} };
  logResponse(ctx, 200, response, reqStart);
  return NextResponse.json(response, { status: 200 });
}
