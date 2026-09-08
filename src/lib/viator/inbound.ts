import { createServiceClient } from '@/lib/supabase/service';
import { checkCapacity } from '@/lib/core/availability';
import { createReservation, getReservation, convertReservation } from '@/lib/core/reservations';
import { createBooking } from '@/lib/core/bookings';
import { countGuestsFromItems } from '@/lib/core/guests';
import type { BookingItem } from '@/lib/core/types';
import type {
  ViatorTicketRequest,
  ViatorAvailability,
  ViatorCalendarEvent,
  ViatorReserveResponse,
  ViatorBookingResponse,
  ViatorCancellationResponse,
  ViatorProduct,
  ViatorPrice,
  ViatorCapacity,
} from './types';

const SUPPLIER_ID = Number(process.env.VIATOR_SUPPLIER_ID || '5636104');

/**
 * Lookup tour by SupplierProductCode (tour UUID).
 */
export async function lookupTour(productOptionId: string) {
  const supabase = createServiceClient();

  const { data: listing } = await supabase
    .from('tour_channel_listings')
    .select('tour_id, tours(*)')
    .eq('external_product_code', productOptionId)
    .eq('channel', 'viator')
    .eq('is_active', true)
    .maybeSingle();

  if (!listing) return null;

  const tour = Array.isArray(listing.tours) ? listing.tours[0] : listing.tours;
  return { tour, tourId: listing.tour_id };
}

/**
 * Convert Viator ticket requests to BookingItem array.
 */
export function ticketRequestsToBookingItems(
  ticketRequests: ViatorTicketRequest[]
): BookingItem[] {
  return ticketRequests.map(tr => ({
    category: tr.type,
    count: tr.quantity,
    groupSize: tr.type === 'UNIT' ? tr.quantity : undefined,
  }));
}

/**
 * Check availability for a specific date and ticket requests.
 */
export async function checkAvailability(
  productOptionId: string,
  travelDate: string,
  ticketRequests: ViatorTicketRequest[]
): Promise<ViatorAvailability | null> {
  const result = await lookupTour(productOptionId);
  if (!result) return null;

  const { tour, tourId } = result;
  const startTime = tour.product_type === 'time_period' ? null : '10:00'; // Default time for time_point
  const bookingItems = ticketRequestsToBookingItems(ticketRequests);
  const totalGuests = countGuestsFromItems(bookingItems);

  const capacity = await checkCapacity(tourId, travelDate, startTime);

  // Get pricing
  const supabase = createServiceClient();
  const { data: pricingData } = await supabase
    .from('tour_pricing_categories')
    .select('category, price, currency')
    .eq('tour_id', tourId);

  const prices: ViatorPrice[] = (pricingData ?? []).map(p => ({
    type: 'PER_PERSON_PRICE',
    price: p.price,
    currency: p.currency,
  }));

  return {
    productOptionId,
    available: totalGuests <= capacity.remaining,
    vacancies: capacity.remaining,
    prices,
  };
}

/**
 * Get calendar availability for a date range.
 */
export async function getCalendarAvailability(
  productOptionId: string,
  startDate: string,
  endDate: string
): Promise<ViatorCalendarEvent[]> {
  const result = await lookupTour(productOptionId);
  if (!result) return [];

  const { tour, tourId } = result;
  const supabase = createServiceClient();

  // Get schedules
  const { data: schedules } = await supabase
    .from('tour_schedules')
    .select('*')
    .eq('tour_id', tourId)
    .eq('is_active', true);

  // Get exceptions
  const { data: exceptions } = await supabase
    .from('schedule_exceptions')
    .select('date')
    .eq('tour_id', tourId);

  const exceptionDates = new Set((exceptions ?? []).map(e => e.date));

  // Get pricing
  const { data: pricingData } = await supabase
    .from('tour_pricing_categories')
    .select('category, price, currency')
    .eq('tour_id', tourId);

  const price = pricingData?.[0];
  const events: ViatorCalendarEvent[] = [];

  // Generate dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    if (exceptionDates.has(dateStr)) continue;

    if (tour.product_type === 'time_point' && schedules) {
      // Time point: generate events for each schedule slot
      for (const schedule of schedules) {
        const startTime = String(schedule.start_time).slice(0, 5);
        const capacity = await checkCapacity(tourId, dateStr, startTime);

        events.push({
          date: dateStr,
          startTime,
          endTime: calculateEndTime(startTime, schedule.duration_minutes),
          status: capacity.remaining > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
          capacity: {
            type: 'LIMITED',
            vacancies: capacity.remaining,
            original: tour.capacity,
            remaining: capacity.remaining,
          },
          price: price ? {
            type: 'PER_PERSON_PRICE',
            price: price.price,
            currency: price.currency,
          } : {
            type: 'UNSUPPORTED_PRICE',
            price: 0,
            currency: 'JPY',
          },
        });
      }
    } else {
      // Time period: single event per day
      const capacity = await checkCapacity(tourId, dateStr, null);

      events.push({
        date: dateStr,
        startTime: tour.opening_hours?.fromTime ?? '09:00',
        endTime: tour.opening_hours?.toTime ?? '18:00',
        status: capacity.remaining > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
        capacity: {
          type: 'LIMITED',
          vacancies: capacity.remaining,
          original: tour.capacity,
          remaining: capacity.remaining,
        },
        price: price ? {
          type: 'PER_PERSON_PRICE',
          price: price.price,
          currency: price.currency,
        } : {
          type: 'UNSUPPORTED_PRICE',
          price: 0,
          currency: 'JPY',
        },
      });
    }
  }

  return events;
}

