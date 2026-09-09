"use client";

import { useState } from "react";
import { PayPalProvider, PayPalOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

interface PayPalPaymentV6Props {
  paypalClientId: string;
  paypalMode: string;
  tourId: string;
  tourName: string;
  date: string;
  startTime: string;
  guestCount: number;
  amount: number;
  currency: string;
  custom?: boolean;
  customerPhone?: string;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export function PayPalPaymentV6({
  paypalClientId,
  paypalMode,
  tourId,
  tourName,
  date,
  startTime,
  guestCount,
  amount,
  currency,
  custom,
  customerPhone,
  onSuccess,
  onError,
}: PayPalPaymentV6Props) {
  const [processing, setProcessing] = useState(false);

  const environment = paypalMode === "live" ? "production" : "sandbox";

  const createOrder = async (): Promise<{ orderId: string }> => {
    const endpoint = custom ? "/api/paypal/create-custom-order" : "/api/paypal/create-order";
    const body: Record<string, unknown> = {
      tour_id: tourId,
      date,
      start_time: startTime,
      guest_count: guestCount,
    };
    if (custom) {
      body.customer_phone = customerPhone || null;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      onError?.(data.error || "Failed to create order");
      throw new Error(data.error);
    }

    // v6 requires returning { orderId } object, not just the string
    return { orderId: data.orderId };
  };

  const onApprove = async (data: { orderId: string }) => {
    setProcessing(true);
    try {
      // Server-side capture is authoritative for payer data
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.orderId,
          tour_id: tourId,
          date,
          start_time: startTime,
          guest_count: guestCount,
          custom: custom ? "true" : undefined,
          customer_phone: customerPhone,
          // Client-side payer info as fallback (server-side is authoritative)
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        onError?.(result.error || "Payment processing failed");
        return;
      }

      onSuccess?.();
    } catch {
      onError?.("Something went wrong after payment. Please contact us.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PayPalProvider
      clientId={paypalClientId}
      environment={environment}
      components={["paypal-payments"]}
      pageType="checkout"
    >
      <div style={{ opacity: processing ? 0.6 : 1, pointerEvents: processing ? "none" : "auto" }}>
        <PayPalOneTimePaymentButton
          createOrder={createOrder}
          onApprove={onApprove}
          onError={() => onError?.("Payment failed. Please try again.")}
          presentationMode="auto"
        />
        {processing && (
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--parchment-dim)", marginTop: "0.5rem" }}>
            Processing your booking...
          </p>
        )}
      </div>
    </PayPalProvider>
  );
}
