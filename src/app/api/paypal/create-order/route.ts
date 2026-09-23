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
import { filterBySlot } from "@/lib/core/slot";
import { checkCapacity } from "@/lib/core/availability";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tour_id, date, start_time, guest_count } = body;

  const rl = rateLimit(`create-order:${clientIp(req)}`, 20);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!tour_id || !date || guest_count === undefined || guest_count === null) {
    return NextResponse.json({ error: "tour_id, date, guest_count required" }, { status: 400 });
  }

  if (typeof tour_id !== "string" || !/^[0-9a-f-]{36}$/i.test(tour_id)) {
    return NextResponse.json({ error: "Invalid tour_id" }, { status: 400 });
  }
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const guestCount = Number(guest_count);
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 99) {
    return NextResponse.json({ error: "Invalid guest_count" }, { status: 400 });
  }
  if (start_time !== undefined && start_time !== null && start_time !== "") {
    if (typeof start_time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(start_time.slice(0, 5))) {
      return NextResponse.json({ error: "Invalid start_time" }, { status: 400 });
    }
  }
  const normalizedStart = start_time ? start_time.slice(0, 5) : null;

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

  // JST today for date/cutoff checks
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayStr = `${jst.getUTCFullYear()}-${String(jst.getUTCMonth() + 1).padStart(2, "0")}-${String(jst.getUTCDate()).padStart(2, "0")}`;
  if (date < todayStr) {
    return NextResponse.json({ error: "Date is in the past" }, { status: 400 });
  }

  // For time_period tours, resolve an effective start from opening_hours for cutoff logic
  let effectiveStart = normalizedStart;
  if (!effectiveStart && tour.product_type === "time_period") {
    const fromTime =
      typeof tour.opening_hours === "object" && tour.opening_hours && "fromTime" in tour.opening_hours
        ? String((tour.opening_hours as { fromTime?: string }).fromTime ?? "")
        : "";
    effectiveStart = fromTime ? fromTime.slice(0, 5) : null;
  }

  // Check existing confirmed bookings (also used for the last-minute booking exception)
  const { data: bookings, error: bookingsError } = await filterBySlot(
    supabase
      .from("bookings")
      .select("guest_count")
      .eq("tour_id", tour_id)
      .eq("date", date),
    normalizedStart
  ).eq("status", "confirmed");
  if (bookingsError) {
    console.error("[create-order] capacity query failed:", bookingsError.message);
    return NextResponse.json({ error: "Unable to verify availability" }, { status: 500 });
  }

  // Cutoff validation (Japan time): a slot closes at start − cutoff, or start −
  // new-guest cutoff (default: same) if a confirmed booking already exists.
  const cutoffMinutes = tour.cutoff_minutes ?? 60;
  const newGuestCutoff = tour.new_guest_cutoff_minutes ?? null;
  if (date === todayStr && effectiveStart) {
    const nowMinutes = jst.getUTCHours() * 60 + jst.getUTCMinutes();
    const [h, m] = effectiveStart.split(":").map(Number);
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

    if (autoTimeSet.has(`${date}_${normalizeTime(normalizedStart)}`)) {
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
        if (normalizedStart && manualBlockCoversStart(manualRows, date, timeToMinutes(normalizedStart))) {
          return NextResponse.json({ error: "This date/time is not available" }, { status: 400 });
        }
      } else if (manualBlockedForTour(manualRows, tour, date, [])) {
        return NextResponse.json({ error: "This date/time is not available" }, { status: 400 });
      }
    }
  }

  // Count confirmed bookings + active OTA holds (single source of truth)
  let capacity;
  try {
    capacity = await checkCapacity(tour_id, date, normalizedStart);
  } catch (e) {
    console.error("[create-order] capacity check failed:", e);
    return NextResponse.json({ error: "Unable to verify availability" }, { status: 500 });
  }
  const remaining = capacity.remaining;

  if (guestCount > remaining) {
    return NextResponse.json({ error: `Only ${remaining} spot${remaining === 1 ? "" : "s"} left` }, { status: 400 });
  }

  // Encode booking info in custom_id: tour_id|date|start_time|guest_count
  const customId = [tour_id, date, normalizedStart ?? "", guestCount].join("|");

  try {
    const provider = getPaymentProvider();
    const order = await provider.createOrder({
      tourName: tour.name,
      amount: Math.round(tour.price * guestCount),
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
