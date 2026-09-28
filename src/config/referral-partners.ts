/**
 * Approved referral partners (shops staff join through).
 *
 * Partners are intentionally code-controlled: /ref/join?partner=... and
 * bookings.referral source values are validated against this list, so a
 * client can never mint a new partner. Staff members live in the
 * referral_staff table; a partner slug only says which shop a person
 * joined through — it never gates their referral URL (see §1/§17 of the
 * referral spec: leaving a shop does not deactivate a person).
 *
 * Partner slugs must be lowercase alphanumeric without hyphens so
 * /ref/<partner>-<staff-slug> parses unambiguously (longest-prefix match
 * still applied as a safety net).
 */

export interface ReferralPartner {
  slug: string;
  displayName: string;
  /**
   * Copy for the landing page's mid-page section (§7). Defaults to neutral
   * tour copy; MISAKI keeps its original kimono wording.
   */
  landing?: { heading: string; body: string };
}

export const REFERRAL_PARTNERS: readonly ReferralPartner[] = [
  {
    slug: "misaki",
    displayName: "KIMONO RENTAL MISAKI",
    landing: {
      heading: "You've dressed for the history. Now walk through it.",
      body:
        "Your kimono gives you a glimpse of Japan's past. This experience takes you into the landscape where that past actually unfolded — the ridge, the walls, and the ground the castle was built to control.",
    },
  },
  {
    slug: "ryuterhua",
    displayName: "Ryu Ter Hua",
    landing: {
      heading: "A good meal deserves a better view.",
      body:
        "Ryu Ter Hua sent you here for more than dinner — this walk takes you into the landscape around Osaka Castle, in the company of a resident historian.",
    },
  },
];

const bySlug = new Map(REFERRAL_PARTNERS.map((p) => [p.slug, p]));

export function isPartner(value: unknown): value is string {
  return typeof value === "string" && bySlug.has(value);
}

export function getPartner(slug: string): ReferralPartner | null {
  return bySlug.get(slug) ?? null;
}

export type ParsedReferralSlug =
  | { kind: "partner"; partner: ReferralPartner }
  | { kind: "staff"; partner: ReferralPartner; staffSlug: string };

/** Staff slugs: lowercase alphanumerics + single hyphens (yuki, yuki-sato). */
const STAFF_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Parse a /ref/[slug] path segment.
 *
 *   misaki          → partner-level QR (typed staff fallback)
 *   misaki-yuki     → staff QR
 *   anything else   → null (404)
 *
 * Longest partner prefix wins, so a future hyphen-free partner named
 * "misakistore" could never swallow "misaki-yuki".
 */
export function parseReferralSlug(segment: string): ParsedReferralSlug | null {
  const value = segment.toLowerCase();
  if (value !== segment) return null; // URLs are lowercase-only

  const partner = getPartner(value);
  if (partner) return { kind: "partner", partner };

  // Longest partner prefix wins (list sorted by slug length, desc).
  const ordered = [...REFERRAL_PARTNERS].sort(
    (a, b) => b.slug.length - a.slug.length
  );
  for (const p of ordered) {
    if (!value.startsWith(`${p.slug}-`)) continue;
    const staffSlug = value.slice(p.slug.length + 1);
    if (!STAFF_SLUG_RE.test(staffSlug)) continue;
    return { kind: "staff", partner: p, staffSlug };
  }
  return null;
}

/** Build the public URL for a partner or staff referral slug. */
export function referralUrl(segment: string): string {
  return `https://osakacastletours.com/ref/${segment}`;
}
