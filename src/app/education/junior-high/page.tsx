import type { Metadata } from "next";
import JuniorHighClient from "./JuniorHighClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
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

const faqJsonLd = buildFaqJsonLd([
  {
    question: "What curriculum does the junior high investigation connect to?",
    answer:
      "The investigation connects to Social Studies curriculum covering the Sengoku period, Hideyoshi, Tokugawa, and Meiji era. It maps to standard junior high history topics taught across Japan.",
  },
  {
    question: "Is the field investigation safe for junior high students?",
    answer:
      "Yes. The investigation follows a fixed route with no free-roaming. Students work in pairs and small groups with designated meeting points throughout.",
  },
  {
    question: "How long is the junior high session?",
    answer:
      "60 to 90 minutes, designed to fit within a standard school schedule.",
  },
  {
    question: "Do students need to speak English?",
    answer:
      "No. The investigation is available in Japanese, English, or bilingual format. English sessions include vocabulary scaffolding and mixed-level support.",
  },
  {
    question: "Is preparation required for teachers?",
    answer:
      "No advance preparation is required. All materials including teacher briefing, student pre-reading, and vocabulary support are provided.",
  },
  {
    question: "What does the price include?",
    answer:
      "Teacher briefing, student pre-reading, key vocabulary, learning objectives, field investigation at 2-3 historical sites, small-group inquiry, whole-class discussion, historian's evidence-based conclusion, and a digital Investigation Companion.",
  },
]);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <JuniorHighClient />
    </>
  );
}
