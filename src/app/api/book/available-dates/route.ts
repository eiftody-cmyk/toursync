import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateAvailableDates } from "@/lib/schedules/generateDates";

function isHiddenTour(tourId: string): boolean {
  const hidden = process.env.HIDDEN_TOUR_IDS ?? "";
  return hidden.split(",").map((s) => s.trim()).filter(Boolean).includes(tourId);
}

export async function GET(req: NextRequest) {
  const tourId = req.nextUrl.searchParams.get("tour_id");
  if (!tourId) {
    return NextResponse.json({ error: "tour_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const result = await generateAvailableDates(supabase, tourId);

  // Cross-tour summary: for dates where THIS tour has no open slots,
  // best remaining count across other visible tours (so the calendar
  // can show "4 spots" and stay clickable when only another tour has room).
  let otherTourSpots: Record<string, number> = {};
  try {
    const ownAvailableDates = new Set(result.available.map((a) => a.date));
    const { data: tours } = await supabase
      .from("tours")
      .select("id")
      .order("name");

    const others = (tours ?? []).filter((t) => t.id !== tourId && !isHiddenTour(t.id));

    const perTour = await Promise.all(
      others.map((t) => generateAvailableDates(supabase, t.id))
    );

    for (const avail of perTour) {
      for (const slot of avail.available) {
        if (ownAvailableDates.has(slot.date)) continue;
        if (!otherTourSpots[slot.date] || slot.remaining > otherTourSpots[slot.date]) {
          otherTourSpots[slot.date] = slot.remaining;
        }
      }
    }
  } catch {
    otherTourSpots = {};
  }

  return NextResponse.json({ ...result, otherTourSpots });
}
