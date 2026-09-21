"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { PayPalPayment } from "@/components/PayPalPayment";
import { Calendar } from "@/components/ui/calendar";
import type { Tour } from "@/types";
import "../styles.css";

interface CustomBookingClientProps {
  tour: Tour;
  companyName: string | null;
  paypalClientId: string;
}

interface ExistingTour {
  tour_id: string;
  tour_name: string;
  start_time: string;
  end_time: string;
  spots_left: number;
}

interface Availability {
  existing_tours: ExistingTour[];
  available_windows: Array<{ from: string; to: string }>;
  suggested_times: string[];
}

interface ConflictError {
  error: string;
  message: string;
  conflict?: { tour_name: string; start_time: string; end_time: string };
  next_available?: string;
  existing_tour_id?: string;
}

function maxBookingDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 400);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Generate 15-minute interval options from 09:00 to 15:00
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 9; h <= 15; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 15 && m > 0) break; // stop at 15:00
      options.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

export function CustomBookingClient({ tour, companyName, paypalClientId }: CustomBookingClientProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | ConflictError | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const fetchAvailability = useCallback(async (selectedDate: string) => {
    if (!selectedDate) {
      setAvailability(null);
      return;
    }
    setLoadingAvailability(true);
    try {
      const res = await fetch(
        `/api/book/available-custom-times?tour_id=${tour.id}&date=${selectedDate}`
      );
      const data = await res.json();
      setAvailability(data);
    } catch {
      setAvailability(null);
    } finally {
      setLoadingAvailability(false);
    }
  }, [tour.id]);

  useEffect(() => {
    fetchAvailability(date);
  }, [date, fetchAvailability]);

  const currencySymbol = tour.currency === "JPY" ? "¥" : tour.currency + " ";
  const pricePerGuest = tour.price ?? 0;
  const guests = parseInt(guestCount || "2", 10);
  const totalPrice = pricePerGuest * guests;

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
            <h2>Request Received</h2>
            <p>
              Payment received. Your requested tour time will be confirmed by email.
              Check your inbox for details.
            </p>
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
        <h1>Request a Custom Time</h1>
        <p className="booking-description">
          Choose your preferred date and time. I&apos;ll check my schedule and confirm your tour personally.
        </p>

        <div className="booking-price">
          {pricePerGuest > 0 && (
            <span>{currencySymbol}{pricePerGuest.toLocaleString()} / person</span>
          )}
        </div>

        <div className="booking-form">
          <div className="form-group">
            <label>Tour</label>
            <div className="tour-name-display">{tour.name}</div>
          </div>

          <div className="form-group">
            <label>Preferred Date *</label>
            <Calendar
              mode="single"
              selected={date ? new Date(date + "T00:00:00") : undefined}
              onSelect={(day) => {
                if (day) {
                  const y = day.getFullYear();
                  const m = String(day.getMonth() + 1).padStart(2, "0");
                  const d = String(day.getDate()).padStart(2, "0");
                  setDate(`${y}-${m}-${d}`);
                } else {
                  setDate("");
                }
                setTime("");
                setError(null);
              }}
              disabled={(d) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = d < today;
                const isMax = d > new Date(maxBookingDate() + "T00:00:00");
                // Disable today if past 3 PM JST (end of custom booking window)
                const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
                const isTodayPastCutoff = d.getTime() === today.getTime() && jstNow.getUTCHours() >= 15;
                return isPast || isMax || isTodayPastCutoff;
              }}
              captionLayout="dropdown"
              startMonth={new Date()}
              endMonth={(() => { const d = new Date(); d.setDate(d.getDate() + 400); return d; })()}
            />
          </div>

          {loadingAvailability && (
            <p style={{ color: "var(--parchment-dim)", fontSize: "0.85rem", fontStyle: "italic" }}>
              Checking availability...
            </p>
          )}

          {availability && !loadingAvailability && availability.existing_tours.length > 0 && (
            <div className="existing-tours-section">
              <label>Edward has a tour on this date:</label>
              {availability.existing_tours.map((t, i) => (
                <div key={i} className="existing-tour-card">
                  <div className="tour-time">{t.start_time} — {t.end_time}</div>
                  <div className="tour-name">{t.tour_name}</div>
                  <div className="spots-left">{t.spots_left} spot{t.spots_left !== 1 ? "s" : ""} left</div>
                  <a href={`/book?tour=${t.tour_id}`} className="join-tour-link">
                    Join this tour →
                  </a>
                </div>
              ))}
            </div>
          )}

          {availability && !loadingAvailability && availability.suggested_times.length > 0 && (
            <div className="form-group">
              <label>Available Custom Times *</label>
              <div className="available-times">
                {availability.suggested_times.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={time === t ? "selected" : ""}
                    onClick={() => { setTime(t); setError(null); }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availability && !loadingAvailability && availability.suggested_times.length === 0 && availability.existing_tours.length === 0 && (
            <p style={{ color: "var(--parchment-dim)", fontSize: "0.85rem", fontStyle: "italic" }}>
              No available custom times on this date. Try another date.
            </p>
          )}

          {!date && !loadingAvailability && (
            <div className="form-group">
              <label htmlFor="time">Preferred Time *</label>
              <select
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              >
                <option value="">Select a time</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="guests">Number of Guests *</label>
            <input
              type="number"
              id="guests"
              min={1}
              max={tour.capacity}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number (optional)</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+81 ..."
            />
          </div>

          {pricePerGuest > 0 && (
            <div className="price-summary">
              Total: {currencySymbol}{totalPrice.toLocaleString()}
            </div>
          )}

          <p className="booking-note">
            Payment confirms your booking request, not your requested time. Your tour time will be confirmed by email.
          </p>

          {error && (
            <div className="booking-unavailable">
              <h3>Date Not Available</h3>
              <p>{typeof error === "string" ? error : error.message}</p>
              {typeof error === "object" && error.conflict && (
                <div className="conflict-details">
                  Conflicting tour: {error.conflict.tour_name} ({error.conflict.start_time}–{error.conflict.end_time})
                </div>
              )}
              <div className="unavailable-actions">
                {typeof error === "object" && error.next_available && (
                  <button
                    className="btn-try"
                    onClick={() => { setTime(error.next_available!); setError(null); }}
                  >
                    Pick {error.next_available}
                  </button>
                )}
                {typeof error === "object" && error.existing_tour_id && (
                  <a href={`/book?tour=${error.existing_tour_id}`} className="btn-home">
                    Join Existing Tour
                  </a>
                )}
                <button className="btn-try" onClick={() => { setError(null); document.getElementById("date")?.focus(); }}>
                  Try Another Date
                </button>
              </div>
            </div>
          )}

          {date && time && guests >= 1 ? (
            <PayPalPayment
              paypalClientId={paypalClientId}
              tourId={tour.id}
              tourName={tour.name}
              date={date}
              startTime={time}
              guestCount={guests}
              amount={totalPrice}
              currency={tour.currency || "JPY"}
              custom
              customerPhone={phone}
              onSuccess={() => setPaymentSuccess(true)}
              onError={setError}
            />
          ) : (
            <p style={{ color: "var(--parchment-dim)", fontSize: "0.85rem", fontStyle: "italic" }}>
              Select a date and time to see payment options.
            </p>
          )}
        </div>
      </main>

      <footer className="booking-footer">
        <strong>Osaka Castle Walks with Edward</strong><br />
        2-3-6 Tanimachi, Chuo-ku, Osaka<br />
        <a href="mailto:edward@osakacastletours.com">edward@osakacastletours.com</a>
      </footer>
    </div>
  );
}
