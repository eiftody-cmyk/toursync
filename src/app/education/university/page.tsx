import UniversityClient from "./UniversityClient";

export const metadata = {
  title: "University Field Seminars — Osaka History & Archaeology",
  description:
    "Mobile university seminars at Osaka Castle led by historian Edward Iftody. History, archaeology, historical geography, and political science fieldwork.",
  openGraph: {
    title: "University Field Seminars — Osaka History & Archaeology",
    description:
      "Mobile university seminars at Osaka Castle led by historian Edward Iftody.",
    url: "https://osakacastletours.com/education/university",
    siteName: "Osaka Castle Walks with Edward",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://osakacastletours.com/images/empress-shotoku.webp",
        width: 1672,
        height: 941,
      },
    ],
  },
  alternates: {
    canonical: "https://osakacastletours.com/education/university",
  },
};

export default function UniversityPage() {
  return <UniversityClient />;
}
