export interface InvestigationExample {
  id: string;
  level: "jhs" | "hs" | "university";
  levelLabel: string;
  levelLabelJa: string;
  subject: string;
  subjectJa: string;
  title: string;
  titleJa: string;
  angle: string;
  angleJa: string;
  question: string;
  questionJa: string;
  sites: string[];
  sitesJa: string[];
  discovery: string;
  discoveryJa: string;
  feedback: string;
  feedbackJa: string;
  relevantThemes: string[];
  timelineSlugs: string[];
}

export const investigationExamples: InvestigationExample[] = [
  {
    id: "hideyoshi-unification",
    level: "jhs",
    levelLabel: "Junior High",
    levelLabelJa: "中学校",
    subject: "Social Studies — History",
    subjectJa: "社会科 — 歴史",
    title: "Hideyoshi & the Unification of Japan",
    titleJa: "秀吉と日本の統一",
    angle: "Why Osaka was chosen as the centre of Toyotomi power",
    angleJa: "なぜ大阪が豊臣権力の中心として選ばれたのか",
    question:
      "Why did Hideyoshi build his castle HERE — and what does that tell us about how he wanted to be perceived?",
    questionJa:
      "なぜ秀吉は大阪城をここに建てたのか——そしてそれは、彼がどう見られたいと思ったかを何語っているか？",
    sites: [
      "Hoenzaka Warehouse",
      "Naniwa Palace",
      "Ishiyama-Hongan-ji",
      "Osaka-jo",
    ],
    sitesJa: [
      "法円坂倉庫",
      "難波宮",
      "石山本願寺",
      "大阪城",
    ],
    discovery:
      "Students examine geographical, military, political and symbolic explanations for Hideyoshi's choice. Their conclusions are then tested against archaeological evidence and contemporary sources.",
    discoveryJa:
      "生徒は地理的、軍事的、政治的、象徴的な秀吉の選択の説明を検討する。その結論は考古学的証拠と同時代の史料で検証される。",
    feedback:
      "My students said this was the first time history felt like something they could actually think about.",
    feedbackJa:
      "生徒が「歴史を自分自身で考える初めての経験」と言いました。",
    relevantThemes: ["hideyoshi", "geography-power"],
    timelineSlugs: ["toyotomihideyoshi", "three-unifiers", "osaka-castle-history"],
  },
  {
    id: "ishiyama-warrior-monks",
    level: "jhs",
    levelLabel: "Junior High",
    levelLabelJa: "中学校",
    subject: "Social Studies — History",
    subjectJa: "社会 — 歴史",
    title: "Warrior Monks, Peasants & the Siege of Osaka",
    titleJa: "僧兵、百姓、そして大坂の包囲戦",
    angle: "Why did Nobunaga spend 10 years attacking a religious fortress?",
    angleJa: "なぜ信長は10年かけて宗教要塞を包囲したのか？",
    question:
      "Was the Ishiyama Honganji War about religion, power, or control of the river?",
    questionJa:
      "石山本願寺戦争は宗教、権力、川の支配のどれについてだったのか？",
    sites: [
      "Ishiyama Honganji ruins",
      "Uemachi Plateau",
      "Osaka River systems",
    ],
    sitesJa: [
      "石山本願寺跡",
      "上町台地",
      "大坂の水系",
    ],
    discovery:
      "Students investigate how religion, geography, trade, and political power interacted during the conflict, then test competing explanations against the evidence.",
    discoveryJa:
      "生徒は紛争中に宗教、地理、貿易、政治的権力がどのように相互作用したかを調査し、競合する説明を証拠に照らして検証する。",
    feedback:
      "Osaka's rivers were once Japan's highways.",
    feedbackJa:
      "大坂の川はかつて日本のハイウェイだった。",
    relevantThemes: ["warrior-monks", "geography-power"],
    timelineSlugs: ["ishiyama-timeline"],
  },
  {
    id: "ancient-naniwa",
    level: "jhs",
    levelLabel: "Junior High",
    levelLabelJa: "中学校",
    subject: "Social Studies — History",
    subjectJa: "社会 — 歴史",
    title: "Ancient Naniwa: Three Capitals, One Location",
    titleJa: "古代難波：三つの都、一つの場所",
    angle: "Why did three different emperors keep choosing the same spot?",
    angleJa: "なぜ3人の天皇が同じ場所を選び続けたのか？",
    question:
      "What made this location valuable enough to rebuild a capital on three separate occasions?",
    questionJa:
      "この場所が3回も都を再建するに値するほどの価値があるとはどういうことか？",
    sites: [
      "Naniwa Palace ruins",
      "Shitenno-ji",
      "Uemachi Plateau",
    ],
    sitesJa: [
      "難波宮跡",
      "四天王寺",
      "上町台地",
    ],
    discovery:
      "Students investigate why multiple emperors chose the same location across centuries, evaluating whether geography, trade access, or political symbolism best explains the pattern.",
    discoveryJa:
      "生徒はなぜ複数の天皇が世紀にわたって同じ場所を選び続けたのかを調査し、地理、貿易アクセス、政治的象徴のいずれがそのパターンを最もよく説明するかを評価する。",
    feedback:
      "I had no idea Osaka was this old. The geography makes it obvious in hindsight.",
    feedbackJa:
      "大阪がこんなに古いとは思わなかった。後から見れば地理がすべて説明する。",
    relevantThemes: ["ancient-osaka", "geography-power"],
    timelineSlugs: ["empress-shotoku", "shitennojihistory"],
  },
  {
    id: "tokugawa-legitimacy",
    level: "hs",
    levelLabel: "Senior High",
    levelLabelJa: "高等学校",
    subject: "History Integrated / Japanese History Inquiry",
    subjectJa: "歴史総合 / 日本史探究",
    title: "Tokugawa Legitimacy & the Rebuilding of Osaka",
    titleJa: "徳川の正統性と大阪の再建",
    angle: "Why the Tokugawa rebuilt the castle of the family they had defeated",
    angleJa: "なぜ徳川は敗れた相手の城を再建したのか",
    question:
      "Why would the winner of a war rebuild the castle of the family he had defeated?",
    questionJa:
      "なぜ戦いの勝者は、敗れた相手の城を再建するのか？",
    sites: [
      "Hoenzaka Warehouse",
      "Naniwa Palace",
      "Ishiyama-Hongan-ji",
      "Osaka-jo",
    ],
    sitesJa: [
      "法円坂倉庫",
      "難波宮",
      "石山本願寺",
      "大阪城",
    ],
    discovery:
      "Students examine competing interpretations of why the Tokugawa rebuilt Osaka Castle and what the reconstruction communicated about legitimacy, power, and historical memory.",
    discoveryJa:
      "生徒はなぜ徳川が大阪城を再建し、その再建が正統性、権力、歴史的記憶について何を伝えたかについての競合する解釈を検証する。",
    feedback:
      "This was the first time my students understood that 'rebuilding' can be an act of political destruction.",
    feedbackJa:
      "「再建」が政治的破壊の行為となり得ることを、生徒が初めて理解した授業でした。",
    relevantThemes: ["tokugawa", "power-propaganda", "historical-memory"],
    timelineSlugs: [
      "tokugawa-ieyasu-timeline",
      "toyotomi_hideyori",
      "osaka-castle-history",
    ],
  },
  {
    id: "geography-power",
    level: "hs",
    levelLabel: "Senior High",
    levelLabelJa: "高等学校",
    subject: "Comprehensive Inquiry Time",
    subjectJa: "総合的な探究の時間",
    title: "Geography & Political Power",
    titleJa: "地理と政治的権力",
    angle: "How does geography shape political history?",
    angleJa: "地理はどのように政治的歴史を形づくるのか",
    question:
      "Why did political powers repeatedly choose this exact location — the Uemachi Plateau — as their centre?",
    questionJa:
      "なぜ政治権力は繰り返し、この正確な場所——上町台地——を自らの中心としたのか？",
    sites: [
      "Hoenzaka Warehouse",
      "Naniwa Palace",
      "Ishiyama-Hongan-ji",
      "Osaka-jo",
    ],
    sitesJa: [
      "法円坂倉庫",
      "難波宮",
      "石山本願寺",
      "大阪城",
    ],
    discovery:
      "Students traced 1,500 years of political convergence on a single ridge. They identified water access, defensive elevation, transportation routes, and symbolic associations — and debated which factor mattered most in each era.",
    discoveryJa:
      "生徒は1,500年にわたる一つの尾根への政治的集約を追跡した。水へのアクセス、防御的な高さ、交通路、象徴的連想を特定し、各時代でどの要因が最重要であったかを議論した。",
    feedback:
      "My students now understand that geography isn't background — it's a historical actor.",
    feedbackJa:
      "生徒が「地理は背景ではなく、歴史の行為者である」と理解するようになった授業でした。",
    relevantThemes: ["geography-power", "ancient-osaka"],
    timelineSlugs: ["deeptimeline", "before-the-castle-prehistoric-osaka", "empress-shotoku"],
  },
  {
    id: "propaganda-memory",
    level: "university",
    levelLabel: "University",
    levelLabelJa: "大学",
    subject: "Political Science / Japanese Studies",
    subjectJa: "政治学 / 日本学",
    title: "Propaganda, Legitimacy & Historical Memory",
    titleJa: "プロパガンダ、正統性、歴史的記憶",
    angle: "How rulers use architecture to construct political legitimacy",
    angleJa: "支配者は建築をどのようにして政治的正統性の構築に活用するか",
    question:
      "How can we tell whether a historical structure was built for military necessity or political performance?",
    questionJa:
      "歴史的建造物が軍事的必要性のために作られたのか、政治的パフォーマンスのために作られたのか、どうやって区別できるか？",
    sites: [
      "Hoenzaka Warehouse",
      "Naniwa Palace",
      "Ishiyama-Hongan-ji",
      "Osaka-jo",
    ],
    sitesJa: [
      "法円坂倉庫",
      "難波宮",
      "石山本願寺",
      "大阪城",
    ],
    discovery:
      "Students examine how successive rulers used the same physical space to project different political narratives, then evaluate how 20th-century reconstruction added another interpretive layer to the site's meaning.",
    discoveryJa:
      "生徒は、歴代の支配者がどう同じ物理的空間を使って異なる政治的物語を投影したかを検証し、近代の再建がその地点の意味にどのような解釈的層を加えたかを評価する。",
    feedback:
      "This seminar changed how my students read political architecture everywhere — not just in Japan.",
    feedbackJa:
      "このセミナーは、生徒が日本のだけでなく、あらゆる場所の政治的建築を読み取る方法を変えました。",
    relevantThemes: ["power-propaganda", "historical-memory"],
    timelineSlugs: [
      "osaka-castle-history",
      "toyotomihideyoshi",
      "tokugawa-ieyasu-timeline",
    ],
  },
  {
    id: "ancient-naniwa-reconstruction",
    level: "hs",
    levelLabel: "Senior High / IB",
    levelLabelJa: "高等学校 / IB",
    subject: "Archaeology / Ancient History",
    subjectJa: "考古学 / 古代史",
    title: "Ancient Naniwa: Reconstructing a Vanished City",
    titleJa: "古代難波：失われた都市の再構成",
    angle: "Can you reconstruct a city from the landscape?",
    angleJa: "景観から都市を再構成できるか？",
    question:
      "What evidence allows us to reconstruct a city that disappeared 1,500 years ago?",
    questionJa:
      "1,500年前に消えた都市を再構成できる証拠とは何か？",
    sites: [
      "Hoenzaka Warehouse",
      "Naniwa Palace",
      "Ishiyama-Hongan-ji",
      "Osaka-jo",
    ],
    sitesJa: [
      "法円坂倉庫",
      "難波宮",
      "石山本願寺",
      "大阪城",
    ],
    discovery:
      "Students examine how the same geographic features attracted successive powers across 1,500 years, testing whether geography determines political outcomes or merely enables them.",
    discoveryJa:
      "生徒は同じ地理的特徴が1,500年にわたって歴代の権力者をどのように惹きつけてきたのかを検証し、地理が政治的結果を決定するのか、それとも単に可能にするのかを検証する。",
    feedback:
      "My IB students used this as the basis for their Internal Assessment investigations.",
    feedbackJa:
      "IB生徒がこの授業を内部評価調査の基礎として使用しました。",
    relevantThemes: ["ancient-osaka", "geography-power"],
    timelineSlugs: [
      "deeptimeline",
      "empress-shotoku",
      "shitennojihistory",
      "before-the-castle-prehistoric-osaka",
    ],
  },
  {
    id: "reconstructing-ancient-naniwa",
    level: "university",
    levelLabel: "University",
    levelLabelJa: "大学",
    subject: "Archaeology / Ancient History",
    subjectJa: "考古学 / 古代史",
    title: "Reconstructing Ancient Naniwa",
    titleJa: "古代難波の再構成",
    angle: "What can archaeology tell us when the documentary record is incomplete?",
    angleJa: "文書記録が不完全なとき、考古学は何を語れるか？",
    question:
      "How do historians and archaeologists reconstruct a city that left few written records but significant physical remains?",
    questionJa:
      "歴史家と考古学者は、文書記録は少ないが物理的遺構が重要な都市をどのように再構成するか？",
    sites: [
      "Hoenzaka Warehouse",
      "Naniwa Palace",
      "Ishiyama-Hongan-ji",
      "Osaka-jo",
    ],
    sitesJa: [
      "法円坂倉庫",
      "難波宮",
      "石山本願寺",
      "大阪城",
    ],
    discovery:
      "Students examined how archaeological evidence — foundation stones, pottery distributions, spatial analysis — reconstructs a city that contemporary texts barely mention. They evaluated the limits of archaeological inference and the relationship between material evidence and written sources.",
    discoveryJa:
      "生徒は、考古学的証拠——基礎石、陶器の分布、空間分析——が、当時の史料がほとんど記述しない都市をどのように再構成するかを検証した。考古学的推論の限界と、物的証拠と文書史料の関係を評価した。",
    feedback:
      "This seminar gave my students a concrete understanding of how historical knowledge is constructed from incomplete evidence.",
    feedbackJa:
      "このセミナーは、不完全な証拠から歴史的知識がどのように構築されるかを生徒に具体的に理解させました。",
    relevantThemes: ["ancient-osaka", "geography-power"],
    timelineSlugs: [
      "deeptimeline",
      "empress-shotoku",
      "shitennojihistory",
      "before-the-castle-prehistoric-osaka",
    ],
  },
  {
    id: "landscape-as-evidence",
    level: "university",
    levelLabel: "University",
    levelLabelJa: "大学",
    subject: "Historical Geography / Political Science",
    subjectJa: "歴史地理学 / 政治学",
    title: "The Landscape as Historical Evidence",
    titleJa: "歴史的証拠としての景観",
    angle: "What can physical geography reveal that written sources conceal?",
    angleJa: "地理は書かれた史料が語れないことを何を明らかにできるか？",
    question:
      "How does the physical landscape of the Uemachi Plateau reveal patterns of political power that written sources alone cannot explain?",
    questionJa:
      "上町台地の物理的景観は、文書だけでは説明できない政治的権力のパターンをどのように明らかにするか？",
    sites: [
      "Hoenzaka Warehouse",
      "Naniwa Palace",
      "Ishiyama-Hongan-ji",
      "Osaka-jo",
    ],
    sitesJa: [
      "法円坂倉庫",
      "難波宮",
      "石山本願寺",
      "大阪城",
    ],
    discovery:
      "Students analyzed how the ridge, waterways, elevation, and sightlines shaped 1,500 years of political decisions. They developed spatial arguments about power, defense, and legitimacy that complemented and sometimes contradicted the documentary record.",
    discoveryJa:
      "生徒は、尾根、水路、高さ、視線が1,500年の政治的決定をどのように形づくったかを分析した。権力、防衛、正統性に関する空間的論拠を展開し、文書記録を補完し、場合によっては矛盾させる議論を構築した。",
    feedback:
      "My students now approach every historical site as a primary source — not just a backdrop.",
    feedbackJa:
      "生徒があらゆる歴史的地点を背景ではなく一次史料として扱うようになりました。",
    relevantThemes: ["geography-power", "ancient-osaka"],
    timelineSlugs: [
      "deeptimeline",
      "before-the-castle-prehistoric-osaka",
      "empress-shotoku",
    ],
  },
];
