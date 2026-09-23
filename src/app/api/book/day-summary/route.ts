import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateAvailableDates } from "@/lib/schedules/generateDates";

function isHiddenTour(tourId: string): boolean {
  const hidden = process.env.HIDDEN_TOUR_IDS ?? "";
  return hidden.split(",").map((s) => s.trim()).filter(Boolean).includes(tourId);
}

function normalizeTime(t: string | null | undefined): string {
  if (!t) return "";
  return t.length > 5 ? t.slice(0, 5) : t;
}

/**
 * Cross-tour day cells for the date-first picker (/book with no ?tour=).
 * GET /api/book/day-summary?from=YYYY-MM-DD&to=YYYY-MM-DD
 * → { days: { [date]: { spots, booked } } }
 */
export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: "from and to required (YYYY-MM-DD)" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: tours, error } = await supabase
    .from("tours")
    .select("id, name, price, currency, capacity")
    .order("name");

  if (error) {
    return NextResponse.json({ error: "Unable to load tours" }, { status: 500 });
  }

  const visible = (tours ?? []).filter((t) => !isHiddenTour(t.id));

  const [{ data: confirmed }, perTour] = await Promise.all([
    supabase
      .from("bookings")
      .select("date, tour_id, start_time, guest_count")
      .eq("status", "confirmed")
      .gte("date", from)
      .lte("date", to),
    Promise.all(visible.map((t) => generateAvailableDates(supabase, t.id))),
  ]);

  const dayBooked: Record<string, number> = {};
  for (const b of confirmed ?? []) {
    if (b.date < from || b.date > to) continue;
    dayBooked[b.date] = (dayBooked[b.date] ?? 0) + (b.guest_count ?? 0);
  }

  const hasSlotBooking = (date: string, tourId: string, slotTime: string): number => {
    let guests = 0;
    for (const b of confirmed ?? []) {
      if (b.date !== date || b.tour_id !== tourId) continue;
      const bt = normalizeTime(b.start_time);
      if (!bt || bt === slotTime) guests += b.guest_count ?? 0;
    }
    return guests;
  };

  const days: Record<string, { spots: number | null; booked: number }> = {};
  const joinMax: Record<string, number> = {};
  const anyMax: Record<string, number> = {};

  for (let i = 0; i < visible.length; i++) {
    const tour = visible[i];
    const avail = perTour[i];
    for (const slot of avail.available) {
      if (slot.date < from || slot.date > to) continue;
      anyMax[slot.date] = Math.max(anyMax[slot.date] ?? 0, slot.remaining);
      if (hasSlotBooking(slot.date, tour.id, slot.start_time) > 0 && slot.remaining > 0) {
        joinMax[slot.date] = Math.max(joinMax[slot.date] ?? 0, slot.remaining);
      }
    }
  }

  // Collect every date that has a booking or any availability in range.
  const dates = new Set<string>([
    ...Object.keys(dayBooked),
    ...Object.keys(joinMax),
    ...Object.keys(anyMax),
  ]);
  for (const d of dates) {
    if (d < from || d > to) continue;
    const spots = joinMax[d] ?? anyMax[d] ?? null;
    days[d] = { spots, booked: dayBooked[d] ?? 0 };
  }

  return NextResponse.json({ from, to, days });
}
