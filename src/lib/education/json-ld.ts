const SITE = "https://osakacastletours.com";
const AUTHOR = {
  "@type": "Person",
  name: "Edward Iftody",
  url: `${SITE}/aboutme`,
  jobTitle: "Historian, Educator & Course Developer",
};
const PUBLISHER = {
  "@type": "Organization",
  name: "Osaka History Investigations",
  url: `${SITE}/education`,
};

export function buildArticleJsonLd(opts: {
  titleEn: string;
  titleJa: string;
  descriptionEn: string;
  descriptionJa: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.titleEn,
    alternateHeadline: opts.titleJa,
    description: opts.descriptionEn,
    url: opts.url,
    inLanguage: ["en", "ja"],
    author: AUTHOR,
    publisher: PUBLISHER,
    datePublished: opts.datePublished || "2026-01-01",
    dateModified: opts.dateModified || new Date().toISOString().split("T")[0],
    ...(opts.image ? { image: opts.image } : {}),
  };
}

export function buildBreadcrumbJsonLd(opts: {
  items: Array<{ name: string; nameJa: string; url: string }>;
  locale?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: opts.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: opts.locale === "ja" ? item.nameJa : item.name,
      item: item.url,
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
