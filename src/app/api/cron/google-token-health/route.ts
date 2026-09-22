import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getValidAccessTokenWithClient } from "@/lib/google/calendar";
import { GoogleDisconnectedError } from "@/lib/google/auth";

/**
 * Daily cron: verify Google Calendar tokens are still valid.
 * If a token is revoked, the row is already cleared by getValidAccessTokenWithClient.
 * This cron proactively checks so the admin sees the banner before any booking fails.
 *
 * Scheduled via wrangler.toml [triggers] crons = ["0 3 * * *"].
 * Requires Worker secret CRON_SECRET (wrangler secret put CRON_SECRET).
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET) return new Response("CRON_SECRET not set", { status: 500 });
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader?.length !== expected.length) return new Response("Unauthorized", { status: 401 });
  let diff = 0;
  for (let i = 0; i < authHeader.length; i++) {
    diff |= authHeader.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return new Response("Unauthorized", { status: 401 });

  const supabase = createServiceClient();
  const { data: tokens } = await supabase
    .from("google_tokens")
    .select("user_id, refresh_token")
    .not("refresh_token", "is", null);

  const results: { userId: string; status: string }[] = [];

  for (const row of tokens ?? []) {
    try {
      await getValidAccessTokenWithClient(supabase, row.user_id);
      results.push({ userId: row.user_id, status: "ok" });
    } catch (e) {
      const status = e instanceof GoogleDisconnectedError ? "disconnected" : "error";
      results.push({ userId: row.user_id, status });
    }
  }

  return Response.json({ ok: true, checked: results.length, results });
}
