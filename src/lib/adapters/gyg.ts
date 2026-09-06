export interface GygAvailability {
  dateTime: string;
  vacancies: number;
  currency?: string;
  pricesByCategory?: {
    retailPrices: {
      category: string;
      price: number;
    }[];
  };
}

export interface GygNotifyParams {
  productId: string;
  availabilities: GygAvailability[];
}

export interface PushResult {
  ok: boolean;
  error?: string;
  status?: number;
}

export async function notifyGygAvailabilityChange(
  params: GygNotifyParams
): Promise<PushResult> {
  const username = process.env.GYG_USERNAME;
  const password = process.env.GYG_PASSWORD;
  const notifyUrl = process.env.GYG_NOTIFY_URL;

  if (!username || !password || !notifyUrl) {
    return { ok: false, error: "GYG_USERNAME, GYG_PASSWORD, or GYG_NOTIFY_URL not set" };
  }

  const body = {
    data: {
      productId: params.productId,
      availabilities: params.availabilities,
    },
  };

  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  try {
    const res = await fetch(notifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let json: Record<string, unknown> | null = null;
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {}

    if (res.ok) return { ok: true };
    const errorMsg =
      json && typeof json === "object" && "errorMessage" in json
        ? String((json as { errorMessage: string }).errorMessage)
        : `HTTP ${res.status}`;
    return { ok: false, error: errorMsg, status: res.status };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
