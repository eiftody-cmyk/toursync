import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { createGygLogger, logResponse } from "@/lib/gyg/logger";
import { gygJson } from "@/lib/gyg/response";
import { lookupTourByProductId } from "@/lib/gyg/lookup";
import type { GygEmptySuccessResponse, GygErrorResponse } from "@/lib/gyg/types";

export async function POST(req: NextRequest) {
  const reqStart = Date.now();
  const ctx = createGygLogger("cancel-booking", req);

  try {
    return await POST_inner(req, reqStart, ctx);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[GYG cancel-booking] Unhandled error:", msg);
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
  const data = (body as Record<string, unknown>) as { data?: Record<string, unknown> } | undefined;
  const requestData = data?.data;

  if (!requestData?.bookingReference || !requestData?.gygBookingReference || !requestData?.productId) {
    return gygJson(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required fields: bookingReference, gygBookingReference, productId" },
      { status: 200 }
    );
  }

  const supabase = createServiceClient();

  // Look up tour (handles T-1221780 and 1221780)
  const result = await lookupTourByProductId(requestData.productId as string);
  if (!result) {
    return gygJson(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${requestData.productId}` },
      { status: 200 }
    );
  }

  // Find booking
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, tour_id, date, start_time, status, guest_count")
    .eq("id", requestData.bookingReference)
    .eq("tour_id", result.tourId)
    .maybeSingle();

  if (!booking) {
    return gygJson(
      { errorCode: "INVALID_BOOKING", errorMessage: "Booking not found" },
      { status: 200 }
    );
  }

  // Check if already cancelled
  if (booking.status === "cancelled") {
    return gygJson(
      { errorCode: "BOOKING_ALREADY_CANCELED", errorMessage: "Booking has already been cancelled" },
      { status: 200 }
    );
  }

  // Check if booking is in the past (JST-aware)
  // Parse date directly from ISO string to avoid timezone conversion issues
  const [y, m, d] = booking.date.split("-").map(Number);
  const startTime = booking.start_time || "00:00";
  const [h, min] = startTime.split(":").map(Number);

  // Format both as JST strings for lexicographic comparison
  const nowStr = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Tokyo" });
  const tourStartStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`;

  if (tourStartStr < nowStr) {
    return gygJson(
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
    return gygJson(
      { errorCode: "INTERNAL_SYSTEM_FAILURE", errorMessage: "Failed to cancel booking" },
      { status: 200 }
    );
  }

  // Parallelize: tour capacity + remaining bookings + auto-block check
  const [tourResult, remainingBookingsResult, autoBlockResult] = await Promise.all([
    supabase.from("tours").select("capacity").eq("id", booking.tour_id).single(),
    (() => {
      const q = supabase.from("bookings").select("guest_count").eq("tour_id", booking.tour_id).eq("date", booking.date).eq("status", "confirmed");
      if (booking.start_time) { q.eq("start_time", booking.start_time); } else { q.is("start_time", null); }
      return q;
    })(),
    (() => {
      const q = supabase.from("blocked_dates").select("id, google_calendar_event_id, calendar_id").eq("tour_id", booking.tour_id).eq("date", booking.date).eq("is_auto_blocked", true);
      if (booking.start_time) { q.eq("start_time", booking.start_time); } else { q.is("start_time", null); }
      return q.maybeSingle();
    })(),
  ]);

  const tour = tourResult.data;
  const totalBooked = (remainingBookingsResult.data ?? []).reduce(
    (sum, b) => sum + (b.guest_count ?? 0),
    0
  );

  if (tour && totalBooked < tour.capacity) {
    const autoBlock = autoBlockResult.data;

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
  return gygJson(response, { status: 200 });
}
