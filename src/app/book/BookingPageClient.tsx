"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PayPalPayment } from "@/components/PayPalPayment";
import type { Tour } from "@/types";
import "./styles.css";

interface AvailableDate {
  date: string;
  start_time: string;
  duration_minutes: number;
  remaining: number;
}

interface DateData {
  available: AvailableDate[];
  blocked: string[];
  full: string[];
}

interface BookingPageClientProps {
  tour: Tour;
  companyName: string | null;
  paypalClientId: string;
  paypalMode: string;
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateStr(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Pad start with empty slots
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(new Date(0)); // sentinel empty
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export function BookingPageClient({ tour, companyName, paypalClientId, paypalMode }: BookingPageClientProps) {
  const [dateData, setDateData] = useState<DateData>({ available: [], blocked: [], full: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableDate | null>(null);
  const [guestCount, setGuestCount] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  useEffect(() => {
    fetch(`/api/book/available-dates?tour_id=${tour.id}`)
      .then((r) => r.json())
      .then((d) => setDateData({ available: d.available ?? [], blocked: d.blocked ?? [], full: d.full ?? [] }))
      .catch(() => setDateData({ available: [], blocked: [], full: [] }))
      .finally(() => setLoading(false));
  }, [tour.id]);

  // Availability lookup: date -> max remaining across all slots
  const dateAvailability = useMemo(() => {
    const map = new Map<string, { totalRemaining: number; slots: AvailableDate[] }>();
    for (const d of dateData.available) {
      const existing = map.get(d.date);
      if (existing) {
        existing.totalRemaining += d.remaining;
        existing.slots.push(d);
      } else {
        map.set(d.date, { totalRemaining: d.remaining, slots: [d] });
      }
    }
    return map;
  }, [dateData]);

  const blockedSet = useMemo(() => new Set(dateData.blocked), [dateData]);
  const fullSet = useMemo(() => new Set(dateData.full), [dateData]);
  const todayStr = toDateStr(now);

  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return dateData.available.filter((d) => d.date === selectedDate);
  }, [dateData, selectedDate]);

  function handleDayClick(date: Date) {
    const dateStr = toDateStr(date);
    if (!dateAvailability.has(dateStr)) return;
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setGuestCount("2");
    setError(null);
  }

  function handleSlotClick(slot: AvailableDate) {
    setSelectedSlot(slot);
    setGuestCount("2");
    setError(null);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const currencySymbol = tour.currency === "JPY" ? "¥" : tour.currency + " ";
  const pricePerGuest = tour.price ?? 0;
  const guests = parseInt(guestCount || "2", 10);
  const totalAmount = pricePerGuest * guests;

  const monthDays = getMonthDays(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  if (paymentSuccess) {
    return (
      <div className="booking-page">
        <header className="booking-header">
          <span className="logo-text">Osaka Castle Walks with Edward</span>
          <div className="logo-link">
            <Image src="/logo.webp" alt="Osaka Castle Walks with Edward" width={240} height={240} />
          </div>
          <span className="tagline">History Beyond the Postcard</span>
        </header>
        <main className="booking-container">
          <div className="booking-success">
            <h2>Booking Confirmed</h2>
            <p>Your tour has been booked. Check your email for confirmation details.</p>
            <Link href="/" className="cta-btn" style={{ display: "inline-block", marginTop: "1.5rem" }}>
              Back to Tours
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <header className="booking-header">
        <span className="logo-text">Osaka Castle Walks with Edward</span>
        <Link href="/" className="logo-link">
          <Image src="/logo.webp" alt="Osaka Castle Walks with Edward" width={240} height={240} />
        </Link>
        <span className="tagline">History Beyond the Postcard</span>
      </header>

      <main className="booking-container">
        <h1>{tour.name}</h1>
        {tour.description && <p className="booking-description">{tour.description}</p>}
        <div className="booking-price">
          {pricePerGuest > 0 && <span>{currencySymbol}{pricePerGuest.toLocaleString()} / person</span>}
          <span style={{ marginLeft: "1rem", opacity: 0.6 }}>{tour.capacity} max guests</span>
        </div>

        {loading ? (
          <p style={{ color: "var(--parchment-dim)" }}>Loading available dates...</p>
        ) : dateData.available.length === 0 && dateData.blocked.length === 0 && dateData.full.length === 0 ? (
          <p style={{ color: "var(--parchment-dim)" }}>
            No available dates at this time. Check back later or contact us.
          </p>
        ) : (
          <div className="booking-calendar-layout">
            {/* Calendar grid */}
            <div className="booking-calendar-section">
              <div className="calendar-header">
                <div className="calendar-nav">
                  <button onClick={prevMonth}>&#8249;</button>
                </div>
                <h3>{monthLabel}</h3>
                <div className="calendar-nav">
                  <button onClick={nextMonth}>&#8250;</button>
                </div>
              </div>

              {/* Weekday headers */}
              <div className="calendar-grid">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="calendar-weekday">{day}</div>
                ))}

                {/* Day cells */}
                {monthDays.map((date, i) => {
                  if (date.getTime() === 0) {
                    return <div key={`empty-${i}`} className="calendar-day empty" />;
                  }

                  const dateStr = toDateStr(date);
                  const isPast = dateStr < todayStr;
                  const isBlocked = blockedSet.has(dateStr);
                  const isFull = fullSet.has(dateStr);
                  const availability = dateAvailability.get(dateStr);
                  const isAvailable = !!availability;
                  const isSelected = selectedDate === dateStr;

                  let className = "calendar-day";
                  if (isPast) className += " past";
                  else if (isSelected) className += " selected";
                  else if (isAvailable) className += " available";
                  else if (isBlocked) className += " blocked";
                  else if (isFull) className += " full";

                  return (
                    <div
                      key={dateStr}
                      className={className}
                      onClick={() => !isPast && handleDayClick(date)}
                    >
                      <span className="day-number">{date.getDate()}</span>
                      {isAvailable && availability && (
                        <span className="day-spots">{availability.totalRemaining} spots</span>
                      )}
                      {isBlocked && <span className="day-spots">blocked</span>}
                      {isFull && <span className="day-spots">full</span>}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="calendar-legend">
                <span className="legend-item">
                  <span className="legend-dot available" /> Available
                </span>
                <span className="legend-item">
                  <span className="legend-dot blocked" /> Blocked
                </span>
                <span className="legend-item">
                  <span className="legend-dot full" /> Full
                </span>
              </div>

              {/* Time slots for selected date */}
              {selectedDate && slotsForDate.length > 0 && (
                <div className="available-dates-list" style={{ marginTop: "1rem" }}>
                  {slotsForDate.map((slot) => {
                    const isSelected = selectedSlot?.date === slot.date && selectedSlot?.start_time === slot.start_time;
                    return (
                      <button
                        key={`${slot.date}_${slot.start_time}`}
                        onClick={() => handleSlotClick(slot)}
                        className={`date-slot-btn ${isSelected ? "selected" : ""}`}
                      >
                        <span className="slot-time">{slot.start_time}</span>
                        <span className={`slot-spots ${slot.remaining <= 2 ? "low" : ""}`}>
                          {slot.remaining} spot{slot.remaining === 1 ? "" : "s"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedDate && slotsForDate.length === 0 && (
                <p style={{ color: "var(--parchment-dim)", fontSize: "0.9rem", marginTop: "0.75rem" }}>
                  No times available for this date.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Book Now */}
        {selectedSlot && (
          <div className="booking-section">
            <h3>Book Now</h3>
            <div className="booking-summary">
              <p><strong>{tour.name}</strong></p>
              <p style={{ color: "var(--parchment-dim)" }}>
                {parseDateStr(selectedSlot.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {selectedSlot.start_time && ` at ${selectedSlot.start_time}`}
              </p>
            </div>

            <div className="form-group">
              <label>Number of Guests</label>
              <input
                type="number"
                min={1}
                max={selectedSlot.remaining}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
              />
            </div>

            {pricePerGuest > 0 && (
              <div className="price-summary">
                Total: {currencySymbol}{totalAmount.toLocaleString()}
              </div>
            )}

            {error && <div className="booking-error">{error}</div>}

            <PayPalPayment
              paypalClientId={paypalClientId}
              paypalMode={paypalMode}
              tourId={tour.id}
              tourName={tour.name}
              date={selectedSlot.date}
              startTime={selectedSlot.start_time}
              guestCount={guests}
              amount={totalAmount}
              currency={tour.currency || "JPY"}
              onSuccess={() => setPaymentSuccess(true)}
              onError={setError}
            />
          </div>
        )}
      </main>

      <footer className="booking-footer">
        <strong>Osaka Castle Walks with Edward</strong><br />
        2-3-6 Tanimachi, Chuo-ku, Osaka<br />
        <a href="mailto:edward@osakacastletours.com">edward@osakacastletours.com</a>
      </footer>
    </div>
  );
}
