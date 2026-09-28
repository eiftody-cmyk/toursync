import { isPartner, REFERRAL_PARTNERS } from "@/config/referral-partners";
import { REFERRAL_COMMISSION_PER_GUEST } from "@/lib/referral/misaki";

// Referral partners share one policy: flat ¥1,500/guest (handled in
// calcCommission/calcNet, never as a percentage — 0 keeps getCommissionRate
// from falling back to 25 if a partner ever misses the flat check).
const PARTNER_RATES = Object.fromEntries(
  REFERRAL_PARTNERS.map((p) => [p.slug, 0])
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

/** Flat per-guest referral fee (any partner), or null for percentage sources. */
function flatCommission(source: string, guests: number): number | null {
  return isPartner(source) ? REFERRAL_COMMISSION_PER_GUEST * guests : null;
}

export function calcNet(
  source: string,
  price: number,
  guests: number,
  rates: Record<string, number> | null
): number {
  const gross = calcGross(price, guests);
  const flat = flatCommission(source, guests);
  if (flat !== null) return gross - flat;
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
  const flat = flatCommission(source, guests);
  if (flat !== null) return flat;
  const rate = getCommissionRate(source, rates);
  return Math.round(gross * rate / 100);
}
