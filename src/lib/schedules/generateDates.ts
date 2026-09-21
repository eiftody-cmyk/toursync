import type { SupabaseClient } from "@supabase/supabase-js";
import { clusterBlockRows, manualBlockedForTour } from "./blockOverlap";

export interface AvailableDate {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  duration_minutes: number;
  remaining: number;
}

export interface DateAvailability {
  available: AvailableDate[];
  blocked: string[]; // YYYY-MM-DD
  full: string[]; // YYYY-MM-DD
}

// PostgreSQL time returns "10:00:00" — strip seconds for consistent comparison
function normalizeTime(t: string | null): string {
  if (!t) return "00:00";
  return t.length > 5 ? t.slice(0, 5) : t;
}

// ── Japan-time helpers ──
// Japan (Asia/Tokyo) is UTC+9 with no DST.
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Shift a Date so its UTC fields represent the Japan wall-clock time
function shiftJst(date: Date): Date {
  return new Date(date.getTime() + JST_OFFSET_MS);
}

// Format a Date as a YYYY-MM-DD date string in Japan time
function jstDateStr(date: Date): string {
  const j = shiftJst(date);
  const m = String(j.getUTCMonth() + 1).padStart(2, "0");
  const d = String(j.getUTCDate()).padStart(2, "0");
  return `${j.getUTCFullYear()}-${m}-${d}`;
}

