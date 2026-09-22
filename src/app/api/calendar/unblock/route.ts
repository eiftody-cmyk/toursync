import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unblockSlot } from "@/lib/google/sync";
import { pushAvailability } from "@/lib/ota/pushAvailability";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { blockedId } = await request.json();
  if (!blockedId) return NextResponse.json({ error: "blockedId required" }, { status: 400 });

  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("id, user_id, tour_id, date, start_time")
    .eq("id", blockedId)
    .eq("user_id", user.id)
    .single();

  if (!blocked) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await unblockSlot({ supabase, blockedId });

  if (!result.ok) {
    // Google delete failed — keep the row so the event id is not lost
    return NextResponse.json(
      { ok: false, error: result.error ?? "Google delete failed; block kept for retry" },
      { status: 502 }
    );
  }

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
