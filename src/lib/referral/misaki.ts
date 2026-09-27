/**
 * MISAKI referral attribution (KIMONO RENTAL MISAKI staff referrals).
 *
 * The referral travels through PayPal's custom_id so it is verified
 * server-side at capture time (and by the webhook fallback):
 *
 *   tour_id|date|start_time|guest_count[|custom=true|phone][|ref=misaki|staff=...]
 *
 * parseReferralParts is position-independent: it scans for ref=/staff= parts,
 * so it works for both instant and custom-time orders.
 */

export const MISAKI_SOURCE = "misaki";
export const MISAKI_COMMISSION_PER_GUEST = 1500;
export const MISAKI_COOKIE = "misaki_ref";

export interface Referral {
  source: string;
  staff: string;
}

const STAFF_MAX_RAW = 40;
const CUSTOM_ID_MAX = 250; // PayPal custom_id limit is 255

export function sanitizeStaffName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .replace(/[|<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, STAFF_MAX_RAW);
  return cleaned || null;
}

/** Validate a client-supplied referral object. Anything but MISAKI is dropped. */
export function normalizeReferral(input: unknown): Referral | null {
  if (!input || typeof input !== "object") return null;
  const { source, staff } = input as { source?: unknown; staff?: unknown };
  if (source !== MISAKI_SOURCE) return null;
  const name = sanitizeStaffName(staff);
  return name ? { source: MISAKI_SOURCE, staff: name } : null;
}

/** Read the referral cookie set by the landing page (fallback for the body param). */
export function referralFromCookieValue(value: string | undefined): Referral | null {
  if (!value) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }
  const name = sanitizeStaffName(decoded);
  return name ? { source: MISAKI_SOURCE, staff: name } : null;
}

/**
 * Append referral segments to a base custom_id, shrinking the staff name if
 * needed so the total stays within PayPal's 255-char limit.
 */
export function appendReferral(baseCustomId: string, referral: Referral | null): string {
  if (!referral) return baseCustomId;
  const prefix = `${baseCustomId}|ref=${referral.source}|staff=`;
  let name = referral.staff;
  let encoded = encodeURIComponent(name);
  while (prefix.length + encoded.length > CUSTOM_ID_MAX && name.length > 1) {
    name = name.slice(0, -1);
    encoded = encodeURIComponent(name);
  }
  return prefix + encoded;
}

/** Extract { source, staff } from split custom_id parts. Returns null when absent/invalid. */
export function parseReferralParts(parts: string[]): Referral | null {
  let source: string | null = null;
  let staff: string | null = null;
  for (const part of parts) {
    if (part.startsWith("ref=")) {
      source = part.slice(4);
    } else if (part.startsWith("staff=")) {
      const raw = part.slice(6);
      try {
        staff = decodeURIComponent(raw);
      } catch {
        staff = raw;
      }
    }
  }
  if (source !== MISAKI_SOURCE) return null;
  const name = sanitizeStaffName(staff);
  return name ? { source: MISAKI_SOURCE, staff: name } : null;
}
