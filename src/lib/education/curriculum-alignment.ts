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
  jhsSocialEn: string;
  rekishSogo: string;
  rekishSogoEn: string;
  nihonshiTankyu: string;
  nihonshiTankyuEn: string;
  tankyu: string;
  tankyuEn: string;
  english: string;
  ib: string;
  ap: string;
}

export const jhsCurriculumAlignment: JHSCurriculumRow[] = [
  {
    theme: "Jomon–Yayoi Transition",
    themeJa: "縄文〜弥生の変遷",
    jhsSocial: "中1・先史日本",
    jhsSocialEn: "Grade 7 · Prehistoric Japan",
    rekishSogo: "—",
    rekishSogoEn: "—",
    nihonshiTankyu: "先史日本",
    nihonshiTankyuEn: "Prehistoric Japan",
    tankyu: "証拠と解釈",
    tankyuEn: "Evidence & Interpretation",
    english: "Evidence & Interpretation",
    ib: "—",
    ap: "—",
  },
  {
    theme: "Ancient Osaka / Naniwa",
    themeJa: "古代大阪・難波",
    jhsSocial: "中1・古代日本",
    jhsSocialEn: "Grade 7 · Ancient Japan",
    rekishSogo: "—",
    rekishSogoEn: "—",
    nihonshiTankyu: "古代国家の形成",
    nihonshiTankyuEn: "Early State Formation",
    tankyu: "歴史的問い",
    tankyuEn: "Historical Question",
    english: "Research Question",
    ib: "—",
    ap: "Unit 1",
  },
  {
    theme: "Warrior Monks & Power",
    themeJa: "僧兵・農民と権力",
    jhsSocial: "中1・中世日本",
    jhsSocialEn: "Grade 7 · Medieval Japan",
    rekishSogo: "—",
    rekishSogoEn: "—",
    nihonshiTankyu: "中世の政治権力",
    nihonshiTankyuEn: "Medieval Political Power",
    tankyu: "証拠と解釈",
    tankyuEn: "Evidence & Interpretation",
    english: "Evidence & Interpretation",
    ib: "—",
    ap: "—",
  },
  {
    theme: "Hideyoshi & Unification",
    themeJa: "秀吉と統一",
    jhsSocial: "中2・戦国〜統一",
    jhsSocialEn: "Grade 8 · Sengoku–Unification",
    rekishSogo: "参照可能",
    rekishSogoEn: "Relevant",
    nihonshiTankyu: "戦国・統一",
    nihonshiTankyuEn: "Sengoku & Unification",
    tankyu: "地理と権力",
    tankyuEn: "Geography & Power",
    english: "Geography & Power",
    ib: "HL: Asia & Oceania",
    ap: "Units 3, 5",
  },
  {
    theme: "Tokugawa Legitimacy",
    themeJa: "徳川の正統性",
    jhsSocial: "中2・近世日本",
    jhsSocialEn: "Grade 8 · Early Modern Japan",
    rekishSogo: "参照可能",
    rekishSogoEn: "Relevant",
    nihonshiTankyu: "近世の政治秩序",
    nihonshiTankyuEn: "Early Modern Political Order",
    tankyu: "正統性とプロパガンダ",
    tankyuEn: "Legitimacy & Propaganda",
    english: "Legitimacy & Propaganda",
    ib: "Topic 5",
    ap: "Unit 3",
  },
  {
    theme: "Meiji & Modern Osaka",
    themeJa: "明治・近代大阪",
    jhsSocial: "中3・近代日本",
    jhsSocialEn: "Grade 9 · Modern Japan",
    rekishSogo: "近代化と社会変容",
    rekishSogoEn: "Modernization & Social Change",
    nihonshiTankyu: "近代日本",
    nihonshiTankyuEn: "Modern Japan",
    tankyu: "変化と継続",
    tankyuEn: "Change & Continuity",
    english: "Change & Continuity",
    ib: "Topic 7",
    ap: "Unit 5",
  },
  {
    theme: "Power & Propaganda",
    themeJa: "権力とプロパガンダ",
    jhsSocial: "中2・政治権力",
    jhsSocialEn: "Grade 8 · Political Power",
    rekishSogo: "—",
    rekishSogoEn: "—",
    nihonshiTankyu: "政治的正統性",
    nihonshiTankyuEn: "Political Legitimacy",
    tankyu: "正統性と物語",
    tankyuEn: "Legitimacy & Narrative",
    english: "Legitimacy & Narrative",
    ib: "Topic 5",
    ap: "Unit 3",
  },
  {
    theme: "Historical Memory",
    themeJa: "歴史的記憶",
    jhsSocial: "中3・近現代日本",
    jhsSocialEn: "Grade 9 · Modern & Contemporary Japan",
    rekishSogo: "歴史解釈",
    rekishSogoEn: "Historical Interpretation",
    nihonshiTankyu: "複数の歴史解釈",
    nihonshiTankyuEn: "Multiple Historical Interpretations",
    tankyu: "複数の視点",
    tankyuEn: "Multiple Perspectives",
    english: "Multiple Interpretations",
    ib: "IA: Fieldwork",
    ap: "—",
  },
  {
    theme: "Geography & Power",
    themeJa: "地理と権力",
    jhsSocial: "中1〜中2・地理と政治",
    jhsSocialEn: "Grades 7–8 · Geography & Politics",
    rekishSogo: "空間分析",
    rekishSogoEn: "Spatial Analysis",
    nihonshiTankyu: "国家形成と領域",
    nihonshiTankyuEn: "State Formation & Territory",
    tankyu: "地理と権力",
    tankyuEn: "Geography & Power",
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
  rekishSogoEn: string;
  nihonshiTankyu: string;
  nihonshiTankyuEn: string;
  tankyu: string;
  tankyuEn: string;
  english: string;
  ib: string;
  ap: string;
}

export const hsCurriculumAlignment: HSCurriculumRow[] = [
  {
    theme: "Jomon–Yayoi Transition",
    themeJa: "縄文〜弥生の変遷",
    rekishSogo: "—",
    rekishSogoEn: "—",
    nihonshiTankyu: "先史日本",
    nihonshiTankyuEn: "Prehistoric Japan",
    tankyu: "証拠と解釈",
    tankyuEn: "Evidence & Interpretation",
    english: "Evidence & Interpretation",
    ib: "—",
    ap: "—",
  },
  {
    theme: "Ancient Osaka / Naniwa",
    themeJa: "古代大阪・難波",
    rekishSogo: "古代国家の形成",
    rekishSogoEn: "Ancient State Formation",
    nihonshiTankyu: "古代日本",
    nihonshiTankyuEn: "Ancient Japan",
    tankyu: "歴史的問い",
    tankyuEn: "Historical Question",
    english: "Research Question",
    ib: "—",
    ap: "Unit 1",
  },
  {
    theme: "Warrior Monks & Power",
    themeJa: "僧兵・農民と権力",
    rekishSogo: "中世の政治権力",
    rekishSogoEn: "Medieval Political Power",
    nihonshiTankyu: "中世日本",
    nihonshiTankyuEn: "Medieval Japan",
    tankyu: "証拠と解釈",
    tankyuEn: "Evidence & Interpretation",
    english: "Evidence & Interpretation",
    ib: "—",
    ap: "—",
  },
  {
    theme: "Hideyoshi & Unification",
    themeJa: "秀吉と統一",
    rekishSogo: "戦国〜統一",
    rekishSogoEn: "Sengoku & Unification",
    nihonshiTankyu: "戦国・統一",
    nihonshiTankyuEn: "Sengoku & Unification",
    tankyu: "地理と権力",
    tankyuEn: "Geography & Power",
    english: "Geography & Power",
    ib: "HL: Asia & Oceania",
    ap: "Units 3, 5",
  },
  {
    theme: "Tokugawa Legitimacy",
    themeJa: "徳川の正統性",
    rekishSogo: "近世の政治秩序",
    rekishSogoEn: "Early Modern Political Order",
    nihonshiTankyu: "近世日本",
    nihonshiTankyuEn: "Early Modern Japan",
    tankyu: "正統性とプロパガンダ",
    tankyuEn: "Legitimacy & Propaganda",
    english: "Legitimacy & Propaganda",
    ib: "Topic 5",
    ap: "Unit 3",
  },
  {
    theme: "Meiji & Modern Osaka",
    themeJa: "明治・近代大阪",
    rekishSogo: "近代化と社会変容",
    rekishSogoEn: "Modernization & Social Change",
    nihonshiTankyu: "近代日本",
    nihonshiTankyuEn: "Modern Japan",
    tankyu: "変化と継続",
    tankyuEn: "Change & Continuity",
    english: "Change & Continuity",
    ib: "Topic 7",
    ap: "Unit 5",
  },
  {
    theme: "Power & Propaganda",
    themeJa: "権力とプロパガンダ",
    rekishSogo: "政治的正統性",
    rekishSogoEn: "Political Legitimacy",
    nihonshiTankyu: "権力と政治",
    nihonshiTankyuEn: "Political Power",
    tankyu: "正統性と物語",
    tankyuEn: "Legitimacy & Narrative",
    english: "Legitimacy & Narrative",
    ib: "Topic 5",
    ap: "Unit 3",
  },
  {
    theme: "Historical Memory",
    themeJa: "歴史的記憶",
    rekishSogo: "歴史解釈",
    rekishSogoEn: "Historical Interpretation",
    nihonshiTankyu: "複数の歴史解釈",
    nihonshiTankyuEn: "Multiple Historical Interpretations",
    tankyu: "複数の視点",
    tankyuEn: "Multiple Perspectives",
    english: "Multiple Interpretations",
    ib: "IA: Fieldwork",
    ap: "—",
  },
  {
    theme: "Geography & Power",
    themeJa: "地理と権力",
    rekishSogo: "地理と政治権力",
    rekishSogoEn: "Spatial Analysis",
    nihonshiTankyu: "空間分析",
    nihonshiTankyuEn: "State Formation & Territory",
    tankyu: "国家形成と領域",
    tankyuEn: "Geography & Power",
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
  historyEn: string;
  archaeology: string;
  archaeologyEn: string;
  histGeo: string;
  histGeoEn: string;
  poliSci: string;
  poliSciEn: string;
  japaneseStudies: string;
  japaneseStudiesEn: string;
}

export const universityAlignment: DisciplineRow[] = [
  {
    theme: "Geography & Power",
    themeJa: "地理と権力",
    history: "国家形成の空間分析",
    historyEn: "Spatial Analysis of State Formation",
    archaeology: "景観考古学",
    archaeologyEn: "Landscape Archaeology",
    histGeo: "自然地理と政治権力",
    histGeoEn: "Physical Geography & Political Power",
    poliSci: "領域と政治的支配",
    poliSciEn: "Territory & Political Control",
    japaneseStudies: "地域権力の動態",
    japaneseStudiesEn: "Regional Power Dynamics",
  },
  {
    theme: "Power & Propaganda",
    themeJa: "権力とプロパガンダ",
    history: "政治的正統性と物語",
    historyEn: "Political Legitimacy & Narrative",
    archaeology: "—",
    archaeologyEn: "—",
    histGeo: "権力の都市景観",
    histGeoEn: "Power in the Urban Landscape",
    poliSci: "プロパガンダと国家の正統性",
    poliSciEn: "Propaganda & State Legitimacy",
    japaneseStudies: "政治的象徴",
    japaneseStudiesEn: "Political Symbolism",
  },
  {
    theme: "Hideyoshi & State Formation",
    themeJa: "秀吉と国家形成",
    history: "戦国期の統一",
    historyEn: "Sengoku Unification",
    archaeology: "城郭考古学",
    archaeologyEn: "Castle Archaeology",
    histGeo: "戦略的地理",
    histGeoEn: "Strategic Geography",
    poliSci: "国家形成と権威",
    poliSciEn: "State Formation & Authority",
    japaneseStudies: "政治史",
    japaneseStudiesEn: "Political History",
  },
  {
    theme: "Tokugawa Legitimacy",
    themeJa: "徳川の正統性",
    history: "近世の政治秩序",
    historyEn: "Early Modern Political Order",
    archaeology: "—",
    archaeologyEn: "—",
    histGeo: "権力と景観",
    histGeoEn: "Power & Landscape",
    poliSci: "正統性と継承",
    poliSciEn: "Legitimacy & Succession",
    japaneseStudies: "徳川政治文化",
    japaneseStudiesEn: "Tokugawa Political Culture",
  },
  {
    theme: "Ancient Naniwa",
    themeJa: "古代難波",
    history: "古代国家の形成",
    historyEn: "Formation of the Ancient State",
    archaeology: "発掘と都市復元",
    archaeologyEn: "Excavation & Urban Reconstruction",
    histGeo: "古代都市の歴史地理",
    histGeoEn: "Historical Geography of the Ancient City",
    poliSci: "—",
    poliSciEn: "—",
    japaneseStudies: "古代の都城研究",
    japaneseStudiesEn: "Ancient Capital & Urban Studies",
  },
  {
    theme: "Historical Memory",
    themeJa: "歴史的記憶",
    history: "歴史叙述と歴史解釈",
    historyEn: "Historiography & Historical Interpretation",
    archaeology: "—",
    archaeologyEn: "—",
    histGeo: "文化的景観",
    histGeoEn: "Cultural Landscape",
    poliSci: "ナショナリズムと記憶",
    poliSciEn: "Nationalism & Memory",
    japaneseStudies: "遺産とアイデンティティ",
    japaneseStudiesEn: "Heritage & Identity",
  },
  {
    theme: "Jomon–Yayoi Transition",
    themeJa: "縄文〜弥生の変遷",
    history: "先史日本・縄文から弥生への変化",
    historyEn: "Prehistoric Japan · Jomon to Yayoi",
    archaeology: "貝塚・土器・水田稲作",
    archaeologyEn: "Shell Middens, Pottery & Wet-Rice Agriculture",
    histGeo: "環境と集落の考古学",
    histGeoEn: "Environment & Settlement Archaeology",
    poliSci: "—",
    poliSciEn: "—",
    japaneseStudies: "先史日本文化",
    japaneseStudiesEn: "Prehistoric Japanese Culture",
  },
];

export const universityCurriculumAlignment: DisciplineRow[] = universityAlignment;
