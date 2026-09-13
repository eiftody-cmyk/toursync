import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBusyEvent, deleteCalendarEvent, getValidAccessTokenWithClient } from "@/lib/google/calendar";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { accessToken, calendarId } = await getValidAccessTokenWithClient(supabase, user.id);

    const { data: tours } = await supabase
      .from("tours")
      .select("google_calendar_id")
      .eq("user_id", user.id)
      .limit(50);
    const tourCalendar = (tours ?? []).find(
      (t) => t.google_calendar_id && t.google_calendar_id !== "primary"
    );
    const targetCalendar = tourCalendar?.google_calendar_id || calendarId;

    const probe = await createBusyEvent({
      accessToken,
      calendarId: targetCalendar,
      summary: "ExperienceRelay connection test (auto-deleted)",
      date: "2099-01-01",
    });
    await deleteCalendarEvent({
      accessToken,
      calendarId: targetCalendar,
      eventId: probe.id,
    });

    return NextResponse.json({ ok: true, calendarId: targetCalendar });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[calendar/test] Google connection test failed:", msg);
    return NextResponse.json({ ok: false, error: msg });
  }
}