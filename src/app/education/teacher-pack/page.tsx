import type { Metadata } from "next";
import TeacherPackClient from "./TeacherPackClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/education/json-ld";

const BASE = "https://osakacastletours.com/education/teacher-pack";
const IMG = "https://osakacastletours.com/images/sanadacharge.webp";

export async function generateMetadata(): Promise<Metadata> {
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
        "en": BASE,
        "ja": BASE,
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
      name: "Sample Lesson",
      nameJa: "授業見本",
      url: BASE,
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
