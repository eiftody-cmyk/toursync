import type { Metadata } from "next";
import JuniorHighClient from "./JuniorHighClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/education/json-ld";

const SITE = "https://osakacastletours.com";
const IMG = `${SITE}/images/yododonohideyori.webp`;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const locale = params?.locale === "ja" ? "ja" : "en";
  const BASE =
    locale === "ja"
      ? `${SITE}/ja/education/junior-high`
      : `${SITE}/education/junior-high`;

  if (locale === "ja") {
    return {
      title: "中学校 — 大阪歴史フィールド探究",
      description:
        "中学生向けのカリキュラム連動型歴史フィールド探究。社会科の内容と連動（戦国、秀吉、徳川、明治）。構造化された英語練習付き。",
      openGraph: {
        title: "中学校 — 大阪歴史フィールド探究",
        description:
          "中学生向けのカリキュラム連動型歴史フィールド探究。",
        url: BASE,
        siteName: "大阪城ウォークス with Edward",
        locale: "ja_JP",
        type: "website",
        images: [{ url: IMG, width: 2588, height: 1238 }],
      },
      alternates: {
        canonical: BASE,
        languages: {
          en: `${SITE}/education/junior-high`,
          ja: BASE,
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
    alternates: {
      canonical: BASE,
      languages: {
        en: BASE,
        ja: `${SITE}/ja/education/junior-high`,
      },
    },
  };
}

const articleJsonLd = buildArticleJsonLd({
  titleEn: "Junior High — Osaka History Field Investigations",
  titleJa: "中学校 — 大阪歴史フィールド探究",
  descriptionEn:
    "Curriculum-aligned history field investigations for junior high school students at Osaka Castle.",
  descriptionJa:
    "中学生向けのカリキュラム連動型歴史フィールド探究。社会科の内容と連動。",
  url: `${SITE}/education/junior-high`,
  image: IMG,
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd({
  items: [
    { name: "Home", nameJa: "ホーム", url: SITE },
    {
      name: "Osaka History Investigations",
      nameJa: "大阪歴史フィールド探究",
      url: `${SITE}/education`,
    },
    {
      name: "Junior High",
      nameJa: "中学校",
      url: `${SITE}/education/junior-high`,
    },
  ],
});

export default function JuniorHighPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <JuniorHighClient />
    </>
  );
}
