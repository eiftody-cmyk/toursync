export interface CurriculumRow {
  theme: string;
  themeJa: string;
  jhsSocial: string;
  hsRekish: string;
  hsNihonshi: string;
  hsTankyu: string;
  english: string;
  ib: string;
  ap: string;
}

export const curriculumAlignment: CurriculumRow[] = [
  {
    theme: "Jomon–Yayoi Transition",
    themeJa: "縄文〜弥生の変遷",
    jhsSocial: "Grade 7 — Prehistoric Japan",
    hsRekish: "—",
    hsNihonshi: "Prehistoric Japan",
    hsTankyu: "Evidence & interpretation",
    english: "✓✓",
    ib: "—",
    ap: "—",
  },
  {
    theme: "Ancient Osaka / Naniwa",
    themeJa: "古代大阪 / 難波",
    jhsSocial: "Grade 7 — Ancient Japan",
    hsRekish: "—",
    hsNihonshi: "Early state formation",
    hsTankyu: "Research question",
    english: "✓✓",
    ib: "—",
    ap: "Unit 1",
  },
  {
    theme: "Warrior Monks & Power",
    themeJa: "僧兵・農民と権力",
    jhsSocial: "Grade 7 — Medieval Japan",
    hsRekish: "—",
    hsNihonshi: "Medieval political power",
    hsTankyu: "Evidence & interpretation",
    english: "✓",
    ib: "—",
    ap: "—",
  },
  {
    theme: "Hideyoshi & Unification",
    themeJa: "秀吉と統一",
    jhsSocial: "Grade 8 — Sengoku period",
    hsRekish: "Referenced",
    hsNihonshi: "Sengoku / unification",
    hsTankyu: "Geography & power",
    english: "✓✓",
    ib: "HL: Asia & Oceania",
    ap: "Unit 3, 5",
  },
  {
    theme: "Tokugawa Legitimacy",
    themeJa: "徳川の正統性",
    jhsSocial: "Grade 8 — Early modern",
    hsRekish: "Referenced",
    hsNihonshi: "Early modern political order",
    hsTankyu: "Legitimacy & propaganda",
    english: "✓✓",
    ib: "Topic 5",
    ap: "Unit 3",
  },
  {
    theme: "Meiji & Modern Osaka",
    themeJa: "明治・近代大阪",
    jhsSocial: "Grade 9 — Modern Japan",
    hsRekish: "Modernization & transformation",
    hsNihonshi: "Modern Japan",
    hsTankyu: "Change & continuity",
    english: "✓✓",
    ib: "Topic 7",
    ap: "Unit 5",
  },
  {
    theme: "Power & Propaganda",
    themeJa: "権力とプロパガンダ",
    jhsSocial: "Grade 8 — Political power",
    hsRekish: "—",
    hsNihonshi: "Political legitimacy",
    hsTankyu: "Legitimacy & narrative",
    english: "✓",
    ib: "Topic 5",
    ap: "Unit 3",
  },
  {
    theme: "Historical Memory",
    themeJa: "歴史的記憶",
    jhsSocial: "Grade 9 — Modern Japan",
    hsRekish: "Historical interpretation",
    hsNihonshi: "Competing perspectives",
    hsTankyu: "Multiple interpretations",
    english: "✓✓",
    ib: "IA: Fieldwork",
    ap: "—",
  },
  {
    theme: "Geography & Power",
    themeJa: "地理と権力",
    jhsSocial: "Grade 7–8 — Physical geography",
    hsRekish: "Spatial analysis",
    hsNihonshi: "State formation & territory",
    hsTankyu: "Core — geography & power",
    english: "✓✓",
    ib: "Topic 4",
    ap: "Unit 1",
  },
];

/* ── JHS Curriculum Alignment ── */

export interface JHSCurriculumRow {
  theme: string;
  themeJa: string;
  jhsSocial: string;
  rekishSogo: string;
  nihonshiTankyu: string;
  tankyu: string;
  english: string;
  ib: string;
  ap: string;
}

