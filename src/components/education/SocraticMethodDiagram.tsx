"use client";

import { useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/education/content";
import { ja } from "@/lib/education/content-ja";

export function SocraticMethodDiagram() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const steps = t.hub.method.steps;

  return (
    <div className="method-steps">
      {steps.map((step, i) => (
        <div key={i} className="method-step">
          <div className="method-step-number">{step.number}</div>
          <h4>{step.title}</h4>
          <p className="method-step-subtitle" style={{
            fontSize: "0.7rem",
            color: "var(--edu-navy)",
            fontStyle: "italic",
            marginBottom: "0.4rem",
          }}>
            {step.subtitle}
          </p>
          <p>{step.description}</p>
        </div>
      ))}
    </div>
  );
}
