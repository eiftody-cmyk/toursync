import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { createGygLogger, logResponse } from "@/lib/gyg/logger";
import { gygJson } from "@/lib/gyg/response";
import { lookupTourByProductId } from "@/lib/gyg/lookup";
import type { GygAvailabilityResponse, GygAvailability } from "@/lib/gyg/types";

function normalizeTime(t: string | null): string {
  if (!t) return "00:00";
  return t.length > 5 ? t.slice(0, 5) : t;
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const ctx = createGygLogger("get-availabilities", req);

  try {
    return await GET_inner(req, startTime, ctx);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[GYG get-availabilities] Unhandled error:", msg);
    const err = { errorCode: "INTERNAL_SYSTEM_FAILURE" as const, errorMessage: "Internal system failure" };
    logResponse(ctx, 200, err, startTime);
    return gygJson(err, { status: 200 });
  }
}

async function GET_inner(req: NextRequest, startTime: number, ctx: ReturnType<typeof createGygLogger>) {
  const authError = verifyGygAuth(req);
  if (authError) {
    logResponse(ctx, 200, { errorCode: "AUTHORIZATION_FAILURE" }, startTime);
    return authError;
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const fromDateTime = searchParams.get("fromDateTime");
  const toDateTime = searchParams.get("toDateTime");

  if (!productId || !fromDateTime || !toDateTime) {
    return gygJson(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required query parameters: productId, fromDateTime, toDateTime" },
      { status: 200 }
    );
  }

  const supabase = createServiceClient();

  // Look up tour by GYG product code (handles T-1221780 and 1221780)
  const result = await lookupTourByProductId(productId);
  if (!result) {
    return gygJson(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${productId}` },
      { status: 200 }
    );
  }

  const tour = result.tour;

  const isTimePeriod = tour.product_type === "time_period";
  const isGroup = tour.ticket_type === "group";

  // Parse date range
  const fromDate = new Date(fromDateTime);
  const toDate = new Date(toDateTime);
  const fromDateStr = fromDateTime.split("T")[0];
  const toDateStr = toDateTime.split("T")[0];

  // Parallelize all independent Supabase queries
  const [schedulesResult, exceptionsResult, blockedResult, bookingsResult, reservationsResult, pricingResult] = await Promise.all([
    supabase.from("tour_schedules").select("*").eq("tour_id", tour.id).eq("is_active", true),
    supabase.from("schedule_exceptions").select("date").eq("tour_id", tour.id),
    supabase.from("blocked_dates").select("date, start_time").eq("tour_id", tour.id),
    supabase.from("bookings").select("date, start_time, guest_count").eq("tour_id", tour.id).eq("status", "confirmed").gte("date", fromDateStr).lte("date", toDateStr),
    supabase.from("gyg_reservations").select("date, start_time, booking_items, expires_at").eq("tour_id", tour.id).gt("expires_at", new Date().toISOString()).gte("date", fromDateStr).lte("date", toDateStr),
    supabase.from("tour_pricing_categories").select("category, price, currency").eq("tour_id", tour.id),
  ]);

  const schedules = schedulesResult.data;
  const exceptions = exceptionsResult.data;
  const blocked = blockedResult.data;
  const allBookings = bookingsResult.data;
  const activeReservations = reservationsResult.data;
  const pricingCategories = pricingResult.data;

  if (!schedules?.length && !isTimePeriod) {
    return gygJson({ data: { availabilities: [] } }, { status: 200 });
  }

  const exceptionDates = new Set((exceptions ?? []).map((e) => e.date));
  const blockedTimeSet = new Set(
    (blocked ?? []).map((b) => `${b.date}_${normalizeTime(b.start_time)}`)
  );

  const bookedMap: Record<string, number> = {};
  for (const b of allBookings ?? []) {
    const key = `${b.date}_${normalizeTime(b.start_time)}`;
    bookedMap[key] = (bookedMap[key] ?? 0) + (b.guest_count ?? 0);
  }

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
      // For time_period: a null start_time in blocked_dates means the whole day is blocked
      const dayBlockedEntries = [...blockedTimeSet].filter((k) => k.startsWith(dateStr + "_"));
      const dayFullyBlocked = dayBlockedEntries.some((k) => {
        const time = k.split("_")[1];
        return time === "null" || time === "00:00" || time === undefined;
      });
      if (dayFullyBlocked) {
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

      // For time period, total booked = sum of all bookings + active reservations for this date
      const dateBookings = allBookings?.filter((b) => b.date === dateStr) ?? [];
      let totalBooked = dateBookings.reduce((sum, b) => sum + (b.guest_count ?? 0), 0);

      // Also count active reservations for this date
      const dateReservations = activeReservations?.filter((r) => r.date === dateStr) ?? [];
      for (const r of dateReservations) {
        const items = r.booking_items as Array<{ category: string; count: number; groupSize?: number }> | null;
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item.category === "GROUP") {
              totalBooked += (item.groupSize || 0) * (item.count || 0);
            } else {
              totalBooked += item.count || 0;
            }
          }
        }
      }

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

  logResponse(ctx, 200, response, startTime);
  return gygJson(response, { status: 200 });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ctx = createGygLogger("get-availabilities", req);

  try {
    return await POST_inner(req, startTime, ctx);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[GYG get-availabilities POST] Unhandled error:", msg);
    const err = { errorCode: "INTERNAL_SYSTEM_FAILURE" as const, errorMessage: "Internal system failure" };
    logResponse(ctx, 200, err, startTime);
    return gygJson(err, { status: 200 });
  }
}

async function POST_inner(req: NextRequest, startTime: number, ctx: ReturnType<typeof createGygLogger>) {
  const authError = verifyGygAuth(req);
  if (authError) {
    logResponse(ctx, 200, { errorCode: "AUTHORIZATION_FAILURE" }, startTime);
    return authError;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return gygJson(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Invalid JSON body" },
      { status: 200 }
    );
  }
  const data = (body as Record<string, unknown>) as { data?: Record<string, unknown> } | undefined;
  const requestData = (data?.data ?? {}) as {
    productId?: string;
    fromDateTime?: string;
    toDateTime?: string;
  };

  if (!requestData.productId || !requestData.fromDateTime || !requestData.toDateTime) {
    return gygJson(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required fields: productId, fromDateTime, toDateTime" },
      { status: 200 }
    );
  }

  const supabase = createServiceClient();

  const result = await lookupTourByProductId(requestData.productId!);
  if (!result) {
    return gygJson(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${requestData.productId}` },
      { status: 200 }
    );
  }

  const tour = result.tour;

  const isTimePeriod = tour.product_type === "time_period";
  const isGroup = tour.ticket_type === "group";

  const fromDateStr = requestData.fromDateTime.split("T")[0];
  const toDateStr = requestData.toDateTime.split("T")[0];

  // Parallelize all independent Supabase queries
  const [schedulesResult, exceptionsResult, blockedResult, bookingsResult, reservationsResult, pricingResult] = await Promise.all([
    supabase.from("tour_schedules").select("*").eq("tour_id", tour.id).eq("is_active", true),
    supabase.from("schedule_exceptions").select("date").eq("tour_id", tour.id),
    supabase.from("blocked_dates").select("date, start_time").eq("tour_id", tour.id),
    supabase.from("bookings").select("date, start_time, guest_count").eq("tour_id", tour.id).eq("status", "confirmed").gte("date", fromDateStr).lte("date", toDateStr),
    supabase.from("gyg_reservations").select("date, start_time, booking_items, expires_at").eq("tour_id", tour.id).gt("expires_at", new Date().toISOString()).gte("date", fromDateStr).lte("date", toDateStr),
    supabase.from("tour_pricing_categories").select("category, price, currency").eq("tour_id", tour.id),
  ]);

  const schedules = schedulesResult.data;
  const exceptions = exceptionsResult.data;
  const blocked = blockedResult.data;
  const allBookings = bookingsResult.data;
  const activeReservations = reservationsResult.data;
  const pricingCategories = pricingResult.data;

  if (!schedules?.length && !isTimePeriod) {
    return gygJson({ data: { availabilities: [] } }, { status: 200 });
  }

  const exceptionDates = new Set((exceptions ?? []).map((e) => e.date));
  const blockedTimeSet = new Set(
    (blocked ?? []).map((b) => `${b.date}_${normalizeTime(b.start_time)}`)
  );

  const bookedMap: Record<string, number> = {};
  for (const b of allBookings ?? []) {
    const key = `${b.date}_${normalizeTime(b.start_time)}`;
    bookedMap[key] = (bookedMap[key] ?? 0) + (b.guest_count ?? 0);
  }

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

  const availabilities: GygAvailability[] = [];
  const cutoffSeconds = (tour.cutoff_minutes ?? 60) * 60;
  const currency = tour.currency || "JPY";
  const now = new Date();

  if (isTimePeriod) {
    const [startYear, startMonth, startDay] = fromDateStr.split("-").map(Number);
    const [endYear, endMonth, endDay] = toDateStr.split("-").map(Number);
    const current = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    const openingFrom = tour.opening_hours?.fromTime ?? "09:00";
    const openingTo = tour.opening_hours?.toTime ?? "18:00";

    while (current <= end) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;

      if (exceptionDates.has(dateStr)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      const dayBlockedEntries = [...blockedTimeSet].filter((k) => k.startsWith(dateStr + "_"));
      const dayFullyBlocked = dayBlockedEntries.some((k) => {
        const time = k.split("_")[1];
        return time === "null" || time === "00:00" || time === undefined;
      });
      if (dayFullyBlocked) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      const dateTime = `${dateStr}T00:00:00+09:00`;

      const dayStart = new Date(`${dateStr}T${openingFrom}:00+09:00`);
      if (dayStart.getTime() - now.getTime() <= cutoffSeconds * 1000) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      const dateBookings = allBookings?.filter((b) => b.date === dateStr) ?? [];
      let totalBooked = dateBookings.reduce((sum, b) => sum + (b.guest_count ?? 0), 0);

      const dateReservations = activeReservations?.filter((r) => r.date === dateStr) ?? [];
      for (const r of dateReservations) {
        const items = r.booking_items as Array<{ category: string; count: number; groupSize?: number }> | null;
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item.category === "GROUP") {
              totalBooked += (item.groupSize || 0) * (item.count || 0);
            } else {
              totalBooked += item.count || 0;
            }
          }
        }
      }

      const remaining = Math.max(0, tour.capacity - totalBooked);

      const retailPrices = (pricingCategories ?? []).map((pc) => ({
        category: pc.category,
        price: pc.price,
      }));

      const avail: GygAvailability = {
        productId: requestData.productId!,
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
          productId: requestData.productId!,
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

  logResponse(ctx, 200, response, startTime);
  return gygJson(response, { status: 200 });
}
