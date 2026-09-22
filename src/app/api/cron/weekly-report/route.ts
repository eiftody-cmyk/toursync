import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/client";
import { weeklyReportEmail } from "@/lib/email/weekly-report";

/**
 * Weekly agentic-check report endpoint.
 *
 * The assistant runs the frozen 35-query set via live web search each round, then POSTs the
 * round results here; this endpoint formats a plain-English email and sends it to
 * edward@osakacastletours.com. Guarded by the same constant-time CRON_SECRET compare as the
 * other cron routes.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET) return new Response("CRON_SECRET not set", { status: 500 });
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader?.length !== expected.length) return new Response("Unauthorized", { status: 401 });
  let diff = 0;
  for (let i = 0; i < authHeader.length; i++) {
    diff |= authHeader.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return new Response("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const roundName = typeof body.roundName === "string" ? body.roundName : "";
    const runDate = typeof body.runDate === "string" ? body.runDate : "";
    const verdict = typeof body.verdict === "string" ? body.verdict : "";
    const hits = Array.isArray(body.hits) ? body.hits : [];

    if (!roundName || !runDate || !verdict) {
      return NextResponse.json({ ok: false, error: "roundName, runDate and verdict are required" }, { status: 400 });
    }

    const { subject, html } = weeklyReportEmail({ roundName, runDate, hits, verdict });
    const result = await sendEmail({ to: "edward@osakacastletours.com", subject, html });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error ?? "send failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, emailId: result.id });
  } catch (e) {
    const err = e instanceof Error ? e.message : JSON.stringify(e);
    return NextResponse.json({ ok: false, error: err }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, method: "POST", purpose: "Weekly agentic discovery report" });
}