import { NextRequest } from 'next/server';
import { verifyViatorAuth } from '@/lib/viator/auth';
import { viatorJson } from '@/lib/viator/response';
import { getCalendarAvailability } from '@/lib/viator/inbound';
import type { ViatorAvailabilityCalendarRequest } from '@/lib/viator/types';

/**
 * POST /api/viator/availability/calendar
 * Long-term availability + pricing calendar.
 */
export async function POST(req: NextRequest) {
  const authError = verifyViatorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json() as ViatorAvailabilityCalendarRequest;

    if (!body.productOptionIds?.length || !body.startDate || !body.endDate) {
      return viatorJson(
        { error: 'Missing required fields: productOptionIds, startDate, endDate' },
        { status: 400 }
      );
    }

    const results = [];
    for (const productOptionId of body.productOptionIds) {
      const events = await getCalendarAvailability(
        productOptionId,
        body.startDate,
        body.endDate
      );
      results.push({
        productOptionId,
        events,
      });
    }

    return viatorJson({ calendars: results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[Viator availability/calendar] Error:', msg);
    return viatorJson({ error: 'Internal system failure' }, { status: 500 });
  }
}
