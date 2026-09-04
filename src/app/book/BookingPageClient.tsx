"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tour } from "@/types";
import { DAY_NAMES } from "@/types";

interface AvailableDate {
  date: string;
  start_time: string;
  duration_minutes: number;
  remaining: number;
}

export function BookingPageClient({ tour }: { tour: Tour }) {
  const [dates, setDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AvailableDate | null>(null);
  const [guestCount, setGuestCount] = useState("2");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/book/available-dates?tour_id=${tour.id}`)
      .then((r) => r.json())
      .then((d) => setDates(d.dates ?? []))
      .catch(() => setDates([]))
      .finally(() => setLoading(false));
  }, [tour.id]);

  async function handleBook() {
    if (!selected) return;
    const guests = parseInt(guestCount, 10);
    if (!guests || guests < 1) {
      setError("Please enter a valid guest count");
      return;
    }

    setBooking(true);
    setError(null);

    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tour.id,
          date: selected.date,
          start_time: selected.start_time,
          guest_count: guests,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create order");
        setBooking(false);
        return;
      }

      // Redirect to PayPal
      if (data.approveUrl) {
        window.location.href = data.approveUrl;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setBooking(false);
    }
  }

  // Group dates by month
  const datesByMonth: Record<string, AvailableDate[]> = {};
  for (const d of dates) {
    const monthKey = d.date.slice(0, 7); // YYYY-MM
    if (!datesByMonth[monthKey]) datesByMonth[monthKey] = [];
    datesByMonth[monthKey].push(d);
  }

  const currencySymbol = tour.currency === "JPY" ? "¥" : tour.currency + " ";
  const pricePerGuest = tour.price ?? 0;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Minimal header */}
      <header className="border-b bg-card/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">TourSync</Link>
          <Link href="/login" className="text-sm text-muted-foreground underline">Tour Operators</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Tour details */}
        <div>
          <h1 className="text-2xl font-bold">{tour.name}</h1>
          {tour.description && (
            <p className="mt-2 text-muted-foreground">{tour.description}</p>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm">
            {pricePerGuest > 0 && (
              <span className="font-semibold">
                {currencySymbol}{pricePerGuest.toLocaleString()} / person
              </span>
            )}
            <span className="text-muted-foreground">{tour.capacity} max guests</span>
          </div>
        </div>

        {/* Date selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select a Date</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading available dates...</p>
            ) : dates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No available dates at this time. Check back later or contact the tour operator.
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(datesByMonth).map(([monthKey, monthDates]) => {
                  const [year, month] = monthKey.split("-");
                  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "long", year: "numeric" });
                  return (
                    <div key={monthKey}>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        {monthName}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {monthDates.map((d) => {
                          const dateObj = new Date(d.date + "T00:00:00");
                          const dayName = DAY_NAMES[dateObj.getDay()];
                          const isSelected = selected?.date === d.date && selected?.start_time === d.start_time;
                          return (
                            <button
                              key={`${d.date}_${d.start_time}`}
                              onClick={() => setSelected(d)}
                              className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div>
                                <span className="font-medium">
                                  {dayName}, {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                                {d.start_time && (
                                  <span className="ml-2 text-muted-foreground text-sm">
                                    {d.start_time}
                                  </span>
                                )}
                              </div>
                              <span className={`text-sm ${d.remaining <= 2 ? "text-orange-600 font-medium" : "text-muted-foreground"}`}>
                                {d.remaining} spot{d.remaining === 1 ? "" : "s"} left
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest count + book */}
        {selected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Book Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p>
                  <strong>{tour.name}</strong>
                </p>
                <p className="text-muted-foreground">
                  {new Date(selected.date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {selected.start_time && ` at ${selected.start_time}`}
                </p>
              </div>

              <div>
                <Label>Number of Guests</Label>
                <Input
                  type="number"
                  min={1}
                  max={selected.remaining}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                />
              </div>

              {pricePerGuest > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total: {currencySymbol}
                  {(pricePerGuest * parseInt(guestCount || "0", 10)).toLocaleString()}
                </p>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                onClick={handleBook}
                disabled={booking || selected.remaining <= 0}
                className="w-full"
                size="lg"
              >
                {booking ? "Redirecting to PayPal..." : "Pay with PayPal"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
