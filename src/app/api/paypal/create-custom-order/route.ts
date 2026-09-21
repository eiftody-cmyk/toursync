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

  // Check existing bookings for time conflicts
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("tour_id, start_time, end_time, guest_count")
    .eq("date", date)
    .eq("status", "confirmed");

  if (existingBookings && existingBookings.length > 0) {
    // Get schedules for duration calculation
    const { data: schedules } = await supabase
      .from("tour_schedules")
      .select("day_of_week, start_time, duration_minutes, start_date, end_date, is_active")
      .eq("tour_id", tour_id)
      .eq("is_active", true);

    const requestedStart = timeToMinutes(start_time);

    for (const booking of existingBookings) {
      const bookingStart = timeToMinutes(booking.start_time);
      let bookingEnd: number;

      if (booking.end_time) {
        bookingEnd = timeToMinutes(booking.end_time);
      } else {
        const schedule = schedules?.find(
          (s) => s.start_time && normalizeTime(s.start_time) === normalizeTime(booking.start_time)
        );
        const duration = schedule?.duration_minutes ?? 150;
        bookingEnd = bookingStart + duration;
      }

      // Check if requested time falls within the booking window
      if (requestedStart >= bookingStart && requestedStart < bookingEnd) {
        const nextAvailable = bookingEnd;
        const nextH = String(Math.floor(nextAvailable / 60)).padStart(2, "0");
        const nextM = String(nextAvailable % 60).padStart(2, "0");
        const nextTime = `${nextH}:${nextM}`;

        // Get the conflicting tour name
        const { data: conflictTour } = await supabase
          .from("tours")
          .select("name")
          .eq("id", booking.tour_id)
          .single();

        const endTimeH = String(Math.floor(bookingEnd / 60)).padStart(2, "0");
        const endTimeM = String(bookingEnd % 60).padStart(2, "0");

        return NextResponse.json(
          {
            error: "unavailable",
            message: `Edward has a tour at ${normalizeTime(booking.start_time)} (until ${endTimeH}:${endTimeM}). The next available time is ${nextTime}.`,
            conflict: {
              tour_name: conflictTour?.name ?? "Tour",
              start_time: normalizeTime(booking.start_time),
              end_time: `${endTimeH}:${endTimeM}`,
            },
            next_available: nextTime,
            existing_tour_id: booking.tour_id,
          },
          { status: 400 }
        );
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
