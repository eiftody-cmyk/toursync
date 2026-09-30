import type { MetadataRoute } from "next";

const SITE = "https://osakacastletours.com";

function langPair(en: string, ja: string) {
  return { languages: { en, ja, "x-default": en } };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const sitePages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE}/landscape`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/book`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/book/custom`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const educationPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/education`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: langPair(`${SITE}/education`, `${SITE}/ja/education`) },
    { url: `${SITE}/education/junior-high`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: langPair(`${SITE}/education/junior-high`, `${SITE}/ja/education/junior-high`) },
    { url: `${SITE}/education/high-school`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: langPair(`${SITE}/education/high-school`, `${SITE}/ja/education/high-school`) },
    { url: `${SITE}/education/university`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: langPair(`${SITE}/education/university`, `${SITE}/ja/education/university`) },
    { url: `${SITE}/education/teacher-pack`, lastModified: now, changeFrequency: "monthly", priority: 0.6, alternates: langPair(`${SITE}/education/teacher-pack`, `${SITE}/ja/education/teacher-pack`) },
    { url: `${SITE}/ja/education`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: langPair(`${SITE}/education`, `${SITE}/ja/education`) },
    { url: `${SITE}/ja/education/junior-high`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: langPair(`${SITE}/education/junior-high`, `${SITE}/ja/education/junior-high`) },
    { url: `${SITE}/ja/education/high-school`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: langPair(`${SITE}/education/high-school`, `${SITE}/ja/education/high-school`) },
    { url: `${SITE}/ja/education/university`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: langPair(`${SITE}/education/university`, `${SITE}/ja/education/university`) },
    { url: `${SITE}/ja/education/teacher-pack`, lastModified: now, changeFrequency: "monthly", priority: 0.6, alternates: langPair(`${SITE}/education/teacher-pack`, `${SITE}/ja/education/teacher-pack`) },
  ];

  const corporatePages: MetadataRoute.Sitemap = [
    { url: `${SITE}/corporate`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: langPair(`${SITE}/corporate`, `${SITE}/ja/corporate`) },
    { url: `${SITE}/ja/corporate`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: langPair(`${SITE}/corporate`, `${SITE}/ja/corporate`) },
  ];

  // All EN timeline/investigation/guide pages (scanned from public/)
  const enSlugs = [
    "aboutme",
    "azaiclanbetrayal",
    "beforejapanhadaname",
    "deeptimeline",
    "empress-shotoku",
    "empress_jingu_timeline",
    "faq",
    "fujiwara-shadow-politics",
    "genpei-timeline",
    "goddess_queen_empress_concubine",
    "hideyoshi-rikyu-timeline",
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
    "hideyoshi-rikyu-timeline",
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

  // EN canonical for a JA slug when the EN twin lives outside the root
  // (the prehistoric essay's EN canonical is the /articles/ copy).
  const enCanonical = (slug: string) =>
    slug === "before-the-castle-prehistoric-osaka"
      ? `${SITE}/articles/${slug}`
      : `${SITE}/${slug}`;

  const enPages: MetadataRoute.Sitemap = enSlugs.map((slug) => ({
    url: `${SITE}/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    ...(jaSlugs.includes(slug)
      ? { alternates: langPair(`${SITE}/${slug}`, `${SITE}/ja/${slug}`) }
      : {}),
  }));

  // transcript-oc-2026 stays out: the page is noindex, so a sitemap entry
  // would contradict its robots meta.
  const articleSlugs = [
    "before-the-castle-prehistoric-osaka",
    "bene-gesserit-heian-japan",
    "capital-redundancy",
    "yuteki-tenmoku-tea-bowl",
  ];

  const articlePages: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${SITE}/articles/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
    ...(jaSlugs.includes(slug)
      ? { alternates: langPair(`${SITE}/articles/${slug}`, `${SITE}/ja/${slug}`) }
      : {}),
  }));

  const jaPages: MetadataRoute.Sitemap = jaSlugs.map((slug) => ({
    url: `${SITE}/ja/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    ...(enSlugs.includes(slug) || slug === "before-the-castle-prehistoric-osaka"
      ? { alternates: langPair(enCanonical(slug), `${SITE}/ja/${slug}`) }
      : {}),
  }));

  return [...sitePages, ...educationPages, ...corporatePages, ...enPages, ...articlePages, ...jaPages];
}
