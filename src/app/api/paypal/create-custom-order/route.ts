import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaypalOrder } from "@/lib/paypal/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tour_id, date, start_time, guest_count, customer_phone } = body;

  if (!tour_id || !date || !start_time || !guest_count) {
    return NextResponse.json(
      { error: "Missing required fields: tour_id, date, start_time, guest_count" },
      { status: 400 }
    );
  }

  const guests = parseInt(guest_count, 10);
  if (!guests || guests < 1) {
    return NextResponse.json({ error: "Invalid guest count" }, { status: 400 });
  }

  const supabase = await createClient();

  // Get tour details
  const { data: tour } = await supabase
    .from("tours")
    .select("name, price, currency")
    .eq("id", tour_id)
    .single();

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  }

  if (!tour.price) {
    return NextResponse.json({ error: "Tour has no price set" }, { status: 400 });
  }

  // No capacity check for custom time — Edward confirms manually

  // Encode custom_id: tour_id|date|start_time|guest_count|custom=true|customer_phone
  // Name/email come from PayPal payer object — no need to encode
  const customId = [
    tour_id,
    date,
    start_time,
    String(guests),
    "custom=true",
    encodeURIComponent(customer_phone || ""),
  ].join("|");

  const amount = Math.round(tour.price * guests);

  try {
    const result = await createPaypalOrder({
      tourName: tour.name,
      amount,
      currency: tour.currency || "JPY",
      customId,
    });

    // Extract approve URL from PayPal response
    const approveUrl = result.links?.find((l: { rel: string; method: string; href: string }) => l.rel === "approve")?.href;

    return NextResponse.json({
      orderId: result.id,
      approveUrl,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[create-custom-order] PayPal error:", msg);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}
