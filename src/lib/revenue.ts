export const DEFAULT_COMMISSION_RATES: Record<string, number> = {
  airbnb: 25,
  viator: 20,
  gyg: 30,
  travelio: 20,
  direct: 0,
  walk_in: 0,
  other: 0,
};

export const COMMISSION_LABELS: Record<string, string> = {
  airbnb: "Airbnb",
  viator: "Viator",
  gyg: "GetYourGuide",
  travelio: "Travelio",
  direct: "Direct",
  walk_in: "Walk-in",
  other: "Other",
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