// Day-of-week (0=Sun) for a YYYY-MM-DD date string in Japan time
function jstDayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00+09:00`).getUTCDay();
}

/**
 * Generate available dates for a tour based on its schedule.
 * Returns available dates, blocked dates, and full dates for calendar display.
 */
export async function generateAvailableDates(
  supabase: SupabaseClient,
  tourId: string,
  monthsAhead: number = 13
): Promise<DateAvailability> {
  const nowAbs = Date.now();
  const todayJst = jstDateStr(new Date(nowAbs));
  const nowMinutesJst = shiftJst(new Date(nowAbs)).getUTCHours() * 60 + shiftJst(new Date(nowAbs)).getUTCMinutes();

  const rangeEnd = new Date(nowAbs);
  rangeEnd.setUTCMonth(rangeEnd.getUTCMonth() + monthsAhead);
  const rangeEndStr = jstDateStr(rangeEnd);

  // 1. Fetch active schedules
  const { data: schedules } = await supabase
    .from("tour_schedules")
    .select("*")
    .eq("tour_id", tourId)
    .eq("is_active", true);

  // 2. Fetch exceptions
  const { data: exceptions } = await supabase
    .from("schedule_exceptions")
    .select("date")
    .eq("tour_id", tourId);

  const exceptionDates = new Set((exceptions ?? []).map((e) => e.date));

  // 3. Fetch blocked dates — normalize start_time
  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("date, start_time, end_time, is_auto_blocked")
    .eq("tour_id", tourId);

  // Split blocks: all-day (manual or auto) blocks every slot on the date,
  // manual timed blocks use overlap against the tour's operating window,
  // auto timed blocks only close their exact slot.
  const { allDayDates, manualRows, autoTimeSet } = clusterBlockRows(blocked);
  const allDayBlockedDates = allDayDates;
  // Report all-day blocked dates on the calendar even when the weekday has no schedule
  const allDayBlockedDatesInRange = [...allDayBlockedDates]
    .filter((d) => d >= todayJst && d <= rangeEndStr)
    .sort();

  // No schedules — still show blocked days on the calendar
  if (!schedules?.length) {
    return { available: [], blocked: allDayBlockedDatesInRange, full: [] };
  }

  // 4. Fetch tour capacity and cutoffs
  const { data: tour } = await supabase
    .from("tours")
    .select("capacity, cutoff_minutes, new_guest_cutoff_minutes, product_type, opening_hours")
    .eq("id", tourId)
    .single();

  const capacity = tour?.capacity ?? 10;
  const cutoffMinutes = tour?.cutoff_minutes ?? 60;
  const newGuestCutoff = tour?.new_guest_cutoff_minutes ?? null;

  // Track all dates that have a schedule (for blocked detection)
  const allScheduledDates = new Set<string>();
  const candidateDates: Array<{ date: string; schedule: typeof schedules[number] }> = [];

  const todayJstStartAbs = Date.parse(`${todayJst}T00:00:00+09:00`);
  const rangeEndAbs = Date.parse(`${rangeEndStr}T00:00:00+09:00`);

  for (const schedule of schedules) {
    const startAbs = Date.parse(`${schedule.start_date}T00:00:00+09:00`);
    const endAbs = schedule.end_date
      ? Date.parse(`${schedule.end_date}T00:00:00+09:00`)
      : rangeEndAbs;

    const effectiveStart = Math.max(startAbs, todayJstStartAbs);

    for (let ts = effectiveStart; ts <= endAbs; ts += DAY_MS) {
      const dateStr = jstDateStr(new Date(ts));
      if (jstDayOfWeek(dateStr) !== schedule.day_of_week) continue;

      allScheduledDates.add(dateStr);

      // Skip exceptions
      if (exceptionDates.has(dateStr)) continue;

      const tourDayBlocked =
        !!(tour && manualBlockedForTour(manualRows, tour, dateStr, schedules));
      // Skip blocked days (all-day or manual overlap) and exact auto-blocked slots
      if (allDayBlockedDates.has(dateStr)) continue;
      if (tourDayBlocked) continue;

      const blockKey = `${dateStr}_${normalizeTime(schedule.start_time)}`;
      if (autoTimeSet.has(blockKey)) continue;

      candidateDates.push({ date: dateStr, schedule });
    }
  }

  if (candidateDates.length === 0 && allScheduledDates.size === 0) {
    return { available: [], blocked: allDayBlockedDatesInRange, full: [] };
  }

  // 6. Batch fetch ALL bookings for this tour in one query
  const allDates = [...allScheduledDates].sort();
  if (allDates.length === 0) return { available: [], blocked: allDayBlockedDatesInRange, full: [] };

  const earliestDate = allDates[0];
  const latestDate = allDates[allDates.length - 1];

  const { data: allBookings } = await supabase
    .from("bookings")
    .select("date, start_time, guest_count")
    .eq("tour_id", tourId)
    .eq("status", "confirmed")
    .gte("date", earliestDate)
    .lte("date", latestDate);

  // 7. Group bookings by date+time for fast lookup
  const bookedMap: Record<string, number> = {};
  for (const b of allBookings ?? []) {
    const key = `${b.date}_${normalizeTime(b.start_time)}`;
    bookedMap[key] = (bookedMap[key] ?? 0) + (b.guest_count ?? 0);
  }

  // 8. Build available dates and identify full dates
  const available: AvailableDate[] = [];
  const fullDates: string[] = [];
  const blockedDates: string[] = [];

  // Find fully blocked dates (all time slots for a date are blocked)
  for (const dateStr of allScheduledDates) {
    const slotsForDate = schedules.filter((s) => jstDayOfWeek(dateStr) === s.day_of_week);

    const dateManualBlocked = !!(tour && manualBlockedForTour(manualRows, tour, dateStr, schedules));
    const allSlotsBlocked = slotsForDate.every((s) => {
      const key = `${dateStr}_${normalizeTime(s.start_time)}`;
      return autoTimeSet.has(key) || allDayBlockedDates.has(dateStr) || dateManualBlocked || exceptionDates.has(dateStr);
    });

    if (allSlotsBlocked && slotsForDate.length > 0) {
      blockedDates.push(dateStr);
    }
  }

  for (const { date, schedule } of candidateDates) {
    const timeKey = `${date}_${normalizeTime(schedule.start_time)}`;
    const booked = bookedMap[timeKey] ?? 0;
    const remaining = capacity - booked;

    // Today only: a slot closes at start − cutoff, or start − new-guest
    // cutoff (default: same) once a confirmed booking already exists.
    if (date === todayJst) {
      const [h, m] = normalizeTime(schedule.start_time).split(":").map(Number);
      const slotStartMin = h * 60 + m;
      const effectiveCutoff = cutoffMinutes === 0 ? 0 : booked > 0 ? (newGuestCutoff ?? cutoffMinutes) : cutoffMinutes;
      if (nowMinutesJst >= slotStartMin - effectiveCutoff) continue;
    }

    if (remaining > 0) {
      available.push({
        date,
        start_time: normalizeTime(schedule.start_time),
        duration_minutes: schedule.duration_minutes,
        remaining,
      });
    } else {
      fullDates.push(date);
    }
  }

  // Any scheduled day with no bookable slot left is shown as full
  // (covers today past its last cutoff, fully excepted days, etc.)
  for (const dateStr of allScheduledDates) {
    if (available.some((a) => a.date === dateStr)) continue;
    if (blockedDates.includes(dateStr) || fullDates.includes(dateStr)) continue;
    fullDates.push(dateStr);
  }

  // Hide today from the calendar once all its slots have passed the cutoff
  if (allScheduledDates.has(todayJst) && !available.some((a) => a.date === todayJst)) {
    const fullIdx = fullDates.indexOf(todayJst);
    if (fullIdx !== -1) fullDates.splice(fullIdx, 1);
    const blockedIdx = blockedDates.indexOf(todayJst);
    if (blockedIdx !== -1) blockedDates.splice(blockedIdx, 1);
  }

  // Merge all-day blocked dates (including weekdays without a schedule)
  for (const dateStr of allDayBlockedDatesInRange) {
    if (!blockedDates.includes(dateStr)) blockedDates.push(dateStr);
  }

  // Sort
  available.sort((a, b) =>
    a.date === b.date ? a.start_time.localeCompare(b.start_time) : a.date.localeCompare(b.date)
  );
  blockedDates.sort();
  fullDates.sort();

  return { available, blocked: blockedDates, full: fullDates };
}
