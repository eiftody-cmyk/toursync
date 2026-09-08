import { NextRequest } from 'next/server';
import { verifyViatorAuth } from '@/lib/viator/auth';
import { viatorJson } from '@/lib/viator/response';
import { confirmBooking } from '@/lib/viator/inbound';
import type { ViatorBookingRequest } from '@/lib/viator/types';

/**
 * POST /api/viator/booking
 * Create booking from reservation.
 */
export async function POST(req: NextRequest) {
  const authError = verifyViatorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json() as ViatorBookingRequest;

    if (!body.productOptionId || !body.reservationId || !body.travelDate || !body.bookingReference) {
      return viatorJson(
        { error: 'Missing required fields: productOptionId, reservationId, travelDate, bookingReference' },
        { status: 400 }
      );
    }

    const result = await confirmBooking(
      body.productOptionId,
      body.reservationId,
      body.travelDate,
      body.bookingReference,
      body.ticketRequests ?? [],
      body.leadTraveller ?? { fullName: 'Unknown', email: 'unknown@example.com' }
    );

    if (!result) {
      return viatorJson(
        { error: 'Invalid reservation or product not found' },
        { status: 404 }
      );
    }

    return viatorJson(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === 'NO_AVAILABILITY') {
      return viatorJson(
        { error: 'Insufficient availability at time of booking' },
        { status: 409 }
      );
    }
    if (msg === 'INVALID_RESERVATION') {
      return viatorJson(
        { error: 'Reservation is invalid or has expired' },
        { status: 410 }
      );
    }
    console.error('[Viator booking] Error:', msg);
    return viatorJson({ error: 'Internal system failure' }, { status: 500 });
  }
}
