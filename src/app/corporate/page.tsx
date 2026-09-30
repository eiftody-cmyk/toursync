import type { Metadata } from "next";
import CorporateClient from "./CorporateClient";
import { jsonLd, pageUrl, type Locale } from "@/lib/education/json-ld";
import { buildCorporateGraphJsonLd } from "@/lib/corporate/json-ld";
import { en } from "@/lib/corporate/content";
import { ja as jaContent } from "@/lib/corporate/content-ja";

const SITE = "https://osakacastletours.com";
const IMG = `${SITE}/images/azaiclanbetrayal.webp`;

const TITLE_EN = "Corporate Team Building: Osaka's Historical Dilemmas";
const TITLE_JA = "法人向けチームビルディング：大阪の歴史的ジレンマ";
const DESC_EN =
  "Private corporate team building at Osaka Castle: three real historical dilemmas to investigate, debate and vote on. 10–40 participants, ¥200,000–¥400,000.";
const DESC_JA =
  "大阪城での法人向けチームビルディング。実在する歴史的ジレンマを三つ用意し、チームで調査・議論・判断・投票します。10〜40名・1グループ ¥200,000〜¥400,000。";

function getLocale(params: { locale?: string }): Locale {
  return params?.locale === "ja" ? "ja" : "en";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const locale = getLocale(await searchParams);
  const BASE = pageUrl("/corporate", locale);

  if (locale === "ja") {
    return {
      title: TITLE_JA,
      description: DESC_JA,
      openGraph: {
        title: TITLE_JA,
        description: DESC_JA,
        url: BASE,
        siteName: "大阪城ウォークス with イフトウデイ　エドワード",
        locale: "ja_JP",
        type: "website",
        images: [{ url: IMG, width: 2296, height: 1222 }],
      },
      twitter: {
        card: "summary_large_image",
        title: TITLE_JA,
        description: DESC_JA,
        images: [IMG],
      },
      alternates: {
        canonical: BASE,
        languages: {
          en: `${SITE}/corporate`,
          ja: BASE,
          "x-default": `${SITE}/corporate`,
        },
      },
    };
  }

  return {
    title: TITLE_EN,
    description: DESC_EN,
    openGraph: {
      title: TITLE_EN,
      description: DESC_EN,
      url: BASE,
      siteName: "Osaka Castle Walks with Edward",
      locale: "en_US",
      type: "website",
      images: [{ url: IMG, width: 2296, height: 1222 }],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE_EN,
      description: DESC_EN,
      images: [IMG],
    },
    alternates: {
      canonical: BASE,
      languages: {
        en: BASE,
        ja: `${SITE}/ja/corporate`,
        "x-default": BASE,
      },
    },
  };
}

export default async function CorporatePage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const locale = getLocale(await searchParams);
  const content = locale === "ja" ? jaContent : en;

  const graphJsonLd = buildCorporateGraphJsonLd({
    titleEn: TITLE_EN,
    titleJa: TITLE_JA,
    descriptionEn: DESC_EN,
    descriptionJa: DESC_JA,
    url: `${SITE}/corporate`,
    urlJa: `${SITE}/ja/corporate`,
    locale,
    image: IMG,
    imageWidth: 2296,
    imageHeight: 1222,
    datePublished: "2026-09-28",
    breadcrumb: [
      {
        name: "Home",
        nameJa: "ホーム",
        url: SITE,
        urlJa: SITE,
      },
      {
        name: "Corporate Team Building",
        nameJa: "法人向けチームビルディング",
        url: `${SITE}/corporate`,
        urlJa: `${SITE}/ja/corporate`,
      },
    ],
    faq: content.hub.faq.map((f) => ({
      question: f.q,
      answer: f.a,
    })),
    tiers: en.hub.pricing.tiers.map((tier, i) => ({
      size: tier.size,
      sizeJa: jaContent.hub.pricing.tiers[i]?.size ?? tier.size,
      price: tier.price,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(graphJsonLd) }}
      />
      <CorporateClient />
    </>
  );
}
