import type { SupabaseClient } from "@supabase/supabase-js";

export interface AvailableDate {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  duration_minutes: number;
  remaining: number;
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

  // 3. Fetch blocked dates
  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("date, start_time")
    .eq("tour_id", tourId);

  const blockedSet = new Set(
    (blocked ?? []).map((b) => `${b.date}_${b.start_time ?? "00:00"}`)
  );

  // 4. Fetch tour capacity
  const { data: tour } = await supabase
    .from("tours")
    .select("capacity")
    .eq("id", tourId)
    .single();

  const capacity = tour?.capacity ?? 10;

  // 5. Generate dates for each schedule
  const now = new Date();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + monthsAhead);

  const available: AvailableDate[] = [];

  for (const schedule of schedules) {
    const startDate = new Date(schedule.start_date);
    const endDate = schedule.end_date
      ? new Date(schedule.end_date)
      : cutoff;

    // Clamp to reasonable range
    const effectiveStart = startDate > now ? startDate : new Date(now);
    const effectiveEnd = endDate < cutoff ? endDate : cutoff;

    // Find first matching day of week
    const current = new Date(effectiveStart);
    while (current.getDay() !== schedule.day_of_week && current <= effectiveEnd) {
      current.setDate(current.getDate() + 1);
    }

    // Generate all matching dates
    while (current <= effectiveEnd) {
      const dateStr = current.toISOString().split("T")[0];

      // Skip exceptions
      if (!exceptionDates.has(dateStr)) {
        // Check if blocked for this time slot
        const blockKey = `${dateStr}_${schedule.start_time}`;
        if (!blockedSet.has(blockKey)) {
          // Check remaining capacity
          const { data: bookings } = await supabase
            .from("bookings")
            .select("guest_count")
            .eq("tour_id", tourId)
            .eq("date", dateStr)
            .eq("start_time", schedule.start_time);

          const booked = (bookings ?? []).reduce(
            (sum, b) => sum + (b.guest_count ?? 0),
            0
          );
          const remaining = capacity - booked;

          if (remaining > 0) {
            available.push({
              date: dateStr,
              start_time: schedule.start_time,
              duration_minutes: schedule.duration_minutes,
              remaining,
            });
          }
        }
      }

      // Next week
      current.setDate(current.getDate() + 7);
    }
  }

  // Sort by date + time
  available.sort((a, b) =>
    a.date === b.date ? a.start_time.localeCompare(b.start_time) : a.date.localeCompare(b.date)
  );

  return available;
}
