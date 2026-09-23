import { createServiceClient } from '@/lib/supabase/service';
import { checkCapacity } from './availability';
import { convertReservation } from './reservations';
import { countGuestsFromItems } from './guests';
import { blockSlot, unblockSlot } from '@/lib/google/sync';
import { filterBySlot } from './slot';
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
    const blockResult = await blockSlot({
      supabase,
      userId,
      tourId,
      date,
      startTime,
      reason: 'Full — via OTA booking',
      summary: 'Full — via OTA booking',
      description: 'Auto-blocked: slot at capacity via OTA booking',
      isAutoBlocked: true,
    });
    if (blockResult.error) {
      console.error('[createBooking] auto-block failed:', blockResult.error);
    }
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
    const start = (booking.start_time ?? '00:00').slice(0, 5);
    const bookingStartAbs = Date.parse(`${booking.date}T${start}:00+09:00`);
    if (Number.isNaN(bookingStartAbs) || bookingStartAbs < Date.now()) {
      throw new Error('CANNOT_CANCEL_PAST_BOOKING');
    }
  }

  const { data: cancelled } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('status', 'confirmed')
    .select('id');
  if (!cancelled || cancelled.length === 0) {
    return;
  }

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

  const { data: remainingBookings } = await filterBySlot(
    supabase
      .from('bookings')
      .select('guest_count')
      .eq('tour_id', tourId)
      .eq('date', date),
    startTime
  ).eq('status', 'confirmed');

  const totalBooked = (remainingBookings ?? []).reduce((s: number, b: { guest_count?: number }) => s + (b.guest_count ?? 0), 0);
  if (totalBooked >= tour.capacity) return;

  const { data: autoBlock } = await filterBySlot(
    supabase
      .from('blocked_dates')
      .select('id, user_id')
      .eq('tour_id', tourId)
      .eq('date', date)
      .eq('is_auto_blocked', true),
    startTime
  ).maybeSingle();

  if (autoBlock) {
    await unblockSlot({ supabase, blockedId: autoBlock.id });
  }
}
