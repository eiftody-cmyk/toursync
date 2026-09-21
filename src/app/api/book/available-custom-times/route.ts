import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  tourWindowSpansForDate,
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
    .select("product_type, opening_hours, capacity")
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

  // Get tour operating spans for this date
  const spans = tourWindowSpansForDate(tour, date, schedules);
  if (!spans || spans.length === 0) {
    return NextResponse.json({
      existing_tours: [],
      available_windows: [],
      suggested_times: [],
    });
  }

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

  // Calculate existing tour windows
  const existingTours: Array<{
    tour_id: string;
    tour_name: string;
    start_time: string;
    end_time: string;
    spots_left: number;
  }> = [];

  const bookingWindows: Array<{ start: number; end: number }> = [];

  for (const booking of bookings ?? []) {
    const bookingStart = timeToMinutes(booking.start_time);
    let bookingEnd: number;

    if (booking.end_time) {
      bookingEnd = timeToMinutes(booking.end_time);
    } else {
      // Try to find duration from schedules
      const schedule = schedules?.find(
        (s) => s.start_time && normalizeTime(s.start_time) === normalizeTime(booking.start_time)
      );
      const duration = schedule?.duration_minutes ?? 150;
      bookingEnd = bookingStart + duration;
    }

    if (bookingStart < bookingEnd) {
      bookingWindows.push({ start: bookingStart, end: bookingEnd });

      existingTours.push({
        tour_id: booking.tour_id,
        tour_name: tourNameMap.get(booking.tour_id) ?? "Tour",
        start_time: normalizeTime(booking.start_time),
        end_time: normalizeTime(
          `${String(Math.floor(bookingEnd / 60)).padStart(2, "0")}:${String(bookingEnd % 60).padStart(2, "0")}`
        ),
        spots_left: tour.capacity - (booking.guest_count ?? 0),
      });
    }
  }

  // Calculate available windows by subtracting booking windows from operating spans
  const availableWindows: Array<{ from: string; to: string }> = [];

  for (const span of spans) {
    let windows = [{ start: span.start, end: span.end }];

    for (const bw of bookingWindows) {
      const newWindows: typeof windows = [];
      for (const w of windows) {
        if (bw.start <= w.start && bw.end >= w.end) {
          // Booking covers entire window — remove it
          continue;
        } else if (bw.start > w.start && bw.start < w.end && bw.end >= w.end) {
          // Booking covers end of window
          newWindows.push({ start: w.start, end: bw.start });
        } else if (bw.start <= w.start && bw.end > w.start && bw.end < w.end) {
          // Booking covers start of window
          newWindows.push({ start: bw.end, end: w.end });
        } else if (bw.start > w.start && bw.end < w.end) {
          // Booking is in the middle — split window
          newWindows.push({ start: w.start, end: bw.start });
          newWindows.push({ start: bw.end, end: w.end });
        } else {
          // No overlap
          newWindows.push(w);
        }
      }
      windows = newWindows;
    }

    for (const w of windows) {
      if (w.end - w.start >= 60) {
        // Only include windows that are at least 60 minutes
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
