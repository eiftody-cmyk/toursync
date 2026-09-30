import { REFERRAL_PARTNERS } from "@/config/referral-partners";

// Referral partners (/ref/join) pay a percentage of booking value at a rate
// unique to each partner (public.referral_partners, applied upstream and
// merged into the rates map before calcCommission/calcNet). 10 is the
// fallback until migration 035 exists or a key is missing from the map;
// partner slugs must never fall through to the 25% unknown-source default.
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

export function getCommissionRate(
  source: string,
  rates: Record<string, number> | null
): number {
  return rates?.[source] ?? DEFAULT_COMMISSION_RATES[source] ?? 25;
}

export function calcGross(price: number, guests: number): number {
  return price * guests;
}

export function calcNet(
  source: string,
  price: number,
  guests: number,
  rates: Record<string, number> | null
): number {
  const gross = calcGross(price, guests);
  const rate = getCommissionRate(source, rates);
  return Math.round(gross * (1 - rate / 100));
}

export function calcCommission(
  source: string,
  price: number,
  guests: number,
  rates: Record<string, number> | null
): number {
  const gross = calcGross(price, guests);
  const rate = getCommissionRate(source, rates);
  return Math.round(gross * rate / 100);
}
