"use client";

import { useState } from "react";
import { PayPalProvider, PayPalOneTimePaymentButton, GooglePayOneTimePaymentButton, ApplePayOneTimePaymentButton, useEligibleMethods } from "@paypal/react-paypal-js/sdk-v6";

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

function PaymentButtons({
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
}: Omit<PayPalPaymentV6Props, "paypalClientId" | "paypalMode">) {
  const [processing, setProcessing] = useState(false);
  const { eligiblePaymentMethods, isLoading, error: eligibleError } = useEligibleMethods({
    payload: {
      currencyCode: currency,
      amount: String(amount),
    },
  });

  const googlePayDetails = eligiblePaymentMethods?.getDetails?.("googlepay");
  const isGooglePayEligible = eligiblePaymentMethods?.isEligible?.("googlepay") ?? false;

  const applePayDetails = eligiblePaymentMethods?.getDetails?.("applepay");
  const isApplePayEligible = eligiblePaymentMethods?.isEligible?.("applepay") ?? false;

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

    return { orderId: data.orderId };
  };

  const captureOrder = async (orderId: string) => {
    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        tour_id: tourId,
        date,
        start_time: startTime,
        guest_count: guestCount,
        custom: custom ? "true" : undefined,
        customer_phone: customerPhone,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      onError?.(result.error || "Payment processing failed");
      return false;
    }

    onSuccess?.();
    return true;
  };

  const onPayPalApprove = async (data: { orderId: string }) => {
    setProcessing(true);
    try {
      await captureOrder(data.orderId);
    } catch {
      onError?.("Something went wrong after payment. Please contact us.");
    } finally {
      setProcessing(false);
    }
  };

  const onGooglePayApprove = async (data: { id: string }) => {
    setProcessing(true);
    try {
      await captureOrder(data.id);
    } catch {
      onError?.("Something went wrong after payment. Please contact us.");
    } finally {
      setProcessing(false);
    }
  };

  const onApplePayApprove = async (data: { approveApplePayPayment: { id: string } }) => {
    setProcessing(true);
    try {
      await captureOrder(data.approveApplePayPayment.id);
    } catch {
      onError?.("Something went wrong after payment. Please contact us.");
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return <p style={{ color: "var(--parchment-dim)" }}>Loading payment options...</p>;
  }

  if (eligibleError) {
    console.warn("Eligibility check error:", eligibleError);
  }

  return (
    <div style={{ opacity: processing ? 0.6 : 1, pointerEvents: processing ? "none" : "auto" }}>
      {/* Apple Pay button - shown if eligible */}
      {isApplePayEligible && applePayDetails?.config && (
        <div style={{ marginBottom: "0.75rem" }}>
          <ApplePayOneTimePaymentButton
            applePayConfig={applePayDetails.config}
            paymentRequest={{
              countryCode: "JP",
              currencyCode: currency,
              total: { label: tourName, amount: String(amount), type: "final" },
            }}
            applePaySessionVersion={4}
            createOrder={createOrder}
            onApprove={onApplePayApprove}
            onError={() => onError?.("Apple Pay payment failed. Please try again.")}
            buttonstyle="black"
            type="buy"
          />
        </div>
      )}

      {/* Google Pay button - shown if eligible */}
      {isGooglePayEligible && googlePayDetails?.config && (
        <div style={{ marginBottom: "0.75rem" }}>
          <GooglePayOneTimePaymentButton
            googlePayConfig={googlePayDetails.config}
            transactionInfo={{
              countryCode: "JP",
              currencyCode: currency,
              totalPriceStatus: "FINAL",
              totalPrice: String(amount),
            }}
            environment="PRODUCTION"
            createOrder={createOrder}
            onApprove={onGooglePayApprove}
            onError={() => onError?.("Google Pay payment failed. Please try again.")}
            buttonColor="black"
            buttonType="pay"
          />
        </div>
      )}

      {/* PayPal button */}
      <PayPalOneTimePaymentButton
        createOrder={createOrder}
        onApprove={onPayPalApprove}
        onError={() => onError?.("Payment failed. Please try again.")}
        presentationMode="auto"
      />

      {processing && (
        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--parchment-dim)", marginTop: "0.5rem" }}>
          Processing your booking...
        </p>
      )}
    </div>
  );
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
  const environment = paypalMode === "live" ? "production" : "sandbox";

  return (
    <PayPalProvider
      clientId={paypalClientId}
      environment={environment}
      components={["paypal-payments", "googlepay-payments", "applepay-payments"]}
      pageType="checkout"
    >
      <PaymentButtons
        tourId={tourId}
        tourName={tourName}
        date={date}
        startTime={startTime}
        guestCount={guestCount}
        amount={amount}
        currency={currency}
        custom={custom}
        customerPhone={customerPhone}
        onSuccess={onSuccess}
        onError={onError}
      />
    </PayPalProvider>
  );
}
