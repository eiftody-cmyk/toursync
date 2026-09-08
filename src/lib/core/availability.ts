import { createServiceClient } from '@/lib/supabase/service';
import type { CapacityResult } from './types';

/**
 * Check remaining capacity for a tour slot.
 * This is the SINGLE source of truth for capacity checks.
 *
 * @param tourId - Tour ID
 * @param date - Date string (YYYY-MM-DD)
 * @param startTime - Start time (HH:MM) or null for time_period tours
 * @param excludeReservationId - Optional reservation to exclude (used during booking conversion)
 * @returns CapacityResult with remaining, totalBooked, and capacity
 */
export async function checkCapacity(
  tourId: string,
  date: string,
  startTime: string | null,
  excludeReservationId?: string
): Promise<CapacityResult> {
  const supabase = createServiceClient();

  // 1. Get tour capacity
  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('capacity')
    .eq('id', tourId)
    .single();

  if (tourError || !tour) {
    throw new Error(`Tour not found: ${tourId}`);
  }

  const capacity = tour.capacity;

  // 2. Count confirmed bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('guest_count')
    .eq('tour_id', tourId)
    .eq('date', date)
    .is('start_time', startTime)
    .eq('status', 'confirmed');

  let totalBooked = (bookings ?? []).reduce(
    (sum, b) => sum + (b.guest_count ?? 0),
    0
  );

  // 3. Count active reservations from new reservations table
  let reservationsQuery = supabase
    .from('reservations')
    .select('booking_items')
    .eq('tour_id', tourId)
    .eq('date', date)
    .is('start_time', startTime)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString());

  if (excludeReservationId) {
    reservationsQuery = reservationsQuery.neq('id', excludeReservationId);
  }

  const { data: reservations } = await reservationsQuery;

  // Also check gyg_reservations (legacy table during migration)
  const { data: gygReservations } = await supabase
    .from('gyg_reservations')
    .select('booking_items')
    .eq('tour_id', tourId)
    .eq('date', date)
    .is('start_time', startTime)
    .gt('expires_at', new Date().toISOString());

  // 4. Sum reservation guests from both tables
  const allReservations = [...(reservations ?? []), ...(gygReservations ?? [])];
  for (const r of allReservations) {
    const items = r.booking_items as Array<{ category: string; count: number; groupSize?: number }> | null;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.category === 'GROUP') {
          totalBooked += (item.groupSize || 0) * (item.count || 0);
        } else {
          totalBooked += item.count || 0;
        }
      }
    }
  }

  return {
    remaining: Math.max(0, capacity - totalBooked),
    totalBooked,
    capacity,
  };
}
