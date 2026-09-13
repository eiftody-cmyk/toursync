export interface BlockLike {
  date: string;
  start_time: string | null;
  end_time: string | null;
  is_auto_blocked: boolean;
}

export interface TourWindowLike {
  product_type: string;
  opening_hours: { fromTime: string; toTime: string } | null;
}

export interface ScheduleWindowLike {
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  start_date: string;
  end_date: string | null;
  is_active?: boolean;
}

export type OverlapMode = "tour" | "slot";

const END_OF_DAY_MIN = 23 * 60 + 59;

/** Normalize HH:MM[:SS] → "HH:MM"; null → "00:00" */
export function normalizeTime(t: string | null): string {
  if (!t) return "00:00";
  return t.length > 5 ? t.slice(0, 5) : t;
}

/** "HH:MM" → minutes since midnight (null → 0) */
export function timeToMinutes(t: string | null): number {
  const [h = "0", m = "0"] = normalizeTime(t).split(":");
  return Number(h) * 60 + Number(m);
}

/** 0=Sun..6=Sat for a YYYY-MM-DD date in Japan time */
export function dayOfWeekJst(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00+09:00`).getUTCDay();
}

/** A block with no start time (or 00:00) means the whole day is blocked. */
export function isAllDayBlock(b: BlockLike): boolean {
  return !b.start_time || timeToMinutes(b.start_time) === 0;
}

/**
 * Split block rows into:
 *  - allDayDates: dates with any all-day block (manual or auto)
 *  - manualRows: manual timed blocks (used for overlap logic)
 *  - autoTimeSet: auto timed blocks keyed `${date}_${HH:MM}` (exact-slot)
 */
export function clusterBlockRows(rows: BlockLike[] | null | undefined): {
  allDayDates: Set<string>;
  manualRows: BlockLike[];
  autoTimeSet: Set<string>;
} {
  const allDayDates = new Set<string>();
  const manualRows: BlockLike[] = [];
  const autoTimeSet = new Set<string>();

  for (const row of rows ?? []) {
    if (isAllDayBlock(row)) {
      allDayDates.add(row.date);
      continue;
    }
    if (row.is_auto_blocked) {
      autoTimeSet.add(`${row.date}_${normalizeTime(row.start_time)}`);
    } else {
      manualRows.push(row);
    }
  }

  return { allDayDates, manualRows, autoTimeSet };
}

/**
 * Operating spans (minutes, half-open [start, end)) for a tour on a date.
 *  - time_period: single span from opening_hours (default 09:00–18:00)
 *  - time_point: one span per active schedule slot for that date (start → start + duration)
 * Returns null when the tour has no operating window that date.
 */
export function tourWindowSpansForDate(
  tour: TourWindowLike,
  dateStr: string,
  schedules: ScheduleWindowLike[] | null | undefined
): Array<{ start: number; end: number }> | null {
  if (tour.product_type === "time_period") {
    const from = tour.opening_hours?.fromTime ?? "09:00";
    const to = tour.opening_hours?.toTime ?? "18:00";
    return [{ start: timeToMinutes(from), end: timeToMinutes(to) }];
  }

  const dow = dayOfWeekJst(dateStr);
  const spans: Array<{ start: number; end: number }> = [];
  for (const s of schedules ?? []) {
    if (s.is_active === false) continue;
    if (s.day_of_week !== dow) continue;
    if (s.start_date && s.start_date > dateStr) continue;
    if (s.end_date && s.end_date < dateStr) continue;
    const start = timeToMinutes(s.start_time);
    spans.push({ start, end: start + (s.duration_minutes ?? 0) });
  }
  return spans.length > 0 ? spans : null;
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Block window as minutes; a block with no end time runs to end of day. */
function blockWindow(b: BlockLike): { start: number; end: number } {
  const start = timeToMinutes(b.start_time);
  let end = b.end_time ? timeToMinutes(b.end_time) : END_OF_DAY_MIN;
  if (end <= start) end = END_OF_DAY_MIN;
  return { start, end };
}

/**
 * True when a manual timed/all-day block on `dateStr` makes the tour's
 * whole operating window unavailable.
 *  - mode "tour" (default): block overlaps the union of the day's slots
 *  - mode "slot": block overlaps any single slot span
 * Returns false when the tour has no operating window that date.
 */
export function manualBlockedForTour(
  manualRows: BlockLike[] | null | undefined,
  tour: TourWindowLike,
  dateStr: string,
  schedules: ScheduleWindowLike[] | null | undefined,
  mode: OverlapMode = "tour"
): boolean {
  const rows = (manualRows ?? []).filter((r) => r.date === dateStr);
  if (rows.length === 0) return false;
  if (rows.some(isAllDayBlock)) return true;

  const spans = tourWindowSpansForDate(tour, dateStr, schedules);
  if (!spans) return false;

  for (const b of rows) {
    const win = blockWindow(b);
    if (mode === "slot") {
      if (spans.some((s) => overlaps(win, s))) return true;
      continue;
    }
    // tour mode: overlap the union of all slot spans
    const unionStart = Math.min(...spans.map((s) => s.start));
    const unionEnd = Math.max(...spans.map((s) => s.end));
    if (overlaps(win, { start: unionStart, end: unionEnd })) return true;
  }
  return false;
}

/**
 * True when any manual timed block on `dateStr` covers the given minute
 * (e.g. a specific requested slot start time). All-day rows always cover it.
 */
export function manualBlockCoversStart(
  manualRows: BlockLike[] | null | undefined,
  dateStr: string,
  minute: number
): boolean {
  for (const b of manualRows ?? []) {
    if (b.date !== dateStr) continue;
    const win = blockWindow(b);
    if (isAllDayBlock(b) || (win.start <= minute && minute < win.end)) return true;
  }
  return false;
}