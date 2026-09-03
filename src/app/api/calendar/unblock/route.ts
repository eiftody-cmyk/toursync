import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteCalendarEvent, getValidAccessTokenWithClient } from "@/lib/google/calendar";
import { pushAvailability } from "@/lib/ota/pushAvailability";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { blockedId } = await request.json();
  if (!blockedId) return NextResponse.json({ error: "blockedId required" }, { status: 400 });

  const { data: blocked, error } = await supabase
    .from("blocked_dates")
    .select("*")
    .eq("id", blockedId)
    .eq("user_id", user.id)
    .single();

  if (error || !blocked) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (blocked.google_calendar_event_id && blocked.calendar_id) {
    try {
      const { accessToken } = await getValidAccessTokenWithClient(supabase, user.id);
      await deleteCalendarEvent({
        accessToken,
        calendarId: blocked.calendar_id,
        eventId: blocked.google_calendar_event_id,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Failed to delete Google event:", msg);
    }
  }

  await supabase.from("blocked_dates").delete().eq("id", blockedId);

  // Push to OTA channels (fire-and-forget — slot is available again)
  if (blocked.tour_id && blocked.date) {
    pushAvailability(supabase, {
      tour_id: blocked.tour_id,
      date: blocked.date,
      start_time: blocked.start_time ?? undefined,
      remaining_capacity: 1,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
