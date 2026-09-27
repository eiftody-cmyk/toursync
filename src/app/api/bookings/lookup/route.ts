import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";
import { createLookupToken, lookupSecretConfigured } from "@/lib/security/cancelToken";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email → signed lookup redirect for /book/manage.
 *
 * The booking list itself stays server-rendered; this route only exists so a
 * bot cannot enumerate bookings by GETting /book/manage?email=... directly:
 *   - 5 requests/min/IP (in-memory; backstop via Cloudflare WAF rate rule)
 *   - Cloudflare Turnstile challenge (skipped until TURNSTILE_SECRET_KEY is set)
 *   - HMAC signature binding the email for 30 minutes
 */
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured yet — rate limit still applies
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.error("[Lookup] Turnstile verify failed:", e instanceof Error ? e.message : e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`lookup:${ip}`, 5);
  if (!rl.ok) {
    return NextResponse.redirect(new URL("/book/manage?error=too_many", req.url), 303);
  }

  if (!lookupSecretConfigured()) {
    console.error("[Lookup] No token secret configured (BOOKING_TOKEN_SECRET / CRON_SECRET)");
    return NextResponse.redirect(new URL("/book/manage?error=unavailable", req.url), 303);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.redirect(new URL("/book/manage?error=invalid", req.url), 303);
  }

  const email = String(form.get("email") ?? "").trim();
  const turnstileToken = String(form.get("cf-turnstile-response") ?? "");

  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.redirect(new URL("/book/manage?error=invalid", req.url), 303);
  }

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.redirect(new URL("/book/manage?error=verify", req.url), 303);
  }

  const { sig } = createLookupToken(email);
  const url = new URL("/book/manage", req.url);
  url.searchParams.set("email", email);
  url.searchParams.set("sig", sig);
  return NextResponse.redirect(url, 303);
}
