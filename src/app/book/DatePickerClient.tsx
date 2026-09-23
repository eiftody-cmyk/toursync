"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import "./styles.css";

interface DayTourSlot {
  start_time: string;
  duration_minutes: number;
  remaining: number;
}

interface DayTour {
  tour_id: string;
  name: string;
  price: number | null;
  currency: string;
  capacity: number;
  slots: DayTourSlot[];
}

interface DateData {
  date: string;
  tours: DayTour[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(new Date(0));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export function DatePickerClient() {
  const now = new Date();
  const todayStr = toDateStr(now);
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayData, setDayData] = useState<DateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDay = useCallback(async (dateStr: string) => {
    setLoading(true);
    setError(null);
    setDayData(null);
    try {
      const r = await fetch(`/api/book/availability-by-date?date=${dateStr}&t=${Date.now()}`);
      if (!r.ok) throw new Error("failed");
      const d: DateData = await r.json();
      setDayData(d);
    } catch {
      setError("Could not load availability. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleDayClick(date: Date) {
    const dateStr = toDateStr(date);
    if (dateStr < todayStr) return;
    setSelectedDate(dateStr);
    loadDay(dateStr);
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

  const monthDays = getMonthDays(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

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
        <h1>Book a Tour</h1>
        <p className="booking-description">
          Pick a date to see which tours are running that day.
        </p>

        <div className="booking-calendar-layout">
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

            <div className="calendar-grid">
              {WEEKDAYS.map((day) => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}

              {monthDays.map((date, i) => {
                if (date.getTime() === 0) {
                  return <div key={`empty-${i}`} className="calendar-day empty" />;
                }

                const dateStr = toDateStr(date);
                const isPast = dateStr < todayStr;
                const isSelected = selectedDate === dateStr;

                let className = "calendar-day";
                if (isPast) className += " past";
                else if (isSelected) className += " selected";
                else className += " available";

                return (
                  <div
                    key={dateStr}
                    className={className}
                    onClick={() => !isPast && handleDayClick(date)}
                  >
                    <span className="day-number">{date.getDate()}</span>
                  </div>
                );
              })}
            </div>

            <div className="calendar-legend">
              <span className="legend-item">
                <span className="legend-dot available" /> Select a date
              </span>
            </div>
          </div>

          <div className="booking-slots-section">
            {!selectedDate && (
              <p style={{ color: "var(--parchment-dim)" }}>
                Choose a date to see available tours.
              </p>
            )}
            {selectedDate && loading && (
              <p style={{ color: "var(--parchment-dim)" }}>Loading tours…</p>
            )}
            {selectedDate && error && (
              <div className="booking-error">{error}</div>
            )}
            {selectedDate && !loading && !error && dayData && (
              <div>
                <h3 style={{ marginBottom: "0.75rem" }}>{selectedLabel}</h3>
                {dayData.tours.length === 0 ? (
                  <p style={{ color: "var(--parchment-dim)", fontSize: "0.95rem" }}>
                    No tours available this day — try another date.
                  </p>
                ) : (
                  <div className="available-dates-list">
                    {dayData.tours.flatMap((tour) =>
                      tour.slots.map((slot) => (
                        <Link
                          key={`${tour.tour_id}_${slot.start_time}`}
                          href={`/book?tour=${tour.tour_id}&date=${dayData.date}&time=${slot.start_time}`}
                          className="date-slot-btn"
                        >
                          <span className="slot-time">{slot.start_time}</span>
                          <span
                            style={{
                              textAlign: "center",
                              fontSize: "0.9rem",
                              lineHeight: 1.3,
                              color: "var(--parchment-dim)",
                            }}
                          >
                            {tour.name}
                          </span>
                          <span className={`slot-spots ${slot.remaining <= 2 ? "low" : ""}`}>
                            {slot.remaining} spot{slot.remaining === 1 ? "" : "s"}
                            {tour.price != null && (
                              <span className="slot-booked">
                                {" "}· ¥{tour.price.toLocaleString()}
                              </span>
                            )}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p style={{ marginTop: "1.5rem", fontSize: "0.95rem" }}>
          <a href="/book/custom">Need a custom time? Request one →</a>
        </p>
      </main>

      <footer className="booking-footer">
        <strong>Osaka Castle Walks with Edward</strong><br />
        2-3-6 Tanimachi, Chuo-ku, Osaka<br />
        <a href="mailto:edward@osakacastletours.com">edward@osakacastletours.com</a>
      </footer>
    </div>
  );
}
