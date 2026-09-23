"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  otherTourSpots: Record<string, number>;
}

interface AltTour {
  tour_id: string;
  name: string;
  price: number | null;
  currency: string;
  capacity: number;
  slots: Array<{
    start_time: string;
    duration_minutes: number;
    remaining: number;
  }>;
}

interface BookingPageClientProps {
  tour: Tour;
  companyName: string | null;
  paypalClientId: string;
  initialDate?: string | null;
  initialTime?: string | null;
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

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + (minutes || 0);
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
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

export function BookingPageClient({
  tour,
  companyName,
  paypalClientId,
  initialDate = null,
  initialTime = null,
}: BookingPageClientProps) {
  const [dateData, setDateData] = useState<DateData>({
    available: [],
    blocked: [],
    full: [],
    otherTourSpots: {},
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableDate | null>(null);
  const [guestCount, setGuestCount] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [altTours, setAltTours] = useState<AltTour[]>([]);
  const [loadingAlts, setLoadingAlts] = useState(false);

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const load = useCallback(async (tourId: string) => {
    try {
      const r = await fetch(`/api/book/available-dates?tour_id=${tourId}&t=${Date.now()}`);
      const d = await r.json();
      setDateData({
        available: d.available ?? [],
        blocked: d.blocked ?? [],
        full: d.full ?? [],
        otherTourSpots: d.otherTourSpots ?? {},
      });
    } catch {
      setDateData({ available: [], blocked: [], full: [], otherTourSpots: {} });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tour.id);
  }, [tour.id, load]);

  // Refetch whenever the tab regains focus/visibility so bookings made in
  // the dashboard show up on the calendar without a manual refresh.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") load(tour.id);
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [tour.id, load]);

  // Availability lookup: date -> max remaining across all slots (+ total booked)
  const dateAvailability = useMemo(() => {
    const map = new Map<string, { totalRemaining: number; booked: number; slots: AvailableDate[] }>();
    for (const d of dateData.available) {
      const existing = map.get(d.date);
      const slotBooked = Math.max(0, tour.capacity - (d.remaining ?? 0));
      if (existing) {
        existing.totalRemaining += d.remaining;
        existing.booked += slotBooked;
        existing.slots.push(d);
      } else {
        map.set(d.date, { totalRemaining: d.remaining, booked: slotBooked, slots: [d] });
      }
    }
    return map;
  }, [dateData, tour.capacity]);

  const blockedSet = useMemo(() => new Set(dateData.blocked), [dateData]);
  const fullSet = useMemo(() => new Set(dateData.full), [dateData]);
  const otherSpots = dateData.otherTourSpots;
  const todayStr = toDateStr(now);

  // Preselect date (+ slot) when landing with ?date=&time= from the date-first picker.
  const preselectKey = `${initialDate}|${initialTime}|${dateData.available.length}`;
  const [preselectDone, setPreselectDone] = useState(false);
  useEffect(() => {
    if (preselectDone || !initialDate) return;
    const pd = parseDateStr(initialDate);
    const jump = () => {
      setViewMonth(pd.getMonth());
      setViewYear(pd.getFullYear());
      setSelectedDate(initialDate);
      setPreselectDone(true);
    };

    const match = dateData.available.filter((d) => d.date === initialDate);
    if (match.length === 0) {
      // Date has no slots for this tour — still select it so the
      // alternate-tour panel can load below the calendar.
      if (initialDate >= todayStr) jump();
      return;
    }
    if (initialTime) {
      const slot = match.find((d) => d.start_time === initialTime);
      if (slot) {
        jump();
        setSelectedSlot(slot);
        return;
      }
    }
    jump();
  }, [preselectDone, initialDate, initialTime, dateData.available, preselectKey, todayStr]);

  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return dateData.available.filter((d) => d.date === selectedDate);
  }, [dateData, selectedDate]);

  const loadAlts = useCallback(async (dateStr: string) => {
    setLoadingAlts(true);
    setAltTours([]);
    try {
      const r = await fetch(`/api/book/availability-by-date?date=${dateStr}&t=${Date.now()}`);
      if (!r.ok) throw new Error("failed");
      const d: { tours?: AltTour[] } = await r.json();
      const others = (d.tours ?? []).filter((t) => t.tour_id !== tour.id);
      setAltTours(others);
    } catch {
      setAltTours([]);
    } finally {
      setLoadingAlts(false);
    }
  }, [tour.id]);

