import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const sitePages: MetadataRoute.Sitemap = [
    { url: "https://osakacastletours.com/", lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: "https://osakacastletours.com/landscape", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: "https://osakacastletours.com/book", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://osakacastletours.com/book/custom", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const educationPages: MetadataRoute.Sitemap = [
    { url: "https://osakacastletours.com/education", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://osakacastletours.com/education/junior-high", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://osakacastletours.com/education/high-school", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://osakacastletours.com/education/university", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://osakacastletours.com/education/teacher-pack", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: "https://osakacastletours.com/ja/education", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://osakacastletours.com/ja/education/junior-high", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://osakacastletours.com/ja/education/high-school", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://osakacastletours.com/ja/education/university", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://osakacastletours.com/ja/education/teacher-pack", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // All EN timeline/investigation/guide pages (scanned from public/)
  const enSlugs = [
    "aboutme",
    "azaiclanbetrayal",
    "before-the-castle-prehistoric-osaka",
    "beforejapanhadaname",
    "deeptimeline",
    "empress-shotoku",
    "empress_jingu_timeline",
    "faq",
    "fujiwara-shadow-politics",
    "genpei-timeline",
    "goddess_queen_empress_concubine",
    "history-beyond-the-postcard",
    "in_the_media",
    "ishiyama-timeline",
    "lordconcubineshogunlie",
    "ojinsuccession",
    "osaka-castle-entry-tickets-guide",
    "osaka-castle-history",
    "osaka-castle-vs-himeji-castle",
    "osaka_history_things_to_do",
    "photography-guide",
    "sanada_nobushige",
    "shitennojihistory",
    "soga-fujiwara-timeline",
    "tenjin-matsuri-history",
    "testimonials",
    "three-unifiers",
    "tokugawa-ieyasu-timeline",
    "toyotomi_hideyori",
    "toyotomihideyoshi",
    "warriormonkspeasantshogun",
    "yayoi_timeline",
  ];

  // All JA timeline pages (scanned from public/ja/)
  const jaSlugs = [
    "azaiclanbetrayal",
    "before-the-castle-prehistoric-osaka",
    "deeptimeline",
    "empress-shotoku",
    "empress_jingu_timeline",
    "fujiwara-shadow-politics",
    "genpei-timeline",
    "ishiyama-timeline",
    "lordconcubineshogunlie",
    "ojinsuccession",
    "osaka-castle-history",
    "sanada_nobushige",
    "shitennojihistory",
    "soga-fujiwara-timeline",
    "tenjin-matsuri-history",
    "three-unifiers",
    "tokugawa-ieyasu-timeline",
    "toyotomi_hideyori",
    "toyotomihideyoshi",
    "yayoi_timeline",
  ];

  const enPages: MetadataRoute.Sitemap = enSlugs.map((slug) => ({
    url: `https://osakacastletours.com/${slug}.html`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const articleSlugs = [
    "before-the-castle-prehistoric-osaka",
    "capital-redundancy",
    "transcript-oc-2026",
    "yuteki-tenmoku-tea-bowl",
  ];

  const articlePages: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `https://osakacastletours.com/articles/${slug}.html`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const jaPages: MetadataRoute.Sitemap = jaSlugs.map((slug) => ({
    url: `https://osakacastletours.com/ja/${slug}.html`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...sitePages, ...educationPages, ...enPages, ...articlePages, ...jaPages];
}
