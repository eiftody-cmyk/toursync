import { NextRequest } from 'next/server';
import { verifyViatorAuth } from '@/lib/viator/auth';
import { viatorJson } from '@/lib/viator/response';
import { pushViatorAvailabilityChange } from '@/lib/viator/notifications';
import type { ViatorAvailabilityNotificationRequest } from '@/lib/viator/types';

/**
 * POST /api/viator/availabilitynotification2
 * Receive availability notifications from Viator.
 * Viator sends this when they want us to push availability updates.
 */
export async function POST(req: NextRequest) {
  const authError = verifyViatorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json() as ViatorAvailabilityNotificationRequest;

    if (!body.productOptionId || !body.dateRange) {
      return viatorJson(
        { error: 'Missing required fields: productOptionId, dateRange' },
        { status: 400 }
      );
    }

    // Push availability change back to Viator
    // This is a bidirectional notification system
    await pushViatorAvailabilityChange(
      body.productOptionId,
      body.dateRange.startDate
    );

    return viatorJson({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[Viator availabilitynotification2] Error:', msg);
    return viatorJson({ error: 'Internal system failure' }, { status: 500 });
  }
}
