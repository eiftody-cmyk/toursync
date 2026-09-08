import { NextRequest } from 'next/server';
import { expireReservations } from '@/lib/core/reservations';

/**
 * Cron job to expire old reservations.
 * Run every minute via Cloudflare Cron Triggers or external cron.
 *
 * Example cron trigger in wrangler.toml:
 * [triggers]
 * crons = ["* * * * *"]
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const expiredCount = await expireReservations();
    return new Response(
      JSON.stringify({ success: true, expired: expiredCount }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Cron] Failed to expire reservations:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
