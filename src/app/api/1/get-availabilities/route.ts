import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import type { GygAvailabilityResponse, GygAvailability } from "@/lib/gyg/types";

function normalizeTime(t: string | null): string {
  if (!t) return "00:00";
  return t.length > 5 ? t.slice(0, 5) : t;
}

export async function GET(req: NextRequest) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const fromDateTime = searchParams.get("fromDateTime");
  const toDateTime = searchParams.get("toDateTime");

  if (!productId || !fromDateTime || !toDateTime) {
    return NextResponse.json(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required query parameters: productId, fromDateTime, toDateTime" },
      { status: 200 }
    );
  }

  const supabase = createServiceClient();

  // Look up tour by GYG product code
  const { data: listing } = await supabase
    .from("tour_channel_listings")
    .select("tour_id, tours(*)")
    .eq("external_product_code", productId)
    .eq("channel", "gyg")
    .eq("is_active", true)
    .single();

  if (!listing?.tours) {
    return NextResponse.json(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${productId}` },
      { status: 200 }
    );
  }

  const tour = (Array.isArray(listing.tours) ? listing.tours[0] : listing.tours) as {
    id: string;
    capacity: number;
    price: number | null;
    currency: string;
    cutoff_minutes: number;
    product_type: "time_point" | "time_period";
    ticket_type: "individual" | "group";
    group_size_min: number;
    group_size_max: number;
    opening_hours: { fromTime: string; toTime: string } | null;
  };

  const isTimePeriod = tour.product_type === "time_period";
  const isGroup = tour.ticket_type === "group";

  // Parse date range
  const fromDate = new Date(fromDateTime);
  const toDate = new Date(toDateTime);
  const fromDateStr = fromDateTime.split("T")[0];
  const toDateStr = toDateTime.split("T")[0];

  // Fetch schedules for this tour
  const { data: schedules } = await supabase
    .from("tour_schedules")
    .select("*")
    .eq("tour_id", tour.id)
    .eq("is_active", true);

  if (!schedules?.length && !isTimePeriod) {
    return NextResponse.json({ data: { availabilities: [] } }, { status: 200 });
  }

  // Fetch exceptions
  const { data: exceptions } = await supabase
    .from("schedule_exceptions")
    .select("date")
    .eq("tour_id", tour.id);
  const exceptionDates = new Set((exceptions ?? []).map((e) => e.date));

  // Fetch blocked dates
  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("date, start_time")
    .eq("tour_id", tour.id);
  const blockedTimeSet = new Set(
    (blocked ?? []).map((b) => `${b.date}_${normalizeTime(b.start_time)}`)
  );

  // Fetch bookings in range (confirmed only)
  const { data: allBookings } = await supabase
    .from("bookings")
    .select("date, start_time, guest_count")
    .eq("tour_id", tour.id)
    .eq("status", "confirmed")
    .gte("date", fromDateStr)
    .lte("date", toDateStr);

  const bookedMap: Record<string, number> = {};
  for (const b of allBookings ?? []) {
    const key = `${b.date}_${normalizeTime(b.start_time)}`;
    bookedMap[key] = (bookedMap[key] ?? 0) + (b.guest_count ?? 0);
  }

  // Also count active (non-expired) reservations
  const { data: activeReservations } = await supabase
    .from("gyg_reservations")
    .select("date, start_time, booking_items, expires_at")
    .eq("tour_id", tour.id)
    .gt("expires_at", new Date().toISOString())
    .gte("date", fromDateStr)
    .lte("date", toDateStr);

  for (const r of activeReservations ?? []) {
    const key = `${r.date}_${normalizeTime(r.start_time)}`;
    let resGuests = 0;
    const items = r.booking_items as Array<{ category: string; count: number; groupSize?: number }> | null;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.category === "GROUP") {
          resGuests += (item.groupSize || 0) * (item.count || 0);
        } else {
          resGuests += item.count || 0;
        }
      }
    }
    bookedMap[key] = (bookedMap[key] ?? 0) + resGuests;
  }

  // Fetch pricing categories
  const { data: pricingCategories } = await supabase
    .from("tour_pricing_categories")
    .select("category, price, currency")
    .eq("tour_id", tour.id);

  // Build availability for each date in range
  const availabilities: GygAvailability[] = [];
  const cutoffSeconds = (tour.cutoff_minutes ?? 60) * 60;
  const currency = tour.currency || "JPY";
  const now = new Date();

  if (isTimePeriod) {
    // ── Time Period: one entry per day with openingTimes ──
    // Iterate dates as strings to avoid timezone conversion issues
    const [startYear, startMonth, startDay] = fromDateStr.split("-").map(Number);
    const [endYear, endMonth, endDay] = toDateStr.split("-").map(Number);
    const current = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    const openingFrom = tour.opening_hours?.fromTime ?? "09:00";
    const openingTo = tour.opening_hours?.toTime ?? "18:00";

    while (current <= end) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;

      // Skip exceptions
      if (exceptionDates.has(dateStr)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Check if the entire day is blocked
      const dayFullyBlocked = [...blockedTimeSet].every((k) => k.startsWith(dateStr + "_"));
      if (dayFullyBlocked && blockedTimeSet.size > 0) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // dateTime is midnight for time period
      const dateTime = `${dateStr}T00:00:00+09:00`;

      // Check cutoff — skip if tour date is within cutoff window
      const dayStart = new Date(`${dateStr}T${openingFrom}:00+09:00`);
      if (dayStart.getTime() - now.getTime() <= cutoffSeconds * 1000) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // For time period, total booked = sum of all bookings for this date
      const dateBookings = allBookings?.filter((b) => b.date === dateStr) ?? [];
      const totalBooked = dateBookings.reduce((sum, b) => sum + (b.guest_count ?? 0), 0);
      const remaining = Math.max(0, tour.capacity - totalBooked);

      const retailPrices = (pricingCategories ?? []).map((pc) => ({
        category: pc.category,
        price: pc.price,
      }));

      const avail: GygAvailability = {
        productId,
        dateTime,
        cutoffSeconds,
        vacancies: isGroup ? Math.floor(remaining / (tour.group_size_max || 1)) : remaining,
        currency,
        openingTimes: [{ fromTime: openingFrom, toTime: openingTo }],
      };

      if (retailPrices.length > 0) {
        avail.pricesByCategory = { retailPrices: retailPrices as GygAvailability["pricesByCategory"] extends { retailPrices: infer T } ? T : never };
      }

      availabilities.push(avail);
      current.setDate(current.getDate() + 1);
    }
  } else {
    // ── Time Point: one entry per schedule slot ──
    // Iterate dates as strings to avoid timezone conversion issues
    const [startYear, startMonth, startDay] = fromDateStr.split("-").map(Number);
    const [endYear, endMonth, endDay] = toDateStr.split("-").map(Number);
    const current = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    while (current <= end) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
      const dayOfWeek = current.getDay();

      const daySchedules = schedules?.filter((s) => s.day_of_week === dayOfWeek) ?? [];

      for (const schedule of daySchedules) {
        if (exceptionDates.has(dateStr)) continue;

        const blockKey = `${dateStr}_${normalizeTime(schedule.start_time)}`;
        if (blockedTimeSet.has(blockKey)) continue;

        const startTime = normalizeTime(schedule.start_time);
        const dateTime = `${dateStr}T${startTime}:00+09:00`;

        const slotTime = new Date(dateTime);
        if (slotTime <= now) continue;

        if (slotTime.getTime() - now.getTime() <= cutoffSeconds * 1000) continue;

        const timeKey = `${dateStr}_${startTime}`;
        const booked = bookedMap[timeKey] ?? 0;
        const remaining = Math.max(0, tour.capacity - booked);

        const retailPrices = (pricingCategories ?? []).map((pc) => ({
          category: pc.category,
          price: pc.price,
        }));

        const avail: GygAvailability = {
          productId,
          dateTime,
          cutoffSeconds,
          vacancies: isGroup ? Math.floor(remaining / (tour.group_size_max || 1)) : remaining,
          currency,
        };

        if (retailPrices.length > 0) {
          avail.pricesByCategory = { retailPrices: retailPrices as GygAvailability["pricesByCategory"] extends { retailPrices: infer T } ? T : never };
        }

        availabilities.push(avail);
      }

      current.setDate(current.getDate() + 1);
    }
  }

  const response: GygAvailabilityResponse = {
    data: { availabilities },
  };

  return NextResponse.json(response, { status: 200 });
}
