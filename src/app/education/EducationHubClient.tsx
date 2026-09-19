"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/education/content";
import { ja } from "@/lib/education/content-ja";
import { SocraticMethodDiagram } from "@/components/education/SocraticMethodDiagram";
import { InvestigationExampleCard } from "@/components/education/InvestigationExampleCard";
import { TimelineHooks } from "@/components/education/TimelineHooks";
import { PricingTable } from "@/components/education/PricingTable";
import { InquiryForm } from "@/components/education/InquiryForm";
import { InvestigationMap } from "@/components/education/InvestigationMap";
import { investigationExamples } from "@/lib/education/examples";
import type { CurriculumLevel } from "@/lib/education/timeline-links";

const TABS: { key: CurriculumLevel | "all"; label: string; labelJa: string }[] = [
  { key: "all", label: "ALL", labelJa: "すべて" },
  { key: "jhs", label: "JHS", labelJa: "中学校" },
  { key: "hs", label: "HIGH SCHOOL", labelJa: "高校" },
  { key: "university", label: "UNIVERSITY", labelJa: "大学" },
];

export default function EducationHub() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const [activeTab, setActiveTab] = useState<CurriculumLevel | "all">("all");

  return (
    <div>
      {/* Hero */}
      <section className="edu-hero bg-hideyoshi">
        <h1 style={{ whiteSpace: "pre-line" }}>
          {t.hub.hero.headline.split("\n").map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {i === 1 ? <em>{line}</em> : line}
            </span>
          ))}
        </h1>
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

      {/* Authority Strip */}
      <section className="authority-strip">
        <a
          className="authority-badge"
          href="https://www.japantimes.co.jp/commentary/2026/07/22/japan/japan-new-imperial-house-law/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="authority-img"
            src="/images/royal-family.webp"
            alt="イフトウ エドワードの研究"
          />
          <div className="authority-text">
            <span className="authority-label">
              {locale === "ja" ? "掲載" : "As seen in"} <em>The Japan Times</em>
            </span>
            <span className="authority-note">
              {locale === "ja"
                ? "イフトウデイ　エドワード — 日本の皇室継承と伝統の発明"
                : "Edward Iftody — Japan's imperial succession and the invention of tradition"}
            </span>
            <span className="authority-cta">{locale === "ja" ? "記事を読む →" : "Read the article →"}</span>
          </div>
        </a>
      </section>

      {/* Problem */}
      <section className="edu-section alt-bg">
        <div className="edu-problem">
          <h3>{t.hub.problem.title}</h3>
          {t.hub.problem.intro.split("\n\n").map((p, i) => (
            <p key={i} className="edu-problem-intro" style={{ marginTop: i > 0 ? "0.75rem" : 0 }}>
              {p}
            </p>
          ))}
          <div className="edu-faq">
            {t.hub.problem.faq.map((item, i) => (
              <div key={i} className="edu-faq-item">
                <h4>{item.q}</h4>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
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
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "var(--edu-ink)",
            maxWidth: 600,
            margin: "0 auto 1.5rem",
          }}
        >
          {t.hub.students.positioning}
        </p>
        <ul style={{ listStyle: "none", maxWidth: 600, margin: "0 auto 1.5rem" }}>
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

      {/* Investigation Map */}
      <section className="edu-section">
        <InvestigationMap />
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
              fontSize: "1rem",
              color: "var(--edu-navy)",
              fontWeight: 600,
              marginTop: "1.5rem",
              padding: "0.75rem 1rem",
              borderLeft: "3px solid var(--edu-navy)",
              background: "rgba(0,0,0,0.03)",
            }}
          >
            {t.hub.companion.note}
          </p>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--edu-ink)",
              lineHeight: 1.6,
              marginTop: "1rem",
            }}
          >
            {locale === "ja"
              ? "フィールド探究の前後に生徒が必要なものすべてがオンラインで利用可能です。デジタルで回答することも、ウェブサイトから直接印刷して教室で使用することもできます。"
              : "Everything your students need before and after the field investigation is available online. Activities can be completed digitally or printed directly from the website for classroom use."}
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
        <div className="edu-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`edu-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {locale === "ja" ? tab.labelJa : tab.label}
            </button>
          ))}
        </div>
        <TimelineHooks
          level={activeTab === "all" ? undefined : activeTab}
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
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="edu-section">
        <h2>{t.hub.pricing.title}</h2>
        <p className="section-subtitle">{t.hub.pricing.subtitle}</p>
        <PricingTable />

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
