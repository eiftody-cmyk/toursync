import type { BookingItem } from './types';

/**
 * Count total guests from booking items.
 * Handles GROUP category specially: groupSize * count.
 */
export function countGuestsFromItems(items: BookingItem[]): number {
  let total = 0;
  for (const item of items) {
    if (item.category === 'GROUP') {
      total += (item.groupSize || 0) * (item.count || 0);
    } else {
      total += item.count || 0;
    }
  }
  return total;
}

/**
 * Parse ISO datetime string into date and start_time.
 * For time_period tours, startTime is null.
 */
export function parseDateTime(
  isoString: string,
  productType: 'time_point' | 'time_period'
): { date: string; startTime: string | null } {
  const dateStr = isoString.split('T')[0];
  if (productType === 'time_period') {
    return { date: dateStr, startTime: null };
  }
  const timePart = isoString.split('T')[1]?.split('+')[0]?.split('-')[0] ?? '00:00:00';
  const [h, m] = timePart.split(':');
  return { date: dateStr, startTime: `${h}:${m}` };
}

/**
 * Normalize time string to HH:MM format.
 */
export function normalizeTime(t: string | null): string {
  if (!t) return '00:00';
  return t.length > 5 ? t.slice(0, 5) : t;
}

/**
 * Generate slot key for capacity lookups.
 */
export function getSlotKey(date: string, startTime: string | null): string {
  return `${date}_${normalizeTime(startTime)}`;
}
