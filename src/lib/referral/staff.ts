/**
 * Staff identity helpers for the referral program.
 *
 * Identity model (per referral spec §4):
 *   - The stable (partner, slug) row in referral_staff IS the identity.
 *   - contact is a required identity AID for rejoin recovery, never unique:
 *     rejoining with the same partner + lower(contact) returns the existing
 *     row (display name updated, slug never changes).
 *   - New identities slugify the display name; collisions get -2, -3, ...
 *
 * Pure functions only — the join API owns DB access.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface StaffRecord {
  id: string;
  partner: string;
  slug: string;
  display_name: string;
  contact: string;
  created_at: string;
}

export interface JoinResult {
  record: StaffRecord;
  /** True when a returning staff member recovered their existing identity. */
  existing: boolean;
}

export const DISPLAY_NAME_MAX = 40;
export const CONTACT_MAX = 100;

/** Trim, collapse whitespace, strip control chars. Returns null if empty/too long. */
export function normalizeDisplayName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, DISPLAY_NAME_MAX);
  return cleaned || null;
}

/** Trim + collapse whitespace for contact (LINE ID or email). Case preserved. */
export function normalizeContact(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/\s+/g, " ").trim().slice(0, CONTACT_MAX);
  return cleaned || null;
}

export function contactKey(contact: string): string {
  return contact.toLowerCase();
}

/**
 * URL-safe slug from a display name: lowercase alphanumerics + hyphens.
 * Non-Latin names (e.g. purely Japanese) slugify to "" — caller substitutes
 * a random fallback (recovery still works via contact).
 */
export function slugifyDisplayName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/** Random fallback segment when slugify yields nothing (s-<8 hex chars>). */
export function randomStaffSlug(): string {
  const bytes = new Uint8Array(4);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return `s-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/** First row (oldest) for this partner whose contact matches case-insensitively. */
export function findExistingByContact(
  rows: StaffRecord[],
  contact: string
): StaffRecord | null {
  const key = contactKey(contact);
  const match = rows.find((r) => contactKey(r.contact) === key);
  return match ?? null;
}

/** Pick base slug, appending -2/-3/... until unused within the partner. */
export function uniqueStaffSlug(
  base: string,
  taken: Set<string>
): string {
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return randomStaffSlug();
}

/**
 * Resolve a /book?ref=&staff= value to a registered staff slug for the
 * given partner, or null when the value is typed free text (partner-QR
 * fallback path). Used by the landing/book servers for display purposes;
 * the attribution string itself always passes through unchanged.
 */
export async function findStaffBySlug(
  supabase: SupabaseClient,
  partner: string,
  staffSlug: string
): Promise<StaffRecord | null> {
  const { data } = await supabase
    .from("referral_staff")
    .select("id, partner, slug, display_name, contact, created_at")
    .eq("partner", partner)
    .eq("slug", staffSlug)
    .maybeSingle();
  return (data as StaffRecord | null) ?? null;
}
