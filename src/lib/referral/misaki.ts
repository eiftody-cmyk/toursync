/**
 * Referral attribution (partner + staff slug).
 *
 * The referral travels through PayPal's custom_id so it is verified
 * server-side at capture time (and by the webhook fallback):
 *
 *   tour_id|date|start_time|guest_count[|custom=true|phone][|ref=<partner>|staff=<value>]
 *
 * staff is a registered referral_staff slug (staff-QR path) or typed free
 * text (partner-QR fallback). parseReferralParts is position-independent:
 * it scans for ref=/staff= parts, so it works for both instant and
 * custom-time orders.
 *
 * The ref value is validated against the code-controlled partner registry
 * (/config/referral-partners) — a client can never mint a new partner.
 */

import { isPartner } from "@/config/referral-partners";

/** Cookie set by the referral landing pages: value "<partner>|<staff>". */
export const ATTR_COOKIE = "ref_attr";
/** Pre-multi-partner cookie (value = staff text only, partner implied). */
export const LEGACY_ATTR_COOKIE = "misaki_ref";

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

/** Validate a client-supplied referral object. Unknown partners are dropped. */
export function normalizeReferral(input: unknown): Referral | null {
  if (!input || typeof input !== "object") return null;
  const { source, staff } = input as { source?: unknown; staff?: unknown };
  if (!isPartner(source)) return null;
  const name = sanitizeStaffName(staff);
  return name ? { source, staff: name } : null;
}

/**
 * Read a referral cookie. Formats:
 *   ref_attr value:  "<partner>|<staff>"  (multi-partner)
 *   legacy value:    "<staff>"            (partner implied = misaki)
 */
export function referralFromCookieValue(value: string | undefined): Referral | null {
  if (!value) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }

  const pipe = decoded.indexOf("|");
  if (pipe === -1) {
    // Legacy misaki_ref value: staff text only.
    const name = sanitizeStaffName(decoded);
    return name ? { source: "misaki", staff: name } : null;
  }

  const partner = decoded.slice(0, pipe);
  const name = sanitizeStaffName(decoded.slice(pipe + 1));
  if (!isPartner(partner) || !name) return null;
  return { source: partner, staff: name };
}

/**
 * Append referral segments to a base custom_id, shrinking the staff value if
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
  if (!source || !isPartner(source)) return null;
  const name = sanitizeStaffName(staff);
  return name ? { source, staff: name } : null;
}
