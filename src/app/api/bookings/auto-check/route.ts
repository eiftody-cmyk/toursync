import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { blockSlot, unblockSlot } from "@/lib/google/sync";
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
    .eq("date", date)
    .eq("status", "confirmed");

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
    const endTime = slotEnd(normalizedStartTime);

    const result = await blockSlot({
      supabase,
      userId: user.id,
      tourId: tour_id,
      date,
      startTime: normalizedStartTime,
      endTime: endTime ?? null,
      reason: `Auto-blocked: FULL ${booked}/${tour.capacity}`,
      summary: `FULL - ${tour.name}${normalizedStartTime ? ` ${normalizedStartTime}` : ""}`,
      description: `Auto-blocked: ${booked}/${tour.capacity} guests booked on ${date}${normalizedStartTime ? ` at ${normalizedStartTime}` : ""}`,
      isAutoBlocked: true,
    });

    if (result.blockedRowId === null && result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    pushAvailability(supabase, {
      tour_id,
      date,
      start_time: normalizedStartTime ?? undefined,
      remaining_capacity: 0,
    }).catch(() => {});

    if (result.skipped && result.eventId) {
      return NextResponse.json({ autoBlocked: false, booked, remaining, note: "Already blocked by concurrent request" });
    }

    return NextResponse.json({ autoBlocked: true, booked, remaining, warning: result.warning });
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
    const result = await unblockSlot({ supabase, blockedId: existingBlockForSlotRow.id });

    if (!result.ok) {
      return NextResponse.json(
        { autoUnblocked: false, booked, remaining, error: result.error ?? "Unblock failed" },
        { status: 502 }
      );
    }

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
