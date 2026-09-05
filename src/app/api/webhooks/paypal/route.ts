import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureOrder } from "@/lib/paypal/client";
import { sendEmail } from "@/lib/email/client";
import { bookingConfirmationEmail } from "@/lib/email/booking-confirmation";
import { operatorNotificationEmail } from "@/lib/email/operator-notification";

// Disable body parsing — we need the raw body for webhook verification
export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const eventType = body?.event_type;

  // Only handle successful payments
  if (eventType !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const resource = body?.resource;
  if (!resource) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Parse custom_id: tour_id|date|start_time|guest_count
  const customId = resource?.custom_id;
  if (!customId) {
    console.error("[PayPal webhook] No custom_id in resource");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const parts = customId.split("|");
  if (parts.length < 4) {
    console.error("[PayPal webhook] Invalid custom_id format:", customId);
    return NextResponse.json({ ok: true, skipped: true });
  }

  const [tourId, date, startTime, guestCountStr] = parts;
  const guestCount = parseInt(guestCountStr, 10);

  if (!tourId || !date || !guestCount || guestCount < 1) {
    console.error("[PayPal webhook] Invalid booking data:", customId);
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = await createClient();

  // Get the tour details and owner info
  const { data: tour } = await supabase
    .from("tours")
    .select("user_id, name, price, currency")
    .eq("id", tourId)
    .single();

  if (!tour) {
    console.error("[PayPal webhook] Tour not found:", tourId);
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Get operator email
  const { data: operatorProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", tour.user_id)
    .single();

  // Extract payer info
  const payerEmail = resource?.payer?.email_address ?? null;
  const payerName = resource?.payer?.name?.given_name
    ? `${resource.payer.name.given_name} ${resource.payer.name.surname ?? ""}`.trim()
    : null;

  // Create the booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      tour_id: tourId,
      user_id: tour.user_id,
      date,
      start_time: startTime || null,
      guest_count: guestCount,
      source: "direct",
      customer_name: payerName ?? payerEmail,
      customer_email: payerEmail,
      notes: `PayPal order: ${body?.resource?.id ?? "unknown"}`,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[PayPal webhook] Failed to create booking:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://toursync1.vercel.app";

  // Send confirmation email to customer
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

    sendEmail({
      to: payerEmail,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
    }).catch((e) => console.error("[PayPal webhook] Confirmation email failed:", e));
  }

  // Send notification email to operator
  if (operatorProfile?.email) {
    const notificationEmail = operatorNotificationEmail({
      operatorEmail: operatorProfile.email,
      tourName: tour.name,
      date,
      startTime,
      guestCount,
      customerEmail: payerEmail,
      baseUrl,
    });

    sendEmail({
      to: notificationEmail.to,
      subject: notificationEmail.subject,
      html: notificationEmail.html,
    }).catch((e) => console.error("[PayPal webhook] Operator notification email failed:", e));
  }

  // Insert in-app notification for operator
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
      if (notifError) console.error("[PayPal webhook] Notification insert failed:", notifError.message);
    });

  // Check auto-block
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
    // Auto-block on Google Calendar if connected
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
      console.error("[PayPal webhook] Auto-block failed:", e);
    }
  }

  console.log(`[PayPal webhook] Booking created: ${tourId} on ${date} for ${guestCount} guests`);
  return NextResponse.json({ ok: true });
}
