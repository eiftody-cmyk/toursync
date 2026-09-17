import HighSchoolClient from "./HighSchoolClient";

export const metadata = {
  title: "High School — Historical Inquiry at Osaka Castle",
  description:
    "History field investigations for high school students at Osaka Castle. Designed for Rekishiso, Nihonshi Tankyu, and inquiry-based learning. IB and AP supported.",
  openGraph: {
    title: "High School — Historical Inquiry at Osaka Castle",
    description:
      "History field investigations for high school students at Osaka Castle. Rekishiso, Nihonshi Tankyu, IB, and AP.",
    url: "https://osakacastletours.com/education/high-school",
    siteName: "Osaka Castle Walks with Edward",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://osakacastletours.com/images/new_kofun.webp",
        width: 1536,
        height: 1024,
      },
    ],
  },
  alternates: {
    canonical: "https://osakacastletours.com/education/high-school",
  },
};

export default function HighSchoolPage() {
  return <HighSchoolClient />;
}
