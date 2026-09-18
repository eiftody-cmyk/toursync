import type { Metadata } from "next";
import TeacherPackClient from "./TeacherPackClient";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
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

const faqJsonLd = buildFaqJsonLd([
  {
    question: "What does this sample lesson show?",
    answer:
      "This is a complete example of a field investigation lesson plan covering Hideyoshi, Osaka Castle, and political power. It includes learning objectives, inquiry questions, three site visits with investigation activities, and assessment examples.",
  },
  {
    question: "Can this lesson be adapted for my course?",
    answer:
      "Yes. This is an example. Every investigation is built around your curriculum, your students, and the question you want them to investigate.",
  },
  {
    question: "What assessment options are included?",
    answer:
      "The sample includes short-answer questions, source-analysis questions, and an essay prompt with suggested answers. Assessment materials can be customized for your school.",
  },
  {
    question: "What is included in every field lesson?",
    answer:
      "Coach briefing, customized learning objectives, student field workbook, Socratic investigation questions, source and evidence activities, vocabulary support, group discussion framework, post-lesson questions, quiz or test questions, essay prompts, and answer key with coach notes.",
  },
]);

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How a Field Investigation Works",
  description:
    "A step-by-step guide to how a historical field investigation at Osaka Castle is structured for schools.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Before the Visit",
      text: "Receive a coach briefing, student pre-reading materials, key vocabulary, and learning objectives tailored to your curriculum.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Site 1 — Historical Context",
      text: "At the first site, the historian explains the historical background, the evidence, and what students are looking at.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Site 2 — Investigation",
      text: "Students break into small groups with a Socratic question. They discuss, argue, and formulate an answer based on the evidence.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Site 3 — Evidence and Conclusion",
      text: "Each group presents their case. The historian reveals what contemporary sources, archaeology, and scholarship actually show.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "After the Visit",
      text: "Students and teachers receive a Digital Investigation Companion with photographs, historical recap, post-visit activities, and assessment materials.",
    },
  ],
};

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
      <TeacherPackClient />
    </>
  );
}
