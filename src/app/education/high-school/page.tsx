import type { Metadata } from "next";
import HighSchoolClient from "./HighSchoolClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/education/json-ld";

const BASE = "https://osakacastletours.com/education/high-school";
const IMG = "https://osakacastletours.com/images/new_kofun.webp";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "High School — Historical Inquiry at Osaka Castle",
    description:
      "History field investigations for high school students at Osaka Castle. Designed for Rekishiso, Nihonshi Tankyu, and inquiry-based learning. IB and AP supported.",
    openGraph: {
      title: "High School — Historical Inquiry at Osaka Castle",
      description:
        "History field investigations for high school students at Osaka Castle. Rekishiso, Nihonshi Tankyu, IB, and AP.",
      url: BASE,
      siteName: "Osaka Castle Walks with Edward",
      locale: "en_US",
      type: "website",
      images: [{ url: IMG, width: 1536, height: 1024 }],
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
  titleEn: "High School — Historical Inquiry at Osaka Castle",
  titleJa: "高校 — 大阪城での歴史探究",
  descriptionEn:
    "History field investigations for high school students at Osaka Castle.",
  descriptionJa:
    "高校生向け歴史フィールド探究 — 歴史総合、日本史探究に対応。",
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
      name: "High School",
      nameJa: "高校",
      url: BASE,
    },
  ],
});

export default function HighSchoolPage() {
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
      <HighSchoolClient />
    </>
  );
}
