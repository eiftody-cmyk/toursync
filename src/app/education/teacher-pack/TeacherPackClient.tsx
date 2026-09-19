"use client";

import Link from "next/link";
import { useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/education/content";
import { ja } from "@/lib/education/content-ja";
import { PricingTable } from "@/components/education/PricingTable";
import { InquiryForm } from "@/components/education/InquiryForm";

export default function TeacherPackPage() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const tp = t.teacherPack;

  return (
    <div>
      {/* Hero */}
      <section className="edu-hero bg-michizane">
        <h1>{tp.hero.headline}</h1>
        <p className="subtitle">{tp.hero.subtitle}</p>
        <div className="cta-group">
          <a href="#inquiry-form" className="edu-cta-btn">
            {t.nav.cta}
          </a>
          <Link href="/education" className="edu-cta-btn secondary">
            {locale === "ja" ? "全体概要に戻る" : "Back to Overview"}
          </Link>
        </div>
      </section>

      {/* Learning Objective */}
      <section className="edu-section narrow">
        <div className="edu-problem">
          <h3>{tp.objective.title}</h3>
          <p>{tp.objective.body}</p>
        </div>
      </section>

      {/* The Question */}
      <section className="edu-section narrow" style={{ paddingTop: 0 }}>
        <h2>{tp.question.title}</h2>
        <p
          style={{
            fontSize: "1.2rem",
            fontStyle: "italic",
            color: "var(--edu-navy)",
            lineHeight: 1.6,
          }}
        >
          {tp.question.body}
        </p>
      </section>

      {/* Before the Visit */}
      <section className="edu-section narrow" style={{ paddingTop: 0 }}>
        <h2>{tp.before.title}</h2>
        <ul style={{ listStyle: "none", margin: "1rem 0" }}>
          {tp.before.items.map((item, i) => (
            <li
              key={i}
              style={{
                padding: "0.4rem 0",
                fontSize: "0.95rem",
                borderBottom: "1px solid var(--edu-border)",
              }}
            >
              ✓ {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Sites — Timeline */}
      <section className="edu-section narrow" style={{ paddingTop: 0 }}>
        <h2>
          {locale === "ja" ? "フィールド探究の流れ" : "Field Investigation Flow"}
        </h2>

        <div className="mockup-timeline">
          {tp.sites.map((site, i) => (
            <div key={i} className="mockup-stop">
              <h3>{site.title}</h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--edu-muted)",
                  fontStyle: "italic",
                  marginBottom: "0.5rem",
                }}
              >
                {locale === "ja" ? `場所：${site.location}` : `Location: ${site.location}`}
              </p>

              <h4>
                {locale === "ja" ? "エドワードが教える" : "Edward teaches"}
              </h4>
              <p>{site.teaches}</p>

              <h4>
                {locale === "ja" ? "グループ探究" : "Group Investigation"}
              </h4>
              <div className="mockup-question">{site.question}</div>
              <p>{site.groups}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Edward's Historical Analysis */}
      <section className="edu-section narrow alt-bg" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <h2>{tp.resolution.title}</h2>
        <p
          style={{
            fontSize: "1rem",
            fontStyle: "italic",
            color: "var(--edu-stone)",
            marginBottom: "1rem",
          }}
        >
          {tp.resolution.intro}
        </p>
        <ul style={{ listStyle: "none", margin: "1rem 0" }}>
          {tp.resolution.items.map((item, i) => (
            <li
              key={i}
              style={{
                padding: "0.4rem 0",
                fontSize: "0.95rem",
                borderBottom: "1px solid var(--edu-border)",
              }}
            >
              → {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Assessment — framed as optional extension */}
      <section className="edu-section narrow">
        <h2>{tp.assessment.title}</h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--edu-stone)",
            fontStyle: "italic",
            marginBottom: "1rem",
          }}
        >
          {locale === "ja"
            ? "フィールド探究はコア製品です。評価と拡張教室教材は必要に応じて追加できます。"
            : "The field investigation is the core product. Assessment and extended classroom materials can be added when useful."}
        </p>
        <div className="mockup-assessment">
          {tp.assessment.questions.map((q, i) => (
            <div key={i} className="question">
              <div className="question-type">{q.type}</div>
              <div className="question-text">{q.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing statement */}
      <section className="edu-section narrow" style={{ paddingTop: 0 }}>
        <div
          style={{
            background: "var(--edu-surface)",
            borderLeft: "3px solid var(--edu-navy)",
            padding: "1.25rem 1.5rem",
            fontSize: "1.05rem",
            color: "var(--edu-ink)",
            fontStyle: "italic",
          }}
        >
          {tp.closing}
        </div>
      </section>

      {/* What's Included */}
      <section className="edu-section alt-bg">
        <h2>{tp.included.title}</h2>
        <div className="included-grid">
          {tp.included.items.map((item, i) => (
            <div key={i} className="included-item">
              <span className="check">✓</span>
              {item}
            </div>
          ))}
        </div>
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
      </section>

      {/* Logistics */}
      <section className="edu-section">
        <h2>{tp.logistics.title}</h2>
        <ul style={{ listStyle: "none", maxWidth: 600, margin: "1rem 0" }}>
          {tp.logistics.items.map((item, i) => (
            <li
              key={i}
              style={{
                padding: "0.4rem 0",
                fontSize: "0.95rem",
                borderBottom: "1px solid var(--edu-border)",
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Pricing */}
      <section className="edu-section alt-bg">
        <h2>{t.hub.pricing.title}</h2>
        <p className="section-subtitle">{t.hub.pricing.subtitle}</p>
        <PricingTable />

      </section>

      {/* How it works */}
      <section className="edu-section">
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
      <section className="edu-section alt-bg" id="inquiry-form">
        <h2>{t.form.title}</h2>
        <p className="section-subtitle">{t.form.subtitle}</p>
        <InquiryForm />
      </section>
    </div>
  );
}
