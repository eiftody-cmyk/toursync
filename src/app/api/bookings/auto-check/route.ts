import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessTokenWithClient, createBusyEvent, deleteCalendarEvent, getCalendarIdForTour } from "@/lib/google/calendar";
import { pushAvailability } from "@/lib/ota/pushAvailability";

function slotEnd(time?: string | null) {
  if (!time) return undefined;
  const [h = "0", m = "0"] = time.split(":");
  const hour = Number(h);
  const minute = Number(m ?? 0);
  const endHour = hour + 2;
  return `${String(Math.min(endHour, 23)).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { tour_id, date, start_time } = await request.json();
  if (!tour_id || !date) return NextResponse.json({ error: "tour_id and date required" }, { status: 400 });

  const { data: tour } = await supabase.from("tours").select("*").eq("id", tour_id).eq("user_id", user.id).single();
  if (!tour) return NextResponse.json({ error: "Tour not found" }, { status: 404 });

  const normalizedStartTime = start_time ? String(start_time) : null;

  let bookingsQuery = supabase
    .from("bookings")
    .select("guest_count")
    .eq("tour_id", tour_id)
    .eq("date", date);

  if (normalizedStartTime) {
    bookingsQuery = bookingsQuery.eq("start_time", normalizedStartTime);
  } else {
    bookingsQuery = bookingsQuery.is("start_time", null);
  }

  const { data: bookings } = await bookingsQuery;

  const booked = (bookings ?? []).reduce((s: number, b: { guest_count: number }) => s + b.guest_count, 0);
  const remaining = tour.capacity - booked;

  let existingBlockForSlotQuery = supabase
    .from("blocked_dates")
    .select("*")
    .eq("tour_id", tour_id)
    .eq("date", date)
    .eq("user_id", user.id);

  if (normalizedStartTime) {
    existingBlockForSlotQuery = existingBlockForSlotQuery.eq("start_time", normalizedStartTime);
  } else {
    existingBlockForSlotQuery = existingBlockForSlotQuery.is("start_time", null);
  }

  const { data: existingBlockForSlot } = await existingBlockForSlotQuery.maybeSingle();

  if (remaining <= 0 && !existingBlockForSlot) {
    let googleEventId: string | null = null;
    let calendarIdUsed: string | null = null;
    const endTime = slotEnd(normalizedStartTime);

    // OTA_SYNC_ENABLED gate: skip outbound push during staging
    if (process.env.OTA_SYNC_ENABLED === "true") {
      try {
        const { accessToken } = await getValidAccessTokenWithClient(supabase, user.id);
        const calendarId = await getCalendarIdForTour(supabase, tour_id);
        const ev = await createBusyEvent({
          accessToken,
          calendarId,
          summary: `FULL - ${tour.name}${normalizedStartTime ? ` ${normalizedStartTime}` : ""}`,
          description: `Auto-blocked: ${booked}/${tour.capacity} guests booked on ${date}${normalizedStartTime ? ` at ${normalizedStartTime}` : ""}`,
          date,
          startTime: normalizedStartTime ?? undefined,
          endTime,
        });
        googleEventId = ev.id ?? null;
        calendarIdUsed = calendarId;
      } catch {
        // No Google connection — still create local auto-block
      }
    }

    // Push to OTA channels (fire-and-forget — slot is now full)
    pushAvailability(supabase, {
      tour_id,
      date,
      start_time: normalizedStartTime ?? undefined,
      remaining_capacity: 0,
    }).catch(() => {});

    let insertResult = await supabase.from("blocked_dates").insert({
      tour_id,
      user_id: user.id,
      date,
      start_time: normalizedStartTime,
      end_time: endTime ?? null,
      reason: `Auto-blocked: FULL ${booked}/${tour.capacity}`,
      google_calendar_event_id: googleEventId,
      calendar_id: calendarIdUsed,
      is_auto_blocked: true,
    });

    if (insertResult.error && (insertResult.error.message?.includes("calendar_id") || insertResult.error.code === "42703")) {
      insertResult = await supabase.from("blocked_dates").insert({
        tour_id,
        user_id: user.id,
        date,
        start_time: normalizedStartTime,
        end_time: endTime ?? null,
        reason: `Auto-blocked: FULL ${booked}/${tour.capacity}`,
        google_calendar_event_id: googleEventId,
        is_auto_blocked: true,
      });
    }

    const insertError = insertResult.error;

    if (insertError) {
      if (insertError.code === "23505") {
        if (googleEventId && calendarIdUsed) {
          try {
            const { accessToken } = await getValidAccessTokenWithClient(supabase, user.id);
            await deleteCalendarEvent({ accessToken, calendarId: calendarIdUsed, eventId: googleEventId });
          } catch { /* best effort */ }
        }
        return NextResponse.json({ autoBlocked: false, booked, remaining, note: "Already blocked by concurrent request" });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ autoBlocked: true, booked, remaining });
  }

  let existingBlockForSlotUnblockQuery = supabase
    .from("blocked_dates")
    .select("*")
    .eq("tour_id", tour_id)
    .eq("date", date)
    .eq("user_id", user.id);

  if (normalizedStartTime) {
    existingBlockForSlotUnblockQuery = existingBlockForSlotUnblockQuery.eq("start_time", normalizedStartTime);
  } else {
    existingBlockForSlotUnblockQuery = existingBlockForSlotUnblockQuery.is("start_time", null);
  }

  const { data: existingBlockForSlotRow } = await existingBlockForSlotUnblockQuery.maybeSingle();

  if (remaining > 0 && existingBlockForSlotRow && existingBlockForSlotRow.is_auto_blocked) {
    if (existingBlockForSlotRow.google_calendar_event_id && existingBlockForSlotRow.calendar_id) {
      try {
        const { accessToken } = await getValidAccessTokenWithClient(supabase, user.id);
        await deleteCalendarEvent({
          accessToken,
          calendarId: existingBlockForSlotRow.calendar_id,
          eventId: existingBlockForSlotRow.google_calendar_event_id,
        });
      } catch {
        // Google event deletion failed — still remove local block
      }
    }
    await supabase.from("blocked_dates").delete().eq("id", existingBlockForSlotRow.id);

    // Push to OTA channels (fire-and-forget — slot is available again)
    pushAvailability(supabase, {
      tour_id,
      date,
      start_time: normalizedStartTime ?? undefined,
      remaining_capacity: remaining,
    }).catch(() => {});

    return NextResponse.json({ autoUnblocked: true, booked, remaining });
  }

  return NextResponse.json({ booked, remaining, autoBlocked: false });
}