export const jhsCurriculumAlignment: JHSCurriculumRow[] = [
  {
    theme: "Jomon–Yayoi Transition",
    themeJa: "縄文〜弥生の変遷",
    jhsSocial: "中1・先史日本",
    rekishSogo: "—",
    nihonshiTankyu: "先史日本",
    tankyu: "証拠と解釈",
    english: "Evidence & Interpretation",
    ib: "—",
    ap: "—",
  },
  {
    theme: "Ancient Osaka / Naniwa",
    themeJa: "古代大阪・難波",
    jhsSocial: "中1・古代日本",
    rekishSogo: "—",
    nihonshiTankyu: "古代国家の形成",
    tankyu: "歴史的問い",
    english: "Research Question",
    ib: "—",
    ap: "Unit 1",
  },
  {
    theme: "Warrior Monks & Power",
    themeJa: "僧兵・農民と権力",
    jhsSocial: "中1・中世日本",
    rekishSogo: "—",
    nihonshiTankyu: "中世の政治権力",
    tankyu: "証拠と解釈",
    english: "Evidence & Interpretation",
    ib: "—",
    ap: "—",
  },
  {
    theme: "Hideyoshi & Unification",
    themeJa: "秀吉と統一",
    jhsSocial: "中2・戦国〜統一",
    rekishSogo: "参照可能",
    nihonshiTankyu: "戦国・統一",
    tankyu: "地理と権力",
    english: "Geography & Power",
    ib: "HL: Asia & Oceania",
    ap: "Units 3, 5",
  },
  {
    theme: "Tokugawa Legitimacy",
    themeJa: "徳川の正統性",
    jhsSocial: "中2・近世日本",
    rekishSogo: "参照可能",
    nihonshiTankyu: "近世の政治秩序",
    tankyu: "正統性とプロパガンダ",
    english: "Legitimacy & Propaganda",
    ib: "Topic 5",
    ap: "Unit 3",
  },
  {
    theme: "Meiji & Modern Osaka",
    themeJa: "明治・近代大阪",
    jhsSocial: "中3・近代日本",
    rekishSogo: "近代化と社会変容",
    nihonshiTankyu: "近代日本",
    tankyu: "変化と継続",
    english: "Change & Continuity",
    ib: "Topic 7",
    ap: "Unit 5",
  },
  {
    theme: "Power & Propaganda",
    themeJa: "権力とプロパガンダ",
    jhsSocial: "中2・政治権力",
    rekishSogo: "—",
    nihonshiTankyu: "政治的正統性",
    tankyu: "正統性と物語",
    english: "Legitimacy & Narrative",
    ib: "Topic 5",
    ap: "Unit 3",
  },
  {
    theme: "Historical Memory",
    themeJa: "歴史的記憶",
    jhsSocial: "中3・近現代日本",
    rekishSogo: "歴史解釈",
    nihonshiTankyu: "複数の歴史解釈",
    tankyu: "複数の視点",
    english: "Multiple Interpretations",
    ib: "IA: Fieldwork",
    ap: "—",
  },
  {
    theme: "Geography & Power",
    themeJa: "地理と権力",
    jhsSocial: "中1〜中2・地理と政治",
    rekishSogo: "空間分析",
    nihonshiTankyu: "国家形成と領域",
    tankyu: "地理と権力",
    english: "Geography & Power",
    ib: "Topic 4",
    ap: "Unit 1",
  },
];

/* ── High School Curriculum Alignment ── */

export interface HSCurriculumRow {
  theme: string;
  themeJa: string;
  rekishSogo: string;
  nihonshiTankyu: string;
  tankyu: string;
  english: string;
  ib: string;
  ap: string;
}

