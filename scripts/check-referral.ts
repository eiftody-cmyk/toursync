/**
 * Referral-system unit checks: run with
 *   npx --yes tsx scripts/check-referral.ts
 * Pure-function checks only (no DB, no network).
 */
import {
  slugifyDisplayName,
  uniqueStaffSlug,
  randomStaffSlug,
  normalizeDisplayName,
  normalizeContact,
  contactKey,
  findExistingByContact,
  type StaffRecord,
} from "../src/lib/referral/staff";
import {
  sanitizeStaffName,
  normalizeReferral,
  referralFromCookieValue,
  appendReferral,
  parseReferralParts,
} from "../src/lib/referral/misaki";
import {
  parseReferralSlug,
  isPartner,
  REFERRAL_PARTNERS,
} from "../src/config/referral-partners";
import { calcCommission, calcNet } from "../src/lib/revenue";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean) {
  if (cond) {
    pass++;
    console.log(`  ok  ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name}`);
  }
}

// --- slugify ---
check("slugify ascii", slugifyDisplayName("Yuki Sato") === "yuki-sato");
check("slugify single", slugifyDisplayName("Yuki") === "yuki");
check("slugify punctuation", slugifyDisplayName("  O'Neil!  ") === "o-neil");
check("slugify accents fold", slugifyDisplayName("José") === "jose");
check("slugify japanese empty", slugifyDisplayName("ゆき") === "");
check("slugify mixed jp", slugifyDisplayName("Yuki ゆき") === "yuki");
check("display name trim", normalizeDisplayName("  Yuki   Sato  ") === "Yuki Sato");
check("display name empty", normalizeDisplayName("   ") === null);
check("contact trim", normalizeContact(" LINE:Yuki  ") === "LINE:Yuki");
check("contact case kept", contactKey("Yuki@X.jp") === "yuki@x.jp");

// --- unique slug ---
check("unique free", uniqueStaffSlug("yuki", new Set()) === "yuki");
check("unique collision", uniqueStaffSlug("yuki", new Set(["yuki"])) === "yuki-2");
check(
  "unique double collision",
  uniqueStaffSlug("yuki", new Set(["yuki", "yuki-2"])) === "yuki-3"
);
check("random fallback shape", /^s-[0-9a-f]{8}$/.test(randomStaffSlug()));

// --- contact recovery (first match, case-insensitive) ---
const rows: StaffRecord[] = [
  {
    id: "1",
    partner: "misaki",
    slug: "yuki",
    display_name: "Yuki",
    contact: "Yuki@Line.me",
    created_at: "2026-01-01",
  },
  {
    id: "2",
    partner: "misaki",
    slug: "yuki-2",
    display_name: "Yuki B",
    contact: "yuki@line.me",
    created_at: "2026-02-01",
  },
];
check(
  "recovery first match wins",
  findExistingByContact(rows, "yuki@LINE.me")?.id === "1"
);
check("recovery no match", findExistingByContact([], "x") === null);

// --- partner slug parsing ---
check("parse partner", parseReferralSlug("misaki")?.kind === "partner");
check("parse staff", (() => {
  const p = parseReferralSlug("misaki-yuki");
  return p?.kind === "staff" && p.kind === "staff" && p.staffSlug === "yuki";
})());
check("parse staff multi hyphen", (() => {
  const p = parseReferralSlug("misaki-yuki-sato-2");
  return p?.kind === "staff" && p.kind === "staff" && p.staffSlug === "yuki-sato-2";
})());
check("parse unknown partner 404", parseReferralSlug("unknownshop") === null);
check("parse uppercase rejected", parseReferralSlug("Misaki") === null);
check("parse weird chars rejected", parseReferralSlug("misaki-yuki%20") === null);
check("isPartner truthy", isPartner("misaki") === true);
check("isPartner unknown", isPartner("evil") === false);
check("isPartner non-string", isPartner(undefined) === false);

