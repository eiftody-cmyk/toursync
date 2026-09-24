const SITE = "https://osakacastletours.com";

export type Locale = "en" | "ja";

// Shared entity @id references. The Person @id matches the static tour site's
// knowledge graph (https://osakacastletours.com/#edward-iftody) so the two
// codebases merge into one interconnected knowledge graph.
export const EDWARD_PERSON_ID = `${SITE}/#edward-iftody`;

export const EDWARD = {
  "@type": "Person",
  "@id": EDWARD_PERSON_ID,
  name: "Edward Iftody",
  alternateName: ["イフトウデイ　エドワード"],
  url: `${SITE}/aboutme`,
  sameAs: [
    `${SITE}/aboutme`,
    `${SITE}/education`,
    "https://www.japantimes.co.jp/commentary/2026/07/22/japan/japan-new-imperial-house-law/",
  ],
  jobTitle: "Historian, Educator & Course Developer",
};

export const EDUCATIONAL_ORG_ID = `${SITE}/education#organization`;

const PUBLISHER = {
  "@type": "EducationalOrganization",
  "@id": EDUCATIONAL_ORG_ID,
  name: "Osaka History Investigations",
  url: `${SITE}/education`,
};

export function pageUrl(path: string, locale: Locale): string {
  return locale === "ja" ? `${SITE}/ja${path}` : `${SITE}${path}`;
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildArticleJsonLd(opts: {
  titleEn: string;
  titleJa: string;
  descriptionEn: string;
  descriptionJa: string;
  url: string;
  urlJa: string;
  locale?: Locale;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const ja = opts.locale === "ja";
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: ja ? opts.titleJa : opts.titleEn,
    description: ja ? opts.descriptionJa : opts.descriptionEn,
    url: ja ? opts.urlJa : opts.url,
    inLanguage: opts.locale ? (ja ? "ja" : "en") : ["en", "ja"],
    author: EDWARD,
    publisher: PUBLISHER,
    datePublished: opts.datePublished || "2026-01-01",
    dateModified: opts.dateModified || new Date().toISOString().split("T")[0],
    ...(opts.image ? { image: opts.image } : {}),
  };
}

export function buildBreadcrumbJsonLd(opts: {
  items: Array<{ name: string; nameJa: string; url: string; urlJa: string }>;
  locale?: Locale;
}) {
  const ja = opts.locale === "ja";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: opts.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: ja ? item.nameJa : item.name,
      item: ja ? item.urlJa : item.url,
    })),
  };
}

export function buildFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildCourseJsonLd(opts: {
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  url: string;
  urlJa: string;
  locale?: Locale;
  lowPrice?: string;
  highPrice?: string;
}) {
  const ja = opts.locale === "ja";
  const canonicalUrl = ja ? opts.urlJa : opts.url;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${canonicalUrl}#course`,
    name: ja ? opts.nameJa : opts.name,
    description: ja ? opts.descriptionJa : opts.description,
    url: canonicalUrl,
    inLanguage: opts.locale ? (ja ? "ja" : "en") : ["en", "ja"],
    provider: EDUCATIONAL_ORG_ID,
    instructor: EDWARD,
    courseMode: "onsite",
    locationCreated: {
      "@type": "Place",
      name: "Osaka Castle",
      sameAs: [
        "https://www.wikidata.org/wiki/Q191854",
        "https://en.wikipedia.org/wiki/Osaka_Castle",
      ],
    },
    ...(opts.lowPrice && opts.highPrice
      ? {
          offers: {
            "@type": "AggregateOffer",
            lowPrice: opts.lowPrice,
            highPrice: opts.highPrice,
            priceCurrency: "JPY",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function buildLearningResourceJsonLd(opts: {
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  url: string;
  urlJa: string;
  locale?: Locale;
}) {
  const ja = opts.locale === "ja";
  const canonicalUrl = ja ? opts.urlJa : opts.url;
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": `${canonicalUrl}#resource`,
    name: ja ? opts.nameJa : opts.name,
    description: ja ? opts.descriptionJa : opts.description,
    url: canonicalUrl,
    inLanguage: opts.locale ? (ja ? "ja" : "en") : ["en", "ja"],
    learningResourceType: "Lesson Plan",
    provider: EDUCATIONAL_ORG_ID,
    author: EDWARD,
    educationalLevel:
      opts.locale === "ja" ? "高等学校, 大学" : "High School, University",
  };
}