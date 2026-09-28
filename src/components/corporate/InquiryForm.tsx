"use client";

import { useState } from "react";
import { useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/corporate/content";
import { ja } from "@/lib/corporate/content-ja";

export function InquiryForm() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const f = t.form;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    groupSize: "",
    language: "",
    dates: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/corporate/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, locale }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : locale === "ja"
            ? "送信に失敗しました。後でもう一度お試しください。"
            : "Failed to submit. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 0" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "0.75rem" }}>
          {f.success.title}
        </h3>
        <p style={{ color: "var(--edu-stone)", maxWidth: 500, margin: "0 auto" }}>
          {f.success.body}
        </p>
      </div>
    );
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit}>
      {/* Contact Section */}
      <div className="form-section">
        <h3>{locale === "ja" ? "会社・ご担当者" : "Company & Contact"}</h3>
        <div className="form-row">
          <div className="form-group">
            <label>{f.company.label}</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{f.contact.contactName}</label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group full-width">
          <label>{f.contact.email}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Group Section */}
      <div className="form-section">
        <h3>{locale === "ja" ? "グループについて" : "Your Group"}</h3>

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label>{f.groupSize.label}</label>
          <div className="radio-group">
            {f.groupSize.options.map((opt) => (
              <label key={opt} className="radio-option">
                <input
                  type="radio"
                  name="groupSize"
                  value={opt}
                  checked={formData.groupSize === opt}
                  onChange={handleChange}
                  required
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label>{f.language.label}</label>
          <div className="radio-group">
            {f.language.options.map((opt) => (
              <label key={opt} className="radio-option">
                <input
                  type="radio"
                  name="language"
                  value={opt}
                  checked={formData.language === opt}
                  onChange={handleChange}
                  required
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label>{f.contact.dates}</label>
          <input
            type="text"
            name="dates"
            value={formData.dates}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>{f.contact.notes}</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "0.75rem 1rem",
            borderRadius: 4,
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      <div className="form-submit">
        <button
          type="submit"
          className="edu-cta-btn"
          disabled={loading}
          style={{ width: "100%", maxWidth: 400 }}
        >
          {loading
            ? locale === "ja"
              ? "送信中..."
              : "Sending..."
            : f.submit}
        </button>
      </div>
    </form>
  );
}
