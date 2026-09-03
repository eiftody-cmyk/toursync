import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteCalendarFromGoogle, getValidAccessTokenWithClient } from "@/lib/google/calendar";

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

  if (!tour.google_calendar_id) {
    return NextResponse.json({ error: "Tour has no custom calendar" }, { status: 400 });
  }

  // If it's primary (legacy), just clear the reference — nothing to delete from Google
  if (tour.google_calendar_id === "primary") {
    await supabase
      .from("tours")
      .update({ google_calendar_id: null })
      .eq("id", tour_id);
    return NextResponse.json({ ok: true, note: "Cleared primary reference — create a per-tour calendar next" });
  }

  try {
    const { accessToken } = await getValidAccessTokenWithClient(supabase, user.id);
    await deleteCalendarFromGoogle(accessToken, tour.google_calendar_id);

    await supabase
      .from("tours")
      .update({ google_calendar_id: null })
      .eq("id", tour_id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Even if Google delete fails, remove the reference
    await supabase
      .from("tours")
      .update({ google_calendar_id: null })
      .eq("id", tour_id);

    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: true, warning: `Calendar removed from tour but Google delete failed: ${msg}` });
  }
}
