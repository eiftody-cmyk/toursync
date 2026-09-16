"use client";

import { useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/education/content";
import { ja } from "@/lib/education/content-ja";

export function PricingTable() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const pricing = t.pricing;

  return (
    <div className="pricing-grid">
      {/* Standard */}
      <div className="pricing-card">
        <h3>{pricing.standard.name}</h3>
        <div className="price-note">{pricing.standard.duration}</div>
        {pricing.standard.tiers.map((tier, i) => (
          <div key={i} style={{ marginBottom: "0.75rem" }}>
            <div className="price">{tier.price}</div>
            <div className="price-note">{tier.size}</div>
          </div>
        ))}
        <ul>
          {pricing.standard.includes.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Custom */}
      <div className="pricing-card featured">
        <h3>{pricing.custom.name}</h3>
        <div className="price">{pricing.custom.price}</div>
        <div className="price-note">{pricing.custom.size}</div>
        <div className="duration">{pricing.custom.duration}</div>
        <ul>
          {pricing.custom.includes.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Full Pack */}
      <div className="pricing-card">
        <h3>{pricing.fullPack.name}</h3>
        <div className="price">{pricing.fullPack.price}</div>
        <div className="price-note">{pricing.fullPack.size}</div>
        <div className="duration">{pricing.fullPack.duration}</div>
        <ul>
          {pricing.fullPack.includes.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
