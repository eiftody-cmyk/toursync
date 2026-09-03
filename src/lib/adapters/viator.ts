export interface ViatorNotifyParams {
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

const VIATOR_API_URL = "https://api.viator.com/v2/notification/events";

export async function notifyViatorAvailabilityChange(
  params: ViatorNotifyParams
): Promise<PushResult> {
  const apiKey = process.env.VIATOR_API_KEY;
  const supplierId = process.env.VIATOR_SUPPLIER_ID;

  if (!apiKey || !supplierId) {
    return { ok: false, error: "VIATOR_API_KEY or VIATOR_SUPPLIER_ID not set" };
  }

  const body = {
    supplierId: Number(supplierId),
    updateType: ["AVAILABILITY"],
    productOptionIds: [params.external_product_code],
    startDate: params.date,
    endDate: params.date,
  };

  try {
    const res = await fetch(VIATOR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Api-Key": apiKey,
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
