import type { Metadata } from "next";
import { cookies } from "next/headers";
import ClientLayout from "./ClientLayout";
import "./education.css";

const SITE = "https://osakacastletours.com";

function getLocaleFromCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): "en" | "ja" {
  const localeCookie = cookieStore.get("edu-locale");
  return localeCookie?.value === "ja" ? "ja" : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore);

  if (locale === "ja") {
    return {
      title: {
        template: "%s | 大阪歴史フィールド探究",
        default: "大阪歴史フィールド探究 — 学校向けフィールドセミナー",
      },
      description:
        "歴史家が指導する大阪城でのフィールド探究。中学校・高等学校・大学のカリキュラムに連動した探究型学習。",
      openGraph: {
        title: "大阪歴史フィールド探究",
        description:
          "歴史家が指導する大阪城でのフィールド探究。学校・大学向け。",
        url: `${SITE}/ja/education`,
        siteName: "大阪城ウォークス with Edward",
        locale: "ja_JP",
        type: "website",
      },
      alternates: {
        canonical: `${SITE}/ja/education`,
        languages: {
          en: `${SITE}/education`,
          ja: `${SITE}/ja/education`,
          "x-default": `${SITE}/education`,
        },
      },
    };
  }

  return {
    title: {
      template: "%s | Osaka History Investigations",
      default:
        "Osaka History Investigations — Field Seminars for Schools",
    },
    description:
      "Historian-led field investigations at Osaka Castle for junior high, high school, and university students. Curriculum-aligned inquiry-based learning.",
    openGraph: {
      title: "Osaka History Investigations",
      description:
        "Historian-led field investigations at Osaka Castle for schools and universities.",
      url: `${SITE}/education`,
      siteName: "Osaka Castle Walks with Edward",
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: `${SITE}/education`,
      languages: {
        en: `${SITE}/education`,
        ja: `${SITE}/ja/education`,
        "x-default": `${SITE}/education`,
      },
    },
  };
}

export default async function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Osaka History Investigations",
    alternateName: [
      "大阪歴史フィールド探究",
      "大阪城フィールド探究",
      "歴史フィールド学習",
    ],
    url: `${SITE}/education`,
    logo: `${SITE}/images/osaka-history-investigations.webp`,
    description:
      "Historian-led field investigations at Osaka Castle for schools and universities. 歴史家が指導する大阪城でのフィールド探究。中学校・高等学校・大学のカリキュラムに連動した探究型学習。",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Osaka",
      addressCountry: "JP",
    },
    founder: {
      "@type": "Person",
      name: "Edward Iftody",
      url: `${SITE}/aboutme`,
      jobTitle: "Historian, Educator & Course Developer",
    },
    knowsAbout: [
      "大阪城",
      "豊臣秀吉",
      "徳川家康",
      "織田信長",
      "戦国時代",
      "歴史探究",
      "フィールド学習",
      "カリキュラム連動",
      "探究型学習",
      "難波宮",
      "上町台地",
      "四天王寺",
      "石山本願寺",
      "大坂の陣",
      "歴史総合",
      "日本史探究",
    ],
    areaServed: {
      "@type": "Country",
      name: "Japan",
    },
    availableLanguage: ["en", "ja"],
    sameAs: [
      "https://www.japantimes.co.jp/commentary/2026/07/22/japan/japan-new-imperial-house-law/",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ClientLayout locale={locale}>{children}</ClientLayout>
    </>
  );
}
