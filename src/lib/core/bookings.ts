import { createServiceClient } from '@/lib/supabase/service';
import { checkCapacity } from './availability';
import { convertReservation } from './reservations';
import { countGuestsFromItems } from './guests';
import type { BookingItem, CustomerInfo, Booking } from './types';

interface CreateBookingParams {
  channel: string;
  channelBookingReference?: string;
  tourId: string;
  userId: string;
  date: string;
  startTime: string | null;
  bookingItems: BookingItem[];
  customerInfo: CustomerInfo;
  reservationId?: string;
  notes?: string;
}

/**
 * Create a booking.
 * Optionally converts a reservation.
 * Auto-blocks if capacity is reached.
 */
export async function createBooking(
  params: CreateBookingParams
): Promise<Booking> {
  const supabase = createServiceClient();
  const {
    channel,
    channelBookingReference,
    tourId,
    userId,
    date,
    startTime,
    bookingItems,
    customerInfo,
    reservationId,
    notes,
  } = params;

  const totalGuests = countGuestsFromItems(bookingItems);

  // Check capacity (exclude this reservation if converting)
  const capacity = await checkCapacity(tourId, date, startTime, reservationId);
  if (totalGuests > capacity.remaining) {
    throw new Error('NO_AVAILABILITY');
  }

  // If converting reservation, verify it exists and is active
  if (reservationId) {
    const { data: reservation } = await supabase
      .from('reservations')
      .select('id, status')
      .eq('id', reservationId)
      .single();

    if (!reservation || reservation.status !== 'active') {
      throw new Error('INVALID_RESERVATION');
    }
  }

  // Create booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      tour_id: tourId,
      user_id: userId,
      date,
      start_time: startTime,
      guest_count: totalGuests,
      source: channel,
      channel,
      channel_booking_reference: channelBookingReference,
      reservation_id: reservationId,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      status: 'confirmed',
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  // Convert reservation if provided
  if (reservationId) {
    await convertReservation(reservationId);
  }

  // Auto-block if full (fire-and-forget)
  const newCapacity = await checkCapacity(tourId, date, startTime);
  if (newCapacity.remaining === 0) {
    triggerAutoBlock(tourId, date, startTime).catch(console.error);
  }

  return booking as Booking;
}

/**
 * Cancel a booking.
 */
export async function cancelBooking(
  bookingId: string
): Promise<void> {
  const supabase = createServiceClient();

  // Check if in the past (JST-aware)
  const { data: booking } = await supabase
    .from('bookings')
    .select('date, start_time')
    .eq('id', bookingId)
    .single();

  if (booking) {
    const now = new Date();
    const jstOffset = 9 * 60;
    const jstNow = new Date(now.getTime() + jstOffset * 60 * 1000);
    const bookingDate = new Date(`${booking.date}T${booking.start_time || '00:00'}:00+09:00`);

    if (bookingDate < jstNow) {
      throw new Error('CANNOT_CANCEL_PAST_BOOKING');
    }
  }

  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);
}

/**
 * Trigger auto-block on Google Calendar (fire-and-forget).
 */
async function triggerAutoBlock(
  tourId: string,
  date: string,
  startTime: string | null
): Promise<void> {
  // This would call the existing /api/calendar/block endpoint
  // For now, just log - will be implemented in Phase 4
  console.log(`Auto-block triggered for tour ${tourId} on ${date} at ${startTime}`);
}
