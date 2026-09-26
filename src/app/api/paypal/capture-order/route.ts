import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getPaymentProvider } from "@/lib/payments";
import { sendEmail } from "@/lib/email/client";
import { bookingConfirmationEmail } from "@/lib/email/booking-confirmation";
import { operatorNotificationEmail } from "@/lib/email/operator-notification";
import { getPreviousTours } from "@/lib/email/previous-tours";
import { customTimeNotificationEmail } from "@/lib/email/custom-time-notification";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";
import { blockSlot } from "@/lib/google/sync";
import { checkCapacity } from "@/lib/core/availability";

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
    const provider = getPaymentProvider();
    captureResult = await provider.captureOrder(orderId);

    if (captureResult.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[Payment] capture failed:", msg);
    return NextResponse.json({ error: "Payment capture failed" }, { status: 500 });
  }

  let orderDetails;
  try {
    const provider = getPaymentProvider();
    orderDetails = await provider.getOrder(orderId);
  } catch {
    return NextResponse.json({ error: "Order verification failed" }, { status: 500 });
  }

  // Parse custom_id to derive booking details server-side.
  // Format: tour_id|date|start_time|guest_count[|custom=true|customer_phone]
  const customId = orderDetails.custom_id;
  if (!customId) {
    console.error("[Payment] No custom_id in order", orderId);
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }

  const parts = customId.split("|");
  if (parts.length < 4) {
    console.error("[Payment] Invalid custom_id format:", customId);
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }

  const [tourId, date, startTime, guestCountStr, customFlag] = parts;
  const guestCount = parseInt(guestCountStr, 10);
  const isCustomTime = customFlag === "custom=true";
  const customerPhone = isCustomTime && parts[5] ? decodeURIComponent(parts[5]) : null;
  const normalizedStart =
    startTime && /^([01]\d|2[0-3]):[0-5]\d/.test(startTime) ? startTime.slice(0, 5) : startTime || null;

  if (
    !tourId ||
    !date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isInteger(guestCount) ||
    guestCount < 1 ||
    guestCount > 99
  ) {
    console.error("[Payment] Invalid booking data:", customId);
    // Funds already captured — auto-refund rather than leave a paid orphan
    try {
      if (captureResult.captureId) {
        const provider = getPaymentProvider();
        await provider.refundPayment(captureResult.captureId, "Invalid order data");
      }
    } catch (refundErr) {
      console.error("[Payment] Auto-refund after invalid order failed:", refundErr);
    }
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: tour } = await supabase
    .from("tours")
    .select("user_id, name, price, currency, meeting_point_address")
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
    console.warn("[Payment] amount mismatch — rejecting", {
      expected: expectedPaid,
      actual: paidValue,
    });
    // Funds already captured — refund so the customer is not left charged with no booking
    try {
      if (captureResult.captureId) {
        const provider = getPaymentProvider();
        await provider.refundPayment(captureResult.captureId, "Amount mismatch");
      }
    } catch (refundErr) {
      console.error("[Payment] Auto-refund after amount mismatch failed:", refundErr);
    }
    return NextResponse.json({ error: "Amount does not match the paid order" }, { status: 400 });
  }

  if (orderDetails.amount?.currency_code && tour.currency && orderDetails.amount.currency_code !== tour.currency) {
    console.warn("[Payment] currency mismatch — rejecting", {
      expected: tour.currency,
      actual: orderDetails.amount.currency_code,
    });
    try {
      if (captureResult.captureId) {
        const provider = getPaymentProvider();
        await provider.refundPayment(captureResult.captureId, "Currency mismatch");
      }
    } catch (refundErr) {
      console.error("[Payment] Auto-refund after currency mismatch failed:", refundErr);
    }
    return NextResponse.json({ error: "Currency does not match" }, { status: 400 });
  }

  // Re-check capacity before insert (TOCTOU guard after create-order)
  if (!isCustomTime) {
    try {
      const capacity = await checkCapacity(tourId, date, normalizedStart);
      if (capacity.remaining < guestCount) {
        try {
          if (captureResult.captureId) {
            const provider = getPaymentProvider();
            await provider.refundPayment(captureResult.captureId, "Tour no longer available");
          }
        } catch (refundErr) {
          console.error("[Payment] Auto-refund after capacity failure failed:", refundErr);
        }
        return NextResponse.json({ error: "This tour time is no longer available" }, { status: 400 });
      }
    } catch (e) {
      console.error("[Payment] capacity check failed:", e);
      return NextResponse.json({ error: "Unable to verify availability" }, { status: 500 });
    }
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

  // Payer info from payment capture response — server-side only, never from client.
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
      start_time: normalizedStart,
      guest_count: guestCount,
      source: isCustomTime ? "direct-custom" : "direct",
      customer_name: payerName ?? payerEmail,
      customer_email: payerEmail,
      paypal_order_id: orderId,
      paypal_capture_id: captureResult.captureId ?? null,
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
    // Race with webhook creating the same booking — treat as success
    if (error.code === "23505") {
      const { data: existingByOrder } = await supabase
        .from("bookings")
        .select("id")
        .eq("paypal_order_id", orderId)
        .limit(1);
      if (existingByOrder && existingByOrder[0]) {
        return NextResponse.json({ ok: true, bookingId: existingByOrder[0].id, duplicate: true });
      }
    }
    console.error("[Payment] Failed to create booking:", error.message);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
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
        meetingPointAddress: tour.meeting_point_address,
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
      const previousTours = await getPreviousTours(supabase, payerEmail);
      const notificationEmail = operatorNotificationEmail({
        operatorEmail: operatorProfile.email,
        tourName: tour.name,
        date,
        startTime,
        guestCount,
        customerName: payerName,
        customerEmail: payerEmail,
        baseUrl,
        previousTours,
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
      if (notifError) console.error("[Payment] Notification insert failed:", notifError.message);
    });

  if (!isCustomTime) {
    try {
      const capacity = await checkCapacity(tourId, date, normalizedStart);
      if (capacity.remaining <= 0) {
        const blockResult = await blockSlot({
          supabase,
          userId: tour.user_id,
          tourId,
          date,
          startTime: normalizedStart,
          reason: "Full — via PayPal booking",
          summary: "Full — via PayPal booking",
          description: "Auto-blocked: slot at capacity via PayPal booking",
          isAutoBlocked: true,
        });
        if (blockResult.error) {
          console.error("[Payment] Auto-block failed:", blockResult.error);
        }
      }
    } catch (e) {
      console.error("[Payment] Auto-block check failed:", e);
    }
  }

  console.log(`[Payment] Booking created: ${tourId} on ${date} for ${guestCount} guests | emails: ${emailResults.join(", ")}`);
  return NextResponse.json({ ok: true, bookingId: booking.id, tourName: tour.name, emails: emailResults });
}
