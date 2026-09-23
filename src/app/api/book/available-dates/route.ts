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

function jstToday(): string {
  const j = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const m = String(j.getUTCMonth() + 1).padStart(2, "0");
  const d = String(j.getUTCDate()).padStart(2, "0");
  return `${j.getUTCFullYear()}-${m}-${d}`;
}

export interface JoinTarget {
  tour_id: string;
  name: string;
  start_time: string;
  duration_minutes: number;
  remaining: number;
  booked: number;
  price: number | null;
  currency: string;
}

export async function GET(req: NextRequest) {
  const tourId = req.nextUrl.searchParams.get("tour_id");
  if (!tourId) {
    return NextResponse.json({ error: "tour_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const result = await generateAvailableDates(supabase, tourId);

  let otherTourSpots: Record<string, number> = {};
  let dayBooked: Record<string, number> = {};
  let joinTargets: Record<string, JoinTarget[]> = {};
  let daySpots: Record<string, number> = {};

  try {
    const ownRemaining: Record<string, number> = {};
    for (const s of result.available) {
      ownRemaining[s.date] = (ownRemaining[s.date] ?? 0) + s.remaining;
    }
    const ownAvailableDates = new Set(result.available.map((a) => a.date));

    const { data: tours } = await supabase
      .from("tours")
      .select("id, name, price, currency, capacity")
      .order("name");

    const others = (tours ?? []).filter((t) => t.id !== tourId && !isHiddenTour(t.id));

    const today = jstToday();
    const datesOfInterest = new Set<string>([
      ...Object.keys(ownRemaining),
      ...result.blocked,
      ...result.full,
    ]);

    const [{ data: confirmed }, perTour] = await Promise.all([
      supabase
        .from("bookings")
        .select("date, tour_id, start_time, guest_count")
        .eq("status", "confirmed")
        .gte("date", today),
      Promise.all(others.map((t) => generateAvailableDates(supabase, t.id))),
    ]);

    // Cross-tour booked guests per date (for the day-cell badge).
    for (const b of confirmed ?? []) {
      if (datesOfInterest.size > 0 && !datesOfInterest.has(b.date) && b.date < today) continue;
      dayBooked[b.date] = (dayBooked[b.date] ?? 0) + (b.guest_count ?? 0);
    }

    // Does this tour+date+slot have confirmed guests? (null start_time = any slot that day)
    const hasSlotBooking = (date: string, tourIdB: string, slotTime: string): number => {
      let guests = 0;
      for (const b of confirmed ?? []) {
        if (b.date !== date || b.tour_id !== tourIdB) continue;
        const bt = normalizeTime(b.start_time);
        if (!bt || bt === slotTime) guests += b.guest_count ?? 0;
      }
      return guests;
    };

    for (let i = 0; i < others.length; i++) {
      const meta = others[i];
      const avail = perTour[i];

      for (const slot of avail.available) {
        // Free inventory on other tours — only when THIS tour has no slots that day.
        if (!ownAvailableDates.has(slot.date)) {
          if (!otherTourSpots[slot.date] || slot.remaining > otherTourSpots[slot.date]) {
            otherTourSpots[slot.date] = slot.remaining;
          }
        }

        // Join target: other tour already has guests on this exact slot and room remains.
        const slotBooked = hasSlotBooking(slot.date, meta.id, slot.start_time);
        if (slotBooked > 0 && slot.remaining > 0) {
          if (!joinTargets[slot.date]) joinTargets[slot.date] = [];
          joinTargets[slot.date].push({
            tour_id: meta.id,
            name: meta.name,
            start_time: slot.start_time,
            duration_minutes: slot.duration_minutes,
            remaining: slot.remaining,
            booked: Math.max(0, (meta.capacity ?? 0) - slot.remaining),
            price: meta.price,
            currency: meta.currency,
          });
        }
      }
    }

    // Day-cell spots: prefer join remaining (other tour has a booking), else own, else other free.
    const allDates = new Set<string>([
      ...Object.keys(ownRemaining),
      ...Object.keys(otherTourSpots),
      ...Object.keys(joinTargets),
      ...Object.keys(dayBooked),
    ]);
    for (const d of allDates) {
      const jt = joinTargets[d];
      if (jt && jt.length > 0) {
        daySpots[d] = Math.max(...jt.map((t) => t.remaining));
      } else if (ownRemaining[d] != null) {
        daySpots[d] = ownRemaining[d];
      } else if (otherTourSpots[d] != null) {
        daySpots[d] = otherTourSpots[d];
      }
    }
  } catch {
    otherTourSpots = {};
    dayBooked = {};
    joinTargets = {};
    daySpots = {};
  }

  return NextResponse.json({
    ...result,
    otherTourSpots,
    dayBooked,
    joinTargets,
    daySpots,
  });
}
