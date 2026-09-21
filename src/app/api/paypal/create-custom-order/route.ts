import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createPaypalOrder } from "@/lib/paypal/client";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";
import {
  clusterBlockRows,
  manualBlockedForTour,
  manualBlockCoversStart,
  timeToMinutes,
  normalizeTime,
} from "@/lib/schedules/blockOverlap";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tour_id, date, start_time, guest_count, customer_phone } = body;

  const rl = rateLimit(`create-custom-order:${clientIp(req)}`, 20);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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

  const supabase = createServiceClient();

  // Get tour details
  const { data: tour } = await supabase
    .from("tours")
    .select("name, price, currency, product_type, opening_hours")
    .eq("id", tour_id)
    .single();

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  }

  if (!tour.price) {
    return NextResponse.json({ error: "Tour has no price set" }, { status: 400 });
  }

  // No capacity check for custom time — Edward confirms manually
  // But reject blocked dates so customers can't book on unavailable days
  const { data: blockedRows } = await supabase
    .from("blocked_dates")
    .select("date, start_time, end_time, is_auto_blocked")
    .eq("tour_id", tour_id)
    .eq("date", date);

  if (blockedRows && blockedRows.length > 0) {
    const { allDayDates, manualRows, autoTimeSet } = clusterBlockRows(blockedRows);

    if (allDayDates.has(date)) {
      return NextResponse.json({ error: "Edward is not available on this date. Please choose another date." }, { status: 400 });
    }

    if (autoTimeSet.has(`${date}_${normalizeTime(start_time)}`)) {
      return NextResponse.json({ error: "This time slot is already fully booked. Please choose a different time." }, { status: 400 });
    }

    if (manualRows.length > 0) {
      if (tour.product_type === "time_point") {
        const { data: schedules } = await supabase
          .from("tour_schedules")
          .select("day_of_week, start_time, duration_minutes, start_date, end_date, is_active")
          .eq("tour_id", tour_id)
          .eq("is_active", true);
        if (manualBlockedForTour(manualRows, tour, date, schedules)) {
          return NextResponse.json({ error: "Edward is not available at this time. Please choose a different time or date." }, { status: 400 });
        }
        if (start_time && manualBlockCoversStart(manualRows, date, timeToMinutes(start_time))) {
          return NextResponse.json({ error: "Edward is not available at this time. Please choose a different time or date." }, { status: 400 });
        }
      } else if (manualBlockedForTour(manualRows, tour, date, [])) {
        return NextResponse.json({ error: "Edward is not available on this date. Please choose another date." }, { status: 400 });
      }
    }
  }

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
