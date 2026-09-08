"use client";

import { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  type PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js";

interface PayPalPaymentProps {
  paypalClientId: string;
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

export function PayPalPayment({
  paypalClientId,
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
}: PayPalPaymentProps) {
  const [processing, setProcessing] = useState(false);

  const createOrder: PayPalButtonsComponentProps["createOrder"] = async () => {
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

    return data.orderId;
  };

  const onApprove: PayPalButtonsComponentProps["onApprove"] = async (data, actions) => {
    setProcessing(true);
    try {
      // Get full order details from PayPal (name + email come from here)
      const orderDetails = actions?.order ? await actions.order.get() : null;
      const payer = orderDetails?.payer;

      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.orderID,
          tour_id: tourId,
          date,
          start_time: startTime,
          guest_count: guestCount,
          custom: custom ? "true" : undefined,
          customer_phone: customerPhone,
          payerEmail: payer?.email_address,
          payerName: payer?.name
            ? `${payer.name.given_name} ${payer.name.surname}`.trim()
            : undefined,
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
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency,
        intent: "capture",
        "enable-funding": "venmo,paylater",
      }}
    >
      <div style={{ opacity: processing ? 0.6 : 1, pointerEvents: processing ? "none" : "auto" }}>
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "pay",
            height: 50,
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={() => onError?.("Payment failed. Please try again.")}
        />
        {processing && (
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--parchment-dim)", marginTop: "0.5rem" }}>
            Processing your booking...
          </p>
        )}
      </div>
    </PayPalScriptProvider>
  );
}
