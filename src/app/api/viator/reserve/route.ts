import { NextRequest } from 'next/server';
import { verifyViatorAuth } from '@/lib/viator/auth';
import { viatorJson } from '@/lib/viator/response';
import { createReserveHold } from '@/lib/viator/inbound';
import type { ViatorReserveRequest } from '@/lib/viator/types';

/**
 * POST /api/viator/reserve
 * Hold inventory for 15 minutes during checkout.
 */
export async function POST(req: NextRequest) {
  const authError = verifyViatorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json() as ViatorReserveRequest;

    if (!body.productOptionId || !body.travelDate || !body.ticketRequests?.length) {
      return viatorJson(
        { error: 'Missing required fields: productOptionId, travelDate, ticketRequests' },
        { status: 400 }
      );
    }

    const result = await createReserveHold(
      body.productOptionId,
      body.travelDate,
      body.ticketRequests
    );

    if (!result) {
      return viatorJson(
        { error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    return viatorJson(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === 'NO_AVAILABILITY') {
      return viatorJson(
        { error: 'No availability for requested date/time' },
        { status: 409 }
      );
    }
    console.error('[Viator reserve] Error:', msg);
    return viatorJson({ error: 'Internal system failure' }, { status: 500 });
  }
}
