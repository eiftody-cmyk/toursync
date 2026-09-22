import { createServiceClient } from '@/lib/supabase/service';
import { checkCapacity } from './availability';
import { convertReservation } from './reservations';
import { countGuestsFromItems } from './guests';
import { blockSlot, unblockSlot } from '@/lib/google/sync';
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

  // Auto-block if full — awaited so Cloudflare Workers doesn't kill the push
  const newCapacity = await checkCapacity(tourId, date, startTime);
  if (newCapacity.remaining === 0) {
    await blockSlot({
      supabase,
      userId,
      tourId,
      date,
      startTime,
      reason: 'Full — via OTA booking',
      summary: 'Full — via OTA booking',
      description: 'Auto-blocked: slot at capacity via OTA booking',
      isAutoBlocked: true,
    }).catch((e) => {
      console.error('[createBooking] auto-block failed:', e instanceof Error ? e.message : e);
    });
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
    .select('date, start_time, tour_id, user_id, status')
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

  // If slot is now below capacity, remove auto-block (Google event + DB row)
  if (booking?.tour_id) {
    try {
      await maybeRemoveAutoBlock(supabase, booking.tour_id, booking.date, booking.start_time);
    } catch (e) {
      console.error('[cancelBooking] auto-unblock failed:', e instanceof Error ? e.message : e);
    }
  }
}

async function maybeRemoveAutoBlock(
  supabase: ReturnType<typeof createServiceClient>,
  tourId: string,
  date: string,
  startTime: string | null
): Promise<void> {
  const { data: tour } = await supabase
    .from('tours')
    .select('capacity')
    .eq('id', tourId)
    .single();
  if (!tour) return;

  const { data: remainingBookings } = await supabase
    .from('bookings')
    .select('guest_count')
    .eq('tour_id', tourId)
    .eq('date', date)
    .eq('start_time', startTime)
    .eq('status', 'confirmed');

  const totalBooked = (remainingBookings ?? []).reduce((s, b) => s + (b.guest_count ?? 0), 0);
  if (totalBooked >= tour.capacity) return;

  let q = supabase
    .from('blocked_dates')
    .select('id, user_id')
    .eq('tour_id', tourId)
    .eq('date', date)
    .eq('is_auto_blocked', true);
  q = startTime ? q.eq('start_time', startTime) : q.is('start_time', null);
  const { data: autoBlock } = await q.maybeSingle();

  if (autoBlock) {
    await unblockSlot({ supabase, blockedId: autoBlock.id });
  }
}
