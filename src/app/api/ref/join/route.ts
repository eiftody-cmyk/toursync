import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";
import { createServiceClient } from "@/lib/supabase/service";
import { getPartner } from "@/config/referral-partners";
import {
  normalizeDisplayName,
  normalizeContact,
  findExistingByContact,
  slugifyDisplayName,
  randomStaffSlug,
  uniqueStaffSlug,
  type StaffRecord,
} from "@/lib/referral/staff";

/**
 * Staff self-registration: POST { partner, display_name, contact } →
 * { slug, display_name, url, existing }.
 *
 * Anti-spam only (not financial protection — the payment system is the
 * gatekeeper): 5 req/min/IP + Cloudflare Turnstile, both copied from the
 * existing /api/bookings/lookup pattern. Partner is validated against the
 * code-controlled allowlist; contact is required but never unique.
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
    console.error("[RefJoin] Turnstile verify failed:", e instanceof Error ? e.message : e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`refjoin:${ip}`, 5);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts — please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const partner = getPartner(typeof body.partner === "string" ? body.partner : "");
  if (!partner) {
    return NextResponse.json({ error: "Unknown partner" }, { status: 400 });
  }

  const displayName = normalizeDisplayName(body.display_name);
  if (!displayName) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 }
    );
  }

  const contact = normalizeContact(body.contact);
  if (!contact) {
    return NextResponse.json(
      { error: "Please enter your LINE ID or email — that's how Edward pays you." },
      { status: 400 }
    );
  }

  if (!(await verifyTurnstile(String(body.token ?? ""), ip))) {
    return NextResponse.json({ error: "Verification failed — try again." }, { status: 403 });
  }

  const supabase = createServiceClient();

  const listExisting = async (): Promise<StaffRecord[]> => {
    const { data, error } = await supabase
      .from("referral_staff")
      .select("id, partner, slug, display_name, contact, created_at")
      .eq("partner", partner.slug);
    if (error) {
      // Table missing (migration 033 not run yet) or transient failure.
      console.error("[RefJoin] referral_staff read failed:", error.message);
      throw new Error("registration_unavailable");
    }
    return (data ?? []) as StaffRecord[];
  };

  try {
    const rows = await listExisting();

    // Returning staff: same partner + same contact (case-insensitive) →
    // recover the existing identity; display name follows the latest input,
    // the slug never changes.
    const existing = findExistingByContact(rows, contact);
    if (existing) {
      if (existing.display_name !== displayName) {
        const { error } = await supabase
          .from("referral_staff")
          .update({ display_name: displayName })
          .eq("id", existing.id);
        if (error) console.error("[RefJoin] display_name update failed:", error.message);
        else existing.display_name = displayName;
      }
      return NextResponse.json({
        slug: existing.slug,
        display_name: existing.display_name,
        partner: partner.slug,
        url: `https://osakacastletours.com/ref/${partner.slug}-${existing.slug}`,
        existing: true,
      });
    }

    // New identity: slugify, fall back to a random slug for non-Latin names.
    const base = slugifyDisplayName(displayName) || randomStaffSlug();
    const taken = new Set(rows.map((r) => r.slug));
    const slug = uniqueStaffSlug(base, taken);

    const { data: inserted, error } = await supabase
      .from("referral_staff")
      .insert({ partner: partner.slug, slug, display_name: displayName, contact })
      .select("id, partner, slug, display_name, contact, created_at")
      .single();

    if (error) {
      // 23505: concurrent join won the slug race — return the winner's row.
      if (error.code === "23505") {
        const again = await listExisting();
        const bySlug = again.find((r) => r.slug === slug);
        if (bySlug) {
          return NextResponse.json({
            slug: bySlug.slug,
            display_name: bySlug.display_name,
            partner: partner.slug,
            url: `https://osakacastletours.com/ref/${partner.slug}-${bySlug.slug}`,
            existing: true,
          });
        }
        const byContact = findExistingByContact(again, contact);
        if (byContact) {
          return NextResponse.json({
            slug: byContact.slug,
            display_name: byContact.display_name,
            partner: partner.slug,
            url: `https://osakacastletours.com/ref/${partner.slug}-${byContact.slug}`,
            existing: true,
          });
        }
      }
      console.error("[RefJoin] insert failed:", error.message);
      throw new Error("registration_unavailable");
    }

    const record = inserted as StaffRecord;
    return NextResponse.json({
      slug: record.slug,
      display_name: record.display_name,
      partner: partner.slug,
      url: `https://osakacastletours.com/ref/${partner.slug}-${record.slug}`,
      existing: false,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "registration_unavailable") {
      return NextResponse.json(
        { error: "Registration temporarily unavailable — try again in a minute." },
        { status: 503 }
      );
    }
    console.error("[RefJoin] unexpected failure:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
