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
  university: string;
}

export const curriculumAlignment: CurriculumRow[] = [
  {
    theme: "Ancient Osaka / Naniwa",
    themeJa: "古代大阪 / 難波",
    jhsSocial: "Grade 7 ★★★★★",
    hsRekish: "—",
    hsNihonshi: "A ★★★★★",
    hsTankyu: "✓✓✓",
    english: "✓",
    ib: "—",
    ap: "Unit 1",
    university: "Archaeology",
  },
  {
    theme: "Warrior Monks & Power",
    themeJa: "武者団と権力",
    jhsSocial: "Grade 7 ★★★★★",
    hsRekish: "—",
    hsNihonshi: "B ★★★★★",
    hsTankyu: "✓✓",
    english: "✓",
    ib: "—",
    ap: "—",
    university: "Medieval History",
  },
  {
    theme: "Hideyoshi & Unification",
    themeJa: "秀吉と統一",
    jhsSocial: "Grade 8 ★★★★★",
    hsRekish: "Referenced",
    hsNihonshi: "C ★★★★★",
    hsTankyu: "✓✓",
    english: "✓",
    ib: "HL: Asia & Oceania",
    ap: "Unit 3, 5",
    university: "Political History",
  },
  {
    theme: "Tokugawa Legitimacy",
    themeJa: "徳川の正統性",
    jhsSocial: "Grade 8 ★★★★★",
    hsRekish: "Referenced",
    hsNihonshi: "C ★★★★★",
    hsTankyu: "✓✓",
    english: "✓",
    ib: "Topic 5",
    ap: "Unit 3",
    university: "Early Modern",
  },
  {
    theme: "Meiji & Modern Osaka",
    themeJa: "明治・近代大阪",
    jhsSocial: "Grade 9 ★★★★★",
    hsRekish: "B ★★★★★",
    hsNihonshi: "D ★★★★★",
    hsTankyu: "✓✓",
    english: "✓✓",
    ib: "Topic 7",
    ap: "Unit 5",
    university: "Modern History",
  },
  {
    theme: "Power & Propaganda",
    themeJa: "権力とプロパガンダ",
    jhsSocial: "Grade 8 ★★★★",
    hsRekish: "—",
    hsNihonshi: "C ★★★★",
    hsTankyu: "✓✓",
    english: "✓",
    ib: "Topic 5",
    ap: "Unit 3",
    university: "Political Science",
  },
  {
    theme: "Historical Memory",
    themeJa: "歴史的記憶",
    jhsSocial: "Grade 9 ★★★★",
    hsRekish: "D ★★★★",
    hsNihonshi: "D ★★★★★",
    hsTankyu: "✓✓✓",
    english: "✓✓",
    ib: "IA: Fieldwork",
    ap: "—",
    university: "Heritage Studies",
  },
  {
    theme: "Geography & Power",
    themeJa: "地理と権力",
    jhsSocial: "Grade 7–8 ★★★★",
    hsRekish: "B ★★★★",
    hsNihonshi: "A, C ★★★★",
    hsTankyu: "✓✓✓",
    english: "✓",
    ib: "Topic 4",
    ap: "Unit 1",
    university: "Historical Geography",
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
    history: "✓✓",
    archaeology: "✓",
    histGeo: "✓✓✓",
    poliSci: "✓✓",
    japaneseStudies: "✓✓",
  },
  {
    theme: "Power & Propaganda",
    themeJa: "権力とプロパガンダ",
    history: "✓✓",
    archaeology: "—",
    histGeo: "✓",
    poliSci: "✓✓✓",
    japaneseStudies: "✓✓",
  },
  {
    theme: "Hideyoshi & State Formation",
    themeJa: "秀吉と国家形成",
    history: "✓✓",
    archaeology: "✓",
    histGeo: "✓✓",
    poliSci: "✓✓",
    japaneseStudies: "✓✓",
  },
  {
    theme: "Tokugawa Legitimacy",
    themeJa: "徳川の正統性",
    history: "✓✓✓",
    archaeology: "—",
    histGeo: "✓",
    poliSci: "✓✓",
    japaneseStudies: "✓✓",
  },
  {
    theme: "Ancient Naniwa",
    themeJa: "古代難波",
    history: "✓✓",
    archaeology: "✓✓✓",
    histGeo: "✓✓✓",
    poliSci: "—",
    japaneseStudies: "✓✓",
  },
  {
    theme: "Historical Memory",
    themeJa: "歴史的記憶",
    history: "✓✓",
    archaeology: "—",
    histGeo: "✓",
    poliSci: "✓",
    japaneseStudies: "✓✓✓",
  },
];
