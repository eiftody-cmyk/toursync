"use client";

import { useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/corporate/content";
import { ja } from "@/lib/corporate/content-ja";
import { withJaName } from "@/lib/education/ja-name";
import { educationTimelineLinks } from "@/lib/education/timeline-links";
import { InquiryForm } from "@/components/corporate/InquiryForm";

const EVIDENCE_SLUGS = [
  "toyotomihideyoshi",
  "ishiyama-timeline",
  "tokugawa-ieyasu-timeline",
  "three-unifiers",
  "azaiclanbetrayal",
  "fujiwara-shadow-politics",
];

export default function CorporateClient() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const h = t.hub;

  const evidence = EVIDENCE_SLUGS.map((slug) =>
    educationTimelineLinks.find((link) => link.slug === slug)
  ).filter((link): link is NonNullable<typeof link> => Boolean(link));

  return (
    <div>
      {/* Hero */}
      <section className="edu-hero corp-hero">
        <h1 style={{ whiteSpace: "pre-line" }}>
          {h.hero.headline.split("\n").map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {i === 1 ? <em>{line}</em> : line}
            </span>
          ))}
        </h1>
        <p className="subtitle">{h.hero.subtitle}</p>
        <p className="corp-hero-facts">{h.hero.facts}</p>
        <div className="cta-group">
          <a href="#inquiry-form" className="edu-cta-btn">
            {h.hero.cta}
          </a>
        </div>
      </section>

      {/* Positioning Band */}
      <section className="corp-positioning">
        <p className="corp-positioning-lead">{h.positioning.lines[0]}</p>
        <p className="corp-positioning-line">{h.positioning.lines[1]}</p>
        <p className="corp-positioning-line">{h.positioning.lines[2]}</p>
      </section>

      {/* How It Works */}
      <section className="edu-section" id="how-it-works">
        <h2>{h.howItWorks.title}</h2>
        <p className="section-subtitle">{h.howItWorks.subtitle}</p>
        <p className="corp-situation">{h.howItWorks.situation}</p>
        <div className="corp-ladder">
          {h.howItWorks.steps.map((step) => (
            <div key={step.number} className="corp-ladder-step">
              <div className="corp-ladder-number">{step.number}</div>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
        <p className="corp-ladder-note">{h.howItWorks.note}</p>
      </section>

      {/* The Three Dilemmas */}
      <section className="edu-section alt-bg" id="experience">
        <h2>{h.dilemmas.title}</h2>
        <p className="section-subtitle">{h.dilemmas.subtitle}</p>
        <div className="corp-dilemma-grid">
          {h.dilemmas.cards.map((card) => (
            <div key={card.era} className="corp-dilemma-card">
              <div className="corp-dilemma-era">{card.era}</div>
              <p>{card.body}</p>
              <a
                className="corp-dilemma-link"
                href={locale === "ja" ? `/ja${card.href}` : card.href}
              >
                {card.linkLabel}
              </a>
            </div>
          ))}
        </div>
        <p className="corp-dilemma-note">{h.dilemmas.note}</p>
      </section>

      {/* Facilitator */}
      <section className="edu-section">
        <h2>{withJaName(h.edward.title)}</h2>
        <div className="about-card">
          <div className="about-text">
            {h.edward.paragraphs.map((p, i) => (
              <p
                key={i}
                style={{
                  marginBottom: i < h.edward.paragraphs.length - 1 ? "0.75rem" : 0,
                }}
              >
                {withJaName(p)}
              </p>
            ))}
            <div className="about-credentials">
              {h.edward.credentials.map((cred, i) => (
                <span key={i} className="badge">
                  {cred}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Setting */}
      <section className="edu-section alt-bg">
        <h2>{h.setting.title}</h2>
        <p className="corp-setting-body">{h.setting.body}</p>
        <ul className="corp-setting-list">
          {h.setting.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Who It's For */}
      <section className="edu-section">
        <h2>{h.audience.title}</h2>
        <p className="section-subtitle">{h.audience.subtitle}</p>
        <ul className="corp-audience-grid">
          {h.audience.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Explore the Evidence */}
      <section className="edu-section alt-bg" id="evidence">
        <h2>{h.evidence.title}</h2>
        <p className="section-subtitle">{h.evidence.subtitle}</p>
        <div className="corp-evidence-grid">
          {evidence.map((link) => (
            <a
              key={link.slug}
              className="corp-evidence-card"
              href={
                locale === "ja"
                  ? `/ja/${link.slug}.html`
                  : `/${link.slug}.html`
              }
            >
              <div className="corp-evidence-period">
                {locale === "ja" ? link.periodJa : link.period}
              </div>
              <h4>{locale === "ja" ? link.titleJa : link.titleEn}</h4>
              <p>{locale === "ja" ? link.descriptionJa : link.descriptionEn}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="edu-section" id="pricing">
        <h2>{h.pricing.title}</h2>
        <p className="section-subtitle">{h.pricing.subtitle}</p>
        <div className="pricing-tier-grid">
          {h.pricing.tiers.map((tier) => (
            <div key={tier.size} className="pricing-card featured">
              <h3>{tier.size}</h3>
              <div className="price">{tier.price}</div>
            </div>
          ))}
        </div>
        <p className="corp-price-note">{h.pricing.note}</p>
      </section>

      {/* FAQ */}
      <section className="edu-section alt-bg">
        <h2>{locale === "ja" ? "よくある質問" : "FAQ"}</h2>
        <div className="edu-faq">
          {h.faq.map((item, i) => (
            <div key={i} className="edu-faq-item">
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="edu-section" id="inquiry-form">
        <h2>{t.form.title}</h2>
        <p className="section-subtitle">{t.form.subtitle}</p>
        <InquiryForm />
      </section>
    </div>
  );
}
