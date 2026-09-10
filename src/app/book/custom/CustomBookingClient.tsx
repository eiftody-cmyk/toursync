"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PayPalPayment } from "@/components/PayPalPayment";
import type { Tour } from "@/types";
import "../styles.css";

interface CustomBookingClientProps {
  tour: Tour;
  companyName: string | null;
  paypalClientId: string;
}

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function threeMonthsOut(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
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
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
            <label htmlFor="date">Preferred Date *</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={tomorrow()}
              max={threeMonthsOut()}
              required
            />
          </div>

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

          {error && <div className="booking-error">{error}</div>}

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
