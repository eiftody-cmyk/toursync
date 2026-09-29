import type { Metadata } from "next";
import { cookies } from "next/headers";
import ClientLayout from "./ClientLayout";
import "../education/education.css";
import "./corporate.css";

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
        template: "%s | 大阪 法人向けチームビルディング",
        default: "法人向けチームビルディング：大阪の歴史的ジレンマ",
      },
      description:
        "大阪城での法人向けチームビルディング。実在する歴史的ジレンマを三つ用意し、チームで調査・議論・判断・投票します。10〜40名・グループ ¥200,000〜¥400,000。",
      openGraph: {
        title: "法人向けチームビルディング：大阪の歴史的ジレンマ",
        description:
          "実在する歴史的ジレンマを軸にした、法人向けのプライベートチームビルディング。10〜40名・グループ ¥200,000〜¥400,000。",
        url: `${SITE}/ja/corporate`,
        siteName: "大阪城ウォークス with イフトウデイ　エドワード",
        locale: "ja_JP",
        type: "website",
      },
      alternates: {
        canonical: `${SITE}/ja/corporate`,
        languages: {
          en: `${SITE}/corporate`,
          ja: `${SITE}/ja/corporate`,
          "x-default": `${SITE}/corporate`,
        },
      },
    };
  }

  return {
    title: {
      template: "%s | Osaka Castle Walks with Edward",
      default: "Corporate Team Building: Osaka's Historical Dilemmas",
    },
    description:
      "Private corporate team building at Osaka Castle: three real historical dilemmas to investigate, debate and vote on. 10–40 participants, ¥200,000–¥400,000.",
    openGraph: {
      title: "Corporate Team Building: Osaka's Historical Dilemmas",
      description:
        "Private corporate team building built on three real historical dilemmas — investigate, debate, decide, reveal, reassess, vote.",
      url: `${SITE}/corporate`,
      siteName: "Osaka Castle Walks with Edward",
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: `${SITE}/corporate`,
      languages: {
        en: `${SITE}/corporate`,
        ja: `${SITE}/ja/corporate`,
        "x-default": `${SITE}/corporate`,
      },
    },
  };
}

export default async function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore);

  return <ClientLayout locale={locale}>{children}</ClientLayout>;
}
