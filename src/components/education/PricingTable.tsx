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
              className={`pricing-card ${i === 0 ? "featured" : ""}`}
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

      {/* Customization note */}
      <div className="pricing-custom-header">
        <h3>{pricing.customHeader}</h3>
        <p>{pricing.customSubtitle}</p>
      </div>
    </div>
  );
}
