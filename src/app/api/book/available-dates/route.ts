import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateAvailableDates } from "@/lib/schedules/generateDates";

export async function GET(req: NextRequest) {
  const tourId = req.nextUrl.searchParams.get("tour_id");
  if (!tourId) {
    return NextResponse.json({ error: "tour_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const result = await generateAvailableDates(supabase, tourId);
  return NextResponse.json(result);
}
