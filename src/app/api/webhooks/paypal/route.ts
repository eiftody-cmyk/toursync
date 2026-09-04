import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureOrder } from "@/lib/paypal/client";

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

  // Get the tour owner's user_id
  const { data: tour } = await supabase
    .from("tours")
    .select("user_id")
    .eq("id", tourId)
    .single();

  if (!tour) {
    console.error("[PayPal webhook] Tour not found:", tourId);
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Extract payer info
  const payerEmail = resource?.payer?.email_address ?? null;

  // Create the booking
  const { error } = await supabase.from("bookings").insert({
    tour_id: tourId,
    user_id: tour.user_id,
    date,
    start_time: startTime || null,
    guest_count: guestCount,
    source: "direct",
    customer_name: payerEmail,
    notes: `PayPal order: ${body?.resource?.id ?? "unknown"}`,
  });

  if (error) {
    console.error("[PayPal webhook] Failed to create booking:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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
    .eq("start_time", startTime || null);

  const totalBooked = (allBookings ?? []).reduce((sum, b) => sum + (b.guest_count ?? 0), 0);

  if (tourCap && totalBooked >= tourCap.capacity) {
    // Auto-block on Google Calendar if connected
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/calendar/block`, {
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
