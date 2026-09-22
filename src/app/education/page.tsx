import type { Metadata } from "next";
import EducationHubClient from "./EducationHubClient";
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
const IMG = `${SITE}/images/toyotomihideyoshi.webp`;

function getLocale(params: { locale?: string }): Locale {
  return params?.locale === "ja" ? "ja" : "en";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const locale = getLocale(await searchParams);
  const BASE = pageUrl("/education", locale);

  if (locale === "ja") {
    return {
      title: "大阪歴史フィールド探究 — 学校向けフィールドセミナー",
      description:
        "歴史家エドワード・イフティが指導する大阪城でのフィールド探究。中学校・高等学校・大学のカリキュラムに連動した探究型学習。",
      openGraph: {
        title: "大阪歴史フィールド探究 — 学校向けフィールドセミナー",
        description:
          "歴史家が指導する大阪城でのフィールド探究。中学校・高等学校・大学向け。",
        url: BASE,
        siteName: "大阪城ウォークス with Edward",
        locale: "ja_JP",
        type: "website",
        images: [{ url: IMG, width: 1408, height: 768 }],
      },
      twitter: {
        card: "summary_large_image",
        title: "大阪歴史フィールド探究 — 学校向けフィールドセミナー",
        description:
          "歴史家が指導する大阪城でのフィールド探究。中学校・高等学校・大学向け。",
        images: [IMG],
      },
      alternates: {
        canonical: BASE,
        languages: {
          en: `${SITE}/education`,
          ja: BASE,
          "x-default": `${SITE}/education`,
        },
      },
    };
  }

  return {
    title: "Osaka History Investigations — Structured Historical Investigations for Schools",
    description:
      "Structured historical investigations at Osaka Castle for junior high, high school, and university students. Designed by a historian and experienced educator. Curriculum-aligned inquiry-based learning with Edward Iftody.",
    openGraph: {
      title: "Osaka History Investigations — Structured Historical Investigations for Schools",
      description:
        "Structured historical investigations at Osaka Castle for junior high, high school, and university students. Designed by a historian and experienced educator.",
      url: BASE,
      siteName: "Osaka Castle Walks with Edward",
      locale: "en_US",
      type: "website",
      images: [{ url: IMG, width: 1408, height: 768 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Osaka History Investigations — Structured Historical Investigations for Schools",
      description:
        "Structured historical investigations at Osaka Castle for schools and universities.",
      images: [IMG],
    },
    alternates: {
      canonical: BASE,
      languages: {
        en: BASE,
        ja: `${SITE}/ja/education`,
        "x-default": BASE,
      },
    },
  };
}

export default async function EducationPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const locale = getLocale(await searchParams);
  const content = locale === "ja" ? jaContent : en;

  const articleJsonLd = buildArticleJsonLd({
    titleEn: "Osaka History Investigations — Structured Historical Investigations for Schools",
    titleJa: "大阪歴史フィールド探究 — 学校向けフィールドセミナー",
    descriptionEn:
      "Structured historical investigations at Osaka Castle for junior high, high school, and university students. Curriculum-aligned inquiry-based learning.",
    descriptionJa:
      "歴史家が指導する大阪城でのフィールド探究。中学校・高等学校・大学のカリキュラムに連動した探究型学習。",
    url: `${SITE}/education`,
    urlJa: `${SITE}/ja/education`,
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
    ],
  });

  const faqJsonLd = buildFaqJsonLd(
    content.hub.problem.faq.map((f) => ({
      question: f.q,
      answer: f.a,
    }))
  );

  const courseJsonLd = buildCourseJsonLd({
    name: "Osaka History Field Investigations",
    nameJa: "大阪歴史フィールド探究",
    description:
      "Structured historical investigations at Osaka Castle for junior high, high school, and university students, led by historian Edward Iftody.",
    descriptionJa:
      "歴史家エドワード・イフティが指導する大阪城での構造化された歴史探究。中学校・高等学校・大学向け。",
    url: `${SITE}/education`,
    urlJa: `${SITE}/ja/education`,
    locale,
    lowPrice: "50000",
    highPrice: "140000",
  });

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name:
      locale === "ja"
        ? "フィールド探究の申し込み方法"
        : "How to Book a Field Investigation",
    description:
      locale === "ja"
        ? "学校が大阪城での歴史フィールド探究を申し込む流れ。"
        : "Step-by-step process for schools to book a historical field investigation at Osaka Castle.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name:
          locale === "ja"
            ? "教えている内容を教えてください"
            : "Tell us what you are teaching",
        text:
          locale === "ja"
            ? "コース、単元、生徒のレベル、クラスサイズ、学習目標を共有します。"
            : "Share your course, unit, student level, class size, and learning objectives.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name:
          locale === "ja" ? "現地形式を選択" : "Choose your field format",
        text:
          locale === "ja"
            ? "90分（探究3つ）、120分（探究4つ）、150分（探究5つ）から選択。"
            : "Select from 90-minute Standard (3 investigations), 120-minute Extended (4 investigations), or 150-minute Full (5 investigations).",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name:
          locale === "ja"
            ? "歴史的問いを一緒に設計"
            : "Develop the historical question together",
        text:
          locale === "ja"
            ? "カリキュラムと生徒に合わせて探究を調整。2営業日以内に概要を提案します。"
            : "Edward adapts the investigation to your curriculum and students. A proposed outline is delivered within 2 business days.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name:
          locale === "ja" ? "生徒が大阪を探究" : "Students investigate Osaka",
        text:
          locale === "ja"
            ? "景観を調べ、証拠を検討し、競合する解釈を議論し、自分たちの結論を弁護します。"
            : "Students examine the landscape, consider the evidence, debate competing interpretations, and defend their own conclusions.",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name:
          locale === "ja"
            ? "教室で続ける"
            : "Continue in the classroom",
        text:
          locale === "ja"
            ? "デジタル調査コンパニオンを受け取り、訪問後の教材、ディスカッションのプロンプト、評価オプションを活用。"
            : "Receive a Digital Investigation Companion with post-visit materials, discussion prompts, and assessment options.",
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
        dangerouslySetInnerHTML={{ __html: jsonLd(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(howToJsonLd) }}
      />
      <EducationHubClient />
    </>
  );
}