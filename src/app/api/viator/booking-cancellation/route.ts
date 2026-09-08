import { NextRequest } from 'next/server';
import { verifyViatorAuth } from '@/lib/viator/auth';
import { viatorJson } from '@/lib/viator/response';
import { cancelBookingByReference } from '@/lib/viator/inbound';
import type { ViatorBookingCancellationRequest } from '@/lib/viator/types';

/**
 * POST /api/viator/booking-cancellation
 * Cancel a booking.
 */
export async function POST(req: NextRequest) {
  const authError = verifyViatorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json() as ViatorBookingCancellationRequest;

    if (!body.bookingReference) {
      return viatorJson(
        { error: 'Missing required field: bookingReference' },
        { status: 400 }
      );
    }

    const result = await cancelBookingByReference(body.bookingReference);

    if (!result) {
      return viatorJson(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return viatorJson(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === 'CANNOT_CANCEL_PAST_BOOKING') {
      return viatorJson(
        { error: 'Cannot cancel a booking in the past' },
        { status: 409 }
      );
    }
    console.error('[Viator booking-cancellation] Error:', msg);
    return viatorJson({ error: 'Internal system failure' }, { status: 500 });
  }
}
