import type { SupabaseClient } from "@supabase/supabase-js";

export interface AvailableDate {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  duration_minutes: number;
  remaining: number;
}

// PostgreSQL time returns "10:00:00" — strip seconds for consistent comparison
function normalizeTime(t: string | null): string {
  if (!t) return "00:00";
  return t.length > 5 ? t.slice(0, 5) : t;
}

/**
 * Generate available dates for a tour based on its schedule.
 *
 * 1. Fetch active schedules for the tour
 * 2. Generate all matching dates from start_date to end_date (or 3 months ahead)
 * 3. Remove exceptions (holidays, cancellations)
 * 4. Remove manually blocked dates
 * 5. Remove dates with zero remaining capacity
 * 6. Return available dates with remaining spots
 */
export async function generateAvailableDates(
  supabase: SupabaseClient,
  tourId: string,
  monthsAhead: number = 3
): Promise<AvailableDate[]> {
  // 1. Fetch active schedules
  const { data: schedules } = await supabase
    .from("tour_schedules")
    .select("*")
    .eq("tour_id", tourId)
    .eq("is_active", true);

  if (!schedules?.length) return [];

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

  const blockedSet = new Set(
    (blocked ?? []).map((b) => `${b.date}_${normalizeTime(b.start_time)}`)
  );

  // 4. Fetch tour capacity
  const { data: tour } = await supabase
    .from("tours")
    .select("capacity")
    .eq("id", tourId)
    .single();

  const capacity = tour?.capacity ?? 10;

  // 5. Generate all candidate dates first
  const now = new Date();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + monthsAhead);

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

      if (!exceptionDates.has(dateStr)) {
        const blockKey = `${dateStr}_${normalizeTime(schedule.start_time)}`;
        if (!blockedSet.has(blockKey)) {
          candidateDates.push({ date: dateStr, schedule });
        }
      }

      current.setDate(current.getDate() + 7);
    }
  }

  if (candidateDates.length === 0) return [];

  // 6. Batch fetch ALL bookings for this tour in one query
  const earliestDate = candidateDates[0].date;
  const latestDate = candidateDates[candidateDates.length - 1].date;

  const { data: allBookings } = await supabase
    .from("bookings")
    .select("date, start_time, guest_count")
    .eq("tour_id", tourId)
    .gte("date", earliestDate)
    .lte("date", latestDate);

  // 7. Group bookings by date+time for fast lookup
  const bookedMap: Record<string, number> = {};
  for (const b of allBookings ?? []) {
    const key = `${b.date}_${normalizeTime(b.start_time)}`;
    bookedMap[key] = (bookedMap[key] ?? 0) + (b.guest_count ?? 0);
  }

  // 8. Build available dates
  const available: AvailableDate[] = [];

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
    }
  }

  // Sort by date + time
  available.sort((a, b) =>
    a.date === b.date ? a.start_time.localeCompare(b.start_time) : a.date.localeCompare(b.date)
  );

  return available;
}
