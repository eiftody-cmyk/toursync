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
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const createOrder: PayPalButtonsComponentProps["createOrder"] = async () => {
    setStatusMsg(null);
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
      const msg = data.error || "Failed to create order";
      setStatusMsg(`Error: ${msg}`);
      onError?.(msg);
      throw new Error(msg);
    }

    return data.orderId;
  };

  const onApprove: PayPalButtonsComponentProps["onApprove"] = async (data, actions) => {
    setProcessing(true);
    setStatusMsg("Confirming payment with PayPal...");
    try {
      // Get full order details from PayPal (name + email come from here)
      const orderDetails = actions?.order ? await actions.order.get() : null;
      const payer = orderDetails?.payer;

      setStatusMsg("Creating your booking...");
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
        const msg = result.error || "Payment processing failed";
        setStatusMsg(`Error: ${msg}`);
        onError?.(msg);
        return;
      }

      setStatusMsg("Booking confirmed!");
      onSuccess?.();
    } catch {
      const msg = "Something went wrong after payment. Please contact us.";
      setStatusMsg(`Error: ${msg}`);
      onError?.(msg);
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
            color: "blue",
            shape: "rect",
            label: "pay",
            height: 50,
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={() => {
            const msg = "Payment failed. Please try again.";
            setStatusMsg(`Error: ${msg}`);
            onError?.(msg);
          }}
        />
        {statusMsg && (
          <p style={{
            textAlign: "center",
            fontSize: "0.85rem",
            marginTop: "0.75rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            color: statusMsg.startsWith("Error:") ? "#dc3545" : "var(--parchment-dim)",
            backgroundColor: statusMsg.startsWith("Error:") ? "#f8d7da" : "transparent",
          }}>
            {statusMsg}
          </p>
        )}
      </div>
    </PayPalScriptProvider>
  );
}
