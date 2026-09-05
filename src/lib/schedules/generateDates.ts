import type { SupabaseClient } from "@supabase/supabase-js";

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

/**
 * Generate available dates for a tour based on its schedule.
 * Returns available dates, blocked dates, and full dates for calendar display.
 */
export async function generateAvailableDates(
  supabase: SupabaseClient,
  tourId: string,
  monthsAhead: number = 6
): Promise<DateAvailability> {
  // 1. Fetch active schedules
  const { data: schedules } = await supabase
    .from("tour_schedules")
    .select("*")
    .eq("tour_id", tourId)
    .eq("is_active", true);

  if (!schedules?.length) return { available: [], blocked: [], full: [] };

  // 2. Fetch exceptions
  const { data: exceptions } = await supabase
    .from("schedule_exceptions")
    .select("date")
    .eq("tour_id", tourId);

  const exceptionDates = new Set((exceptions ?? []).map((e) => e.date));

  // 3. Fetch blocked dates — normalize start_time
  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("date, start_time")
    .eq("tour_id", tourId);

  // Track blocked per date+time AND per date
  const blockedTimeSet = new Set(
    (blocked ?? []).map((b) => `${b.date}_${normalizeTime(b.start_time)}`)
  );
  const blockedDateSet = new Set<string>();
  for (const b of blocked ?? []) {
    // A date is "blocked" on the calendar if ALL its time slots are blocked
    // For now, track individual blocked slots
    blockedDateSet.add(b.date);
  }

  // 4. Fetch tour capacity
  const { data: tour } = await supabase
    .from("tours")
    .select("capacity")
    .eq("id", tourId)
    .single();

  const capacity = tour?.capacity ?? 10;

  // 5. Generate all candidate dates
  const now = new Date();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + monthsAhead);

  // Track all dates that have a schedule (for blocked detection)
  const allScheduledDates = new Set<string>();
  const candidateDates: Array<{ date: string; schedule: typeof schedules[number] }> = [];

  for (const schedule of schedules) {
    const startDate = new Date(schedule.start_date);
    const endDate = schedule.end_date
      ? new Date(schedule.end_date)
      : cutoff;

    const effectiveStart = startDate > now ? startDate : new Date(now);
    const effectiveEnd = endDate < cutoff ? endDate : cutoff;

    const current = new Date(effectiveStart);
    while (current.getDay() !== schedule.day_of_week && current <= effectiveEnd) {
      current.setDate(current.getDate() + 1);
    }

    while (current <= effectiveEnd) {
      const dateStr = current.toISOString().split("T")[0];
      allScheduledDates.add(dateStr);

      // Skip exceptions
      if (exceptionDates.has(dateStr)) {
        current.setDate(current.getDate() + 7);
        continue;
      }

      // Skip blocked time slots
      const blockKey = `${dateStr}_${normalizeTime(schedule.start_time)}`;
      if (blockedTimeSet.has(blockKey)) {
        // This slot is blocked — if ALL slots for this date are blocked, mark as fully blocked
        current.setDate(current.getDate() + 7);
        continue;
      }

      candidateDates.push({ date: dateStr, schedule });
      current.setDate(current.getDate() + 7);
    }
  }

  if (candidateDates.length === 0 && allScheduledDates.size === 0) {
    return { available: [], blocked: [], full: [] };
  }

  // 6. Batch fetch ALL bookings for this tour in one query
  const allDates = [...allScheduledDates].sort();
  if (allDates.length === 0) return { available: [], blocked: [], full: [] };

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
    const slotsForDate = schedules.filter((s) => {
      const d = new Date(dateStr + "T00:00:00");
      return d.getDay() === s.day_of_week;
    });

    const allSlotsBlocked = slotsForDate.every((s) => {
      const key = `${dateStr}_${normalizeTime(s.start_time)}`;
      return blockedTimeSet.has(key) || exceptionDates.has(dateStr);
    });

    if (allSlotsBlocked && slotsForDate.length > 0) {
      blockedDates.push(dateStr);
    }
  }

  for (const { date, schedule } of candidateDates) {
    const timeKey = `${date}_${normalizeTime(schedule.start_time)}`;
    const booked = bookedMap[timeKey] ?? 0;
    const remaining = capacity - booked;

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

  // Sort
  available.sort((a, b) =>
    a.date === b.date ? a.start_time.localeCompare(b.start_time) : a.date.localeCompare(b.date)
  );
  blockedDates.sort();
  fullDates.sort();

  return { available, blocked: blockedDates, full: fullDates };
}
