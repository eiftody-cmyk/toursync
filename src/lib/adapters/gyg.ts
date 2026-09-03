export interface GygNotifyParams {
  tour_id: string;
  date: string;
  start_time?: string;
  remaining_capacity: number;
  external_product_code: string;
}

export interface PushResult {
  ok: boolean;
  error?: string;
  status?: number;
}

export async function notifyGygAvailabilityChange(
  params: GygNotifyParams
): Promise<PushResult> {
  const apiKey = process.env.GYG_API_KEY;
  const notifyUrl = process.env.GYG_NOTIFY_URL;

  if (!apiKey || !notifyUrl) {
    return { ok: false, error: "GYG_API_KEY or GYG_NOTIFY_URL not set" };
  }

  const body = {
    productId: params.external_product_code,
    dateFrom: params.date,
    dateTo: params.date,
  };

  try {
    const res = await fetch(notifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) return { ok: true };
    return { ok: false, error: `HTTP ${res.status}`, status: res.status };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
