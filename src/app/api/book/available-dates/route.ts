import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAvailableDates } from "@/lib/schedules/generateDates";

export async function GET(req: NextRequest) {
  const tourId = req.nextUrl.searchParams.get("tour_id");
  if (!tourId) {
    return NextResponse.json({ error: "tour_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const dates = await generateAvailableDates(supabase, tourId);
  return NextResponse.json({ dates });
}
