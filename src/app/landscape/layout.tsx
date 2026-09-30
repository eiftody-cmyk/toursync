import type { Metadata } from "next";
import "../education/education.css";

const SITE = "https://osakacastletours.com";
const OG_IMAGE = `${SITE}/images/toyotomicastle.webp`;

export const metadata: Metadata = {
  title: "Osaka's Lost Landscapes",
  description:
    "Historical reconstructions of Osaka Castle's lost landscapes. Stand where history happened.",
  openGraph: {
    title: "Osaka's Lost Landscapes",
    description:
      "Historical reconstructions of Osaka Castle's lost landscapes. Stand where history happened.",
    url: `${SITE}/landscape`,
    siteName: "Osaka Castle Walks with Edward",
    type: "website",
    images: [{ url: OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Osaka's Lost Landscapes",
    description:
      "Historical reconstructions of Osaka Castle's lost landscapes.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: `${SITE}/landscape`,
  },
};

const landscapeJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Osaka's Lost Landscapes", item: `${SITE}/landscape` },
  ],
};

export default function LandscapeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landscapeJsonLd) }}
      />
    </>
  );
}
