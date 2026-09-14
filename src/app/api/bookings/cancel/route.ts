import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/client";
import { cancellationConfirmationEmail } from "@/lib/email/cancellation-confirmation";
import { cancellationOperatorNotificationEmail } from "@/lib/email/cancellation-operator-notification";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`cancel:${clientIp(req)}`, 5);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const formData = await req.formData();
  const bookingId = formData.get("booking_id") as string;

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

  if (booking.status !== "confirmed") {
    return NextResponse.redirect(new URL(`/book/manage?id=${bookingId}&error=already_cancelled`, req.url));
  }

  // Check 24-hour cancellation policy
  const [y, m, d] = booking.date.split("-").map(Number);
  const startTime = booking.start_time || "00:00";
  const [h, min] = startTime.split(":").map(Number);
  const tourStart = new Date(y, m - 1, d, h, min);
  const now = new Date();

  if (tourStart.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
    return NextResponse.redirect(
      new URL(`/book/manage?id=${bookingId}&error=too_late`, req.url)
    );
  }

  // Cancel the booking (use service client to bypass RLS)
  const { error } = await serviceClient
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) {
    console.error("[Booking cancel] Failed:", error.message);
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
      await provider.refundPayment(booking.paypal_capture_id, "Tour cancelled by operator");
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
  const { data: remainingBookings } = await serviceClient
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
    // Find and remove the auto-block directly (service client bypasses auth + RLS)
    const { data: autoBlock } = await serviceClient
      .from("blocked_dates")
      .select("id, google_calendar_event_id, calendar_id")
      .eq("tour_id", booking.tour_id)
      .eq("date", booking.date)
      .eq("start_time", booking.start_time || null)
      .eq("is_auto_blocked", true)
      .maybeSingle();

    if (autoBlock) {
      // Delete from blocked_dates table directly
      await serviceClient.from("blocked_dates").delete().eq("id", autoBlock.id);

      // Delete from Google Calendar if connected
      if (autoBlock.google_calendar_event_id && autoBlock.calendar_id && booking.user_id) {
        try {
          const { getValidAccessTokenWithClient, deleteCalendarEvent } = await import("@/lib/google/calendar");
          const { accessToken } = await getValidAccessTokenWithClient(serviceClient, booking.user_id);
          await deleteCalendarEvent({
            accessToken,
            calendarId: autoBlock.calendar_id,
            eventId: autoBlock.google_calendar_event_id,
          });
        } catch (e) {
          console.error("[Booking cancel] Delete Google Calendar event failed:", e);
        }
      }

      // Push availability to OTA channels (fire-and-forget — slot is available again)
      try {
        const { pushAvailability } = await import("@/lib/ota/pushAvailability");
        pushAvailability(serviceClient, {
          tour_id: booking.tour_id,
          date: booking.date,
          start_time: booking.start_time ?? undefined,
          remaining_capacity: 1,
        }).catch(() => {});
      } catch (e) {
        console.error("[Booking cancel] Push availability failed:", e);
      }
    }
  }

  return NextResponse.redirect(
    new URL(`/book/manage?id=${bookingId}&cancelled=true`, req.url)
  );
}
