"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookingDetails {
  tourId: string;
  date: string;
  startTime: string | null;
  guestCount: number;
}

export function ConfirmPageClient({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
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

        if (data.status === "COMPLETED" && data.bookingDetails) {
          setBookingDetails(data.bookingDetails);

          // Fetch tour name
          try {
            const tourRes = await fetch(
              `/api/book/available-dates?tour_id=${data.bookingDetails.tourId}`
            );
            // The tour name isn't in available-dates, so we'll use a simple approach
            // The webhook will handle the actual booking - we just show confirmation
          } catch {
            // Tour name fetch is optional - we have the other details
          }

          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage("Payment status: " + (data.status || "unknown"));
        }
      } catch {
        setStatus("error");
        setErrorMessage("Something went wrong confirming your payment");
      }
    }

    capture();
  }, [orderId]);

  // Parse date for display
  function formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

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

              {bookingDetails && (
                <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
                  {tourName && <p><strong>{tourName}</strong></p>}
                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDate(bookingDetails.date)}
                  </p>
                  {bookingDetails.startTime && (
                    <p>
                      <strong>Time:</strong> {bookingDetails.startTime}
                    </p>
                  )}
                  <p>
                    <strong>Guests:</strong> {bookingDetails.guestCount}
                  </p>
                  <p className="text-xs text-muted-foreground pt-2">
                    Order ID: {orderId}
                  </p>
                </div>
              )}

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
