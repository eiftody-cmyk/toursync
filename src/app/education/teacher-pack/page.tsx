import type { Metadata } from "next";
import TeacherPackClient from "./TeacherPackClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildLearningResourceJsonLd,
  jsonLd,
  pageUrl,
  type Locale,
} from "@/lib/education/json-ld";
import { en } from "@/lib/education/content";
import { ja as jaContent } from "@/lib/education/content-ja";

const SITE = "https://osakacastletours.com";
const IMG = `${SITE}/images/sanadacharge.webp`;

function getLocale(params: { locale?: string }): Locale {
  return params?.locale === "ja" ? "ja" : "en";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const locale = getLocale(await searchParams);
  const BASE = pageUrl("/education/teacher-pack", locale);

  if (locale === "ja") {
    return {
      title: "授業見本 — フィールド探究の実際",
      description:
        "完全なフィールド探究の授業計画。学習目標、探究の問い、地点訪問、評価の例、料金。秀吉、大阪城と政治的権力の例。",
      openGraph: {
        title: "授業見本 — フィールド探究の実際",
        description:
          "完全なフィールド探究の授業計画。秀吉、大阪城と政治的権力の例。",
        url: BASE,
        siteName: "大阪城ウォークス with Edward",
        locale: "ja_JP",
        type: "website",
        images: [{ url: IMG, width: 1536, height: 1024 }],
      },
      twitter: {
        card: "summary_large_image",
        title: "授業見本 — フィールド探究の実際",
        description: "完全なフィールド探究の授業計画。秀吉、大阪城と政治的権力の例。",
        images: [IMG],
      },
      alternates: {
        canonical: BASE,
        languages: {
          en: `${SITE}/education/teacher-pack`,
          ja: BASE,
          "x-default": `${SITE}/education/teacher-pack`,
        },
      },
    };
  }

  return {
    title: "Sample Lesson — Field Investigation in Action",
    description:
      "See a complete field investigation lesson plan: learning objectives, inquiry questions, site visits, assessment examples, and pricing for schools at Osaka Castle.",
    openGraph: {
      title: "Sample Lesson — Field Investigation in Action",
      description:
        "Complete field investigation lesson plan for schools at Osaka Castle.",
      url: BASE,
      siteName: "Osaka Castle Walks with Edward",
      locale: "en_US",
      type: "website",
      images: [{ url: IMG, width: 1536, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Sample Lesson — Field Investigation in Action",
      description:
        "Complete field investigation lesson plan for schools at Osaka Castle.",
      images: [IMG],
    },
    alternates: {
      canonical: BASE,
      languages: {
        en: BASE,
        ja: `${SITE}/ja/education/teacher-pack`,
        "x-default": BASE,
      },
    },
  };
}

export default async function TeacherPackPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const locale = getLocale(await searchParams);
  const content = locale === "ja" ? jaContent : en;

  const articleJsonLd = buildArticleJsonLd({
    titleEn: "Sample Lesson — Field Investigation in Action",
    titleJa: "授業見本 — フィールド探究の実際",
    descriptionEn:
      "Complete field investigation lesson plan for schools at Osaka Castle.",
    descriptionJa:
      "完全なフィールド探究の授業計画。秀吉、大阪城と政治的権力の例。",
    url: `${SITE}/education/teacher-pack`,
    urlJa: `${SITE}/ja/education/teacher-pack`,
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
        name: "Sample Lesson",
        nameJa: "授業見本",
        url: `${SITE}/education/teacher-pack`,
        urlJa: `${SITE}/ja/education/teacher-pack`,
      },
    ],
  });

  const faqJsonLd = buildFaqJsonLd(
    content.teacherPack.faq.map((f) => ({
      question: f.q,
      answer: f.a,
    }))
  );

  const learningResourceJsonLd = buildLearningResourceJsonLd({
    name: "Sample Field Investigation Lesson: Hideyoshi, Osaka Castle, and Political Power",
    nameJa: "フィールド探究 授業見本 — 秀吉、大阪城と政治的権力",
    description:
      "A complete field investigation lesson plan covering learning objectives, inquiry questions, three site visits with investigation activities, and assessment examples.",
    descriptionJa:
      "学習目標、探究の問い、3つの地点訪問と探究活動、評価の例を含む完全なフィールド探究の授業計画。",
    url: `${SITE}/education/teacher-pack`,
    urlJa: `${SITE}/ja/education/teacher-pack`,
    locale,
  });

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name:
      locale === "ja"
        ? "フィールド探究の進め方"
        : "How a Field Investigation Works",
    description:
      locale === "ja"
        ? "学校向けに大阪城での歴史フィールド探究がどのように構成されるかのステップバイステップのガイド。"
        : "A step-by-step guide to how a historical field investigation at Osaka Castle is structured for schools.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: locale === "ja" ? "訪問前" : "Before the Visit",
        text:
          locale === "ja"
            ? "カリキュラムに合わせた教師向けブリーフィング、生徒向け予習教材、重要語彙、学習目標を受け取ります。"
            : "Receive a teacher briefing, student pre-reading materials, key vocabulary, and learning objectives tailored to your curriculum.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name:
          locale === "ja" ? "地点1 — 歴史的背景" : "Site 1 — Historical Context",
        text:
          locale === "ja"
            ? "最初の地点で、歴史家が歴史的背景、証拠、生徒が見ているものを説明します。"
            : "At the first site, the historian explains the historical background, the evidence, and what students are looking at.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: locale === "ja" ? "地点2 — 探究" : "Site 2 — Investigation",
        text:
          locale === "ja"
            ? "生徒はソクラテス的問いを使って小グループに分かれ、証拠に基づいて議論し、解答を組み立てます。"
            : "Students break into small groups with a Socratic question. They discuss, argue, and formulate an answer based on the evidence.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name:
          locale === "ja"
            ? "地点3 — 証拠と結論"
            : "Site 3 — Evidence and Conclusion",
        text:
          locale === "ja"
            ? "各班が自説を発表します。歴史家が同時代史料・考古学・研究の実際を示します。"
            : "Each group presents their case. The historian reveals what contemporary sources, archaeology, and scholarship actually show.",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: locale === "ja" ? "訪問後" : "After the Visit",
        text:
          locale === "ja"
            ? "生徒と教師はデジタル探究コンパニオン（写真、歴史のまとめ、訪問後の活動、評価教材）を受け取ります。"
            : "Students and teachers receive a Digital Investigation Companion with photographs, historical recap, post-visit activities, and assessment materials.",
      },
    ],
  };

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
        dangerouslySetInnerHTML={{ __html: jsonLd(learningResourceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(howToJsonLd) }}
      />
      <TeacherPackClient />
    </>
  );
}