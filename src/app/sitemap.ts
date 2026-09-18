import type { MetadataRoute } from "next";
import { educationTimelineLinks } from "@/lib/education/timeline-links";
import { readdirSync } from "fs";
import { join } from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // --- Education React pages ---
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
    {
      url: "https://osakacastletours.com/ja/education",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://osakacastletours.com/ja/education/junior-high",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://osakacastletours.com/ja/education/high-school",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://osakacastletours.com/ja/education/university",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://osakacastletours.com/ja/education/teacher-pack",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // --- Site pages ---
  const sitePages: MetadataRoute.Sitemap = [
    {
      url: "https://osakacastletours.com/",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: "https://osakacastletours.com/landscape",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: "https://osakacastletours.com/book",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://osakacastletours.com/book/custom",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // --- Static HTML pages: scan public/ directory ---
  const publicDir = join(process.cwd(), "public");
  const jaDir = join(publicDir, "ja");

  const excludeEn = new Set([
    "index.html", // GitHub Pages fallback, not used by Cloudflare
  ]);

  const enFiles = readdirSync(publicDir)
    .filter((f) => f.endsWith(".html") && !excludeEn.has(f))
    .map((f) => f.replace(".html", ""));

  const jaFiles = readdirSync(jaDir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => f.replace(".html", ""));

  // Timeline pages already covered by educationTimelineLinks
  const timelineSlugs = new Set(educationTimelineLinks.map((l) => l.slug));

  // Extra EN pages not in timeline-links (guides, investigations, static)
  const extraEnPages = enFiles.filter((slug) => !timelineSlugs.has(slug));

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

  // Extra pages only in EN (no JA version)
  const extraPages: MetadataRoute.Sitemap = extraEnPages.map((slug) => ({
    url: `https://osakacastletours.com/${slug}.html`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // JA pages not yet covered by timelinePages
  const coveredJa = new Set(
    educationTimelineLinks.map((l) => `ja/${l.slug}`)
  );
  const extraJaPages: MetadataRoute.Sitemap = jaFiles
    .filter((slug) => !coveredJa.has(`ja/${slug}`))
    .map((slug) => ({
      url: `https://osakacastletours.com/ja/${slug}.html`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [
    ...sitePages,
    ...educationPages,
    ...timelinePages,
    ...extraPages,
    ...extraJaPages,
  ];
}
