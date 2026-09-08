import { createServiceClient } from '@/lib/supabase/service';

const VIATOR_API_BASE = 'https://api.viator.com';

/**
 * Get product mapping catalog from Viator.
 */
export async function getMappingCatalog(): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const apiKey = process.env.VIATOR_API_KEY;
  const supplierId = process.env.VIATOR_SUPPLIER_ID;

  if (!apiKey || !supplierId) {
    return { ok: false, error: 'VIATOR_API_KEY or VIATOR_SUPPLIER_ID not set' };
  }

  try {
    const res = await fetch(`${VIATOR_API_BASE}/v2/mappings/catalog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({ supplierId: Number(supplierId) }),
    });

    const data = await res.json();
    return { ok: res.ok, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/**
 * Connect products (map our products to Viator's).
 */
export async function connectProducts(
  mappings: Array<{ supplierProductCode: string; viatorProductId: string }>
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const apiKey = process.env.VIATOR_API_KEY;
  const supplierId = process.env.VIATOR_SUPPLIER_ID;

  if (!apiKey || !supplierId) {
    return { ok: false, error: 'VIATOR_API_KEY or VIATOR_SUPPLIER_ID not set' };
  }

  try {
    const res = await fetch(`${VIATOR_API_BASE}/v2/mappings/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        supplierId: Number(supplierId),
        mappings,
      }),
    });

    const data = await res.json();
    return { ok: res.ok, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/**
 * Disconnect products (unmap our products from Viator).
 */
export async function disconnectProducts(
  mappings: Array<{ supplierProductCode: string; viatorProductId: string }>
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const apiKey = process.env.VIATOR_API_KEY;
  const supplierId = process.env.VIATOR_SUPPLIER_ID;

  if (!apiKey || !supplierId) {
    return { ok: false, error: 'VIATOR_API_KEY or VIATOR_SUPPLIER_ID not set' };
  }

  try {
    const res = await fetch(`${VIATOR_API_BASE}/v2/mappings/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        supplierId: Number(supplierId),
        mappings,
      }),
    });

    const data = await res.json();
    return { ok: res.ok, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
