import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isGoogleSyncEnabled, syncPendingBlocks } from "@/lib/google/sync";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!isGoogleSyncEnabled()) {
    return NextResponse.json({ ok: false, error: "OTA sync paused" });
  }

  try {
    const { synced, failed, total } = await syncPendingBlocks({ supabase, userId: user.id });
    return NextResponse.json({
      ok: true,
      synced: synced.length,
      failed,
      skipped: total - synced.length - failed.length,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
