import type { Metadata } from "next";
import HighSchoolClient from "./HighSchoolClient";
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
const IMG = `${SITE}/images/new_kofun.webp`;

function getLocale(params: { locale?: string }): Locale {
  return params?.locale === "ja" ? "ja" : "en";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const locale = getLocale(await searchParams);
  const BASE = pageUrl("/education/high-school", locale);

  if (locale === "ja") {
    return {
      title: "高校 — 大阪歴史フィールド探究",
      description:
        "高校生向けフィールド探究 — 歴史総合・日本史探究・探究の時間に対応したカリキュラム接続型のフィールド探究。IB・AP対応。",
      openGraph: {
        title: "高校 — 大阪歴史フィールド探究",
        description:
          "高校生向けフィールド探究 — 歴史総合・日本史探究に対応。",
        url: BASE,
        siteName: "大阪城ウォークス with イフトウデイ　エドワード",
        locale: "ja_JP",
        type: "website",
        images: [{ url: IMG, width: 1536, height: 1024 }],
      },
      twitter: {
        card: "summary_large_image",
        title: "高校 — 大阪歴史フィールド探究",
        description: "高校生向けフィールド探究 — 歴史総合・日本史探究に対応。",
        images: [IMG],
      },
      alternates: {
        canonical: BASE,
        languages: {
          en: `${SITE}/education/high-school`,
          ja: BASE,
          "x-default": `${SITE}/education/high-school`,
        },
      },
    };
  }

  return {
    title: "High School — Historical Inquiry at Osaka Castle",
    description:
      "History field investigations for high school students at Osaka Castle. Designed for Rekishiso, Nihonshi Tankyu, and inquiry-based learning. IB and AP supported.",
    openGraph: {
      title: "High School — Historical Inquiry at Osaka Castle",
      description:
        "History field investigations for high school students at Osaka Castle. Rekishiso, Nihonshi Tankyu, IB, and AP.",
      url: BASE,
      siteName: "Osaka Castle Walks with Edward",
      locale: "en_US",
      type: "website",
      images: [{ url: IMG, width: 1536, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "High School — Historical Inquiry at Osaka Castle",
      description:
        "History field investigations for high school students at Osaka Castle.",
      images: [IMG],
    },
    alternates: {
      canonical: BASE,
      languages: {
        en: BASE,
        ja: `${SITE}/ja/education/high-school`,
        "x-default": BASE,
      },
    },
  };
}

export default async function HighSchoolPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const locale = getLocale(await searchParams);
  const content = locale === "ja" ? jaContent : en;

  const articleJsonLd = buildArticleJsonLd({
    titleEn: "High School — Historical Inquiry at Osaka Castle",
    titleJa: "高校 — 大阪歴史フィールド探究",
    descriptionEn:
      "History field investigations for high school students at Osaka Castle.",
    descriptionJa:
      "高校生向けフィールド探究 — 歴史総合・日本史探究に対応。",
    url: `${SITE}/education/high-school`,
    urlJa: `${SITE}/ja/education/high-school`,
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
        name: "High School",
        nameJa: "高校",
        url: `${SITE}/education/high-school`,
        urlJa: `${SITE}/ja/education/high-school`,
      },
    ],
  });

  const faqJsonLd = buildFaqJsonLd(
    content.highSchool.faq.map((f) => ({
      question: f.q,
      answer: f.a,
    }))
  );

  const courseJsonLd = buildCourseJsonLd({
    name: "High School Osaka History Field Investigation",
    nameJa: "高校生向け大阪歴史フィールド探究",
    description:
      "History field investigations for high school students at Osaka Castle, designed for Rekishiso, Nihonshi Tankyu, and inquiry-based learning.",
    descriptionJa:
      "歴史総合、日本史探究、探究に対応した高校生向けの大阪城での歴史フィールド探究。",
    url: `${SITE}/education/high-school`,
    urlJa: `${SITE}/ja/education/high-school`,
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
      <HighSchoolClient />
    </>
  );
}