import { NextRequest } from 'next/server';
import { verifyViatorAuth } from '@/lib/viator/auth';
import { viatorJson } from '@/lib/viator/response';
import { getTourList } from '@/lib/viator/inbound';

/**
 * POST /api/viator/tourlist
 * List products for Viator mapping.
 */
export async function POST(req: NextRequest) {
  const authError = verifyViatorAuth(req);
  if (authError) return authError;

  try {
    const products = await getTourList();
    return viatorJson({ products });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[Viator tourlist] Error:', msg);
    return viatorJson({ error: 'Internal system failure' }, { status: 500 });
  }
}
