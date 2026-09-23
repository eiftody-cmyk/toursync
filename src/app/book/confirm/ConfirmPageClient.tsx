"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ConfirmPageClient({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [tourName, setTourName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    async function capture() {
      try {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setErrorMessage(data.error || "Payment could not be confirmed");
          return;
        }

        if (data.ok === true) {
          setStatus("success");
          setTourName(typeof data.tourName === "string" ? data.tourName : "");
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Payment status: unknown");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Something went wrong confirming your payment");
      }
    }

    capture();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link href="/" className="font-bold text-lg">ExperienceRelay</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {status === "loading" && (
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="animate-pulse text-2xl">...</div>
              <p className="text-sm text-muted-foreground">Confirming your payment...</p>
            </CardContent>
          </Card>
        )}

        {status === "success" && (
          <Card className="border-emerald-300">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Badge className="bg-emerald-500">Confirmed</Badge>
                Payment Successful
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your booking has been confirmed. You&apos;ll receive a confirmation from PayPal.
              </p>

              <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
                {tourName && <p><strong>{tourName}</strong></p>}
                <p className="text-xs text-muted-foreground pt-2">
                  Order ID: {orderId}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button asChild size="sm">
                  <Link href="/book">Book Another Tour</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "error" && (
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="destructive">Issue</Badge>
                Payment Not Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {errorMessage || "We couldn't confirm your payment. Don't worry — if PayPal charged you, your booking is still being processed."}
              </p>
              <p className="text-sm text-muted-foreground">
                If you were charged, your booking will appear shortly. If you need help, contact the tour operator directly.
              </p>
              <div className="flex gap-2 pt-2">
                <Button asChild size="sm">
                  <Link href="/book">Try Again</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
