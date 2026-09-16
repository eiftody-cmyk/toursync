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
import { universityAlignment } from "@/lib/education/curriculum-alignment";

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
      <section className="edu-hero">
        <h1>{uni.hero.headline}</h1>
        <p className="subtitle">{uni.hero.subtitle}</p>
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

      {/* Discipline Alignment */}
      <section className="edu-section alt-bg">
        <h2>
          {locale === "ja"
            ? "学問分野との対応"
            : "Discipline Alignment"}
        </h2>
        <p className="section-subtitle">
          {locale === "ja"
            ? "大学プログラムは学問分野に合わせてカスタマイズされます。"
            : "University programs are customized to your discipline."}
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="matrix-table">
            <thead>
              <tr>
                <th>{locale === "ja" ? "テーマ" : "Theme"}</th>
                <th>{locale === "ja" ? "歴史" : "History"}</th>
                <th>{locale === "ja" ? "考古学" : "Archaeology"}</th>
                <th>{locale === "ja" ? "歴史地理" : "Hist. Geography"}</th>
                <th>{locale === "ja" ? "政治学" : "Political Science"}</th>
                <th>{locale === "ja" ? "日本学" : "Japanese Studies"}</th>
              </tr>
            </thead>
            <tbody>
              {universityAlignment.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>
                    {locale === "ja" ? row.themeJa : row.theme}
                  </td>
                  <td>{row.history}</td>
                  <td>{row.archaeology}</td>
                  <td>{row.histGeo}</td>
                  <td>{row.poliSci}</td>
                  <td>{row.japaneseStudies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* University Examples */}
      <section className="edu-section">
        <h2>
          {locale === "ja" ? "大学セミナー例" : "University Seminar Examples"}
        </h2>
        <div className="example-cards">
          {uniExamples.map((example) => (
            <InvestigationExampleCard key={example.id} example={example} />
          ))}
        </div>
      </section>

      {/* Timeline Hooks */}
      <section className="edu-section alt-bg">
        <TimelineHooks
          themes={[
            "geography-power",
            "power-propaganda",
            "ancient-osaka",
            "historical-memory",
            "hideyoshi",
            "tokugawa",
          ]}
          limit={15}
        />
      </section>

      {/* Pricing */}
      <section className="edu-section">
        <h2>{t.hub.pricing.title}</h2>
        <p className="section-subtitle">{t.hub.pricing.subtitle}</p>
        <PricingTable />
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

      {/* Inquiry */}
      <section className="edu-section alt-bg" id="inquiry-form">
        <h2>{t.form.title}</h2>
        <p className="section-subtitle">{t.form.subtitle}</p>
        <InquiryForm />
      </section>
    </div>
  );
}
