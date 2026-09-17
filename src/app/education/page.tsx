import EducationHubClient from "./EducationHubClient";

export const metadata = {
  title: "Osaka History Investigations — Field Seminars for Schools",
  description:
    "Historian-led field investigations at Osaka Castle for junior high, high school, and university students. Curriculum-aligned inquiry-based learning with Edward Iftody.",
  openGraph: {
    title: "Osaka History Investigations — Field Seminars for Schools",
    description:
      "Historian-led field investigations at Osaka Castle for junior high, high school, and university students.",
    url: "https://osakacastletours.com/education",
    siteName: "Osaka Castle Walks with Edward",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://osakacastletours.com/images/toyotomihideyoshi.webp",
        width: 1408,
        height: 768,
      },
    ],
  },
  alternates: {
    canonical: "https://osakacastletours.com/education",
  },
};

export default function EducationPage() {
  return <EducationHubClient />;
}
