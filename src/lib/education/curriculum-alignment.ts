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
    themeJa: "武者団と権力",
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
    history: "Spatial analysis of state formation",
    archaeology: "Landscape archaeology",
    histGeo: "Core — physical geography & political power",
    poliSci: "Territory & political control",
    japaneseStudies: "Regional power dynamics",
  },
  {
    theme: "Power & Propaganda",
    themeJa: "権力とプロパガンダ",
    history: "Political legitimacy & narrative",
    archaeology: "—",
    histGeo: "Urban landscapes of power",
    poliSci: "Core — propaganda & state legitimacy",
    japaneseStudies: "Political symbolism",
  },
  {
    theme: "Hideyoshi & State Formation",
    themeJa: "秀吉と国家形成",
    history: "Sengoku unification",
    archaeology: "Castle archaeology",
    histGeo: "Strategic geography",
    poliSci: "Nation-building & authority",
    japaneseStudies: "Political history",
  },
  {
    theme: "Tokugawa Legitimacy",
    themeJa: "徳川の正統性",
    history: "Core — early modern political order",
    archaeology: "—",
    histGeo: "Power & landscape",
    poliSci: "Legitimacy & succession",
    japaneseStudies: "Tokugawa political culture",
  },
  {
    theme: "Ancient Naniwa",
    themeJa: "古代難波",
    history: "Early Japanese state",
    archaeology: "Core — excavation & reconstruction",
    histGeo: "Core — ancient urban geography",
    poliSci: "—",
    japaneseStudies: "Ancient capital studies",
  },
  {
    theme: "Historical Memory",
    themeJa: "歴史的記憶",
    history: "Historiography & interpretation",
    archaeology: "—",
    histGeo: "Cultural landscapes",
    poliSci: "Nationalism & memory",
    japaneseStudies: "Core — heritage & identity",
  },
];
