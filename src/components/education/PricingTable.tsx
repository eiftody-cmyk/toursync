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

      {/* Custom section header */}
      <div className="pricing-custom-header">
        <h3>{pricing.customHeader}</h3>
        <p>{pricing.customSubtitle}</p>
      </div>

      {/* Custom products — 2 columns */}
      <div className="pricing-custom-grid">
        {[pricing.custom, pricing.fullPack].map((product, i) => (
          <div key={i} className="pricing-card">
            <h3>{product.name}</h3>
            {"description" in product && (
              <div className="pricing-card-description">{product.description}</div>
            )}
            <div className="price">{product.price}</div>
            <div className="price-note">{product.size}</div>
            <div className="duration">{product.duration}</div>
            <ul>
              {product.includes.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
