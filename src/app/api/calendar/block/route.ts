import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBusyEvent, getValidAccessTokenWithClient, getCalendarIdForTour } from "@/lib/google/calendar";
import { pushAvailability } from "@/lib/ota/pushAvailability";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { tour_id, date, start_time, end_time, reason, summary } = body;

  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  // OTA_SYNC_ENABLED gate: skip outbound push during staging
  if (process.env.OTA_SYNC_ENABLED !== "true") {
    return NextResponse.json({ eventId: null, warning: "OTA sync paused — local block only" });
  }

  try {
    const { accessToken } = await getValidAccessTokenWithClient(supabase, user.id);

    if (!tour_id) {
      return NextResponse.json({ error: "tour_id required — per-tour calendar needed" }, { status: 400 });
    }
    const calendarId = await getCalendarIdForTour(supabase, tour_id);

    const tourName = summary ?? `Blocked${reason ? ` - ${reason}` : ""}`;
    const data = await createBusyEvent({
      accessToken,
      calendarId,
      summary: tourName,
      description: reason ? `Reason: ${reason}` : undefined,
      date,
      startTime: start_time ?? undefined,
      endTime: end_time ?? undefined,
    });

    // Push to OTA channels (fire-and-forget — block already saved to Google)
    pushAvailability(supabase, {
      tour_id,
      date,
      start_time: start_time ?? undefined,
      remaining_capacity: 0,
    }).catch(() => {});

    return NextResponse.json({ eventId: data.id, calendarId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("not connected") || msg.includes("No valid")) {
      return NextResponse.json({ eventId: null, warning: "Google not connected; local block only" });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
