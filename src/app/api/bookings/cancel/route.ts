import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/client";
import { cancellationConfirmationEmail } from "@/lib/email/cancellation-confirmation";
import { cancellationOperatorNotificationEmail } from "@/lib/email/cancellation-operator-notification";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";
import { filterBySlot } from "@/lib/core/slot";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`cancel:${clientIp(req)}`, 5);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const formData = await req.formData();
  const bookingId = formData.get("booking_id") as string;
  const cancelToken = formData.get("token") as string | null;
  const lookupEmail = formData.get("email") as string | null;

  if (!bookingId) {
    return NextResponse.json({ error: "booking_id required" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Get the booking (no join — avoid RLS issues on tours)
  const { data: booking } = await serviceClient
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.redirect(new URL("/book/manage?error=not_found", req.url));
  }

  // Require proof of ownership: valid cancel token or matching email
  const { verifyCancelToken } = await import("@/lib/security/cancelToken");
  const tokenOk = cancelToken ? verifyCancelToken(bookingId, cancelToken) : false;
  const emailOk =
    !!lookupEmail &&
    !!booking.customer_email &&
    lookupEmail.trim().toLowerCase() === booking.customer_email.trim().toLowerCase();
  if (!tokenOk && !emailOk) {
    return NextResponse.redirect(new URL(`/book/manage?id=${bookingId}&error=unauthorized`, req.url));
  }

  if (booking.status !== "confirmed") {
    return NextResponse.redirect(new URL(`/book/manage?id=${bookingId}&error=already_cancelled`, req.url));
  }

  // Check 24-hour cancellation policy (JST)
  const startTime = (booking.start_time || "00:00").slice(0, 5);
  const tourStartAbs = Date.parse(`${booking.date}T${startTime}:00+09:00`);
  const now = Date.now();

  if (Number.isNaN(tourStartAbs) || tourStartAbs - now <= 24 * 60 * 60 * 1000) {
    return NextResponse.redirect(
      new URL(`/book/manage?id=${bookingId}&error=too_late`, req.url)
    );
  }

  // Conditional cancel — only one concurrent request wins and triggers a refund
  const { data: cancelledRows, error } = await serviceClient
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("status", "confirmed")
    .select("id");

  if (error || !cancelledRows || cancelledRows.length === 0) {
    if (error) console.error("[Booking cancel] Failed:", error.message);
    return NextResponse.redirect(new URL(`/book/manage?id=${bookingId}&error=cancel_failed`, req.url));
  }

  // Fetch tour details
  const { data: tour } = await serviceClient
    .from("tours")
    .select("capacity, name, user_id")
    .eq("id", booking.tour_id)
    .single();

  // Fetch operator profile for notification email
  const { data: operatorProfile } = await serviceClient
    .from("profiles")
    .select("email")
    .eq("id", booking.user_id)
    .single();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://osakacastletours.com";

  // Issue payment refund if capture ID is available
  let refundIssued = false;
  if (booking.paypal_capture_id) {
    try {
      const { getPaymentProvider } = await import("@/lib/payments");
      const provider = getPaymentProvider();
      await provider.refundPayment(booking.paypal_capture_id, "Customer cancelled");
      refundIssued = true;
      console.log(`[Booking cancel] Refund issued for capture ${booking.paypal_capture_id}`);
    } catch (e) {
      console.error("[Booking cancel] Refund failed:", e);
    }
  }

  // Send cancellation confirmation email to customer
  if (booking.customer_email && tour?.name) {
    const email = cancellationConfirmationEmail({
      tourName: tour.name,
      date: booking.date,
      startTime: booking.start_time,
      guestCount: booking.guest_count,
      baseUrl,
    });
    sendEmail({
      to: booking.customer_email,
      subject: email.subject,
      html: email.html,
    }).catch((e) => console.error("[Booking cancel] Confirmation email failed:", e));
  }

  // Send operator notification email
  if (operatorProfile?.email && tour?.name) {
    const notificationEmail = cancellationOperatorNotificationEmail({
      operatorEmail: operatorProfile.email,
      tourName: tour.name,
      date: booking.date,
      startTime: booking.start_time,
      guestCount: booking.guest_count,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      refundIssued,
      baseUrl,
    });
    sendEmail({
      to: notificationEmail.to,
      subject: notificationEmail.subject,
      html: notificationEmail.html,
    }).catch((e) => console.error("[Booking cancel] Operator notification email failed:", e));
  }

  // Insert in-app notification for operator
  if (tour?.user_id) {
    const guestWord = booking.guest_count === 1 ? "guest" : "guests";
    serviceClient
      .from("notifications")
      .insert({
        user_id: tour.user_id,
        type: "booking_cancelled",
        title: `Booking Cancelled — ${tour.name}`,
        message: `${booking.guest_count} ${guestWord} on ${booking.date}${booking.start_time ? ` at ${booking.start_time}` : ""}`,
        link: "/dashboard",
      })
      .then(({ error: notifError }) => {
        if (notifError) console.error("[Booking cancel] Notification insert failed:", notifError.message);
      });
  }

  // Check if we should un-auto-block
  // If the date/time is now below capacity, remove the auto-block
  const { data: remainingBookings } = await filterBySlot(
    serviceClient
      .from("bookings")
      .select("guest_count")
      .eq("tour_id", booking.tour_id)
      .eq("date", booking.date),
    booking.start_time
  ).eq("status", "confirmed");

  const totalBooked = (remainingBookings ?? []).reduce(
    (sum: number, b: { guest_count?: number }) => sum + (b.guest_count ?? 0),
    0
  );

  if (tour && totalBooked < tour.capacity) {
    const { data: autoBlock } = await filterBySlot(
      serviceClient
        .from("blocked_dates")
        .select("id")
        .eq("tour_id", booking.tour_id)
        .eq("date", booking.date),
      booking.start_time
    )
      .eq("is_auto_blocked", true)
      .maybeSingle();

    if (autoBlock) {
      // Delete Google event first, then DB row — keeps event id if Google fails
      const { unblockSlot } = await import("@/lib/google/sync");
      const result = await unblockSlot({ supabase: serviceClient, blockedId: autoBlock.id });

      if (result.ok) {
        try {
          const { pushAvailability } = await import("@/lib/ota/pushAvailability");
          pushAvailability(serviceClient, {
            tour_id: booking.tour_id,
            date: booking.date,
            start_time: booking.start_time ?? undefined,
            remaining_capacity: Math.max(0, tour.capacity - totalBooked),
          }).catch((e) => console.error("[Booking cancel] Push availability failed:", e));
        } catch (e) {
          console.error("[Booking cancel] Push availability failed:", e);
        }
      } else {
        console.error("[Booking cancel] Unblock failed (row kept):", result.error);
      }
    }
  }

  return NextResponse.redirect(
    new URL(`/book/manage?id=${bookingId}&cancelled=true`, req.url)
  );
}
