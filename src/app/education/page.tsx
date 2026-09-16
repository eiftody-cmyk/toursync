"use client";

import Link from "next/link";
import { useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/education/content";
import { ja } from "@/lib/education/content-ja";
import { SocraticMethodDiagram } from "@/components/education/SocraticMethodDiagram";
import { InvestigationExampleCard } from "@/components/education/InvestigationExampleCard";
import { TimelineHooks } from "@/components/education/TimelineHooks";
import { PricingTable } from "@/components/education/PricingTable";
import { InquiryForm } from "@/components/education/InquiryForm";
import { investigationExamples } from "@/lib/education/examples";

export default function EducationHub() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;

  return (
    <div>
      {/* Hero */}
      <section className="edu-hero">
        <h1 style={{ whiteSpace: "pre-line" }}>{t.hub.hero.headline}</h1>
        <p className="subtitle">{t.hub.hero.subtitle}</p>
        <div className="cta-group">
          <a href="#inquiry-form" className="edu-cta-btn">
            {t.hub.hero.cta}
          </a>
          <Link href="/education/teacher-pack" className="edu-cta-btn secondary">
            {t.hub.hero.secondary}
          </Link>
        </div>
      </section>

      {/* Problem */}
      <section className="edu-section alt-bg">
        <div className="edu-problem">
          <h3>{t.hub.problem.title}</h3>
          {t.hub.problem.body.split("\n\n").map((p, i) => (
            <p key={i} style={{ marginTop: i > 0 ? "0.75rem" : 0 }}>
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Method */}
      <section className="edu-section">
        <h2>{t.hub.method.title}</h2>
        <p className="section-subtitle">{t.hub.method.subtitle}</p>
        <SocraticMethodDiagram />
      </section>

      {/* What Students Do */}
      <section className="edu-section alt-bg">
        <h2>{t.hub.students.title}</h2>
        <p className="section-subtitle">{t.hub.students.subtitle}</p>
        <ul style={{ listStyle: "none", maxWidth: 600, margin: "1.5rem 0" }}>
          {t.hub.students.items.map((item, i) => (
            <li
              key={i}
              style={{
                padding: "0.5rem 0",
                fontSize: "1.05rem",
                borderBottom: "1px solid var(--edu-border)",
              }}
            >
              {item}
            </li>
          ))}
        </ul>
        <p
          style={{
            fontStyle: "italic",
            color: "var(--edu-navy)",
            fontSize: "1.1rem",
            marginTop: "1.5rem",
          }}
        >
          {t.hub.students.closing}
        </p>
      </section>

      {/* Examples */}
      <section className="edu-section">
        <h2>
          {locale === "ja" ? "探究の例" : "Example Investigations"}
        </h2>
        <p className="section-subtitle">
          {locale === "ja"
            ? "他のコースで作成した探究の一例です。あなたのカリキュラムに合わせてカスタマイズします。"
            : "These are real investigations designed for other courses. Your lesson is built around your curriculum."}
        </p>
        <div className="example-cards">
          {investigationExamples.map((example) => (
            <InvestigationExampleCard key={example.id} example={example} />
          ))}
        </div>
      </section>

      {/* Timeline Hooks */}
      <section className="edu-section alt-bg">
        <TimelineHooks
          themes={[
            "hideyoshi",
            "tokugawa",
            "warrior-monks",
            "ancient-osaka",
            "geography-power",
            "power-propaganda",
            "historical-memory",
          ]}
          limit={8}
        />
      </section>

      {/* About */}
      <section className="edu-section">
        <h2>{t.hub.about.title}</h2>
        <div className="about-card">
          <div className="about-text">
            {t.hub.about.paragraphs.map((p, i) => (
              <p key={i} style={{ marginBottom: i < t.hub.about.paragraphs.length - 1 ? "0.75rem" : 0 }}>
                {p}
              </p>
            ))}
            <div className="about-credentials">
              {t.hub.about.credentials.map((cred, i) => (
                <span key={i} className="badge">
                  {cred}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="edu-section alt-bg">
        <h2>{t.hub.pricing.title}</h2>
        <p className="section-subtitle">{t.hub.pricing.subtitle}</p>
        <PricingTable />
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--edu-muted)",
            fontStyle: "italic",
            marginTop: "1rem",
          }}
        >
          {t.hub.pricing.note}
        </p>
      </section>

      {/* Inquiry Form */}
      <section className="edu-section" id="inquiry-form">
        <h2>{t.form.title}</h2>
        <p className="section-subtitle">{t.form.subtitle}</p>
        <InquiryForm />
        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.85rem",
            color: "var(--edu-muted)",
          }}
        >
          {t.form.notSure}{" "}
          <Link href="/education/teacher-pack">
            {locale === "ja" ? "授業見本を見る →" : "See a sample lesson →"}
          </Link>
        </p>
      </section>
    </div>
  );
}
