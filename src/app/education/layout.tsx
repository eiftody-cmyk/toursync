import ClientLayout from "./ClientLayout";
import "./education.css";

export const metadata = {
  title: {
    template: "%s | Osaka History Investigations",
    default: "Osaka History Investigations — Field Seminars for Schools",
  },
  description:
    "Historian-led field investigations at Osaka Castle for junior high, high school, and university students. Curriculum-aligned inquiry-based learning.",
  openGraph: {
    title: "Osaka History Investigations",
    description:
      "Historian-led field investigations at Osaka Castle for schools and universities.",
    url: "https://osakacastletours.com/education",
    siteName: "Osaka Castle Walks with Edward",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://osakacastletours.com/education",
  },
};

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Osaka History Investigations",
    alternateName: "大阪歴史フィールド探究",
    url: "https://osakacastletours.com/education",
    logo: "https://osakacastletours.com/images/logo.webp",
    description:
      "Historian-led field investigations at Osaka Castle for schools and universities.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Osaka",
      addressCountry: "JP",
    },
    founder: {
      "@type": "Person",
      name: "Edward Iftody",
      url: "https://osakacastletours.com/aboutme",
      jobTitle: "Independent Researcher & Resident Historian",
    },
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
      <ClientLayout>{children}</ClientLayout>
    </>
  );
}
