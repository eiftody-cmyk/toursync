"use client";

import { useState, useCallback } from "react";
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
  PayPalGuestPaymentButton,
  ApplePayOneTimePaymentButton,
  GooglePayOneTimePaymentButton,
  useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";

interface PayPalPaymentProps {
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
  paypalClientId,
  paypalMode,
  currency,
  amount,
  tourId,
  tourName,
  date,
  startTime,
  guestCount,
  custom,
  customerPhone,
  onSuccess,
  onError,
}: Omit<PayPalPaymentProps, "paypalClientId"> & { paypalClientId: string; paypalMode: string; currency: string; amount: number }) {
  const [processing, setProcessing] = useState(false);
  const { eligiblePaymentMethods, isLoading } = useEligibleMethods({
    payload: { currencyCode: currency },
  });

  const createOrder = useCallback(async () => {
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
  }, [custom, tourId, date, startTime, guestCount, customerPhone, onError]);

  const handleCapture = useCallback(async (orderId: string) => {
    setProcessing(true);
    try {
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
        return;
      }

      onSuccess?.();
    } catch {
      onError?.("Something went wrong after payment. Please contact us.");
    } finally {
      setProcessing(false);
    }
  }, [tourId, date, startTime, guestCount, custom, customerPhone, onError, onSuccess]);

  const handleError = useCallback(() => {
    onError?.("Payment failed. Please try again.");
  }, [onError]);

  if (isLoading) {
    return <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--parchment-dim)" }}>Loading payment options...</p>;
  }

  const isPaypalEligible = eligiblePaymentMethods?.isEligible("paypal");
  const isCardEligible = eligiblePaymentMethods?.isEligible("card");
  const isApplePayEligible = eligiblePaymentMethods?.isEligible("applepay");
  const isGooglePayEligible = eligiblePaymentMethods?.isEligible("googlepay");

  const applePayConfig = isApplePayEligible ? eligiblePaymentMethods?.getDetails("applepay")?.config : undefined;
  const googlePayConfig = isGooglePayEligible ? eligiblePaymentMethods?.getDetails("googlepay")?.config : undefined;

  return (
    <div style={{ opacity: processing ? 0.6 : 1, pointerEvents: processing ? "none" : "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {isPaypalEligible && (
          <PayPalOneTimePaymentButton
            createOrder={createOrder}
            onApprove={(data) => handleCapture(data.orderId)}
            onError={handleError}
            presentationMode="auto"
          />
        )}
        {isCardEligible && (
          <PayPalGuestPaymentButton
            createOrder={createOrder}
            onApprove={(data) => handleCapture(data.orderId)}
            onError={handleError}
          />
        )}
        {isApplePayEligible && applePayConfig && (
          <ApplePayOneTimePaymentButton
            createOrder={createOrder}
            onApprove={(data) => handleCapture(data.approveApplePayPayment.id)}
            onError={handleError}
            applePayConfig={applePayConfig}
            paymentRequest={{
              countryCode: "JP",
              currencyCode: currency,
              total: { label: tourName, amount: String(amount), type: "final" },
            }}
            applePaySessionVersion={4}
            buttonstyle="black"
            type="buy"
          />
        )}
        {isGooglePayEligible && googlePayConfig && (
          <GooglePayOneTimePaymentButton
            createOrder={createOrder}
            onApprove={(data) => {
              const orderId = (data as Record<string, unknown>).orderId || (data as Record<string, unknown>).paymentMethodData;
              handleCapture(typeof orderId === "string" ? orderId : "");
            }}
            onError={handleError}
            googlePayConfig={googlePayConfig}
            transactionInfo={{
              countryCode: "JP",
              currencyCode: currency,
              totalPriceStatus: "FINAL",
              totalPrice: String(amount),
            }}
            environment="PRODUCTION"
          />
        )}
      </div>
      {processing && (
        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--parchment-dim)", marginTop: "0.5rem" }}>
          Processing your booking...
        </p>
      )}
    </div>
  );
}

export function PayPalPayment({
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
}: PayPalPaymentProps) {
  return (
    <PayPalProvider
      clientId={paypalClientId}
      environment={paypalMode === "live" ? "production" : "sandbox"}
      components={["paypal-payments", "venmo-payments", "paypal-guest-payments", "applepay-payments", "googlepay-payments"]}
      pageType="checkout"
    >
      <PaymentButtons
        paypalClientId={paypalClientId}
        paypalMode={paypalMode}
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
