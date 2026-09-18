import type { Metadata } from "next";
import EducationHubClient from "./EducationHubClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/education/json-ld";

const SITE = "https://osakacastletours.com";
const IMG = `${SITE}/images/toyotomihideyoshi.webp`;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const locale = params?.locale === "ja" ? "ja" : "en";
  const BASE =
    locale === "ja" ? `${SITE}/ja/education` : `${SITE}/education`;

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
      alternates: {
        canonical: BASE,
        languages: {
          en: `${SITE}/education`,
          ja: BASE,
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
    alternates: {
      canonical: BASE,
      languages: {
        en: BASE,
        ja: `${SITE}/ja/education`,
      },
    },
  };
}

const articleJsonLd = buildArticleJsonLd({
  titleEn: "Osaka History Investigations — Structured Historical Investigations for Schools",
  titleJa: "大阪歴史フィールド探究 — 学校向けフィールドセミナー",
  descriptionEn:
    "Structured historical investigations at Osaka Castle for junior high, high school, and university students. Designed by a historian and experienced educator.",
  descriptionJa:
    "歴史家が指導する大阪城でのフィールド探究。中学校・高等学校・大学のカリキュラムに連動した探究型学習。",
  url: `${SITE}/education`,
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
  ],
});

const faqJsonLd = buildFaqJsonLd([
  {
    question: "What is a field investigation at Osaka Castle?",
    answer:
      "A historian-led educational session at Osaka Castle where students examine primary sources, ask historical questions, and develop interpretations — not a guided tour.",
  },
  {
    question: "大阪城でのフィールド探究とは何ですか？",
    answer:
      "歴史家が指導する大阪城での教育セッションです。一次資料の観察、歴史的問いの設定、解釈の構築を行います。観光ツアーではありません。",
  },
  {
    question: "何年生が対象ですか？",
    answer:
      "中学校・高等学校・大学の全レベルに対応しています。カリキュラムに合わせて探究をカスタマイズします。",
  },
  {
    question: "1回のセッションはどのくらいですか？",
    answer:
      "90分、120分、または150分の3つのフォーマットがあります。学校のスケジュールに合わせて調整可能です。",
  },
  {
    question: "英語で行いますか？",
    answer:
      "英語、日本語、バイリンガルのいずれかを選択できます。英語の語彙サポートも含まれています。",
  },
  {
    question: "テーマをカスタマイズできますか？",
    answer:
      "はい。あなたのカリキュラム、生徒のレベル、探究したい問いに合わせてカスタマイズします。",
  },
  {
    question: "料金に何が含まれますか？",
    answer:
      "コーチ向けブリーフィング、生徒用事前読物、語彙サポート、学習目標、フィールド探究、全体討議、歴史家による証拠に基づく解釈、教師向けフォローアップ教材、デジタル調査コンパニオンが含まれます。上位プランには追加の探究活動、一次資料、評価教材が含まれます。",
  },
  {
    question: "予約方法は？",
    answer:
      "ウェブサイトの依頼フォームからお申し込みください。カリキュラムの内容を確認し、2営業日以内に探究の概要をご提案いたします。",
  },
]);

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Book a Field Investigation",
  description:
    "Step-by-step process for schools to book a historical field investigation at Osaka Castle.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Tell us what you are teaching",
      text: "Share your course, unit, student level, class size, and learning objectives.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Choose your field format",
      text: "Select from 90-minute Standard (3 investigations), 120-minute Extended (4 investigations), or 150-minute Full (5 investigations).",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Develop the historical question together",
      text: "Edward adapts the investigation to your curriculum and students. A proposed outline is delivered within 2 business days.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Students investigate Osaka",
      text: "Students examine the landscape, consider the evidence, debate competing interpretations, and defend their own conclusions.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Continue in the classroom",
      text: "Receive a Digital Investigation Companion with post-visit materials, discussion prompts, and assessment options.",
    },
  ],
};

export default function EducationPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLd),
        }}
      />
      <EducationHubClient />
    </>
  );
}
