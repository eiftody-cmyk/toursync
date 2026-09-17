import type { Metadata } from "next";
import JuniorHighClient from "./JuniorHighClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/education/json-ld";

const BASE = "https://osakacastletours.com/education/junior-high";
const IMG = "https://osakacastletours.com/images/yododonohideyori.webp";

export async function generateMetadata(): Promise<Metadata> {
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
        "en": BASE,
        "ja": BASE,
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
  url: BASE,
  image: IMG,
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd({
  items: [
    {
      name: "Home",
      nameJa: "ホーム",
      url: "https://osakacastletours.com",
    },
    {
      name: "Osaka History Investigations",
      nameJa: "大阪歴史フィールド探究",
      url: "https://osakacastletours.com/education",
    },
    {
      name: "Junior High",
      nameJa: "中学校",
      url: BASE,
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
