const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toJSTDate(date: Date): Date {
  return new Date(date.getTime() + JST_OFFSET_MS);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatYMD(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

export function todayJST(): string {
  return formatYMD(toJSTDate(new Date()));
}

export function formatJSTDate(date: Date): string {
  return formatYMD(toJSTDate(date));
}

export function toJSTStartOfDay(dateStr: string): Date {
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
