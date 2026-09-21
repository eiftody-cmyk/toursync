import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  timeToMinutes,
  normalizeTime,
} from "@/lib/schedules/blockOverlap";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tour_id = searchParams.get("tour_id");
  const date = searchParams.get("date");

  if (!tour_id || !date) {
    return NextResponse.json(
      { error: "tour_id and date required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Get tour details
  const { data: tour } = await supabase
    .from("tours")
    .select("capacity")
    .eq("id", tour_id)
    .single();

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  }

  // Get active schedules for this tour
  const { data: schedules } = await supabase
    .from("tour_schedules")
    .select("day_of_week, start_time, duration_minutes, start_date, end_date, is_active")
    .eq("tour_id", tour_id)
    .eq("is_active", true);

  // Custom booking window: 9am–3pm for all tours
  const CUSTOM_START = 9 * 60;   // 540 minutes
  const CUSTOM_END = 15 * 60;    // 900 minutes
  const CUSTOM_TOUR_DURATION = 150; // 2.5 hours
  const BUFFER_MINUTES = 30;

  // Get all confirmed bookings for this date
  const { data: bookings } = await supabase
    .from("bookings")
    .select("tour_id, start_time, end_time, guest_count, status")
    .eq("date", date)
    .eq("status", "confirmed");

  // Also get tour names for existing bookings
  const tourIds = [...new Set((bookings ?? []).map((b) => b.tour_id))];
  const { data: tourDetails } = await supabase
    .from("tours")
    .select("id, name")
    .in("id", tourIds);

  const tourNameMap = new Map((tourDetails ?? []).map((t) => [t.id, t.name]));

  // Calculate existing tour windows — group by tour_id + start_time
  const existingTours: Array<{
    tour_id: string;
    tour_name: string;
    start_time: string;
    end_time: string;
    spots_left: number;
  }> = [];

  const bookingWindows: Array<{ start: number; end: number }> = [];

  // Group bookings by tour_id + start_time to avoid duplicates
  const bookingGroups = new Map<string, { tour_id: string; start_time: string; total_guests: number }>();

  for (const booking of bookings ?? []) {
    const key = `${booking.tour_id}_${normalizeTime(booking.start_time)}`;
    const existing = bookingGroups.get(key);
    if (existing) {
      existing.total_guests += booking.guest_count ?? 0;
    } else {
      bookingGroups.set(key, {
        tour_id: booking.tour_id,
        start_time: normalizeTime(booking.start_time),
        total_guests: booking.guest_count ?? 0,
      });
    }
  }

  for (const group of bookingGroups.values()) {
    const bookingStart = timeToMinutes(group.start_time);

    // Find duration from schedules
    const schedule = schedules?.find(
      (s) => s.start_time && normalizeTime(s.start_time) === group.start_time
    );
    const duration = schedule?.duration_minutes ?? 150;
    const bookingEnd = bookingStart + duration;

    bookingWindows.push({ start: bookingStart - CUSTOM_TOUR_DURATION, end: bookingEnd + BUFFER_MINUTES });

    const endTimeH = String(Math.floor(bookingEnd / 60)).padStart(2, "0");
    const endTimeM = String(bookingEnd % 60).padStart(2, "0");

    existingTours.push({
      tour_id: group.tour_id,
      tour_name: tourNameMap.get(group.tour_id) ?? "Tour",
      start_time: group.start_time,
      end_time: `${endTimeH}:${endTimeM}`,
      spots_left: tour.capacity - group.total_guests,
    });
  }

  // Calculate available windows by subtracting booking windows from the 9am-3pm range
  const availableWindows: Array<{ from: string; to: string }> = [];

  let windows = [{ start: CUSTOM_START, end: CUSTOM_END }];

  for (const bw of bookingWindows) {
    const newWindows: typeof windows = [];
    for (const w of windows) {
      if (bw.start <= w.start && bw.end >= w.end) {
        continue;
      } else if (bw.start > w.start && bw.start < w.end && bw.end >= w.end) {
        newWindows.push({ start: w.start, end: bw.start });
      } else if (bw.start <= w.start && bw.end > w.start && bw.end < w.end) {
        newWindows.push({ start: bw.end, end: w.end });
      } else if (bw.start > w.start && bw.end < w.end) {
        newWindows.push({ start: w.start, end: bw.start });
        newWindows.push({ start: bw.end, end: w.end });
      } else {
        newWindows.push(w);
      }
    }
    windows = newWindows;
  }

  for (const w of windows) {
    if (w.end - w.start >= 30) {
      availableWindows.push({
        from: normalizeTime(
          `${String(Math.floor(w.start / 60)).padStart(2, "0")}:${String(w.start % 60).padStart(2, "0")}`
        ),
        to: normalizeTime(
          `${String(Math.floor(w.end / 60)).padStart(2, "0")}:${String(w.end % 60).padStart(2, "0")}`
        ),
      });
    }
  }

  // Generate suggested times (15-minute intervals within available windows)
  const suggestedTimes: string[] = [];
  for (const window of availableWindows) {
    let t = timeToMinutes(window.from);
    const end = timeToMinutes(window.to);
    while (t < end) {
      const h = String(Math.floor(t / 60)).padStart(2, "0");
      const m = String(t % 60).padStart(2, "0");
      suggestedTimes.push(`${h}:${m}`);
      t += 15;
    }
  }

  return NextResponse.json({
    existing_tours: existingTours,
    available_windows: availableWindows,
    suggested_times: suggestedTimes,
  });
}
