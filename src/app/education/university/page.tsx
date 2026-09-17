import type { Metadata } from "next";
import UniversityClient from "./UniversityClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/education/json-ld";

const BASE = "https://osakacastletours.com/education/university";
const IMG = "https://osakacastletours.com/images/empress-shotoku.webp";

export async function generateMetadata(): Promise<Metadata> {
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
        "en": BASE,
        "ja": BASE,
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
      name: "University",
      nameJa: "大学",
      url: BASE,
    },
  ],
});

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
      <UniversityClient />
    </>
  );
}
