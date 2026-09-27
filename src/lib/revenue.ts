import { MISAKI_COMMISSION_PER_GUEST, MISAKI_SOURCE } from "@/lib/referral/misaki";

export const DEFAULT_COMMISSION_RATES: Record<string, number> = {
  airbnb: 25,
  viator: 20,
  gyg: 25,
  travelio: 20,
  direct: 0,
  walk_in: 0,
  other: 0,
  // Flat ¥1,500/guest referral fee (handled in calcCommission/calcNet below,
  // never as a percentage — 0 keeps getCommissionRate from falling back to 25).
  [MISAKI_SOURCE]: 0,
};

export const COMMISSION_LABELS: Record<string, string> = {
  airbnb: "Airbnb",
  viator: "Viator",
  gyg: "GetYourGuide",
  travelio: "Travelio",
  direct: "Direct",
  walk_in: "Walk-in",
  other: "Other",
  [MISAKI_SOURCE]: "MISAKI",
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

/** Flat per-guest referral fee (MISAKI staff), or null for percentage sources. */
function flatCommission(source: string, guests: number): number | null {
  return source === MISAKI_SOURCE ? MISAKI_COMMISSION_PER_GUEST * guests : null;
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
