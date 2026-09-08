"use client";

import { useState } from "react";
import Link from "next/link";
import type { Tour } from "@/types";
import "../styles.css";

interface CustomBookingClientProps {
  tour: Tour;
  companyName: string | null;
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

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function CustomBookingClient({ tour, companyName }: CustomBookingClientProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currencySymbol = tour.currency === "JPY" ? "¥" : tour.currency + " ";
  const pricePerGuest = tour.price ?? 0;
  const displayName = companyName || "ExperienceRelay";
  const totalPrice = pricePerGuest * parseInt(guestCount || "0", 10);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!date || !time || !name || !email) {
      setError("Please fill in all required fields.");
      return;
    }

    const guests = parseInt(guestCount, 10);
    if (!guests || guests < 1) {
      setError("Please enter a valid guest count.");
      return;
    }

    setBooking(true);

    try {
      const res = await fetch("/api/paypal/create-custom-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tour.id,
          date,
          start_time: time,
          guest_count: guests,
          customer_name: name,
          customer_email: email,
          customer_phone: phone || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create order.");
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

  return (
    <div>
      <header className="booking-header">
        <Link href="/" className="logo">{displayName}</Link>
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

        <form className="booking-form" onSubmit={handleSubmit}>
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
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
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
            <label htmlFor="name">Your Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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

          <button
            type="submit"
            className="cta-btn"
            disabled={booking}
            style={{ width: "100%" }}
          >
            {booking ? "Redirecting to PayPal..." : "Pay & Request Time"}
          </button>
        </form>
      </main>

      <footer className="booking-footer">
        <Link href="/">← Back to {displayName}</Link>
      </footer>
    </div>
  );
}
