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

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date required (YYYY-MM-DD)" }, { status: 400 });
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

  const { data: dayBookings } = await supabase
    .from("bookings")
    .select("tour_id, start_time, guest_count")
    .eq("status", "confirmed")
    .eq("date", date);

  const slotBookedGuests = (tourId: string, slotTime: string): number => {
    let guests = 0;
    for (const b of dayBookings ?? []) {
      if (b.tour_id !== tourId) continue;
      const bt = normalizeTime(b.start_time);
      if (!bt || bt === slotTime) guests += b.guest_count ?? 0;
    }
    return guests;
  };

  const results = await Promise.all(
    visible.map(async (tour) => {
      const availability = await generateAvailableDates(supabase, tour.id);
      const slots = availability.available.filter((a) => a.date === date);
      if (slots.length === 0) return null;
      return {
        tour_id: tour.id,
        name: tour.name,
        price: tour.price,
        currency: tour.currency,
        capacity: tour.capacity,
        slots: slots.map((s) => ({
          start_time: s.start_time,
          duration_minutes: s.duration_minutes,
          remaining: s.remaining,
          booked: Math.max(0, tour.capacity - s.remaining),
          has_bookings: slotBookedGuests(tour.id, s.start_time) > 0,
        })),
      };
    })
  );

  const onDate = results.filter((r): r is NonNullable<typeof r> => r !== null);
  onDate.sort((a, b) => {
    // Booked (joinable) slots first, then by start time / name.
    const aj = a.slots.some((s) => s.has_bookings) ? 0 : 1;
    const bj = b.slots.some((s) => s.has_bookings) ? 0 : 1;
    if (aj !== bj) return aj - bj;
    const t = a.slots[0]?.start_time ?? "";
    const u = b.slots[0]?.start_time ?? "";
    return t.localeCompare(u) || a.name.localeCompare(b.name);
  });

  return NextResponse.json({ date, tours: onDate });
}