/**
 * Create a reservation hold (15 minutes).
 */
export async function createReserveHold(
  productOptionId: string,
  travelDate: string,
  ticketRequests: ViatorTicketRequest[]
): Promise<ViatorReserveResponse | null> {
  const result = await lookupTour(productOptionId);
  if (!result) return null;

  const { tour, tourId } = result;
  const startTime = tour.product_type === 'time_period' ? null : '10:00';
  const bookingItems = ticketRequestsToBookingItems(ticketRequests);

  // Get pricing
  const supabase = createServiceClient();
  const { data: pricingData } = await supabase
    .from('tour_pricing_categories')
    .select('category, price, currency')
    .eq('tour_id', tourId);

  let totalPrice = 0;
  for (const item of bookingItems) {
    const price = pricingData?.find(p => p.category === item.category);
    if (price) {
      totalPrice += price.price * item.count;
    }
  }

  const reservation = await createReservation({
    channel: 'viator',
    tourId,
    userId: tour.user_id,
    date: travelDate,
    startTime,
    bookingItems,
    totalPrice,
    ttlMinutes: 15,
  });

  return {
    reservationId: reservation.id,
    productOptionId,
    expiryTime: reservation.expires_at,
    totalPrice,
    currency: 'JPY',
  };
}

/**
 * Confirm a booking from a reservation.
 */
export async function confirmBooking(
  productOptionId: string,
  reservationId: string,
  travelDate: string,
  bookingReference: string,
  ticketRequests: ViatorTicketRequest[],
  leadTraveller: { fullName: string; email: string; phone?: string }
): Promise<ViatorBookingResponse | null> {
  const result = await lookupTour(productOptionId);
  if (!result) return null;

  const { tour, tourId } = result;
  const startTime = tour.product_type === 'time_period' ? null : '10:00';
  const bookingItems = ticketRequestsToBookingItems(ticketRequests);

  // Get pricing
  const supabase = createServiceClient();
  const { data: pricingData } = await supabase
    .from('tour_pricing_categories')
    .select('category, price, currency')
    .eq('tour_id', tourId);

  let totalPrice = 0;
  for (const item of bookingItems) {
    const price = pricingData?.find(p => p.category === item.category);
    if (price) {
      totalPrice += price.price * item.count;
    }
  }

  const booking = await createBooking({
    channel: 'viator',
    channelBookingReference: bookingReference,
    tourId,
    userId: tour.user_id,
    date: travelDate,
    startTime,
    bookingItems,
    customerInfo: {
      name: leadTraveller.fullName,
      email: leadTraveller.email,
      phone: leadTraveller.phone,
    },
    reservationId,
  });

  return {
    bookingReference: booking.id,
    status: 'CONFIRMED',
    totalPrice,
    currency: 'JPY',
  };
}

/**
 * Cancel a booking.
 */
export async function cancelBookingByReference(
  bookingReference: string
): Promise<ViatorCancellationResponse | null> {
  const supabase = createServiceClient();

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, channel_booking_reference, status')
    .eq('channel_booking_reference', bookingReference)
    .eq('channel', 'viator')
    .maybeSingle();

  if (!booking) return null;

  // Import cancelBooking from core
  const { cancelBooking } = await import('@/lib/core/bookings');
  await cancelBooking(booking.id);

  return {
    bookingReference,
    status: 'CANCELLED',
    cancellationFee: 0,
    refundAmount: 0,
    currency: 'JPY',
  };
}

/**
 * Get tour list for mapping.
 */
export async function getTourList(): Promise<ViatorProduct[]> {
  const supabase = createServiceClient();

  const { data: listings } = await supabase
    .from('tour_channel_listings')
    .select('external_product_code, tour_id, tours(*)')
    .eq('channel', 'viator')
    .eq('is_active', true);

  if (!listings) return [];

  const products: ViatorProduct[] = [];

  for (const listing of listings) {
    const tour = Array.isArray(listing.tours) ? listing.tours[0] : listing.tours;
    if (!tour) continue;

    // Get pricing
    const { data: pricingData } = await supabase
      .from('tour_pricing_categories')
      .select('category, price, currency')
      .eq('tour_id', tour.id);

    const priceBands = (pricingData ?? []).map(p => ({
      ageFrom: 0,
      ageTo: 99,
      price: p.price,
      currency: p.currency,
    }));

    products.push({
      tourCode: listing.external_product_code,
      productOptionId: listing.external_product_code,
      productName: tour.name,
      description: tour.description ?? '',
      isPerPersonPrice: tour.ticket_type === 'individual',
      isGroupPricing: tour.ticket_type === 'group',
      duration: `${tour.opening_hours ? 'Open' : '1 hour'}`,
      priceBands,
    });
  }

  return products;
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}
