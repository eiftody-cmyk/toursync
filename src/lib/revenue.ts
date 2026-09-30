import { REFERRAL_PARTNERS } from "@/config/referral-partners";

// Referral partners (/ref/join) get paid either a percentage of booking
// value or a flat ¥-per-guest fee — unique per partner, stored in
// public.referral_partners (payout_type + payout_rate, migrations 035/036)
// and merged into the rates map upstream before calcCommission/calcNet.
// A plain number in the map always means percent (OTA/channel rates are
// numeric and unchanged). 10% is the fallback until the table exists or a
// key is missing; partner slugs must never fall through to the 25%
// unknown-source default.
const PARTNER_DEFAULT_RATE = 10;
const PARTNER_RATES = Object.fromEntries(
  REFERRAL_PARTNERS.map((p) => [p.slug, PARTNER_DEFAULT_RATE])
);
const PARTNER_LABELS = Object.fromEntries(
  REFERRAL_PARTNERS.map((p) => [p.slug, p.displayName])
);

export const DEFAULT_COMMISSION_RATES: Record<string, number> = {
  airbnb: 25,
  viator: 20,
  gyg: 25,
  travelio: 20,
  direct: 0,
  walk_in: 0,
  other: 0,
  ...PARTNER_RATES,
};

export const COMMISSION_LABELS: Record<string, string> = {
  airbnb: "Airbnb",
  viator: "Viator",
  gyg: "GetYourGuide",
  travelio: "Travelio",
  direct: "Direct",
  walk_in: "Walk-in",
  other: "Other",
  ...PARTNER_LABELS,
};

export type PayoutSpec = {
  type: "percent" | "flat_per_guest";
  value: number;
};

export type RateMap = Record<string, number | PayoutSpec>;

function resolvePayout(source: string, rates: RateMap | null): PayoutSpec {
  const entry = rates?.[source] ?? DEFAULT_COMMISSION_RATES[source];
  if (entry !== null && typeof entry === "object") return entry;
  return { type: "percent", value: (entry as number | undefined) ?? 25 };
}

export function calcGross(price: number, guests: number): number {
  return price * guests;
}

export function calcNet(
  source: string,
  price: number,
  guests: number,
  rates: RateMap | null
): number {
  const gross = calcGross(price, guests);
  const payout = resolvePayout(source, rates);
  if (payout.type === "flat_per_guest") {
    return gross - Math.round(guests * payout.value);
  }
  return Math.round(gross * (1 - payout.value / 100));
}

export function calcCommission(
  source: string,
  price: number,
  guests: number,
  rates: RateMap | null
): number {
  const payout = resolvePayout(source, rates);
  if (payout.type === "flat_per_guest") {
    return Math.round(guests * payout.value);
  }
  return Math.round(calcGross(price, guests) * payout.value / 100);
}
