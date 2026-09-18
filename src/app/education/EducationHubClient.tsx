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
      <section className="edu-hero bg-hideyoshi">
        <h1 style={{ whiteSpace: "pre-line" }}>{t.hub.hero.headline}</h1>
        <p className="subtitle" style={{ whiteSpace: "pre-line" }}>{t.hub.hero.subtitle}</p>
        <p
          style={{
            fontFamily: '"Cinzel", serif',
            fontSize: "0.8rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: "var(--edu-gold)",
            marginTop: "1rem",
          }}
        >
          {locale === "ja" ? "90〜150分 · 10〜40名 · 英語/日本語/バイリンガル · ¥50,000から" : "90–150 minutes · 10–40 students · English / Japanese / Bilingual · From ¥50,000 per class"}
        </p>
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
              {p.includes("||")
                ? p.split(/(\|\|.*?\|\|)/).map((segment, j) =>
                    segment.startsWith("||") && segment.endsWith("||") ? (
                      <span key={j} className="edu-highlight-question">
                        {segment.slice(2, -2)}
                      </span>
                    ) : (
                      segment
                    )
                  )
                : p}
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

      {/* Program Lifecycle — Before / During / After */}
      <section className="edu-section alt-bg">
        <h2>{t.hub.programLifecycle.title}</h2>
        <p className="section-subtitle">{t.hub.programLifecycle.subtitle}</p>
        <div className="program-lifecycle-grid">
          {t.hub.programLifecycle.phases.map((phase, i) => (
            <div key={i} className="program-lifecycle-phase">
              <div className="program-lifecycle-phase-label">{phase.phase}</div>
              <h3>{phase.title}</h3>
              <ul>
                {phase.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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

      {/* Post-Visit Companion */}
      <section className="edu-section">
        <h2>{t.hub.companion.title}</h2>
        <p className="section-subtitle">{t.hub.companion.subtitle}</p>
        <div
          style={{
            maxWidth: 700,
            margin: "1.5rem 0",
          }}
        >
          {t.hub.companion.body.split("\n\n").map((p, i) => (
            <p
              key={i}
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.7,
                color: "var(--edu-ink)",
                marginBottom: i < t.hub.companion.body.split("\n\n").length - 1 ? "1rem" : 0,
              }}
            >
              {p}
            </p>
          ))}
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--edu-muted)",
              fontStyle: "italic",
              marginTop: "1.5rem",
            }}
          >
            {t.hub.companion.note}
          </p>
        </div>
      </section>

      {/* Examples */}
      <section className="edu-section alt-bg">
        <h2>
          {locale === "ja" ? "あなたの生徒は何を探究できますか？" : "What could your students investigate?"}
        </h2>
        <p className="section-subtitle">
          {locale === "ja"
            ? "これらは固定されたツアーではありません。全ての探究はあなたのコース、生徒、学習目標に合わせて適応されます。"
            : "These are examples, not fixed tours. Every investigation is adapted to your course, students, and learning objectives."}
        </p>
        <div className="example-cards">
          {investigationExamples.map((example) => (
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
      <section className="edu-section alt-bg">
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
            {t.hub.about.publishedWork && (
              <p style={{ marginTop: "1rem", fontSize: "0.95rem" }}>
                <a
                  href={t.hub.about.publishedWork.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--edu-navy)", textDecoration: "underline" }}
                >
                  {t.hub.about.publishedWork.label} →
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="edu-section">
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

      {/* How it works */}
      <section className="edu-section alt-bg">
        <h2>{t.hub.howItWorks.title}</h2>
        <div className="how-it-works-steps">
          {t.hub.howItWorks.steps.map((step, i) => (
            <div key={i} className="how-it-works-step">
              <div className="how-it-works-number">{step.number}</div>
              <div>
                <h4>{step.title}</h4>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
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
