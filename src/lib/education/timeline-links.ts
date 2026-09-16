export interface TimelineLink {
  slug: string;
  titleEn: string;
  titleJa: string;
  descriptionEn: string;
  descriptionJa: string;
  period: string;
  periodJa: string;
  relevantThemes: string[];
  heroImage?: string;
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
    heroImage: "images/toyotomicastle.webp",
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
    heroImage: "toyotomihideyoshi.webp",
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
    heroImage: "Ishiyama.webp",
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
    heroImage: "formerniwapalace.webp",
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
    heroImage: "nobunaga.webp",
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
    heroImage: "ieyasu.webp",
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
    heroImage: "yododonohideyori.webp",
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
    heroImage: "images/jomon-people.webp",
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
    heroImage: "toyotomihideyoshi.webp",
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
    heroImage: "kofun.webp",
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
    heroImage: "images/empress-shotoku.webp",
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
    heroImage: "shitennoji.webp",
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
    heroImage: "images/yayoi_boat.webp",
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
    heroImage: "himiko.webp",
  },
  {
    slug: "empress_jingu_timeline",
    titleEn: "Empress Jingū: Sifting Fact From Folklore",
    titleJa: "神功皇后：伝説と史実を分かつ",
    descriptionEn:
      "How 8th-century court compilers re-engineered Empress Jingū's timeline to justify female imperial authority.",
    descriptionJa:
      "8世紀の朝廷が女性天皇の正統性を正当化するために神功皇后の年表をどう再構築したか。",
    period: "Ancient",
    periodJa: "古代",
    relevantThemes: ["ancient-osaka", "power-propaganda"],
    heroImage: "images/empress_jingu.webp",
  },
  {
    slug: "ojinsuccession",
    titleEn: "The Ōjin Succession — Three Versions of the Same Story",
    titleJa: "応神天皇の皇位継承 — 三つの物語",
    descriptionEn:
      "Three competing accounts of Emperor Ōjin's succession crisis reveal how legitimacy was constructed.",
    descriptionJa:
      "応神天皇の継承危機の三つの对立する説明が、正統性がどう構築されたかを明らかにする。",
    period: "Ancient",
    periodJa: "古代",
    relevantThemes: ["ancient-osaka", "power-propaganda"],
    heroImage: "kofun.webp",
  },
  {
    slug: "fujiwara-shadow-politics",
    titleEn: "The Fujiwara Regency — Shadow Politics of the Imperial Throne",
    titleJa: "藤原摂関政治 — 五百年にわたる影の支配",
    descriptionEn:
      "How the Fujiwara clan dominated the throne for five centuries through regency offices and marriage alliances.",
    descriptionJa:
      "藤原氏が摂関職と婚姻同盟を通じて500年にわたり帝座をどう支配したか。",
    period: "Heian",
    periodJa: "平安",
    relevantThemes: ["power-propaganda", "historical-memory"],
    heroImage: "images/fujiwara-no-michinaga.webp",
  },
  {
    slug: "genpei-timeline",
    titleEn: "Taira, Minamoto & the First Shogunate",
    titleJa: "平氏、源氏と最初の幕府",
    descriptionEn:
      "The imperial origins of the Taira and Minamoto clans, the Genpei War, and the birth of Japan's first shogunate.",
    descriptionJa:
      "平氏と源氏の皇室起源、源平合戦、そして日本初の幕府の誕生。",
    period: "Kamakura",
    periodJa: "鎌倉",
    relevantThemes: ["power-propaganda", "historical-memory"],
    heroImage: "images/taira-minamoto-battle.webp",
  },
  {
    slug: "azaiclanbetrayal",
    titleEn: "The Oda-Azai Betrayal — A Sengoku Timeline",
    titleJa: "織田・浅井の裏切り — 戦国タイムライン",
    descriptionEn:
      "The collapse of the Oda-Azai alliance, from marriage politics to the destruction of the Azai clan.",
    descriptionJa:
      "織田・浅井同盟の崩壊 — 婚姻政治から浅井氏の滅亡まで。",
    period: "Sengoku",
    periodJa: "戦国",
    relevantThemes: ["warrior-monks", "hideyoshi"],
    heroImage: "azaiclanbetrayal.webp",
  },
  {
    slug: "sanada_nobushige",
    titleEn: "The Crimson Path — A Sanada Nobushige Timeline",
    titleJa: "真田信繁 — 日本最強の武将",
    descriptionEn:
      "The complete life of Sanada Nobushige, from his father's political maneuvering through the Siege of Osaka.",
    descriptionJa:
      "真田信繁の生涯 — 父の政治的駆け引きから大坂の陣まで。",
    period: "Sengoku–Edo",
    periodJa: "戦国〜江戸",
    relevantThemes: ["tokugawa", "historical-memory"],
    heroImage: "images/chausu-yama.webp",
  },
  {
    slug: "soga-fujiwara-timeline",
    titleEn: "Soga, Fujiwara & The Imperial Line",
    titleJa: "蘇我氏、藤原氏と皇室 — 朝廷政治タイムライン",
    descriptionEn:
      "The rise of the Soga clan, the Isshi Incident, and centuries of Fujiwara dominance over the imperial line.",
    descriptionJa:
      "蘇我氏の台頭、乙巳の変、そして藤原氏による皇室への数世紀にわたる支配。",
    period: "Ancient–Heian",
    periodJa: "古代〜平安",
    relevantThemes: ["ancient-osaka", "power-propaganda"],
    heroImage: "assassination.webp",
  },
  {
    slug: "tenjin-matsuri-history",
    titleEn: "Tenjin Matsuri — Osaka's Greatest Water Festival",
    titleJa: "天神祭 — 大阪最大の祭礼",
    descriptionEn:
      "The complete history of Tenjin Matsuri from Sugawara no Michizane's exile to one of Japan's Three Great Festivals.",
    descriptionJa:
      "菅原道真の流罪から日本三大祭りの一つへ — 天神祭の完全な歴史。",
    period: "Heian–Modern",
    periodJa: "平安〜近代",
    relevantThemes: ["ancient-osaka", "historical-memory"],
    heroImage: "tenjin-matsuri-hero.webp",
  },
  {
    slug: "lordconcubineshogunlie",
    titleEn: "A Lord, a Concubine, and a Shogun's Lie",
    titleJa: "大名、側室、将軍の嘘",
    descriptionEn:
      "Investigating the deaths of Toyotomi Hideyori and Yodo-dono — challenging the Tokugawa official narrative.",
    descriptionJa:
      "豊臣秀頼と淀殿の死を調査する — 徳川の公式見解に疑問を投げかける。",
    period: "Sengoku–Edo",
    periodJa: "戦国〜江戸",
    relevantThemes: ["tokugawa", "historical-memory", "power-propaganda"],
    heroImage: "yododonohideyori.webp",
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
