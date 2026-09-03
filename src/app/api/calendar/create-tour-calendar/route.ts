import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCalendarForTour, getValidAccessTokenWithClient } from "@/lib/google/calendar";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { tour_id } = await request.json();
  if (!tour_id) return NextResponse.json({ error: "tour_id required" }, { status: 400 });

  const { data: tour } = await supabase
    .from("tours")
    .select("*")
    .eq("id", tour_id)
    .eq("user_id", user.id)
    .single();
  if (!tour) return NextResponse.json({ error: "Tour not found" }, { status: 404 });

  // Already has a custom calendar — no-op
  if (tour.google_calendar_id && tour.google_calendar_id !== "primary") {
    return NextResponse.json({ calendar_id: tour.google_calendar_id, already_exists: true });
  }

  try {
    const { accessToken } = await getValidAccessTokenWithClient(supabase, user.id);
    const cal = await createCalendarForTour(accessToken, tour.name);

    await supabase
      .from("tours")
      .update({ google_calendar_id: cal.id })
      .eq("id", tour_id);

    return NextResponse.json({ calendar_id: cal.id, summary: cal.summary });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