  function handleDayClick(date: Date) {
    const dateStr = toDateStr(date);
    if (dateStr < todayStr) return;
    const hasOwn = dateAvailability.has(dateStr);
    const hasOther = otherSpots[dateStr] != null;
    if (!hasOwn && !hasOther) return;

    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setGuestCount("2");
    setError(null);
    setAltTours([]);
    if (!hasOwn) {
      loadAlts(dateStr);
    }
  }

  // Load alternates when preselect lands on a date without this tour's slots.
  useEffect(() => {
    if (!selectedDate || slotsForDate.length > 0 || altTours.length > 0 || loadingAlts) return;
    if (!dateAvailability.has(selectedDate)) {
      loadAlts(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, slotsForDate.length, dateAvailability]);

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
            <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>
              Didn&apos;t see it? Check your <strong>spam or junk folder</strong>.
            </p>
            <Link href="https://osakacastletours.com/" className="cta-btn" style={{ display: "inline-block", marginTop: "1.5rem" }}>
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
        <div className="logo-link">
          <Image src="/logo.webp" alt="Osaka Castle Walks with Edward" width={240} height={240} />
        </div>
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
        ) : dateData.available.length === 0 && dateData.blocked.length === 0 && dateData.full.length === 0 && Object.keys(otherSpots).length === 0 ? (
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
                  const availability = dateAvailability.get(dateStr);
                  const otherCount = otherSpots[dateStr];
                  const isFull = fullSet.has(dateStr) || blockedSet.has(dateStr);
                  const hasOwn = !!availability;
                  const hasOther = otherCount != null;
                  // Full only when no tour has room that day.
                  const isUnavailable = isFull && !hasOwn && !hasOther;
                  const isAvailable = hasOwn || hasOther;
                  const isSelected = selectedDate === dateStr;
                  const spotCount = hasOwn ? availability!.totalRemaining : otherCount;

                  let className = "calendar-day";
                  if (isPast) className += " past";
                  else if (isSelected) className += " selected";
                  else if (isUnavailable) className += " full";
                  else if (isAvailable) className += " available";

                  return (
                    <div
                      key={dateStr}
                      className={className}
                      onClick={() => !isPast && handleDayClick(date)}
                    >
                      <span className="day-number">{date.getDate()}</span>
                      {isAvailable && spotCount != null && (
                        <>
                          <span className="day-spots">{spotCount} spots</span>
                          {hasOwn && availability && availability.booked > 0 && (
                            <span className="day-booked">{availability.booked} booked</span>
                          )}
                        </>
                      )}
                      {isUnavailable && <span className="day-spots">full</span>}
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
                          {tour.capacity - slot.remaining > 0 && (
                            <span className="slot-booked"> · {tour.capacity - slot.remaining} booked</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Alternate tours when this tour has no slots */}
              {selectedDate && slotsForDate.length === 0 && (
                <div style={{ marginTop: "1rem" }}>
                  {loadingAlts && (
                    <p style={{ color: "var(--parchment-dim)", fontSize: "0.9rem" }}>
                      Checking availability...
                    </p>
                  )}
                  {!loadingAlts && altTours.length > 0 && (
                    <div className="existing-tours-section">
                      <label>This tour is full on this date — Edward has a tour:</label>
                      {altTours.map((alt) =>
                        alt.slots.map((slot) => {
                          const end = addMinutesToTime(slot.start_time, slot.duration_minutes);
                          return (
                            <div key={`${alt.tour_id}_${slot.start_time}`} className="existing-tour-card">
                              <div className="tour-time">{slot.start_time} — {end}</div>
                              <div className="tour-name">{alt.name}</div>
                              <div className="spots-left">
                                {slot.remaining} spot{slot.remaining === 1 ? "" : "s"} left
                              </div>
                              <Link
                                href={`/book?tour=${alt.tour_id}&date=${selectedDate}&time=${slot.start_time}`}
                                className="join-tour-link"
                              >
                                Join this tour →
                              </Link>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                  {!loadingAlts && altTours.length === 0 && (
                    <p style={{ color: "var(--parchment-dim)", fontSize: "0.9rem" }}>
                      No times available for this date. Try another date.
                    </p>
                  )}
                </div>
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
