import { EDWARD, type Locale } from "@/lib/education/json-ld";

const SITE = "https://osakacastletours.com";

// The corporate product sits under the main brand, deliberately separate from
// the Osaka History Investigations school identity. Mirrors the Organization
// block in public/index.html (no @id — same as the static site).
const PUBLISHER = {
  "@type": "Organization",
  name: "Osaka Castle Walks with Edward",
  logo: {
    "@type": "ImageObject",
    url: `${SITE}/images/logo.webp`,
  },
};

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
    datePublished: opts.datePublished || "2026-09-28",
    dateModified: opts.dateModified || new Date().toISOString().split("T")[0],
    ...(opts.image ? { image: opts.image } : {}),
  };
}
