"use client";

import { useState } from "react";
import { useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/education/content";
import { ja } from "@/lib/education/content-ja";

export function InquiryForm() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const f = t.form;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subject: "",
    angle: "",
    level: "",
    classSize: "",
    language: "",
    materials: [] as string[],
    schoolName: "",
    contactName: "",
    email: "",
    phone: "",
    dates: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMaterialToggle = (material: string) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.includes(material)
        ? prev.materials.filter((m) => m !== material)
        : [...prev.materials, material],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/education/inquiry", {
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
          {t.form.success.title}
        </h3>
        <p style={{ color: "var(--edu-stone)", maxWidth: 500, margin: "0 auto" }}>
          {t.form.success.body}
        </p>
      </div>
    );
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit}>
      {/* Curriculum Section */}
      <div className="form-section">
        <h3>
          {locale === "ja" ? "授業の内容" : "What are you teaching?"}
        </h3>
        <div className="form-group full-width" style={{ marginBottom: "1rem" }}>
          <label>{f.subject.label}</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder={f.subject.placeholder}
            required
          />
        </div>
        <div className="form-group full-width">
          <label>{f.angle.label}</label>
          <textarea
            name="angle"
            value={formData.angle}
            onChange={handleChange}
            placeholder={f.angle.placeholder}
            rows={3}
          />
        </div>
      </div>

      {/* Logistics Section */}
      <div className="form-section">
        <h3>
          {locale === "ja" ? "実施条件" : "Logistics"}
        </h3>

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label>{f.level.label}</label>
          <div className="radio-group">
            {f.level.options.map((opt) => (
              <label key={opt} className="radio-option">
                <input
                  type="radio"
                  name="level"
                  value={opt}
                  checked={formData.level === opt}
                  onChange={handleChange}
                  required
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label>{f.classSize.label}</label>
          <div className="radio-group">
            {f.classSize.options.map((opt) => (
              <label key={opt} className="radio-option">
                <input
                  type="radio"
                  name="classSize"
                  value={opt}
                  checked={formData.classSize === opt}
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

        <div className="form-group">
          <label>{f.materials.label}</label>
          <div className="checkbox-group">
            {f.materials.options.map((opt) => (
              <label key={opt} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.materials.includes(opt)}
                  onChange={() => handleMaterialToggle(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="form-section">
        <h3>
          {locale === "ja" ? "連絡先" : "Contact Information"}
        </h3>
        <div className="form-row">
          <div className="form-group">
            <label>{f.contact.schoolName}</label>
            <input
              type="text"
              name="schoolName"
              value={formData.schoolName}
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
        <div className="form-row">
          <div className="form-group">
            <label>{f.contact.email}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{f.contact.phone}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
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
