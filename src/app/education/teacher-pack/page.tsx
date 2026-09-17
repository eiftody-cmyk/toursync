import TeacherPackClient from "./TeacherPackClient";

export const metadata = {
  title: "Sample Lesson — Field Investigation in Action",
  description:
    "See a complete field investigation lesson plan: learning objectives, inquiry questions, site visits, assessment examples, and pricing for schools at Osaka Castle.",
  openGraph: {
    title: "Sample Lesson — Field Investigation in Action",
    description:
      "Complete field investigation lesson plan for schools at Osaka Castle.",
    url: "https://osakacastletours.com/education/teacher-pack",
    siteName: "Osaka Castle Walks with Edward",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://osakacastletours.com/images/sanadacharge.webp",
        width: 1536,
        height: 1024,
      },
    ],
  },
  alternates: {
    canonical: "https://osakacastletours.com/education/teacher-pack",
  },
};

export default function TeacherPackPage() {
  return <TeacherPackClient />;
}
