"use client";

import { useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/education/content";
import { ja } from "@/lib/education/content-ja";

export function PricingTable() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const pricing = t.pricing;

  return (
    <div>
      {/* Tiered products — 3 columns */}
      <div className="pricing-tier-grid">
        {[pricing.standard, pricing.extended, pricing.fullSeminar].map(
          (product, i) => (
            <div
              key={i}
              className="pricing-card featured"
            >
              <h3>{product.name}</h3>
              <div className="duration">{product.duration}</div>
              {product.tiers.map((tier, j) => (
                <div key={j} className="pricing-tier">
                  <div className="price">{tier.price}</div>
                  <div className="price-note">{tier.size}</div>
                </div>
              ))}
              <ul>
                {product.includes.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>

      {/* Customization section */}
      <div className="pricing-custom-section">
        <h3>{pricing.customProgram.title}</h3>
        <p className="custom-intro">{pricing.customProgram.intro}</p>
        <ul className="custom-examples">
          {pricing.customProgram.examples.map((example, i) => (
            <li key={i}>
              <strong>{example.bold}</strong> {example.text}
            </li>
          ))}
        </ul>
        <p className="custom-cta">{pricing.customProgram.cta}</p>
        <p className="custom-online-note">{pricing.customProgram.onlineNote}</p>
      </div>
    </div>
  );
}
