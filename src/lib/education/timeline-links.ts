export interface TimelineLink {
  slug: string;
  titleEn: string;
  titleJa: string;
  descriptionEn: string;
  descriptionJa: string;
  period: string;
  periodJa: string;
  relevantThemes: string[];
}

export const educationTimelineLinks: TimelineLink[] = [
  {
    slug: "osaka-castle-history",
    titleEn: "Osaka Castle: Toyotomi Hideyoshi, the Siege & the Erasure",
    titleJa: "大阪城：豊臣秀吉、大坂の陣、そして埋もれた歴史",
    descriptionEn:
      "The hidden story of Osaka Castle — Toyotomi Hideyoshi's vision, the two sieges, and how the Tokugawa buried his legacy.",
    descriptionJa:
      "大阪城の裏側の物語 — 豊臣秀吉のvision、二度の大坂の陣、そして徳川が豊臣の遺産をどう埋めたか。",
    period: "Sengoku–Tokugawa",
    periodJa: "戦国〜江戸",
    relevantThemes: [
      "hideyoshi",
      "tokugawa",
      "power-propaganda",
      "historical-memory",
    ],
  },
  {
    slug: "toyotomihideyoshi",
    titleEn: "The Taikō's Path — A Toyotomi Hideyoshi Timeline",
    titleJa: "太閤の道 — 豊臣秀吉の年表",
    descriptionEn:
      "Toyotomi Hideyoshi's rise from peasant foot-soldier to Japan's unifier and builder of Osaka Castle.",
    descriptionJa:
      "足軽から天下統一者へ — 豊臣秀吉の生涯と大阪城の建設。",
    period: "Sengoku",
    periodJa: "戦国",
    relevantThemes: ["hideyoshi", "power-propaganda", "geography-power"],
  },
  {
    slug: "ishiyama-timeline",
    titleEn: "The Ishiyama Honganji War (1570–1580)",
    titleJa: "石山本願寺戦争（1570〜1580）",
    descriptionEn:
      "Why Oda Nobunaga spent a decade besieging Osaka's warrior-monk fortress.",
    descriptionJa:
      "なぜ織田信長は10年かけて大坂の武者団要塞を包囲したのか。",
    period: "Sengoku",
    periodJa: "戦国",
    relevantThemes: ["warrior-monks", "geography-power"],
  },
  {
    slug: "deeptimeline",
    titleEn: "The Uemachi Plateau — A Deep Time Timeline",
    titleJa: "上町台地 — ディープタイム年表",
    descriptionEn:
      "The geological and archaeological deep-time history of the ridge beneath Osaka Castle.",
    descriptionJa:
      "大阪城の下にある尾根の地質学的・考古学的ディープタイムの歴史。",
    period: "Ancient–Modern",
    periodJa: "古代〜近代",
    relevantThemes: ["ancient-osaka", "geography-power"],
  },
  {
    slug: "three-unifiers",
    titleEn: "Three Unifiers — Osaka Castle Walks with Edward",
    titleJa: "三人の統一者 — 大阪城ウォークス",
    descriptionEn:
      "Oda Nobunaga, Toyotomi Hideyoshi, and Tokugawa Ieyasu — three men, one castle, sixty years.",
    descriptionJa:
      "織田信長、豊臣秀吉、徳川家康 — 三人の男、一つの城、60年の歴史。",
    period: "Sengoku–Tokugawa",
    periodJa: "戦国〜江戸",
    relevantThemes: ["hideyoshi", "tokugawa", "power-propaganda"],
  },
  {
    slug: "tokugawa-ieyasu-timeline",
    titleEn: "The Sleeping Dragon — A Tokugawa Ieyasu Timeline",
    titleJa: "睡龍 — 徳川家康の年表",
    descriptionEn:
      "Tokugawa Ieyasu's patience, betrayal, and the sieges of Osaka that established the shogunate.",
    descriptionJa:
      "徳川家康の忍耐、裏切り、幕府を確立した大坂の戦い。",
    period: "Tokugawa",
    periodJa: "江戸",
    relevantThemes: ["tokugawa", "power-propaganda", "historical-memory"],
  },
  {
    slug: "toyotomi_hideyori",
    titleEn: "Toyotomi Hideyori: Heir to Osaka Castle's Fall",
    titleJa: "豊臣秀頼：大阪城の崩壊に直面した継承者",
    descriptionEn:
      "The life of Toyotomi Hideyori from birth to the siege of Osaka and the Tokugawa's official story.",
    descriptionJa:
      "豊臣秀頼の生涯 — 生誕から大坂の陣、そして徳川の公式見解まで。",
    period: "Sengoku–Tokugawa",
    periodJa: "戦国〜江戸",
    relevantThemes: ["tokugawa", "historical-memory", "hideyoshi"],
  },
  {
    slug: "before-the-castle-prehistoric-osaka",
    titleEn: "Before the Castle: When Osaka was a Prehistoric Lagoon",
    titleJa: "城の前：大坂が先史時代の潟であった頃",
    descriptionEn:
      "The Jomon-Yayoi encounter in prehistoric Osaka — a lost world of aquatic hunter-gatherers and incoming farmers.",
    descriptionJa:
      "先史時代の大坂における縄文・弥生の出会い — 水辺の狩猟採集農民と渡来農民の失われた世界。",
    period: "Ancient",
    periodJa: "古代",
    relevantThemes: ["ancient-osaka"],
  },
  {
    slug: "warriormonkspeasantshogun",
    titleEn: "Warrior Monks, Peasant & Shogun",
    titleJa: "武者団、足軽、将軍",
    descriptionEn:
      "Three fortresses on the Osaka Castle site: warrior-monk stronghold, Toyotomi fortress, Tokugawa burial.",
    descriptionJa:
      "大阪城跡地の三つの要塞：武者団の拠点、豊臣の要塞、徳川の埋葬地。",
    period: "Sengoku–Tokugawa",
    periodJa: "戦国〜江戸",
    relevantThemes: ["warrior-monks", "hideyoshi", "tokugawa"],
  },
  {
    slug: "beforejapanhadaname",
    titleEn: "Before Japan Had a Name",
    titleJa: "「日本」という国が生まれる前",
    descriptionEn:
      "A 7,000-year deep history covering Jomon settlements through Queen Himiko and the first imperial capitals.",
    descriptionJa:
      "7,000年の深歴史 — 縄文の定住から卑弥呼、最初の帝都まで。",
    period: "Ancient",
    periodJa: "古代",
    relevantThemes: ["ancient-osaka", "geography-power"],
  },
  {
    slug: "empress-shotoku",
    titleEn: "Empress Shotoku, Dokyo & Naniwa Dynamics",
    titleJa: "称徳天皇、道鏡、難波の力学",
    descriptionEn:
      "Scholarly timeline of Empress Shotoku, the monk Dokyo, and how they reshaped imperial succession and the Naniwa capital.",
    descriptionJa:
      "称徳天皇、道鏡、そして皇位継承と難波の都をどう再形成したかの学術年表。",
    period: "Ancient",
    periodJa: "古代",
    relevantThemes: ["ancient-osaka", "geography-power"],
  },
  {
    slug: "shitennojihistory",
    titleEn: "Shitenno-ji: 1,400 Years of Power, Faith, and Survival",
    titleJa: "四天王寺：1,400年の権力、信仰、生存",
    descriptionEn:
      "The complete history of Shitenno-ji from its founding by Prince Shotoku in 593 CE.",
    descriptionJa:
      "593年に聖徳太子が建立して以来の四天王寺の完全な歴史。",
    period: "Ancient",
    periodJa: "古代",
    relevantThemes: ["ancient-osaka", "warrior-monks"],
  },
  {
    slug: "yayoi_timeline",
    titleEn: "The Yayoi Age in Japan — Parallel Histories",
    titleJa: "弥生時代 — 並行する歴史",
    descriptionEn:
      "Deep-time timeline of the Yayoi period, featuring parallel histories of China and Korea.",
    descriptionJa:
      "弥生時代のディープタイム年表 — 中国と朝鮮の並行する歴史を含む。",
    period: "Ancient",
    periodJa: "古代",
    relevantThemes: ["ancient-osaka"],
  },
  {
    slug: "osaka-castle-vs-himeji-castle",
    titleEn: "Osaka Castle or Himeji Castle? An Honest Comparison",
    titleJa: "大阪城か姫路城か？正直な比較",
    descriptionEn:
      "Himeji as the unburned original, Osaka as where Japan's history actually happened.",
    descriptionJa:
      "姫路は燃え残った原点、大阪は日本の歴史が実際に起きた場所。",
    period: "Cross-period",
    periodJa: "通史",
    relevantThemes: ["historical-memory", "tokugawa"],
  },
  {
    slug: "goddess_queen_empress_concubine",
    titleEn: "Goddess, Queen, Empress, Concubine",
    titleJa: "女神、女王、天皇、側室",
    descriptionEn:
      "2,000 years of influential women in Japanese history, from goddesses to Yodo-dono.",
    descriptionJa:
      "女神から淀殿まで — 日本史における影響力ある女性2,000年の歴史。",
    period: "Ancient–Sengoku",
    periodJa: "古代〜戦国",
    relevantThemes: ["ancient-osaka", "hideyoshi", "historical-memory"],
  },
];

export function getTimelineLinksForThemes(
  themes: string[],
  locale: "en" | "ja"
): (TimelineLink & { url: string })[] {
  return educationTimelineLinks
    .filter((link) =>
      themes.some((t) => link.relevantThemes.includes(t))
    )
    .map((link) => ({
      ...link,
      url: locale === "ja" ? `https://osakacastletours.com/ja/${link.slug}.html` : `https://osakacastletours.com/${link.slug}.html`,
    }));
}
