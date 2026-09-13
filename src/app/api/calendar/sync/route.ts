import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBusyEvent, getValidAccessTokenWithClient, getCalendarIdForTour } from "@/lib/google/calendar";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (process.env.OTA_SYNC_ENABLED !== "true") {
    return NextResponse.json({ ok: false, error: "OTA sync paused" });
  }

  const { data: pending, error } = await supabase
    .from("blocked_dates")
    .select("*")
    .eq("user_id", user.id)
    .is("google_calendar_event_id", null)
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const synced: string[] = [];
  const failed: { id: string; reason: string }[] = [];

  for (const row of pending ?? []) {
    try {
      const { accessToken } = await getValidAccessTokenWithClient(supabase, user.id);
      const calendarId = row.tour_id
        ? await getCalendarIdForTour(supabase, row.tour_id)
        : row.calendar_id ?? "primary";

      const data = await createBusyEvent({
        accessToken,
        calendarId,
        summary: row.reason ? `Blocked - ${row.reason}` : "Blocked",
        description: row.reason ? `Reason: ${row.reason}` : undefined,
        date: row.date,
        startTime: row.start_time ?? undefined,
        endTime: row.end_time ?? undefined,
      });

      await supabase
        .from("blocked_dates")
        .update({ google_calendar_event_id: data.id, calendar_id: calendarId })
        .eq("id", row.id);

      synced.push(row.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      failed.push({ id: row.id, reason: msg });
    }
  }

  return NextResponse.json({
    ok: true,
    synced: synced.length,
    failed,
    skipped: (pending ?? []).length - synced.length - failed.length,
  });
}