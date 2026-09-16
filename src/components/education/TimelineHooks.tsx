"use client";

import { useLocale } from "@/lib/education/language-context";
import {
  educationTimelineLinks,
  type TimelineLink,
} from "@/lib/education/timeline-links";

interface TimelineHooksProps {
  themes: string[];
  title?: string;
  titleJa?: string;
  limit?: number;
}

export function TimelineHooks({
  themes,
  title,
  titleJa,
  limit = 6,
}: TimelineHooksProps) {
  const { locale } = useLocale();

  const links = educationTimelineLinks
    .filter((link) => themes.some((t) => link.relevantThemes.includes(t)))
    .slice(0, limit);

  if (links.length === 0) return null;

  return (
    <div className="timeline-hooks">
      <h3>
        {locale === "ja"
          ? titleJa || "証拠を探究する"
          : title || "Explore the Evidence"}
      </h3>
      <div className="timeline-hook-list">
        {links.map((link) => (
          <a
            key={link.slug}
            href={locale === "ja" ? `/ja/${link.slug}.html` : `/${link.slug}.html`}
            className="timeline-hook-card"
          >
            <span className="timeline-hook-period">
              {locale === "ja" ? link.periodJa : link.period}
            </span>
            <div>
              <h4>{locale === "ja" ? link.titleJa : link.titleEn}</h4>
              <p>
                {locale === "ja" ? link.descriptionJa : link.descriptionEn}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
