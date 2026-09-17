import type { MetadataRoute } from "next";
import { educationTimelineLinks } from "@/lib/education/timeline-links";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const educationPages: MetadataRoute.Sitemap = [
    {
      url: "https://osakacastletours.com/education",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://osakacastletours.com/education/junior-high",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://osakacastletours.com/education/high-school",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://osakacastletours.com/education/university",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://osakacastletours.com/education/teacher-pack",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const timelinePages: MetadataRoute.Sitemap = educationTimelineLinks.flatMap(
    (link) => [
      {
        url: `https://osakacastletours.com/${link.slug}.html`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
      {
        url: `https://osakacastletours.com/ja/${link.slug}.html`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
    ]
  );

  return [...educationPages, ...timelinePages];
}
