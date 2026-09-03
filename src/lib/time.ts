const JST = "Asia/Tokyo";

export function todayJST(): string {
  // Returns YYYY-MM-DD in JST
  return new Date().toLocaleDateString("en-CA", { timeZone: JST });
}

export function formatJSTDate(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: JST });
}

export function toJSTStartOfDay(dateStr: string): Date {
  // Creates a Date at 00:00:00 JST, returns as UTC-equivalent Date
  // that react-big-calendar can use
  return new Date(`${dateStr}T00:00:00+09:00`);
}

export function isTodayJST(dateStr: string): boolean {
  return dateStr === todayJST();
}

export function nextDay(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00+09:00`);
  d.setDate(d.getDate() + 1);
  return formatJSTDate(d);
}
