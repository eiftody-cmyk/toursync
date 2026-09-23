import type { Metadata } from "next";
import JuniorHighClient from "./JuniorHighClient";
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
const IMG = `${SITE}/images/yododonohideyori.webp`;

function getLocale(params: { locale?: string }): Locale {
  return params?.locale === "ja" ? "ja" : "en";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const locale = getLocale(await searchParams);
  const BASE = pageUrl("/education/junior-high", locale);

  if (locale === "ja") {
    return {
      title: "中学校 — 大阪歴史フィールド探究",
      description:
        "中学生向けのカリキュラム接続型フィールド探究。社会科の内容と接続（戦国・秀吉・徳川・明治）。構造化された英語運用の機会付き。",
      openGraph: {
        title: "中学校 — 大阪歴史フィールド探究",
        description:
"中学生向けのカリキュラム接続型フィールド探究。社会科の内容と接続（戦国・秀吉・徳川・明治）。構造化された英語運用の機会付き。",
        url: BASE,
        siteName: "大阪城ウォークス with Edward",
        locale: "ja_JP",
        type: "website",
        images: [{ url: IMG, width: 2588, height: 1238 }],
      },
      twitter: {
        card: "summary_large_image",
        title: "中学校 — 大阪歴史フィールド探究",
        description: "中学生向けのカリキュラム接続型フィールド探究。",
        images: [IMG],
      },
      alternates: {
        canonical: BASE,
        languages: {
          en: `${SITE}/education/junior-high`,
          ja: BASE,
          "x-default": `${SITE}/education/junior-high`,
        },
      },
    };
  }

  return {
    title: "Junior High — Osaka History Field Investigations",
    description:
      "Curriculum-aligned history field investigations for junior high school students at Osaka Castle. Social studies, Sengoku period, and inquiry-based learning.",
    openGraph: {
      title: "Junior High — Osaka History Field Investigations",
      description:
        "Curriculum-aligned history field investigations for junior high school students at Osaka Castle.",
      url: BASE,
      siteName: "Osaka Castle Walks with Edward",
      locale: "en_US",
      type: "website",
      images: [{ url: IMG, width: 2588, height: 1238 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Junior High — Osaka History Field Investigations",
      description:
        "Curriculum-aligned history field investigations for junior high school students at Osaka Castle.",
      images: [IMG],
    },
    alternates: {
      canonical: BASE,
      languages: {
        en: BASE,
        ja: `${SITE}/ja/education/junior-high`,
        "x-default": BASE,
      },
    },
  };
}

export default async function JuniorHighPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const locale = getLocale(await searchParams);
  const content = locale === "ja" ? jaContent : en;

  const articleJsonLd = buildArticleJsonLd({
    titleEn: "Junior High — Osaka History Field Investigations",
    titleJa: "中学校 — 大阪歴史フィールド探究",
    descriptionEn:
      "Curriculum-aligned history field investigations for junior high school students at Osaka Castle.",
    descriptionJa:
      "中学生向けのカリキュラム接続型フィールド探究。社会科の内容と接続（戦国・秀吉・徳川・明治）。構造化された英語運用の機会付き。",
    url: `${SITE}/education/junior-high`,
    urlJa: `${SITE}/ja/education/junior-high`,
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
        name: "Junior High",
        nameJa: "中学校",
        url: `${SITE}/education/junior-high`,
        urlJa: `${SITE}/ja/education/junior-high`,
      },
    ],
  });

  const faqJsonLd = buildFaqJsonLd(
    content.juniorHigh.faq.map((f) => ({
      question: f.q,
      answer: f.a,
    }))
  );

  const courseJsonLd = buildCourseJsonLd({
    name: "Junior High Osaka History Field Investigation",
    nameJa: "中学生向け大阪歴史フィールド探究",
    description:
      "Curriculum-aligned history field investigations for junior high school students at Osaka Castle, led by historian Edward Iftody.",
    descriptionJa:
      "歴史家イフトウデイ　エドワードが指導する中学生向けのカリキュラム接続型フィールド探究。",
    url: `${SITE}/education/junior-high`,
    urlJa: `${SITE}/ja/education/junior-high`,
    locale,
    lowPrice: "50000",
    highPrice: "95000",
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
      <JuniorHighClient />
    </>
  );
}