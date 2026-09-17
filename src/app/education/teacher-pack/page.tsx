import type { Metadata } from "next";
import TeacherPackClient from "./TeacherPackClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/education/json-ld";

const SITE = "https://osakacastletours.com";
const IMG = `${SITE}/images/sanadacharge.webp`;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const locale = params?.locale === "ja" ? "ja" : "en";
  const BASE =
    locale === "ja"
      ? `${SITE}/ja/education/teacher-pack`
      : `${SITE}/education/teacher-pack`;

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
      alternates: {
        canonical: BASE,
        languages: {
          en: `${SITE}/education/teacher-pack`,
          ja: BASE,
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
    alternates: {
      canonical: BASE,
      languages: {
        en: BASE,
        ja: `${SITE}/ja/education/teacher-pack`,
      },
    },
  };
}

const articleJsonLd = buildArticleJsonLd({
  titleEn: "Sample Lesson — Field Investigation in Action",
  titleJa: "授業見本 — フィールド探究の実際",
  descriptionEn:
    "Complete field investigation lesson plan for schools at Osaka Castle.",
  descriptionJa:
    "完全なフィールド探究の授業計画。秀吉、大阪城と政治的権力の例。",
  url: `${SITE}/education/teacher-pack`,
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
      name: "Sample Lesson",
      nameJa: "授業見本",
      url: `${SITE}/education/teacher-pack`,
    },
  ],
});

export default function TeacherPackPage() {
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
      <TeacherPackClient />
    </>
  );
}
