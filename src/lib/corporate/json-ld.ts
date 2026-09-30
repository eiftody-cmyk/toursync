import { EDWARD, type Locale } from "@/lib/education/json-ld";

const SITE = "https://osakacastletours.com";

// Cross-page entity references: these @ids are defined by the static site
// (public/index.html). Referencing them joins the corporate page to the main
// LocalBusiness/WebSite knowledge graph instead of creating parallel entities.
const BUSINESS_ID = `${SITE}/#business`; // LocalBusiness in public/index.html
const WEBSITE_ID = `${SITE}/#website`; // WebSite in public/index.html

type BreadcrumbItem = { name: string; nameJa: string; url: string; urlJa: string };
type FaqItem = { question: string; answer: string };
type Tier = { size: string; sizeJa: string; price: string };

export function buildCorporateGraphJsonLd(opts: {
  titleEn: string;
  titleJa: string;
  descriptionEn: string;
  descriptionJa: string;
  url: string;
  urlJa: string;
  locale?: Locale;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  datePublished?: string;
  dateModified?: string;
  breadcrumb: BreadcrumbItem[];
  faq: FaqItem[];
  tiers: Tier[];
}) {
  const ja = opts.locale === "ja";
  const canonicalUrl = ja ? opts.urlJa : opts.url;
  const pageTitle = ja ? opts.titleJa : opts.titleEn;
  const pageDescription = ja ? opts.descriptionJa : opts.descriptionEn;
  const webpageId = `${canonicalUrl}#webpage`;
  const faqId = `${canonicalUrl}#faq`;
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const serviceId = `${canonicalUrl}#service`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE}/`,
        name: "Osaka Castle Walks with Edward",
        publisher: { "@id": BUSINESS_ID },
      },
      {
        "@type": "WebPage",
        "@id": webpageId,
        name: pageTitle,
        description: pageDescription,
        url: canonicalUrl,
        inLanguage: ja ? "ja" : "en",
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": BUSINESS_ID },
        author: EDWARD,
        breadcrumb: { "@id": breadcrumbId },
        mainEntity: { "@id": faqId },
        datePublished: opts.datePublished || "2026-09-28",
        dateModified: opts.dateModified || new Date().toISOString().split("T")[0],
        ...(opts.image
          ? {
              primaryImageOfPage: {
                "@type": "ImageObject",
                url: opts.image,
                ...(opts.imageWidth ? { width: opts.imageWidth } : {}),
                ...(opts.imageHeight ? { height: opts.imageHeight } : {}),
              },
            }
          : {}),
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name: pageTitle,
        description: pageDescription,
        url: canonicalUrl,
        serviceType: ja ? "法人向けチームビルディング体験" : "Corporate team-building experience",
        provider: { "@id": BUSINESS_ID },
        areaServed: { "@type": "City", name: "Osaka" },
        availableLanguage: ["en", "ja"],
        audience: {
          "@type": "Audience",
          audienceType: ja ? "法人グループ" : "Corporate groups",
        },
        offers: opts.tiers.map((tier) => ({
          "@type": "Offer",
          name: ja ? tier.sizeJa : tier.size,
          price: tier.price.replace(/[^\d]/g, ""),
          priceCurrency: "JPY",
          availability: "https://schema.org/InStock",
          url: `${canonicalUrl}#inquiry-form`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        inLanguage: ja ? "ja" : "en",
        itemListElement: opts.breadcrumb.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: ja ? item.nameJa : item.name,
          item: ja ? item.urlJa : item.url,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": faqId,
        inLanguage: ja ? "ja" : "en",
        mainEntityOfPage: { "@id": webpageId },
        mainEntity: opts.faq.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}
