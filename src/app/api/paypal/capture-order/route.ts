import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { captureOrder, getPaypalOrder } from "@/lib/paypal/client";
import { sendEmail } from "@/lib/email/client";
import { bookingConfirmationEmail } from "@/lib/email/booking-confirmation";
import { operatorNotificationEmail } from "@/lib/email/operator-notification";
import { customTimeNotificationEmail } from "@/lib/email/custom-time-notification";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId } = body;

  const rl = rateLimit(`capture:${clientIp(req)}`, 15);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
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

  let orderDetails;
  try {
    orderDetails = await getPaypalOrder(orderId);
  } catch {
    return NextResponse.json({ error: "Order verification failed" }, { status: 500 });
  }

  // Parse custom_id to derive booking details server-side.
  // Format: tour_id|date|start_time|guest_count[|custom=true|customer_phone]
  const customId = orderDetails.custom_id;
  if (!customId) {
    console.error("[PayPal capture] No custom_id in order", orderId);
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }

  const parts = customId.split("|");
  if (parts.length < 4) {
    console.error("[PayPal capture] Invalid custom_id format:", customId);
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }

  const [tourId, date, startTime, guestCountStr, customFlag] = parts;
  const guestCount = parseInt(guestCountStr, 10);
  const isCustomTime = customFlag === "custom=true";
  const customerPhone = isCustomTime && parts[5] ? decodeURIComponent(parts[5]) : null;

  if (!tourId || !date || !guestCount || guestCount < 1) {
    console.error("[PayPal capture] Invalid booking data:", customId);
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: tour } = await supabase
    .from("tours")
    .select("user_id, name, price, currency")
    .eq("id", tourId)
    .single();

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  }

  // Verify the amount matches what this server would have priced.
  const rawTotal = Math.round(tour.price * guestCount);
  const expectedPaid = tour.currency === "JPY" ? rawTotal : rawTotal / 100;
  const paidValue = Number(orderDetails.amount?.value);
  if (Number.isNaN(paidValue) || Math.abs(paidValue - expectedPaid) > 0.01) {
    console.warn("[PayPal capture] amount mismatch — rejecting", {
      expected: expectedPaid,
      actual: paidValue,
    });
    return NextResponse.json({ error: "Amount does not match the paid order" }, { status: 400 });
  }

  // Dedup: if a booking already references this PayPal order, don't create a second one.
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("paypal_order_id", orderId)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true, bookingId: existing[0].id, duplicate: true });
  }

  const { data: operatorProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", tour.user_id)
    .single();

  // Payer info from PayPal capture response — server-side only, never from client.
  const payerEmail = captureResult.payer?.email_address ?? null;
  const payerName = captureResult.payer?.name
    ? `${captureResult.payer.name.given_name ?? ""} ${captureResult.payer.name.surname ?? ""}`.trim() || null
    : null;

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      tour_id: tourId,
      user_id: tour.user_id,
      date,
      start_time: startTime || null,
      guest_count: guestCount,
      source: isCustomTime ? "direct-custom" : "direct",
      customer_name: payerName ?? payerEmail,
      customer_email: payerEmail,
      paypal_order_id: orderId,
      notes: isCustomTime
        ? JSON.stringify({
            custom_time: true,
            customer_phone: customerPhone,
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

  const emailResults: string[] = [];

  if (isCustomTime) {
    if (operatorProfile?.email) {
      const notificationEmail = customTimeNotificationEmail({
        tourName: tour.name,
        date,
        startTime: startTime || "TBD",
        guestCount,
        customerName: payerName ?? "Unknown",
        customerEmail: payerEmail ?? "unknown",
        customerPhone,
        baseUrl,
      });

      const result = await sendEmail({
        to: operatorProfile.email,
        subject: notificationEmail.subject,
        html: notificationEmail.html,
      });
      emailResults.push(`operator: ${result.ok ? "sent" : result.error}`);
    }
  } else {
    if (payerEmail && tour.price) {
      const confirmationEmail = bookingConfirmationEmail({
        tourName: tour.name,
        date,
        startTime,
        guestCount,
        currency: tour.currency || "JPY",
        pricePerGuest: tour.price,
        bookingId: booking.id,
        baseUrl,
      });

      const result = await sendEmail({
        to: payerEmail,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
      });
      emailResults.push(`customer: ${result.ok ? "sent" : result.error}`);
    } else {
      emailResults.push(`customer: skipped (email=${payerEmail}, price=${tour.price})`);
    }

    if (operatorProfile?.email) {
      const notificationEmail = operatorNotificationEmail({
        operatorEmail: operatorProfile.email,
        tourName: tour.name,
        date,
        startTime,
        guestCount,
        customerName: payerName,
        customerEmail: payerEmail,
        baseUrl,
      });

      const result = await sendEmail({
        to: notificationEmail.to,
        subject: notificationEmail.subject,
        html: notificationEmail.html,
      });
      emailResults.push(`operator: ${result.ok ? "sent" : result.error}`);
    } else {
      emailResults.push("operator: skipped (no email in profile)");
    }
  }

  const guestWord = guestCount === 1 ? "guest" : "guests";
  supabase
    .from("notifications")
    .insert({
      user_id: tour.user_id,
      type: "new_booking",
      title: `New Booking — ${tour.name}`,
      message: `${guestCount} ${guestWord} on ${date}${startTime ? ` at ${startTime}` : ""}`,
      link: "/dashboard",
    })
    .then(({ error: notifError }) => {
      if (notifError) console.error("[PayPal capture] Notification insert failed:", notifError.message);
    });

  if (!isCustomTime) {
    const { data: tourCap } = await supabase
      .from("tours")
      .select("capacity")
      .eq("id", tourId)
      .single();

    const { data: allBookings } = await supabase
      .from("bookings")
      .select("guest_count")
      .eq("tour_id", tourId)
      .eq("date", date)
      .eq("start_time", startTime || null)
      .eq("status", "confirmed");

    const totalBooked = (allBookings ?? []).reduce((sum, b) => sum + (b.guest_count ?? 0), 0);

    if (tourCap && totalBooked >= tourCap.capacity) {
      try {
        await fetch(`${baseUrl}/api/calendar/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tour_id: tourId,
            date,
            start_time: startTime || null,
            reason: "Full — via PayPal booking",
          }),
        });
      } catch (e) {
        console.error("[PayPal capture] Auto-block failed:", e);
      }
    }
  }

  console.log(`[PayPal capture] Booking created: ${tourId} on ${date} for ${guestCount} guests | emails: ${emailResults.join(", ")}`);
  return NextResponse.json({ ok: true, bookingId: booking.id, emails: emailResults });
}
