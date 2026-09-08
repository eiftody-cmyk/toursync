import { createServiceClient } from '@/lib/supabase/service';

const VIATOR_API_BASE = 'https://api.viator.com';

interface NotifyEventsParams {
  productOptionId: string;
  startDate: string;
  endDate: string;
  updateType?: string[];
}

/**
 * Notify Viator of availability/pricing/capacity changes.
 */
export async function notifyViatorEvents(
  params: NotifyEventsParams
): Promise<{ ok: boolean; error?: string; status?: number }> {
  const apiKey = process.env.VIATOR_API_KEY;
  const supplierId = process.env.VIATOR_SUPPLIER_ID;

  if (!apiKey || !supplierId) {
    return { ok: false, error: 'VIATOR_API_KEY or VIATOR_SUPPLIER_ID not set' };
  }

  const body = {
    supplierId: Number(supplierId),
    updateType: params.updateType ?? ['AVAILABILITY'],
    productOptionIds: [params.productOptionId],
    startDate: params.startDate,
    endDate: params.endDate,
  };

  try {
    const res = await fetch(`${VIATOR_API_BASE}/v2/notification/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 204) return { ok: true };

    if (res.status === 207) {
      const data = await res.json();
      const errors = data.results?.filter((r: { status?: number }) => r.status !== 200);
      if (errors?.length) {
        return { ok: false, error: JSON.stringify(errors), status: 207 };
      }
      return { ok: true };
    }

    return { ok: false, error: `HTTP ${res.status}`, status: res.status };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/**
 * Push availability change for a tour to Viator.
 */
export async function pushViatorAvailabilityChange(
  tourId: string,
  date: string,
  startTime?: string
): Promise<void> {
  const supabase = createServiceClient();

  const { data: listing } = await supabase
    .from('tour_channel_listings')
    .select('external_product_code')
    .eq('tour_id', tourId)
    .eq('channel', 'viator')
    .eq('is_active', true)
    .maybeSingle();

  if (!listing) return;

  await notifyViatorEvents({
    productOptionId: listing.external_product_code,
    startDate: date,
    endDate: date,
  });
}
