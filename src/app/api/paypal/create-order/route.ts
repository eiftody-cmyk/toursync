import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getPaymentProvider } from "@/lib/payments";
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
  const { tour_id, date, start_time, guest_count } = body;

  const rl = rateLimit(`create-order:${clientIp(req)}`, 20);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!tour_id || !date || !guest_count) {
    return NextResponse.json({ error: "tour_id, date, guest_count required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: tour } = await supabase
    .from("tours")
    .select("name, price, currency, cutoff_minutes, new_guest_cutoff_minutes, product_type, opening_hours")
    .eq("id", tour_id)
    .single();

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  }

  if (!tour.price) {
    return NextResponse.json({ error: "Tour has no price set" }, { status: 400 });
  }

  // Check existing confirmed bookings (also used for the last-minute booking exception)
  const { data: bookings } = await supabase
    .from("bookings")
    .select("guest_count")
    .eq("tour_id", tour_id)
    .eq("date", date)
    .eq("start_time", start_time ?? null)
    .eq("status", "confirmed");

  // Cutoff validation (Japan time): a slot closes at start − cutoff, or start −
  // new-guest cutoff (default: same) if a confirmed booking already exists.
  const cutoffMinutes = tour.cutoff_minutes ?? 60;
  const newGuestCutoff = tour.new_guest_cutoff_minutes ?? null;
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayStr = `${jst.getUTCFullYear()}-${String(jst.getUTCMonth() + 1).padStart(2, "0")}-${String(jst.getUTCDate()).padStart(2, "0")}`;
  if (date === todayStr && start_time) {
    const nowMinutes = jst.getUTCHours() * 60 + jst.getUTCMinutes();
    const [h, m] = start_time.split(":").map(Number);
    const slotMinutes = h * 60 + m;
    const existingBooking = (bookings ?? []).length > 0;
    const effectiveCutoff = cutoffMinutes === 0 ? 0 : existingBooking ? (newGuestCutoff ?? cutoffMinutes) : cutoffMinutes;
    if (nowMinutes >= slotMinutes - effectiveCutoff) {
      return NextResponse.json({ error: "This tour time has already passed the booking cutoff" }, { status: 400 });
    }
  }

  // Fetch all blocks for this tour/date and apply busy-window semantics:
  // all-day blocks close the date; manual timed blocks close the tour when
  // they overlap its operating window (or, for time_point, the requested slot);
  // auto full-capacity blocks close their exact slot.
  const { data: blockedRows } = await supabase
    .from("blocked_dates")
    .select("date, start_time, end_time, is_auto_blocked")
    .eq("tour_id", tour_id)
    .eq("date", date);

  if (blockedRows && blockedRows.length > 0) {
    const { allDayDates, manualRows, autoTimeSet } = clusterBlockRows(blockedRows);

    if (allDayDates.has(date)) {
      return NextResponse.json({ error: "This date/time is not available" }, { status: 400 });
    }

    if (autoTimeSet.has(`${date}_${normalizeTime(start_time)}`)) {
      return NextResponse.json({ error: "This date/time is not available" }, { status: 400 });
    }

    if (manualRows.length > 0) {
      // time_point: whole tour-day is unavailable if any manual block overlaps
      // any of that date's slots; time_period: overlap against the operating window.
      if (tour.product_type === "time_point") {
        const { data: schedules } = await supabase
          .from("tour_schedules")
          .select("day_of_week, start_time, duration_minutes, start_date, end_date, is_active")
          .eq("tour_id", tour_id)
          .eq("is_active", true);
        if (manualBlockedForTour(manualRows, tour, date, schedules)) {
          return NextResponse.json({ error: "This date/time is not available" }, { status: 400 });
        }
        if (start_time && manualBlockCoversStart(manualRows, date, timeToMinutes(start_time))) {
          return NextResponse.json({ error: "This date/time is not available" }, { status: 400 });
        }
      } else if (manualBlockedForTour(manualRows, tour, date, [])) {
        return NextResponse.json({ error: "This date/time is not available" }, { status: 400 });
      }
    }
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
    const provider = getPaymentProvider();
    const order = await provider.createOrder({
      tourName: tour.name,
      amount: Math.round(tour.price * guest_count),
      currency: tour.currency || "JPY",
      customId,
    });

    return NextResponse.json({
      orderId: order.id,
      approveUrl: order.approveUrl,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[Payment] create order failed:", msg);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
