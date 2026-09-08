import { createServiceClient } from '@/lib/supabase/service';
import { checkCapacity } from './availability';
import { countGuestsFromItems } from './guests';
import type { BookingItem, Reservation } from './types';

const DEFAULT_TTL_MINUTES = 15;

interface CreateReservationParams {
  channel: string;
  channelReservationId?: string;
  tourId: string;
  userId: string;
  date: string;
  startTime: string | null;
  bookingItems: BookingItem[];
  totalPrice: number;
  currency?: string;
  ttlMinutes?: number;
}

/**
 * Create a reservation hold.
 * Checks capacity before creating.
 */
export async function createReservation(
  params: CreateReservationParams
): Promise<Reservation> {
  const supabase = createServiceClient();
  const {
    channel,
    channelReservationId,
    tourId,
    userId,
    date,
    startTime,
    bookingItems,
    totalPrice,
    currency = 'JPY',
    ttlMinutes = DEFAULT_TTL_MINUTES,
  } = params;

  const totalGuests = countGuestsFromItems(bookingItems);

  const capacity = await checkCapacity(tourId, date, startTime);
  if (totalGuests > capacity.remaining) {
    throw new Error('NO_AVAILABILITY');
  }

  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({
      channel,
      channel_reservation_id: channelReservationId,
      tour_id: tourId,
      user_id: userId,
      date,
      start_time: startTime,
      booking_items: bookingItems,
      total_guests: totalGuests,
      total_price: totalPrice,
      currency,
      status: 'active',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create reservation: ${error.message}`);
  }

  return reservation as Reservation;
}

/**
 * Get a reservation by ID.
 * Returns null if not found or expired.
 */
export async function getReservation(
  reservationId: string
): Promise<Reservation | null> {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('reservations')
    .select()
    .eq('id', reservationId)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return data as Reservation | null;
}

/**
 * Convert a reservation to a booking.
 * Updates status to 'converted'.
 */
export async function convertReservation(
  reservationId: string
): Promise<void> {
  const supabase = createServiceClient();

  await supabase
    .from('reservations')
    .update({ status: 'converted', updated_at: new Date().toISOString() })
    .eq('id', reservationId);
}

/**
 * Cancel a reservation.
 * Updates status to 'cancelled'.
 */
export async function cancelReservation(
  reservationId: string
): Promise<void> {
  const supabase = createServiceClient();

  await supabase
    .from('reservations')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', reservationId);
}

/**
 * Expire all active reservations that have passed their expiry time.
 * Called by cron job.
 */
export async function expireReservations(): Promise<number> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('reservations')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString())
    .select('id');

  if (error) {
    throw new Error(`Failed to expire reservations: ${error.message}`);
  }

  return data?.length ?? 0;
}
