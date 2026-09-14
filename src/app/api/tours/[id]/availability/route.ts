import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateAvailableDates } from "@/lib/schedules/generateDates";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "tour id required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const availability = await generateAvailableDates(supabase, id);
  return NextResponse.json({ tour_id: id, availability });
}
