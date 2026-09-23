import type { Metadata } from "next";
import UniversityClient from "./UniversityClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildCourseJsonLd,
  buildFaqJsonLd,
  jsonLd,
  pageUrl,
  type Locale,
} from "@/lib/education/json-ld";
import { en } from "@/lib/education/content";
import { ja as jaContent } from "@/lib/education/content-ja";

const SITE = "https://osakacastletours.com";
const IMG = `${SITE}/images/empress-shotoku.webp`;

function getLocale(params: { locale?: string }): Locale {
  return params?.locale === "ja" ? "ja" : "en";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const locale = getLocale(await searchParams);
  const BASE = pageUrl("/education/university", locale);

  if (locale === "ja") {
    return {
      title: "大学フィールドセミナー — 大阪の歴史と考古学",
      description:
        "歴史家イフトウデイ　エドワードが率いる大阪城での大学フィールドゼミ。歴史・考古学・歴史地理学・政治学のフィールドワーク。一次史料・二次史料の分析。",
      openGraph: {
        title: "大学フィールドセミナー — 大阪の歴史と考古学",
        description:
          "歴史家が率いる大阪城での大学フィールドゼミ。",
        url: BASE,
        siteName: "大阪城ウォークス with Edward",
        locale: "ja_JP",
        type: "website",
        images: [{ url: IMG, width: 1672, height: 941 }],
      },
      twitter: {
        card: "summary_large_image",
        title: "大学フィールドセミナー — 大阪の歴史と考古学",
        description: "歴史家が率いる大阪城での大学フィールドゼミ。",
        images: [IMG],
      },
      alternates: {
        canonical: BASE,
        languages: {
          en: `${SITE}/education/university`,
          ja: BASE,
          "x-default": `${SITE}/education/university`,
        },
      },
    };
  }

  return {
    title: "University Field Seminars — Osaka History & Archaeology",
    description:
      "Mobile university seminars at Osaka Castle led by historian Edward Iftody. History, archaeology, historical geography, and political science fieldwork.",
    openGraph: {
      title: "University Field Seminars — Osaka History & Archaeology",
      description:
        "Mobile university seminars at Osaka Castle led by historian Edward Iftody.",
      url: BASE,
      siteName: "Osaka Castle Walks with Edward",
      locale: "en_US",
      type: "website",
      images: [{ url: IMG, width: 1672, height: 941 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "University Field Seminars — Osaka History & Archaeology",
      description:
        "Mobile university seminars at Osaka Castle led by historian Edward Iftody.",
      images: [IMG],
    },
    alternates: {
      canonical: BASE,
      languages: {
        en: BASE,
        ja: `${SITE}/ja/education/university`,
        "x-default": BASE,
      },
    },
  };
}

export default async function UniversityPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const locale = getLocale(await searchParams);
  const content = locale === "ja" ? jaContent : en;

  const articleJsonLd = buildArticleJsonLd({
    titleEn: "University Field Seminars — Osaka History & Archaeology",
    titleJa: "大学フィールドセミナー — 大阪の歴史と考古学",
    descriptionEn:
      "Mobile university seminars at Osaka Castle led by historian Edward Iftody.",
    descriptionJa:
      "歴史家が率いる大阪城での大学フィールドゼミ。歴史、考古学、歴史地理学、政治学の野外調査。",
    url: `${SITE}/education/university`,
    urlJa: `${SITE}/ja/education/university`,
    image: IMG,
    locale,
    datePublished: "2026-09-01",
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    locale,
    items: [
      {
        name: "Home",
        nameJa: "ホーム",
        url: SITE,
        urlJa: `${SITE}/ja/education`,
      },
      {
        name: "Osaka History Investigations",
        nameJa: "大阪歴史フィールド探究",
        url: `${SITE}/education`,
        urlJa: `${SITE}/ja/education`,
      },
      {
        name: "University",
        nameJa: "大学",
        url: `${SITE}/education/university`,
        urlJa: `${SITE}/ja/education/university`,
      },
    ],
  });

  const faqJsonLd = buildFaqJsonLd(
    content.university.faq.map((f) => ({
      question: f.q,
      answer: f.a,
    }))
  );

  const courseJsonLd = buildCourseJsonLd({
    name: "University Field Seminar at Osaka Castle",
    nameJa: "大阪城大学フィールドセミナー",
    description:
      "Mobile university seminars at Osaka Castle led by historian Edward Iftody across history, archaeology, historical geography, and political science.",
    descriptionJa:
      "歴史家イフトウデイ　エドワードが率いる大阪城での大学フィールドゼミ。歴史・考古学・歴史地理学・政治学。",
    url: `${SITE}/education/university`,
    urlJa: `${SITE}/ja/education/university`,
    locale,
    lowPrice: "50000",
    highPrice: "140000",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(courseJsonLd) }}
      />
      <UniversityClient />
    </>
  );
}