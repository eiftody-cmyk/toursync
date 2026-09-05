"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import type { Tour } from "@/types";

interface AvailableDate {
  date: string;
  start_time: string;
  duration_minutes: number;
  remaining: number;
}

export function BookingPageClient({ tour }: { tour: Tour }) {
  const [dates, setDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableDate | null>(null);
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

  // Build a set of available date strings for quick lookup
  const availableDateSet = useMemo(() => new Set(dates.map((d) => d.date)), [dates]);

  // Get time slots for a given date
  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return dates.filter((d) => d.date === selectedDate);
  }, [dates, selectedDate]);

  // When user clicks a date on the calendar
  function handleDateClick(date: Date | undefined) {
    if (!date) return;
    const dateStr = date.toISOString().split("T")[0];
    if (!availableDateSet.has(dateStr)) return;

    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setGuestCount("2");
    setError(null);

    // If only one slot, auto-select it
    const slots = dates.filter((d) => d.date === dateStr);
    if (slots.length === 1) {
      setSelectedSlot(slots[0]);
    }
  }

  // When user clicks a time slot button
  function handleSlotClick(slot: AvailableDate) {
    setSelectedSlot(slot);
    setGuestCount("2");
    setError(null);
  }

  async function handleBook() {
    if (!selectedSlot) return;
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
          date: selectedSlot.date,
          start_time: selectedSlot.start_time,
          guest_count: guests,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create order");
        setBooking(false);
        return;
      }

      if (data.approveUrl) {
        window.location.href = data.approveUrl;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setBooking(false);
    }
  }

  const currencySymbol = tour.currency === "JPY" ? "¥" : tour.currency + " ";
  const pricePerGuest = tour.price ?? 0;

  // Convert available dates to Date objects for the calendar modifier
  const availableDateObjects = useMemo(
    () => dates.map((d) => new Date(d.date + "T00:00:00")),
    [dates]
  );

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

        {/* Calendar */}
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
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate ? new Date(selectedDate + "T00:00:00") : undefined}
                  onSelect={handleDateClick}
                  disabled={(date) => !availableDateSet.has(date.toISOString().split("T")[0])}
                  modifiers={{
                    available: availableDateObjects,
                  }}
                  modifiersClassNames={{
                    available: "bg-primary/10 text-primary font-semibold hover:bg-primary/20",
                  }}
                  showOutsideDays={false}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time slot selection */}
        {selectedDate && slotsForDate.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Select a time:</p>
              <div className="flex flex-wrap gap-2">
                {slotsForDate.map((slot) => {
                  const isSelected =
                    selectedSlot?.date === slot.date && selectedSlot?.start_time === slot.start_time;
                  return (
                    <button
                      key={`${slot.date}_${slot.start_time}`}
                      onClick={() => handleSlotClick(slot)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      {slot.start_time}
                      <span className={`ml-2 text-xs ${slot.remaining <= 2 ? "opacity-80" : "opacity-60"}`}>
                        {slot.remaining} spot{slot.remaining === 1 ? "" : "s"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Book Now */}
        {selectedSlot && (
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
                  {new Date(selectedSlot.date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {selectedSlot.start_time && ` at ${selectedSlot.start_time}`}
                </p>
              </div>

              <div>
                <Label>Number of Guests</Label>
                <Input
                  type="number"
                  min={1}
                  max={selectedSlot.remaining}
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
                disabled={booking || selectedSlot.remaining <= 0}
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
