"use client";

import { useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/education/content";
import { ja } from "@/lib/education/content-ja";
import { educationTimelineLinks } from "@/lib/education/timeline-links";

export function InvestigationLayers() {
  const { locale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const list = t.investigations || [];

  if (list.length === 0) return null;

  const linkFor = (slug: string) =>
    educationTimelineLinks.find((l) => l.slug === slug);

  return (
    <section className="edu-section">
      <h2>
        {locale === "ja"
          ? "大阪城の下にある歴史の層"
          : "The Layers Beneath the Castle"}
      </h2>
      <p className="section-subtitle">
        {locale === "ja"
          ? "大阪城一つに、倉庫、宮殿、要塞、そして城 —— 700年以上にわたる権力の層が重なっています。それぞれの層を、実際の証拠から探究するのがフィールドレッスンです。"
          : "Beneath one castle lie the granaries, the palace, the fortress, and the castle itself — over seven hundred years of power stacked on a single plateau. Each layer is a field investigation in its own right."}
      </p>
      <div className="investigation-layers-grid">
        {list.map((block) => {
          const chronicle = linkFor(block.timelineSlugs[0]);
          return (
            <article key={block.slug} className="investigation-layer-card">
              <div className="investigation-layer-head">
                <span className="timeline-hook-period">
                  {locale === "ja" ? block.periodJa : block.period}
                </span>
                <h3>{locale === "ja" ? block.layerJa : block.layerEn}</h3>
              </div>
              <h4>{locale === "ja" ? block.titleJa : block.title}</h4>
              <p className="investigation-layer-question">
                {locale === "ja" ? block.questionJa : block.question}
              </p>
              <p className="investigation-layer-evidence">
                <strong>
                  {locale === "ja" ? "証拠：" : "Evidence: "}
                </strong>
                {locale === "ja" ? block.evidenceJa : block.evidence}
              </p>
              <p className="investigation-layer-why">
                <strong>
                  {locale === "ja" ? "なぜここで：" : "Why here: "}
                </strong>
                {locale === "ja" ? block.whyHereJa : block.whyHere}
              </p>
              {chronicle && (
                <div className="investigation-layer-links">
                  <a href={`https://osakacastletours.com/${locale === "ja" ? "ja/" : ""}${chronicle.slug}.html`}>
                    {locale === "ja"
                      ? `読み進める：${chronicle.titleJa} →`
                      : `Read: ${chronicle.titleEn} →`}
                  </a>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}