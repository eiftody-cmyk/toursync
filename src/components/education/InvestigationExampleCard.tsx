"use client";

import { useState } from "react";
import { useLocale } from "@/lib/education/language-context";
import type { InvestigationExample } from "@/lib/education/examples";

interface InvestigationExampleCardProps {
  example: InvestigationExample;
}

export function InvestigationExampleCard({ example }: InvestigationExampleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { locale } = useLocale();

  return (
    <div
      className={`example-card ${expanded ? "expanded" : ""}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="example-card-header">
        <div>
          <div className="example-card-meta">
            <span className="badge level">
              {locale === "ja" ? example.levelLabelJa : example.levelLabel}
            </span>
            <span className="badge period">
              {locale === "ja" ? example.subjectJa : example.subject}
            </span>
          </div>
          <h3>{locale === "ja" ? example.titleJa : example.title}</h3>
          <p className="angle">
            {locale === "ja" ? example.angleJa : example.angle}
          </p>
        </div>
        <button
          className="example-card-expand"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded
            ? locale === "ja"
              ? "閉じる ▲"
              : "Close ▲"
            : locale === "ja"
              ? "詳細を見る ▼"
              : "View Details ▼"}
        </button>
      </div>

      {expanded && (
        <div className="example-card-body">
          <div className="example-section">
            <h4>{locale === "ja" ? "探究の問い" : "Socratic Question"}</h4>
            <p>{locale === "ja" ? example.questionJa : example.question}</p>
          </div>

          <div className="example-section">
            <h4>{locale === "ja" ? "訪問する場所" : "Sites Visited"}</h4>
            <ul>
              {(locale === "ja" ? example.sitesJa : example.sites).map(
                (site, i) => (
                  <li key={i}>{site}</li>
                )
              )}
            </ul>
          </div>

          <div className="example-section">
            <h4>{locale === "ja" ? "生徒の発見" : "What Students Discovered"}</h4>
            <p>
              {locale === "ja" ? example.discoveryJa : example.discovery}
            </p>
          </div>

          <div className="example-feedback">
            &ldquo;{locale === "ja" ? example.feedbackJa : example.feedback}&rdquo;
          </div>
        </div>
      )}
    </div>
  );
}
