import type { Metadata } from "next";
import HighSchoolClient from "./HighSchoolClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/education/json-ld";

const SITE = "https://osakacastletours.com";
const IMG = `${SITE}/images/new_kofun.webp`;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const locale = params?.locale === "ja" ? "ja" : "en";
  const BASE =
    locale === "ja"
      ? `${SITE}/ja/education/high-school`
      : `${SITE}/education/high-school`;

  if (locale === "ja") {
    return {
      title: "高校 — 大阪城での歴史探究",
      description:
        "高校生向け歴史フィールド探究 — 歴史総合、日本史探究、探究に対応したカリキュラム連動型の探究形式。IB・AP対応。",
      openGraph: {
        title: "高校 — 大阪城での歴史探究",
        description:
          "高校生向け歴史フィールド探究 — 歴史総合、日本史探究に対応。",
        url: BASE,
        siteName: "大阪城ウォークス with Edward",
        locale: "ja_JP",
        type: "website",
        images: [{ url: IMG, width: 1536, height: 1024 }],
      },
      alternates: {
        canonical: BASE,
        languages: {
          en: `${SITE}/education/high-school`,
          ja: BASE,
        },
      },
    };
  }

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
        en: BASE,
        ja: `${SITE}/ja/education/high-school`,
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
  url: `${SITE}/education/high-school`,
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
      name: "High School",
      nameJa: "高校",
      url: `${SITE}/education/high-school`,
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
