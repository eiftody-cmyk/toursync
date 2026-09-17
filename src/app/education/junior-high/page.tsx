import JuniorHighClient from "./JuniorHighClient";

export const metadata = {
  title: "Junior High — Osaka History Field Investigations",
  description:
    "Curriculum-aligned history field investigations for junior high school students at Osaka Castle. Social studies, Sengoku period, and inquiry-based learning.",
  openGraph: {
    title: "Junior High — Osaka History Field Investigations",
    description:
      "Curriculum-aligned history field investigations for junior high school students at Osaka Castle.",
    url: "https://osakacastletours.com/education/junior-high",
    siteName: "Osaka Castle Walks with Edward",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://osakacastletours.com/images/yododonohideyori.webp",
        width: 2588,
        height: 1238,
      },
    ],
  },
  alternates: {
    canonical: "https://osakacastletours.com/education/junior-high",
  },
};

export default function JuniorHighPage() {
  return <JuniorHighClient />;
}
