import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { blockSlot } from "@/lib/google/sync";
import { GoogleDisconnectedError } from "@/lib/google/auth";
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
  if (!tour_id) {
    return NextResponse.json({ error: "tour_id required — per-tour calendar needed" }, { status: 400 });
  }

  // Ownership check — never block another operator's tour
  const { data: tour } = await supabase
    .from("tours")
    .select("id, user_id")
    .eq("id", tour_id)
    .eq("user_id", user.id)
    .single();
  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  }

  try {
    const result = await blockSlot({
      supabase,
      userId: user.id,
      tourId: tour_id,
      date,
      startTime: start_time ?? null,
      endTime: end_time ?? null,
      reason: reason ?? null,
      summary: summary ?? undefined,
      isAutoBlocked: false,
    });

    if (result.error) {
      console.error("[calendar/block] Google Calendar push failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (result.eventId && tour_id && date) {
      pushAvailability(supabase, {
        tour_id,
        date,
        start_time: start_time ?? undefined,
        remaining_capacity: 0,
      }).catch(() => {});
    }

    return NextResponse.json({
      eventId: result.eventId,
      calendarId: result.calendarId,
      blockedId: result.blockedRowId,
      warning: result.warning,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[calendar/block] Google Calendar push failed:", msg);
    if (e instanceof GoogleDisconnectedError || msg.includes("not connected") || msg.includes("No valid")) {
      return NextResponse.json({ eventId: null, warning: "Google not connected; local block only. Reconnect in Settings." });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
