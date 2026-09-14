import {
  type PaymentProvider,
  type CreateOrderParams,
  type PaymentOrder,
  type PaymentCapture,
  type PaymentOrderDetails,
  type PaymentRefund,
  type PaymentMethod,
} from "./types";

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials not configured");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("PayPal token request failed");
  const data = await res.json();
  return data.access_token;
}

export class PayPalProvider implements PaymentProvider {
  name = "paypal";

  async createOrder(params: CreateOrderParams): Promise<PaymentOrder> {
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
              value:
                params.currency === "JPY"
                  ? String(params.amount)
                  : (params.amount / 100).toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "Osaka Castle Walks with Edward",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/confirm`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book`,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`PayPal order failed: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    const approveUrl = data.links?.find(
      (l: { rel: string }) => l.rel === "approve",
    )?.href;

    return { id: data.id, status: data.status, approveUrl };
  }

  async captureOrder(orderId: string): Promise<PaymentCapture> {
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

    const data = await res.json();
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

    return {
      status: data.status,
      payer: data.payer,
      captureId: capture?.id,
      amount: capture?.amount,
    };
  }

  async getOrder(orderId: string): Promise<PaymentOrderDetails> {
    const token = await getAccessToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`PayPal order fetch failed: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      status: data.status,
      custom_id: data?.purchase_units?.[0]?.custom_id,
      amount: data?.purchase_units?.[0]?.amount,
    };
  }

  async refundPayment(captureId: string, reason: string): Promise<PaymentRefund> {
    const token = await getAccessToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/payments/captures/${captureId}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ note_to_payer: reason }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`PayPal refund failed: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    return { id: data.id, status: data.status };
  }

  getMethods(): PaymentMethod[] {
    return [
      { id: "paypal", name: "PayPal", status: "active", currencies: ["JPY", "USD", "EUR", "GBP"] },
    ];
  }
}
