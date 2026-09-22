import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { createGygLogger, logResponse } from "@/lib/gyg/logger";
import { gygJson } from "@/lib/gyg/response";
import { sendEmail } from "@/lib/email/client";
import { cancellationOperatorNotificationEmail } from "@/lib/email/cancellation-operator-notification";
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
  const bodyObj = (body ?? {}) as Record<string, unknown>;
  const requestData = (bodyObj.data && typeof bodyObj.data === "object" ? bodyObj.data : bodyObj) as Record<string, unknown> | undefined;

  if (!requestData?.bookingReference || !requestData?.gygBookingReference || !requestData?.productId) {
    return gygJson(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required fields: bookingReference, gygBookingReference, productId" },
      { status: 200 }
    );
  }

  const supabase = createServiceClient();

  // Find booking directly by UUID (globally unique) — skip tour lookup for speed
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, tour_id, user_id, date, start_time, status, guest_count")
    .eq("id", requestData.bookingReference)
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

  // JST-aware string comparison (bypasses toLocaleString for Cloudflare compat)
  const nowUtc = Date.now();
  const nowJst = new Date(nowUtc + 9 * 60 * 60 * 1000);
  const nowStr = `${nowJst.getUTCFullYear()}-${String(nowJst.getUTCMonth() + 1).padStart(2, "0")}-${String(nowJst.getUTCDate()).padStart(2, "0")}T${String(nowJst.getUTCHours()).padStart(2, "0")}:${String(nowJst.getUTCMinutes()).padStart(2, "0")}:${String(nowJst.getUTCSeconds()).padStart(2, "0")}`;
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

  console.log(`[GYG cancel-booking] Booking cancelled: ${booking.id} (${requestData.gygBookingReference})`);

  // ── Side effects (fire-and-forget) ──────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://osakacastletours.com";

  // Fetch tour details for capacity check and notifications
  const { data: tour } = await supabase
    .from("tours")
    .select("capacity, name, user_id")
    .eq("id", booking.tour_id)
    .single();

  // Fetch operator profile for notification email
  const { data: operatorProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", booking.user_id)
    .maybeSingle();

  // 1) Auto-block check: if slot is now below capacity, remove auto-block
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
    const { data: autoBlock } = await supabase
      .from("blocked_dates")
      .select("id")
      .eq("tour_id", booking.tour_id)
      .eq("date", booking.date)
      .eq("start_time", booking.start_time || null)
      .eq("is_auto_blocked", true)
      .maybeSingle();

    if (autoBlock) {
      // Delete Google event first, then DB row — keeps event id if Google fails
      const { unblockSlot } = await import("@/lib/google/sync");
      const result = await unblockSlot({ supabase, blockedId: autoBlock.id });

      if (result.ok) {
        try {
          const { pushAvailability } = await import("@/lib/ota/pushAvailability");
          pushAvailability(supabase, {
            tour_id: booking.tour_id,
            date: booking.date,
            start_time: booking.start_time ?? undefined,
            remaining_capacity: tour.capacity - totalBooked,
          }).catch(() => {});
        } catch (e) {
          console.error("[GYG cancel-booking] Push availability failed:", e);
        }
      } else {
        console.error("[GYG cancel-booking] Unblock failed (row kept):", result.error);
      }
    }
  }

  // 2) Send operator notification email
  if (operatorProfile?.email && tour?.name) {
    const notificationEmail = cancellationOperatorNotificationEmail({
      operatorEmail: operatorProfile.email,
      tourName: tour.name,
      date: booking.date,
      startTime: booking.start_time,
      guestCount: booking.guest_count,
      customerName: null,
      customerEmail: null,
      refundIssued: false,
      baseUrl,
    });
    sendEmail({
      to: notificationEmail.to,
      subject: notificationEmail.subject,
      html: notificationEmail.html,
    }).catch((e) => console.error("[GYG cancel-booking] Operator notification email failed:", e));
  }

  // 3) Insert in-app notification for operator
  if (tour?.user_id) {
    const guestWord = booking.guest_count === 1 ? "guest" : "guests";
    supabase
      .from("notifications")
      .insert({
        user_id: tour.user_id,
        type: "booking_cancelled",
        title: `Booking Cancelled — ${tour.name}`,
        message: `${booking.guest_count} ${guestWord} on ${booking.date}${booking.start_time ? ` at ${booking.start_time}` : ""} (via GetYourGuide)`,
        link: "/dashboard",
      })
      .then(({ error: notifError }) => {
        if (notifError) console.error("[GYG cancel-booking] Notification insert failed:", notifError.message);
      });
  }

  const response: GygEmptySuccessResponse = { data: {} };
  logResponse(ctx, 200, response, reqStart);
  return gygJson(response, { status: 200 });
}
