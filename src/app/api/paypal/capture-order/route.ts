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
  const { orderId, tour_id, date, start_time, guest_count, custom, customer_phone } = body;

  const rl = rateLimit(`capture:${clientIp(req)}`, 15);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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

  // Verify the captured order matches what this server would have priced.
  const isCustomTime = custom === true || custom === "true";
  const guestCountNum = parseInt(String(guest_count), 10);
  const expectedCustomId = isCustomTime
    ? [
        tour_id,
        date,
        start_time ?? "",
        String(guestCountNum),
        "custom=true",
        encodeURIComponent(customer_phone || ""),
      ].join("|")
    : [tour_id, date, start_time ?? "", String(guestCountNum)].join("|");

  let orderDetails;
  try {
    orderDetails = await getPaypalOrder(orderId);
  } catch {
    return NextResponse.json({ error: "Order verification failed" }, { status: 500 });
  }

  if (orderDetails.custom_id !== expectedCustomId) {
    console.warn("[PayPal capture] custom_id mismatch — rejecting", {
      expected: expectedCustomId,
      actual: orderDetails.custom_id,
    });
    return NextResponse.json({ error: "Booking details do not match the paid order" }, { status: 400 });
  }

  // PayPal reports non-JPY amounts in major units (USD dollars); JPY stays integer.
  const rawTotal = Math.round(tour.price * guestCountNum);
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
    .ilike("notes", `%${orderId}%`)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true, bookingId: existing[0].id, duplicate: true });
  }

  const { data: operatorProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", tour.user_id)
    .single();

  const guestCount = guestCountNum;

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

  const emailResults: string[] = [];

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
        startTime: start_time,
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
        startTime: start_time,
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

  console.log(`[PayPal capture] Booking created: ${tour_id} on ${date} for ${guestCount} guests | emails: ${emailResults.join(", ")}`);
  return NextResponse.json({ ok: true, bookingId: booking.id, emails: emailResults });
}
