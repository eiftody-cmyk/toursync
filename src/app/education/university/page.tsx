import type { Metadata } from "next";
import UniversityClient from "./UniversityClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/education/json-ld";

const SITE = "https://osakacastletours.com";
const IMG = `${SITE}/images/empress-shotoku.webp`;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const locale = params?.locale === "ja" ? "ja" : "en";
  const BASE =
    locale === "ja"
      ? `${SITE}/ja/education/university`
      : `${SITE}/education/university`;

  if (locale === "ja") {
    return {
      title: "大学フィールドセミナー — 大阪の歴史と考古学",
      description:
        "歴史家エドワード・イフティが率いる大阪城での大学フィールドゼミ。歴史、考古学、歴史地理学、政治学の野外調査。一次史料・二次史料の分析。",
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
      alternates: {
        canonical: BASE,
        languages: {
          en: `${SITE}/education/university`,
          ja: BASE,
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
    alternates: {
      canonical: BASE,
      languages: {
        en: BASE,
        ja: `${SITE}/ja/education/university`,
      },
    },
  };
}

const articleJsonLd = buildArticleJsonLd({
  titleEn: "University Field Seminars — Osaka History & Archaeology",
  titleJa: "大学フィールドセミナー — 大阪の歴史と考古学",
  descriptionEn:
    "Mobile university seminars at Osaka Castle led by historian Edward Iftody.",
  descriptionJa:
    "歴史家が率いる大阪城での大学フィールドゼミ。歴史、考古学、歴史地理学、政治学の野外調査。",
  url: `${SITE}/education/university`,
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
      name: "University",
      nameJa: "大学",
      url: `${SITE}/education/university`,
    },
  ],
});

const faqJsonLd = buildFaqJsonLd([
  {
    question: "What disciplines does the university seminar support?",
    answer:
      "The seminar supports history, archaeology, historical geography, political science, and related fields. Topics are customized to course objectives.",
  },
  {
    question: "How is the seminar structured?",
    answer:
      "The seminar follows a 4-step structure: Context (historical background), Investigation (site and source examination), Interpretation (argument development), and Historiography (scholarly debate).",
  },
  {
    question: "Can the seminar be customized for specific courses?",
    answer:
      "Yes. Each seminar is customized to the course objectives, student level, and specific historical questions the instructor wants to address.",
  },
  {
    question: "What materials are provided?",
    answer:
      "Pre-seminar materials including historical background, key vocabulary, and inquiry questions. Post-seminar materials including investigation guides and further reading.",
  },
]);

export default function UniversityPage() {
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
      <UniversityClient />
    </>
  );
}
