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


export default function UniversityPage() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const uni = t.university;

  const uniExamples = investigationExamples.filter(
    (e) => e.level === "university"
  );

  return (
    <div>
      {/* Hero */}
      <section className="edu-hero bg-shotoku">
        <h1>{uni.hero.headline}</h1>
        <p className="subtitle">{uni.hero.subtitle}</p>
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
            {t.nav.cta}
          </a>
          <Link href="/education/teacher-pack" className="edu-cta-btn secondary">
            {t.hub.hero.secondary}
          </Link>
        </div>
      </section>

      {/* Seminar Structure */}
      <section className="edu-section">
        <h2>{uni.method.title}</h2>
        <p className="section-subtitle">{uni.method.subtitle}</p>
        <SocraticMethodDiagram variant="university" />
      </section>

      {/* What the Seminar Provides */}
      <section className="edu-section alt-bg">
        <h2>{uni.why.title}</h2>
        <ul style={{ listStyle: "none", maxWidth: 700, margin: "1.5rem 0" }}>
          {uni.why.items.map((item, i) => (
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

      {/* Seminar Topics */}
      <section className="edu-section">
        <h2>{uni.seminars.title}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
            margin: "1.5rem 0",
          }}
        >
          {uni.seminars.items.map((item, i) => (
            <div
              key={i}
              style={{
                background: "var(--edu-card)",
                border: "1px solid var(--edu-border)",
                borderRadius: 6,
                padding: "1.25rem 1.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.95rem",
                  color: "var(--edu-ink)",
                }}
              >
                {item}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="edu-section">
        <h2>
          {locale === "ja" ? "よくあるご質問" : "Frequently Asked Questions"}
        </h2>
        <div className="edu-faq">
          {uni.faq.map((item, i) => (
            <div key={i} className="edu-faq-item">
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Discipline Alignment */}
      <section className="edu-section alt-bg">
        <h2>
          {locale === "ja"
            ? "学問分野との対応"
            : "Discipline Alignment"}
        </h2>
        <CurriculumMatrix variant="university" />
      </section>

      {/* University Examples */}
      <section className="edu-section">
        <h2>
          {locale === "ja" ? "あなたの生徒は何を探究できますか？" : "What could your students investigate?"}
        </h2>
        <p className="section-subtitle">
          {locale === "ja"
            ? "これらは固定されたツアーではありません。全ての探究はあなたのコース、生徒、学習目標に合わせて適応されます。"
            : "These are examples, not fixed tours. Every investigation is adapted to your course, students, and learning objectives."}
        </p>
        <div className="example-cards">
          {uniExamples.map((example) => (
            <InvestigationExampleCard key={example.id} example={example} />
          ))}
        </div>
      </section>

      {/* Timeline Hooks */}
      <section className="edu-section alt-bg">
        <TimelineHooks />
      </section>

      {/* Pricing */}
      <section className="edu-section">
        <h2>{t.hub.pricing.title}</h2>
        <p className="section-subtitle">{t.hub.pricing.subtitle}</p>
        <PricingTable />
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

        <div
          style={{
            background: "var(--edu-card)",
            border: "1px solid var(--edu-border)",
            borderRadius: 6,
            padding: "1.5rem 2rem",
            marginTop: "1.5rem",
          }}
        >
          <h3
            style={{
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
            }}
          >
            {locale === "ja" ? "大学セミナー" : "University Field Seminar"}
          </h3>
          <p style={{ color: "var(--edu-stone)", fontSize: "0.95rem" }}>
            {locale === "ja"
              ? "完全カスタマイズ。お気軽にご相談ください。"
              : "Fully customized to your course. Contact to discuss your specific needs."}
          </p>
        </div>
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

      {/* Inquiry */}
      <section className="edu-section" id="inquiry-form">
        <h2>{t.form.title}</h2>
        <p className="section-subtitle">{t.form.subtitle}</p>
        <InquiryForm />
      </section>
    </div>
  );
}
