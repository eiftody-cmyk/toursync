import type { Metadata } from "next";
import EducationHubClient from "./EducationHubClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/education/json-ld";

const BASE = "https://osakacastletours.com/education";
const IMG = "https://osakacastletours.com/images/toyotomihideyoshi.webp";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Osaka History Investigations — Field Seminars for Schools",
    description:
      "Historian-led field investigations at Osaka Castle for junior high, high school, and university students. Curriculum-aligned inquiry-based learning with Edward Iftody.",
    openGraph: {
      title: "Osaka History Investigations — Field Seminars for Schools",
      description:
        "Historian-led field investigations at Osaka Castle for junior high, high school, and university students.",
      url: BASE,
      siteName: "Osaka Castle Walks with Edward",
      locale: "en_US",
      type: "website",
      images: [{ url: IMG, width: 1408, height: 768 }],
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
  titleEn: "Osaka History Investigations — Field Seminars for Schools",
  titleJa: "大阪歴史フィールド探究 — 学校向けフィールドセミナー",
  descriptionEn:
    "Historian-led field investigations at Osaka Castle for junior high, high school, and university students.",
  descriptionJa:
    "歴史家が指導する大阪城でのフィールド探究。中学校・高等学校・大学のカリキュラムに連動した探究型学習。",
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
      url: BASE,
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
      "コーチ向けブリーフィング、生徒用事前読物、語彙サポート、学習目標、フィールド探究、全体討議、歴史家による証拠に基づく解釈、教師向けフォローアップ教材、訪問後コンパニオンが含まれます。",
  },
  {
    question: "予約方法は？",
    answer:
      "ウェブサイトの依頼フォームからお申し込みください。カリキュラムの内容を確認し、2営業日以内に探究の概要をご提案いたします。",
  },
]);

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
      <EducationHubClient />
    </>
  );
}
