"use client";

import Link from "next/link";
import { useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/education/content";
import { ja } from "@/lib/education/content-ja";
import { SocraticMethodDiagram } from "@/components/education/SocraticMethodDiagram";
import { InvestigationExampleCard } from "@/components/education/InvestigationExampleCard";
import { CurriculumMatrix } from "@/components/education/CurriculumMatrix";
import { TimelineHooks } from "@/components/education/TimelineHooks";
import { PricingTable } from "@/components/education/PricingTable";
import { InquiryForm } from "@/components/education/InquiryForm";
import { investigationExamples } from "@/lib/education/examples";

export default function HighSchoolPage() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const hs = t.highSchool;

  const hsExamples = investigationExamples.filter(
    (e) => e.level === "hs"
  );

  return (
    <div>
      {/* Hero */}
      <section className="edu-hero">
        <h1>{hs.hero.headline}</h1>
        <p className="subtitle">{hs.hero.subtitle}</p>
        <div className="cta-group">
          <a href="#inquiry-form" className="edu-cta-btn">
            {t.nav.cta}
          </a>
          <Link href="/education/teacher-pack" className="edu-cta-btn secondary">
            {t.hub.hero.secondary}
          </Link>
        </div>
      </section>

      {/* Method */}
      <section className="edu-section">
        <h2>{t.hub.method.title}</h2>
        <p className="section-subtitle">{t.hub.method.subtitle}</p>
        <SocraticMethodDiagram />
      </section>

      {/* Why HS */}
      <section className="edu-section alt-bg">
        <h2>{hs.why.title}</h2>
        <ul style={{ listStyle: "none", maxWidth: 700, margin: "1.5rem 0" }}>
          {hs.why.items.map((item, i) => (
            <li
              key={i}
              style={{
                padding: "0.6rem 0",
                fontSize: "1.05rem",
                borderBottom: "1px solid var(--edu-border)",
              }}
            >
              ✓ {item}
            </li>
          ))}
        </ul>
      </section>

      {/* 探究 Time Fit */}
      <section className="edu-section">
        <h2>{hs.inquiryTime.title}</h2>
        <p className="section-subtitle">{hs.inquiryTime.subtitle}</p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "1.5rem 0" }}>
          {hs.inquiryTime.steps.map((step, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 140px",
                background: "var(--edu-card)",
                border: "1px solid var(--edu-border)",
                borderRadius: 6,
                padding: "1.25rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.08em",
                  color: "var(--edu-muted)",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                Step {i + 1}
              </div>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--edu-ink)",
                  marginBottom: "0.25rem",
                }}
              >
                {step.jp}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--edu-stone)",
                  fontStyle: "italic",
                }}
              >
                {step.en}
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            fontStyle: "italic",
            color: "var(--edu-navy)",
            fontSize: "1.05rem",
          }}
        >
          {hs.inquiryTime.closing}
        </p>
      </section>

      {/* IB/AP */}
      <section className="edu-section alt-bg">
        <h2>{hs.ib.title}</h2>
        <ul style={{ listStyle: "none", maxWidth: 600, margin: "1.5rem 0" }}>
          {hs.ib.items.map((item, i) => (
            <li
              key={i}
              style={{
                padding: "0.5rem 0",
                fontSize: "1rem",
                borderBottom: "1px solid var(--edu-border)",
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Curriculum Matrix */}
      <section className="edu-section">
        <h2>
          {locale === "ja"
            ? "カリキュラム対応表"
            : "Curriculum Alignment"}
        </h2>
        <p className="section-subtitle">
          {locale === "ja"
            ? "全ての探究はあなたのカリキュラムに合わせてカスタマイズされます。"
            : "Every investigation is customized to your curriculum unit."}
        </p>
        <CurriculumMatrix />
      </section>

      {/* HS Examples */}
      <section className="edu-section alt-bg">
        <h2>
          {locale === "ja" ? "高校の探究例" : "HS Investigation Examples"}
        </h2>
        <div className="example-cards">
          {hsExamples.map((example) => (
            <InvestigationExampleCard key={example.id} example={example} />
          ))}
        </div>
      </section>

      {/* Timeline Hooks */}
      <section className="edu-section">
        <TimelineHooks
          themes={[
            "hideyoshi",
            "tokugawa",
            "geography-power",
            "power-propaganda",
            "historical-memory",
          ]}
          limit={10}
        />
      </section>

      {/* Pricing */}
      <section className="edu-section alt-bg">
        <h2>{t.hub.pricing.title}</h2>
        <p className="section-subtitle">{t.hub.pricing.subtitle}</p>
        <PricingTable />
      </section>

      {/* Inquiry */}
      <section className="edu-section" id="inquiry-form">
        <h2>{t.form.title}</h2>
        <p className="section-subtitle">{t.form.subtitle}</p>
        <InquiryForm />
      </section>
    </div>
  );
}