export const hsCurriculumAlignment: HSCurriculumRow[] = [
  {
    theme: "Jomon–Yayoi Transition",
    themeJa: "縄文〜弥生の変遷",
    rekishSogo: "—",
    nihonshiTankyu: "先史日本",
    tankyu: "証拠と解釈",
    english: "Evidence & Interpretation",
    ib: "—",
    ap: "—",
  },
  {
    theme: "Ancient Osaka / Naniwa",
    themeJa: "古代大阪・難波",
    rekishSogo: "古代国家の形成",
    nihonshiTankyu: "古代日本",
    tankyu: "歴史的問い",
    english: "Research Question",
    ib: "—",
    ap: "Unit 1",
  },
  {
    theme: "Warrior Monks & Power",
    themeJa: "僧兵・農民と権力",
    rekishSogo: "中世の政治権力",
    nihonshiTankyu: "中世日本",
    tankyu: "証拠と解釈",
    english: "Evidence & Interpretation",
    ib: "—",
    ap: "—",
  },
  {
    theme: "Hideyoshi & Unification",
    themeJa: "秀吉と統一",
    rekishSogo: "戦国〜統一",
    nihonshiTankyu: "戦国・統一",
    tankyu: "地理と権力",
    english: "Geography & Power",
    ib: "HL: Asia & Oceania",
    ap: "Units 3, 5",
  },
  {
    theme: "Tokugawa Legitimacy",
    themeJa: "徳川の正統性",
    rekishSogo: "近世の政治秩序",
    nihonshiTankyu: "近世日本",
    tankyu: "正統性とプロパガンダ",
    english: "Legitimacy & Propaganda",
    ib: "Topic 5",
    ap: "Unit 3",
  },
  {
    theme: "Meiji & Modern Osaka",
    themeJa: "明治・近代大阪",
    rekishSogo: "近代化と社会変容",
    nihonshiTankyu: "近代日本",
    tankyu: "変化と継続",
    english: "Change & Continuity",
    ib: "Topic 7",
    ap: "Unit 5",
  },
  {
    theme: "Power & Propaganda",
    themeJa: "権力とプロパガンダ",
    rekishSogo: "政治的正統性",
    nihonshiTankyu: "権力と政治",
    tankyu: "正統性と物語",
    english: "Legitimacy & Narrative",
    ib: "Topic 5",
    ap: "Unit 3",
  },
  {
    theme: "Historical Memory",
    themeJa: "歴史的記憶",
    rekishSogo: "歴史解釈",
    nihonshiTankyu: "複数の歴史解釈",
    tankyu: "複数の視点",
    english: "Multiple Interpretations",
    ib: "IA: Fieldwork",
    ap: "—",
  },
  {
    theme: "Geography & Power",
    themeJa: "地理と権力",
    rekishSogo: "地理と政治権力",
    nihonshiTankyu: "空間分析",
    tankyu: "国家形成と領域",
    english: "Geography & Power",
    ib: "Topic 4",
    ap: "Unit 1",
  },
];

/* ── University Discipline Alignment ── */

export interface DisciplineRow {
  theme: string;
  themeJa: string;
  history: string;
  archaeology: string;
  histGeo: string;
  poliSci: string;
  japaneseStudies: string;
}

export const universityAlignment: DisciplineRow[] = [
  {
    theme: "Geography & Power",
    themeJa: "地理と権力",
    history: "国家形成の空間分析",
    archaeology: "景観考古学",
    histGeo: "自然地理と政治権力",
    poliSci: "領域と政治的支配",
    japaneseStudies: "地域権力の動態",
  },
  {
    theme: "Power & Propaganda",
    themeJa: "権力とプロパガンダ",
    history: "政治的正統性と物語",
    archaeology: "—",
    histGeo: "権力の都市景観",
    poliSci: "プロパガンダと国家の正統性",
    japaneseStudies: "政治的象徴",
  },
  {
    theme: "Hideyoshi & State Formation",
    themeJa: "秀吉と国家形成",
    history: "戦国期の統一",
    archaeology: "城郭考古学",
    histGeo: "戦略的地理",
    poliSci: "国家形成と権威",
    japaneseStudies: "政治史",
  },
  {
    theme: "Tokugawa Legitimacy",
    themeJa: "徳川の正統性",
    history: "近世の政治秩序",
    archaeology: "—",
    histGeo: "権力と景観",
    poliSci: "正統性と継承",
    japaneseStudies: "徳川政治文化",
  },
  {
    theme: "Ancient Naniwa",
    themeJa: "古代難波",
    history: "古代国家の形成",
    archaeology: "発掘と都市復元",
    histGeo: "古代都市の歴史地理",
    poliSci: "—",
    japaneseStudies: "古代の都城研究",
  },
  {
    theme: "Historical Memory",
    themeJa: "歴史的記憶",
    history: "歴史叙述と歴史解釈",
    archaeology: "—",
    histGeo: "文化的景観",
    poliSci: "ナショナリズムと記憶",
    japaneseStudies: "遺産とアイデンティティ",
  },
  {
    theme: "Jomon–Yayoi Transition",
    themeJa: "縄文〜弥生の変遷",
    history: "先史日本・縄文から弥生への変化",
    archaeology: "貝塚・土器・水田稲作",
    histGeo: "環境と集落の考古学",
    poliSci: "—",
    japaneseStudies: "先史日本文化",
  },
];

export const universityCurriculumAlignment: DisciplineRow[] = universityAlignment;
