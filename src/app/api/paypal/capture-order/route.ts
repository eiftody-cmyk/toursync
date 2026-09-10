import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { captureOrder } from "@/lib/paypal/client";
import { sendEmail } from "@/lib/email/client";
import { bookingConfirmationEmail } from "@/lib/email/booking-confirmation";
import { operatorNotificationEmail } from "@/lib/email/operator-notification";
import { customTimeNotificationEmail } from "@/lib/email/custom-time-notification";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId, tour_id, date, start_time, guest_count, custom, customer_name, customer_email, customer_phone } = body;

  if (!orderId || !tour_id || !date || !guest_count) {
    return NextResponse.json({ error: "orderId, tour_id, date, guest_count required" }, { status: 400 });
  }

  let captureResult;
  try {
    captureResult = await captureOrder(orderId);

    if (captureResult.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[PayPal capture] Capture failed:", msg);
    return NextResponse.json({ error: "Payment capture failed" }, { status: 500 });
  }

  const supabase = createServiceClient();

  const { data: tour } = await supabase
    .from("tours")
    .select("user_id, name, price, currency")
    .eq("id", tour_id)
    .single();

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  }

  const { data: operatorProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", tour.user_id)
    .single();

  const isCustomTime = custom === true || custom === "true";
  const guestCount = parseInt(String(guest_count), 10);

  // Server-side payer info is authoritative — extracted from PayPal capture response
  const serverPayerEmail = captureResult.payer?.email_address ?? null;
  const serverPayerName = captureResult.payer?.name
    ? `${captureResult.payer.name.given_name ?? ""} ${captureResult.payer.name.surname ?? ""}`.trim() || null
    : null;

  // Use server-side data; fall back to client-provided data only if server data missing
  const payerEmail = serverPayerEmail ?? body.payerEmail ?? null;
  const payerName = serverPayerName ?? body.payerName ?? null;

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      tour_id,
      user_id: tour.user_id,
      date,
      start_time: start_time || null,
      guest_count: guestCount,
      source: isCustomTime ? "direct-custom" : "direct",
      customer_name: payerName ?? payerEmail,
      customer_email: payerEmail,
      notes: isCustomTime
        ? JSON.stringify({
            custom_time: true,
            customer_phone: customer_phone || null,
            paypal_order: orderId,
          })
        : `PayPal order: ${orderId}`,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[PayPal capture] Failed to create booking:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://osakacastletours.com";

  if (isCustomTime) {
    if (operatorProfile?.email) {
      const notificationEmail = customTimeNotificationEmail({
        tourName: tour.name,
        date,
        startTime: start_time || "TBD",
        guestCount,
        customerName: payerName ?? "Unknown",
        customerEmail: payerEmail ?? "unknown",
        customerPhone: customer_phone || null,
        baseUrl,
      });

      sendEmail({
        to: operatorProfile.email,
        subject: notificationEmail.subject,
        html: notificationEmail.html,
      }).catch((e) => console.error("[PayPal capture] Custom time notification email failed:", e));
    }
  } else {
    if (payerEmail && tour.price) {
      const confirmationEmail = bookingConfirmationEmail({
        tourName: tour.name,
        date,
        startTime: start_time,
        guestCount,
        currency: tour.currency || "JPY",
        pricePerGuest: tour.price,
        bookingId: booking.id,
        baseUrl,
      });

      sendEmail({
        to: payerEmail,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
      }).catch((e) => console.error("[PayPal capture] Confirmation email failed:", e));
    }

    if (operatorProfile?.email) {
      const notificationEmail = operatorNotificationEmail({
        operatorEmail: operatorProfile.email,
        tourName: tour.name,
        date,
        startTime: start_time,
        guestCount,
        customerEmail: payerEmail,
        baseUrl,
      });

      sendEmail({
        to: notificationEmail.to,
        subject: notificationEmail.subject,
        html: notificationEmail.html,
      }).catch((e) => console.error("[PayPal capture] Operator notification email failed:", e));
    }
  }

  const guestWord = guestCount === 1 ? "guest" : "guests";
  supabase
    .from("notifications")
    .insert({
      user_id: tour.user_id,
      type: "new_booking",
      title: `New Booking — ${tour.name}`,
      message: `${guestCount} ${guestWord} on ${date}${start_time ? ` at ${start_time}` : ""}`,
      link: "/dashboard",
    })
    .then(({ error: notifError }) => {
      if (notifError) console.error("[PayPal capture] Notification insert failed:", notifError.message);
    });

  if (!isCustomTime) {
    const { data: tourCap } = await supabase
      .from("tours")
      .select("capacity")
      .eq("id", tour_id)
      .single();

    const { data: allBookings } = await supabase
      .from("bookings")
      .select("guest_count")
      .eq("tour_id", tour_id)
      .eq("date", date)
      .eq("start_time", start_time || null)
      .eq("status", "confirmed");

    const totalBooked = (allBookings ?? []).reduce((sum, b) => sum + (b.guest_count ?? 0), 0);

    if (tourCap && totalBooked >= tourCap.capacity) {
      try {
        await fetch(`${baseUrl}/api/calendar/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tour_id,
            date,
            start_time: start_time || null,
            reason: "Full — via PayPal booking",
          }),
        });
      } catch (e) {
        console.error("[PayPal capture] Auto-block failed:", e);
      }
    }
  }

  console.log(`[PayPal capture] Booking created: ${tour_id} on ${date} for ${guestCount} guests${isCustomTime ? " (custom time)" : ""}`);
  return NextResponse.json({ ok: true, bookingId: booking.id });
}
