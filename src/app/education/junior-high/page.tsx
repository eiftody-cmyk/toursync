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

export default function JuniorHighPage() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const jhs = t.juniorHigh;

  const jhsExamples = investigationExamples.filter((e) => e.level === "jhs");

  return (
    <div>
      {/* Hero */}
      <section className="edu-hero">
        <h1>{jhs.hero.headline}</h1>
        <p className="subtitle">{jhs.hero.subtitle}</p>
        <div className="cta-group">
          <a href="#inquiry-form" className="edu-cta-btn">
            {t.nav.cta}
          </a>
          <Link href="/education/teacher-pack" className="edu-cta-btn secondary">
            {t.hub.hero.secondary}
          </Link>
        </div>
      </section>

      {/* Method (short) */}
      <section className="edu-section">
        <h2>{t.hub.method.title}</h2>
        <p className="section-subtitle">{t.hub.method.subtitle}</p>
        <SocraticMethodDiagram />
      </section>

      {/* Why JHS */}
      <section className="edu-section alt-bg">
        <h2>{jhs.why.title}</h2>
        <ul style={{ listStyle: "none", maxWidth: 700, margin: "1.5rem 0" }}>
          {jhs.why.items.map((item, i) => (
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

      {/* English Integration */}
      <section className="edu-section">
        <h2>{jhs.english.title}</h2>
        <p className="section-subtitle">{jhs.english.subtitle}</p>
        <ul style={{ listStyle: "none", maxWidth: 600, margin: "1.5rem 0" }}>
          {jhs.english.items.map((item, i) => (
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
      <section className="edu-section alt-bg">
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

      {/* JHS Examples */}
      <section className="edu-section">
        <h2>
          {locale === "ja" ? "中学校の探究例" : "JHS Investigation Examples"}
        </h2>
        <div className="example-cards">
          {jhsExamples.map((example) => (
            <InvestigationExampleCard key={example.id} example={example} />
          ))}
        </div>
      </section>

      {/* Timeline Hooks */}
      <section className="edu-section alt-bg">
        <TimelineHooks
          themes={["hideyoshi", "warrior-monks", "tokugawa", "ancient-osaka"]}
          limit={4}
        />
      </section>

      {/* Pricing */}
      <section className="edu-section">
        <h2>{t.hub.pricing.title}</h2>
        <p className="section-subtitle">{t.hub.pricing.subtitle}</p>
        <PricingTable />
      </section>

      {/* Inquiry */}
      <section className="edu-section alt-bg" id="inquiry-form">
        <h2>{t.form.title}</h2>
        <p className="section-subtitle">{t.form.subtitle}</p>
        <InquiryForm />
      </section>
    </div>
  );
}
