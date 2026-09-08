import { NextRequest } from 'next/server';
import { verifyViatorAuth } from '@/lib/viator/auth';
import { viatorJson } from '@/lib/viator/response';
import { checkAvailability } from '@/lib/viator/inbound';
import type { ViatorAvailabilityCheckRequest } from '@/lib/viator/types';

/**
 * POST /api/viator/availability/check
 * Real-time availability check during checkout.
 */
export async function POST(req: NextRequest) {
  const authError = verifyViatorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json() as ViatorAvailabilityCheckRequest;

    if (!body.productOptionIds?.length || !body.travelDate || !body.ticketRequests?.length) {
      return viatorJson(
        { error: 'Missing required fields: productOptionIds, travelDate, ticketRequests' },
        { status: 400 }
      );
    }

    const results = [];
    for (const productOptionId of body.productOptionIds) {
      const availability = await checkAvailability(
        productOptionId,
        body.travelDate,
        body.ticketRequests
      );
      if (availability) {
        results.push(availability);
      }
    }

    return viatorJson({ availability: results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[Viator availability/check] Error:', msg);
    return viatorJson({ error: 'Internal system failure' }, { status: 500 });
  }
}