// --- second partner (Ryu Ter Hua, Thai restaurant) ---
check("parse ryuterhua partner", parseReferralSlug("ryuterhua")?.kind === "partner");
check("parse ryuterhua staff", (() => {
  const p = parseReferralSlug("ryuterhua-yuki");
  return (
    p?.kind === "staff" &&
    p.kind === "staff" &&
    p.partner.slug === "ryuterhua" &&
    p.staffSlug === "yuki"
  );
})());
check("parse ryuterhua multi-hyphen staff", (() => {
  const p = parseReferralSlug("ryuterhua-yuki-sato");
  return p?.kind === "staff" && p.kind === "staff" && p.staffSlug === "yuki-sato";
})());
check("isPartner ryuterhua", isPartner("ryuterhua") === true);
check(
  "ryuterhua landing copy configured",
  REFERRAL_PARTNERS.find((p) => p.slug === "ryuterhua")?.landing !== undefined
);

// --- staff sanitizing ---
check("staff trim", sanitizeStaffName("  Yuki  ") === "Yuki");
check("staff pipe stripped", sanitizeStaffName("Yu|ki") === "Yu ki");
check("staff angle stripped", sanitizeStaffName("<Yuki>") === "Yuki");
check("staff empty", sanitizeStaffName("   ") === null);
check("staff non-string", sanitizeStaffName(42) === null);
check("staff 40 cap", sanitizeStaffName("x".repeat(60))!.length === 40);

// --- normalizeReferral (client-supplied) ---
check(
  "normalize ok",
  JSON.stringify(normalizeReferral({ source: "misaki", staff: "Yuki" })) ===
    '{"source":"misaki","staff":"Yuki"}'
);
check("normalize unknown partner", normalizeReferral({ source: "evil", staff: "Yuki" }) === null);
check("normalize no staff", normalizeReferral({ source: "misaki", staff: "" }) === null);
check("normalize garbage", normalizeReferral("misaki") === null);

// --- cookie round-trips ---
check(
  "cookie new format",
  JSON.stringify(referralFromCookieValue(encodeURIComponent("misaki|Yuki"))) ===
    '{"source":"misaki","staff":"Yuki"}'
);
check(
  "cookie legacy no pipe",
  JSON.stringify(referralFromCookieValue(encodeURIComponent("Yuki"))) ===
    '{"source":"misaki","staff":"Yuki"}'
);
check("cookie unknown partner", referralFromCookieValue("evil|Yuki") === null);
check("cookie empty staff", referralFromCookieValue("misaki|") === null);
check("cookie undefined", referralFromCookieValue(undefined) === null);
check(
  "cookie invalid percent survives",
  referralFromCookieValue("%E0%A4%A")?.staff !== undefined
);

// --- custom_id ---
const base = "c97d74f3-c95a-451f-aa1a-e34452b3e592|2026-10-01|10:00|2";
const cid = appendReferral(base, { source: "misaki", staff: "Yuki" });
check("custom id contains ref", cid.includes("|ref=misaki|staff=Yuki"));
check("custom id no ref null", appendReferral(base, null) === base);
const longCid = appendReferral(
  base,
  { source: "misaki", staff: "X".repeat(300) }
);
check("custom id ≤255", longCid.length <= 255);
check("custom id keeps ref prefix", longCid.includes("|ref=misaki|staff="));
const roundTrip = parseReferralParts(longCid.split("|"));
check("custom id round-trip", roundTrip?.source === "misaki");
check("custom id round-trip staff", (roundTrip?.staff ?? "").length > 0);

// parse position independence (custom-time order has extra empty segment)
const customParts = [
  base.split("|")[0],
  "2026-10-01",
  "10:00",
  "2",
  "custom=true",
  "phone=+819012345678",
  "ref=misaki",
  "staff=Yuki",
].join("|").split("|");
check(
  "parse position independent",
  JSON.stringify(parseReferralParts(customParts)) ===
    '{"source":"misaki","staff":"Yuki"}'
);
check("parse rejects unknown partner", parseReferralParts(["x", "ref=evil", "staff=Yuki"]) === null);
check("parse missing staff", parseReferralParts(["ref=misaki"]) === null);
check("parse absent", parseReferralParts(["a", "b"]) === null);

// --- revenue: flat ¥1,500 for partners, percentages elsewhere ---
check("commission misaki flat", calcCommission("misaki", 9500, 2, null) === 3000);
check("commission ryuterhua flat", calcCommission("ryuterhua", 9500, 3, null) === 4500);
check("net misaki flat", calcNet("misaki", 9500, 2, null) === 19000 - 3000);
check("commission unknown partner-like", calcCommission("viator", 9500, 2, null) === 3800);
check(
  "commission unknown source falls back 25",
  calcCommission("mystery", 9500, 1, null) === 2375
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
