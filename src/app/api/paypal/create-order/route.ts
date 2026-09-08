import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaypalOrder } from "@/lib/paypal/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tour_id, date, start_time, guest_count } = body;

  if (!tour_id || !date || !guest_count) {
    return NextResponse.json({ error: "tour_id, date, guest_count required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: tour } = await supabase
    .from("tours")
    .select("name, price, currency, cutoff_minutes")
    .eq("id", tour_id)
    .single();

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  }

  if (!tour.price) {
    return NextResponse.json({ error: "Tour has no price set" }, { status: 400 });
  }

  // Cutoff validation — reject if start_time + cutoff has passed
  const cutoffMinutes = tour.cutoff_minutes ?? 60;
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  if (date === todayStr && start_time) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = start_time.split(":").map(Number);
    const slotMinutes = h * 60 + m;
    if (nowMinutes >= slotMinutes + cutoffMinutes) {
      return NextResponse.json({ error: "This tour time has already passed the booking cutoff" }, { status: 400 });
    }
  }

  // Check remaining capacity
  const { data: bookings } = await supabase
    .from("bookings")
    .select("guest_count")
    .eq("tour_id", tour_id)
    .eq("date", date)
    .eq("start_time", start_time ?? null)
    .eq("status", "confirmed");

  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("id")
    .eq("tour_id", tour_id)
    .eq("date", date)
    .eq("start_time", start_time ?? null)
    .maybeSingle();

  if (blocked) {
    return NextResponse.json({ error: "This date/time is not available" }, { status: 400 });
  }

  const { data: tourFull } = await supabase
    .from("tours")
    .select("capacity")
    .eq("id", tour_id)
    .single();

  const booked = (bookings ?? []).reduce((sum, b) => sum + (b.guest_count ?? 0), 0);
  const remaining = (tourFull?.capacity ?? 10) - booked;

  if (guest_count > remaining) {
    return NextResponse.json({ error: `Only ${remaining} spot${remaining === 1 ? "" : "s"} left` }, { status: 400 });
  }

  // Encode booking info in custom_id: tour_id|date|start_time|guest_count
  const customId = [tour_id, date, start_time ?? "", guest_count].join("|");

  try {
    const order = await createPaypalOrder({
      tourName: tour.name,
      amount: Math.round(tour.price * guest_count),
      currency: tour.currency || "JPY",
      customId,
    });

    const approveLink = order.links.find((l) => l.rel === "approve");
    return NextResponse.json({
      orderId: order.id,
      approveUrl: approveLink?.href,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[PayPal] create order failed:", msg);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}
