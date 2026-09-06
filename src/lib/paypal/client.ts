const PAYPAL_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials not configured");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("PayPal token request failed");
  const data = await res.json();
  return data.access_token;
}

export interface CreateOrderParams {
  tourName: string;
  amount: number; // in minor units (e.g. 9500 JPY)
  currency: string;
  customId: string; // encodes tour_id + date + time + guests
}

export interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
}

export async function createPaypalOrder(params: CreateOrderParams): Promise<PayPalOrder> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description: params.tourName,
          custom_id: params.customId,
          amount: {
            currency_code: params.currency,
            value: params.currency === "JPY" ? String(params.amount) : (params.amount / 100).toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "ExperienceRelay",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/confirm`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book`,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`PayPal order failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}

export async function captureOrder(orderId: string): Promise<{ status: string; payer?: unknown }> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`PayPal capture failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}
