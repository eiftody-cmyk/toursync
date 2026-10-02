# JA Naturalness Review Checklist — 日本語ネイティブレビュー用チェックリスト

Reviewer: an outside native Japanese speaker (the rewrites below are
machine-generated and have **not** yet been reviewed by a human native).
Scope: all 21 pages under `public/ja/*.html`.

Work landed in: `38b5641` (guide/lint), `5039c49` (P0 term fixes),
`b84a8b9` (Group A, 9 pages), `bf991dc` (Group B, 7 pages),
`e5e0e6f` (Group C, 5 pages), `54b1707` (this checklist + strict title lint),
`caa62ef` (round 2, azaiclan), `2cce699` (round 3, §5c),
`69ad5ff` (round 8, §5h — yayoi accuracy/terminology),
`7e74a4b` (round 9, §5i — empress_jingu historical rewrite),
`dc594b7` (round 10, §5j — ojinsuccession three-record rewrite),
`26cc219` (round 11, §5k — shitennojihistory accuracy/terminology rewrite).

---

## 1. How to review

```bash
npm run check:ja      # must pass: 0 errors, 0 warnings (title lint is now strict)
npm run check:data    # JSON-LD / canonical / FAQ parity
npm run check:parity  # EN↔JA deeptimeline index parity
npx tsc --noEmit
```

Then, per page: read the JA text and compare **meaning** against the EN twin
in `public/<same-name>.html` (EN is a meaning reference, not a literal source).
Return findings as `page → sentence → suggested fix`.

## 2. What is frozen (do not restructure)

- element order, ids, classes, hrefs, entry order/counts, FAQ pairing
- FAQ: the visible answer must stay **byte-identical** to the FAQPage
  JSON-LD `acceptedAnswer.text` (edit both together or the build breaks)
- `<title>` template: `… — … | エドワードと歩く大阪城`
  (em dash U+2014, ASCII pipe; no タイムライン/時間軸; no ― ─ · ｜)
- JSON-LD `LocalBusiness`/`WebSite` `"name": "Osaka Castle Walks with Edward"`
  intentionally stays Latin — do not translate
- meta description ≤ 120 JA chars; `rel=canonical` / `og:url` extensionless

## 3. Terminology decisions already applied (confirm, don't revert)

| Decision | Rule |
|---|---|
| Fortress naming | pre-1868 **大坂城**; modern park / 天守閣 / tour **大阪城** |
| City naming | historical **大坂**, modern **大阪** |
| Campaigns | **大坂の陣** / **大坂冬の陣** / **大坂夏の陣** (never 大阪の陣) |
| Warriors | **武士・武将** (never サムライ) |
| Assaults | **総攻撃** (never 強攻) |
| Dates | Gregorian primary; 和暦 only for anchors verified in `JA_STYLE_GUIDE.md`,   form `1615年（元和元年）`; bare CE/BCE removed (→ 年 / 紀元前X年) |
| Register | 敬体 です・ます in all visible prose; telegraphic noun captions allowed where EN is the same style |
| Double dashes | `——…——` parentheticals rewritten to （…）or 、; no `──` (U+2500) anywhere |
| Research credit | unified JA phrasing on all pages (see `JA_STYLE_GUIDE.md` §研究) |
| Page identity | `lordconcubineshogunlie` trio = **城主、側室、将軍の嘘** (was 大名; title/H1/FAQ/JSON-LD + all 20 JA nav labels + both llms.txt synced — do not reintroduce 大名 in labels) |
| soga page identity | **皇統の運命** in title/og/twitter/JSON-LD/H1 (was 皇室の運命 ×10); metas **史書の記述をめぐる論点** (was 歴史解釈の偏り ×3) |
| Power phrase | **権力と承認** in all JA (hideyoshi hero/H1 + deeptimeline continue li; was 命令・承認 = calque of EN "command, recognition" — EN kept as-is) |
| Continue heading | **大阪城で物語を続けましょう** on every JA page with that section (4 files normalized from 続ける) |
| Nara-era header | **藤原仲麻呂の乱** (was 藤原氏の変革; EN `Fujiwara Coup` → `Nakamaro's Rebellion`) |
| CTA trio | the 3 exact strings (法人向けチームビルディング… / 学校・大学向け歴史フィールドレッスン… / この再構成は、同時代のヨーロッパ人の記録…) on all 21 JA pages — buttons and English-link lines unchanged |
| Credit name | **エドワード・イフトディ** (round 0: was エドワード・イフティ ×32 / 20 JA files incl. `ja/llms.txt`) — matches EN "Edward Iftody" / JSON-LD `#edward-iftody`; the JSON-LD `イフトウデイ　エドワード` name fields (both locales) are a separate established rendering and stay as-is |
| Historian label | **専属** (round 0: was 常駐 ×25 / 20 JA files, incl. JSON-LD `jobTitle: 独立研究者・専属歴史家`); overrides the round-3 keep — reviewer's part 4/5/6 call; EN `Resident Historian` untouched |
| Tour badge | **ツアーで訪問** on all 83 JA `tour-badge` spans (round 0: was ツアー対象 ×61 + 徒歩コース ×13; deeptimeline already correct); EN badge stays `On Tour` ×83 |
| Museum name | **豊臣石垣館** (round 5: was 豊臣石垣博物館 ×7 in ja/osaka meta ×3 + JSON-LD + cards; official name per City of Osaka; EN "Toyotomi Stone Wall Museum" untouched) |
| osaka primary source | **『難波戦記』/ Naniwa Senki** (round 5: 『感身腸記』/ "Shōkō Monogatari" were phantom titles — both locales' sources li replaced, "written by participants" claim dropped) |
| Siege surrender subject | **本願寺が**…信長に降伏 (ja/ishiyama FAQ visible + JSON-LD ×2, byte-synced; annot-04: dropped sentence subjects restored) |
| Ishiyama↔dtail span | **1570–1580 = ten years / 十年** everywhere (annot-04 §57: ishiyama convention wins — dtail card `1568–1580`/eleven + tail P Eleven/11年 reverted in round 5; round 4's Eleven/11年戦争 superseded) |
| Genpei coverage range | **814–1192 / 814〜1192** in dtail tail li + genpei JSON-LD (round 5: round 4's shrink to 1180–1185 conflicted with the li title "…& the First Shogunate" and the page's own first card 814–889; fujiwara's 858–1086 stays) |
| Continue Exploring h2 | **探索を続ける** for EN "Continue Exploring" sections (deeptimeline + round-5 empress/ishiyama/osaka); distinct from the callout variant 大阪城で物語を続けましょう (§5d) |
| JA list tour links | EN-only tour pages linked root-absolute with JA titles — **僧兵、百姓、将軍** (`/warriormonkspeasantshogun.html`), **女神・女王・皇后・側室** (`/goddess_queen_empress_concubine.html`); item-count parity over link-language purity (no JA twins exist; JA-relative paths would 404) |
| Festival name | **天神祭** (round 6: ja/tenjin ×35 incl. title/meta/JSON-LD visible+FAQ — was 天神祭り; llms already canonical); **大川川 → 大川** ×15 (EN "Okawa River"); EN untouched |
| Taira naming | **平氏** for EN "Taira" in ja/genpei titles/meta/JSON-LD/prose ×37 (round 6: was 平家 — pairs with 源氏 per llms 平氏、源氏); **平家物語** ×4 kept (work title); era-btn/era-header 平氏の台頭 too |
| Gojoseon | **古朝鮮** in ja/yayoi ancient contexts (round 6: card titles ×2 + bodies ×2; EN "Gojoseon"); **のちの韓国** dropped from both locales' yayoi card prose in round 8 (→ 朝鮮半島の…); JSON-LD ancient cross-ref **朝鮮半島** (aligns JA HTML meta; EN "Korea" untouched); 衛氏朝鮮 kept |
| Suishou | **倭国王帥升** (round 6: was 倭面土王 ×2 in ja/yayoi JSON-LD + card; EN "Suishou" = 帥升, 後漢書 107 CE — visible = JSON-LD byte-aligned) |
| Ikasuri shrine | **坐摩神社** (readings いかすり/ざま; round 6: was 生駒神社 ×8 + 座摩 ×1 in ja/empress; EN "Ikasuri Shrine (Zama-san)" was already correct and kept; legend = Jingū founded it, five Ikasuri deities, moved 1608 when Osaka Castle was built) |
| Companion links | EN `/beforejapanhadaname.html` ↔ JA **/ja/before-the-castle-prehistoric-osaka.html** with short title **城になる前の大阪** (round 6: tenjin DYK trailing sentence + yayoi callout companion p added; no ja/beforejapanhadaname.html exists — never link it) |
| Box blurb | standard 「大阪城の石垣…」 sentence where EN blurb = "Explore the stone walls…" (round 6: empress/tenjin/yayoi); **genpei keeps its own pair** ("Walk the story of how warrior power swallowed the imperial court" → 武士の力が朝廷を呑み込んだ物語を… ); **fujiwara keeps its own pair** (round 7: "Walk the story of the women who bound the throne…" → 玉座とその主人を結びつけた女性たちの物語を…) |
| Fujiwara mothers | **母** in every "Fujiwara mothers" slot on fujiwara (round 7: was 后 ×9 — 立后 ×3 / 皇后 ×8 kept as terms of art; FAQ JSON↔visible byte-synced ×2; streak began with **聖武天皇**, both locales — EN Monmu claim was fact error); mothers cards: 乙牟漏（良継）/旅子（百川）/明子（冬嗣）/沢子, 安子=**師輔**の娘, 懐子=**伊尹**の娘, card title **二人の母と三つの治世** |
| Ōjin brothers | **菟道稚郎子** (was 宇治和気郎子 ×5), **皇子** (was 王子 ×11; 住吉仲皇子), **瑞歯別** (was 水歯別 ×7; = Mizuhawake), era-header/slot fixes **履中天皇・反正天皇** (was 反正/允恭 misassignments ×9 across era-header + 6 cards), book titles wrapped **『日本書紀』×24 / 『宋書』×7**, title **同じ物語の三つの記録** (was 三つのバージョン ×5 + both llms) |
| Hideyori identity | **黄金の鳥籠** (round 7: was 黄金の牢獄 ×8 — EN "Gilded Prison"/"The Sovereign of the Gilded Cage" untouched), **浪人** (was 浪士 ×1), age **1598年に5歳** (EN "age four" fact fix), hedge **自害したと伝えられています** (EN flat "commit ritual suicide (seppuku)" flagged not changed), callout h2 **大阪城で物語を続けましょう** + companion link to 城主、側室、将軍の嘘 |
| Siege death date | **1615年6月4日 / June 4, 1615** site standard (round 7: osaka-castle-history EN May 8/8 May + JA ×2 → June 4/4 June — reverses Round A's "month-level only" call on this page; hideyori/deeptimeline already standard) |
| Moat fill | outer moats only (round 7: dropped the "not just… but also the inner moats" claim in hideyori card, EN+JA — outer moat fill is the documented 1615 peace condition) |

## 4. ⚠ Uncertain phrases — review these first

| Page | Item | Why |
|---|---|---|
| `tenjin-matsuri-history`, `fujiwara-shadow-politics` | **時康親王** | EN says "Prince Tokiyo" — verify reading/attribution and whether both pages need the same figure |
| `ishiyama-timeline` | **焦土作戦** | calque of EN "scorched-earth campaign" — check if 焦土化作戦 / 焦土と化した is the natural JA military-historical term |
| `osaka-castle-history` | **国松** | EN "Kunimatsu" — confirm presentation (国松 with 幼名 千丸?) |
| `deeptimeline` | **政治の座から外された台地** | original JA said 昇格させられた (opposite of EN "Politically sidelined") — new wording follows EN; confirm intent |
| `empress-shotoku` | **紀百継 → 吉備真備**, card title **直接皇権の再主張** | agent-side factual/title corrections |
| `empress_jingu_timeline` | round-6 items (朝鮮×3, 女王, contradictory 200年頃 line) — **resolved round 9**: full historical rewrite removed 女帝 for Jingū, reframed Gwanggaeto/Himiko/Hōenzaka claims (§5i) | closed 2026-10-02 |
| `fujiwara-shadow-politics` | readings **侃子・重子**; **別部穢麻呂**; **詔を読み上げている儀式** (was 誥文) — round 7 resolved 諸盛の娘・安子 → 師輔の娘・安子 and 乙縄と多治比の娘 → 乙牟漏/旅子, added 伊尹（=Koretada, father of 懐子; 国史大辞典 花山天皇 entry) and fixed 文武→聖武 streak | EN names ambiguous or terminology avoided |
| `ojinsuccession` (Group C era) | 元明天皇 → 祖母で文武天皇の母; 厩戸王（のちの聖徳太子）; 敏達; 山背大兄王; 645年（大化元年） anchor | superseded — page fully rewritten round 10 (§5j); items no longer on the page |
| `ojinsuccession` | round-10 reviewer items (**395–410 regnal years**, 国家レベル overclaims, **商業的**難波, era headers 挑発/外交的沈黙, Hideyoshi–Ieyasu 1200年 aside) — **resolved round 10**: three-record rewrite removed all regnal years, interpretation-as-fact reframed, aside deleted (§5j). Native review still wanted on the new prose: 宋書 honorific quote (使持節・都督倭…六国諸軍事・安東大将軍・倭国王), readings 大鷦鷯尊/瑞歯別皇子, 倭の五王 transliteration (讃・珍・済・興・武) | open for prose review; content closed 2026-10-02 |
| `soga-fujiwara-timeline` | **藤原氏と摂関政治** (dedup), **皇室との婚姻** (was 王室結婚) | wording de-duplication |
| `shitennojihistory` | round-11 new vocabulary — **官寺**, **四箇院（敬田院・施薬院・療病院・悲田院）**, **二河白道**, **四天王寺式伽藍配置**, **開基**, **乙巳の変**, **難波長柄豊碕宮**, **厩戸皇子**, **門前町** | agent-introduced historical terms — confirm naturalness/registers (官寺 vs 寺院, 四箇院 reading, 難波長柄豊碕宮 full name); content closed 2026-10-02 (§5k), open for prose review |
| `azaiclanbetrayal` | **1564 marriage date** — round-2 review claimed 1567 "almost certainly"; sources actually split (Wikipedia Oichi body says 1567, its own infobox + Azai article say 1564), traditional/majority = 1564, site EN says 1564 ×7 (+ warriormonks teaser ×2). **Kept 1564 everywhere** (decision 2026-10-01); JA-only change would have contradicted EN |
| all pages | JSON-LD `publisher.name` left Latin | intentional, see §2 |

## 5. Per-page status (all rewritten, guards green)

- **Group A** (`b84a8b9`): `sanada_nobushige`, `tokugawa-ieyasu-timeline`,
  `genpei-timeline`, `three-unifiers`, `toyotomi_hideyori`, `azaiclanbetrayal`,
  `lordconcubineshogunlie`, `toyotomihideyoshi`, `hideyoshi-rikyu-timeline`
- **Group B** (`bf991dc`): `ishiyama-timeline`, `shitennojihistory`,
  `tenjin-matsuri-history`, `before-the-castle-prehistoric-osaka`,
  `yayoi_timeline`, `osaka-castle-history`, `deeptimeline`
  (deeptimeline: 35 card bodies + title `上町台地 — ディープタイムの年表`,
  73 —— / 40 ── / 8 模板 / 46 CE-BCE retired)
- **Group C** (`e5e0e6f`): `empress-shotoku`, `empress_jingu_timeline`,
  `fujiwara-shadow-politics`, `ojinsuccession`, `soga-fujiwara-timeline`

Suggested review order (SEO/tour impact first):
`deeptimeline` → `osaka-castle-history`, `ishiyama-timeline`, `tenjin-matsuri-history`
→ `ojinsuccession`, `soga-fujiwara-timeline`, `fujiwara-shadow-politics` → remainder spot-check.

## 5b. Round 2 — `azaiclanbetrayal` full external draft + historian review (2026-10-01)

A second-pass full-page rewrite (external draft in hybrid AEO/brand tone) was
applied over Group A, incorporating a historian's 10-item accuracy review:

- **Applied (review items 2–9, 10):** 朝倉＝主家/主従 categorical claims →
  朝倉氏との長年の関係 (the feudal-lord framing was an overclaim; EN's own
  "hereditary feudal loyalty" was left as-is, JA-only scope); 完全な安全回廊
  softened; 血統 used selectively (秀頼 card now "信長の妹・お市を通じて" —
  avoids implying direct dynastic continuity); 孤児 → 両親を相次いで失った;
  最も影響力のある側室 → causal chain (側室の一人 → 後継者を産み政治的影響力);
  Hideyoshi's 1595 motive hedged (chronology verified: 秀頼1593 → 秀次切腹1595 →
  三条河原処刑1595-08); 誓い → 同盟 in bodies (era-header 裏切り — 壊れた誓い and
  finale 1564年の誓い kept as storytelling); 遺恨 carry-in → 大坂城の政治の中心に
  立ち…記憶を背負う; titles 血の誓いの同盟 → お市、浅井長政に嫁ぐ,
  茶々、内輪に入る → 茶々 — 敵の懐へ
- **Guard restorations the draft had dropped:** 和暦 ×3 (天正10/11年, 慶長20年),
  research attribution `<p>` kept verbatim, FAQPage JSON ↔ visible byte-sync ×4,
  Article description + meta/og/twitter synced to new intro
- **Kept as-is:** `<title>` (draft dropped the required `の年表`), 1564 date (see §4)

## 5c. Round 3 — terminology/accuracy review: 3 target pages + extras (2026-10-01)

External review processed with count-asserted edits; structure fingerprint
(ids/classes/hrefs/tag counts/JSON-LD shape) identical on all 25 files.

**Applied (before-the-castle):** 丸太舟→丸木舟 ×2; 大阪城の地下→足元 ×6
(metas, speakable subtitle, body); 旧河内潟 period-mapped — pre-spit
629→河内湾, lagoon-era body 641/659/687→河内潟, page-level metas/keywords/
place-JSON/FAQ keep 旧河内潟 as the retrospective toponym (9); 難波の王宮→
ヤマト王権の王宮; 東北→東日本 (Jōmon range, not Tohoku); H2 水中世界→
水の世界; 動きが速く→生命力にあふれ; 見るのは簡単→語りたくなるのも無理は
ありません; **6,000 BCE→4,000 BCE + 初期→中期 Holocene** (Jōmon
transgression max ≈6000 BP; "early Holocene + 6,000 BCE" was internally
inconsistent) — EN twin fixed too; 紀元1千年紀→紀元3世紀 (kofun starts 3rd c.,
fixes the 同じころ link); シリカ→マグネシウム (sanukite = Setouchi high-Mg
andesite); 磨製収穫鉤→石包丁 (standard term; dropped contested grind/chip
label) — EN "polished" dropped too; 考古学などを展示→考古資料 ×3.

**Applied (lordconcubine):** 大名→**城主** in the page identity ×10 (title,
og/twitter, JSON-LD name/headline/breadcrumb, H1, FAQ Q3, menu) + nav label
site-wide ×30 across 20 JA pages + both llms.txt (34 total) — body
「大名の娘」kept (correct); 歴史の兵器化→歴史の政治利用 ×4; 数メートルの土で
物理的に→数メートルの盛り土で ×2; 日本史上最大の武士の戦い→戦国最後にして
最大級の合戦 ×2; Cocks = **平戸のイギリス商館長**, 目撃者の証言→記録 (he was
in Hirado, not at Osaka — Gutenberg #46803 "…English Factory in Japan,
1615–1622"); 1615年6月（慶長20年5月） month precision (= 1615-06-04);
地政学→存亡に関わる脅威 ×2 + 豊臣氏の滅亡にいたる; FAQ Q1/Q2 reworded with
超級表現 最高 removed (byte-paired JSON ↔ visible ×2 each); 最大の謎 trimmed
at intro + ideal-for (hero kept).

**Applied (sanada):** meta 戦闘→合戦 ×3 (body 戦闘 = combat contexts kept).
**Extras:** yayoi 前方後円墳（古墳）→前方後円墳; tokugawa でっち上げ→設けて;
soga でっち上げ×2→着せられた/罪を着せられ (formal register).
**EN fact fixes only:** 4,000 BCE, high-magnesium, stone reaping knives,
Cocks descriptor — EN marketing wording ("best", "largest", geopolitical)
untouched.

**Pushed back / kept:** 渡り鳥 (matches EN "migrating waterfowl"); 天守閣の中
名誉ある自殺 (already framed as the Shogun's declaration + contradicted);
国家公認 (0 JA occurrences — only EN "state-sanctioned"); ディープな (already
奥深く); Google-preferred-source note (page-local, accurate); 常駐歴史家
kept as the standardized brand line for EN "Resident Historian" (20 pages);
大坂城 ×8 all pre-1868 contexts.

## 5d. Round 4 — deeptimeline index/tail + soga + site-wide CTA (2026-10-01)

Dump part 3/6 processed with the count-asserted two-phase pipeline (60 exact
replacements + 3 CTA regex rules + en-dash rule); post-apply fingerprint shows
exactly the two planned insertions (soga JA Continue-Exploring 6-link list +
Explore All button; deeptimeline JA Explore All button), every other tag count
identical; check:ja 0 warnings / check:data 61 pages / check:parity / tsc /
build all green.

**soga (both locales):** FAQ pairs byte-synced — JA `娘を皇族の皇子に嫁がせ…
摂政や関白` → `娘を皇室へと入内させ、幼い天皇には摂政として、成人した天皇には
関白として…` ×2; EN `to imperial princes … to child emperors` → `into the
imperial family — Sesshō for child emperors, Kampaku for adult ones` ×2.
Intro 645: `大化の改新で滅ぼされました` → `乙巳の変で倒されました` / EN
`destroyed in the Taika Reform` → `overthrown in the Isshi Incident`.
Bidatsu = Suiko's **異父兄** / EN **paternal** half-brother (shared father
Kinmei). Sushun assassin = **東漢直駒**, not 倭漢直阿美麻呂. Page identity
`皇室の運命`→`皇統の運命` ×10, `歴史解釈の偏り`→`史書の記述をめぐる論点` ×3.
Go-Sanjō = `宇多天皇以来約170年ぶり` / EN `some 170 years — the first since
Emperor Uda` (was 「200年以上」/"over two centuries"; ja.wikipedia 後三条天皇:
宇多天皇以来170年ぶりの藤原氏を外戚としない天皇). Nakamaro 764 = relay bells +
imperial seals, dies in defeat (both; was 軍の印/処刑を命じ). Genmei = Monmu's
mother, Shōmu's grandmother (EN widow-fix). Michizane = 899 appointment +
政敵・藤原時平 (both). Archives burning hedged (both). Ōjin intro = early
capitals of Asuka/Naniwa/Nara. Nara header → 藤原仲麻呂の乱 /
Nakamaro's Rebellion. Also: ふさわしい皇室政府→皇室本来の政治 ×2, binary
framing quote reworded, 廃位と崩御→廃位と死去, 若年で持統天皇に継ぎ→持統天皇の
後を継ぎ, 皇后の→妻の 光明皇后, 重任→重用, Tenji card +698 sole-inheritor line,
plus 東漢直駒/台頭を支えた/造営と遷都/逃れるように/H2・H3 rewordings.

**fujiwara (both):** 669 deathbed grant expanded with the 698 続日本紀条 —
文武天皇 made Fuhito the surname's sole inheritor, his brothers reverted to
中臣 (JA FAQ ×2 + card; EN FAQ ×2, `newborn son`→`ten years old in 669 and
confirmed … in 698`, `regents and in-laws`→`regents and imperial in-laws`
so JSON-LD ↔ visible are pair-aligned).

**deeptimeline:** index Yayoi pair fixed both locales (strong title +
legendary-succession blurb → wet-rice revolution / first kings; the Ōjin
section's identical blurb correctly kept); `皇帝の座`→`天皇の座`; `生存`→`存続`
×3 (index, ja/llms, site-graph); `大阪最大の祭礼`→`大阪で最も名高い祭礼` ×2;
`十年戦争`→`一向一揆との11年戦争` / EN `Ten years … warrior monks`→`Eleven
years … Ikkō-ikki`; Hideyori card +`徳川の平和の時代を生んだ`; `その都市を
定義した`→`この街をかたちづくった` ×2; `日本最強の武将。`→`日本一の兵。` +
site-graph title; stale lagoon title → the page's actual `城の前史：大阪が太古の
潟であった頃` ×4 (both llms.txt, dtail li, site-graph); Fujiwara card 400
Years→~200 Years + JA 四百年→約200年; tail ranges 645–1185→858–1086 and
814–1192→1180–1185 (both locales); genpei meta `（814〜1192）`/`(814–1192)`
removed; JA tail gained the Explore All button.

**Unifications:** `命令・承認`→`権力と承認` ×3; continue heading ×4 →
`大阪城で物語を続けましょう`; Nara header above. **CTA standardization** — the
reviewer's 3 exact strings across all 21 JA pages (法人向け p ×22 incl. the
double block on osaka-castle-history, 学校・大学向け p ×22, sources p ×17
再構成/再構築/復元 → この再構成…); buttons untouched. **En-dash** → `〜` on
card-date/era-header/year lines and （…）ranges ×43 (soga 27 incl. two
double-range cards, hideyoshi 6, tenjin 5, tokugawa 5); 『…』 bibliography
lines excluded.

**Pushed back / kept:** sanada H1 `日本最強の武将` (decision — only the
deeptimeline card + site-graph title changed to 日本一の兵; page FAQ glossary
kept); deeptimeline's Ishiyama card `日本最強の武将に10年間抵抗` (different
subject, unflagged); Ōjin blurb `伝説の王権争い` (correct for that page); the
other 5 soga `大化の改新` uses (legitimate reform-term contexts); EN marketing
untouched.

**Citations:** ja.wikipedia 後三条天皇 (宇多天皇以来170年ぶりの藤原氏を外戚と
しない天皇); 『続日本紀』文武天皇二年八月条 — 669 鎌足臨終に藤原姓授予、
698 不比等をこの姓の継承者と定め他兄弟は中臣に復す (ctext.org).

## 5e. Round 5 — dump 4/6: empress + ishiyama + osaka (2026-10-01)

Count-asserted two-phase pipeline (roundA-apply/verify): 9 files, +120/−30,
fingerprints exactly as planned (the 6 EN/revert files text-only; ja-empress
section+1 p+3 li+4 a+5; ja-ishiyama section+1 p+4 li+4 a+6 strong+1; ja-osaka
section+2 div+3 h3+3 p+7 img+2 li+6 a+7 strong+1). check:ja 0/21, check:data
61/101 FAQ parity, check:parity, tsc, build green.

**Research resolved:** Kōken 738 FAQ correct (Princess Abe designated Crown
Princess 738 — kept); museum = **豊臣石垣館**; 『感身腸記』/ "Shōkō Monogatari"
phantom → **『難波戦記』/ Naniwa Senki** (both locales); Yodo EN card date
June 5 → May 8, 1615 (own body + JA said 5月8日); 三津寺 camp = EN "Mitsumatsu"
(JA 三松 wrong kanji); 来島通総 → **九鬼嘉隆** (EN Kuki Yoshitaka was right).

**empress (both):** intro rewritten — the old line described Saimei's 7th-c.
reign on Shōtoku's page; now Kōken 749–758 / Shōtoku 764–770, Dōkyō, Nakamaro's
rebellion, Naniwa's last years as capital (EN + JA); Prince Motoko → Prince
Moto / 橘諸兄皇子 → **基王** (EN-era pair restored); 宣明 → **宣命** ×2 (EN
senmyō); 世俗の帝位 → 皇位; JA gained missing tour blurb + Continue Exploring
(ojin, empress_jingu, dtail, fujiwara + Explore All).

**ishiyama (JA):** 九鬼嘉隆, 三津寺, FAQ surrender ×2 + **本願寺が** subject
(visible = JSON-LD), tour blurb, callout p2 (「僧兵、百姓、将軍」 EN-href link —
parity with EN's 3-tale link) + Continue Exploring (azaiclan, toyotomihideyoshi,
tokugawa, hideyoshi-rikyu).

**osaka (both):** Yodo card date; sources li → Naniwa Senki both locales; JA
gained tour blurb (first box only), full **Stone Walls** section translated
from EN (h3 trio 豊臣 vs 徳川 / タコ石 / 豊臣石垣館, `../images/` paths, before
the sources comment anchor) and Continue Exploring 6-li (EN-href extension for
warriormonks + goddess; see §3).

**Round-4 reverts:** dtail card 1568→1570 + eleven→ten (both locales), tail P
Eleven/11年 → Ten/十年 (annot-04 §57), tail li genpei 1180–1185 → 814–1192 +
genpei JSON-LD `(814–1192)`/`（814〜1192）` restored (§3 scope note).

## 5f. Round 6 — dump 5/6: empress_jingu + genpei + tenjin + yayoi (2026-10-01)

Count-asserted two-phase pipeline (roundB-apply/verify): 4 JA files,
+178/−95. Fingerprints: ja-empress section+1 div+1 p+3 h2+1 ul+5 li+6 a +
坐摩神社×8 (生駒×8/座摩×1 gone); ja-genpei section+1 div+1 p+3 h2+1 ul+3 li+4 a +
平家 41→4 (物語 kept) with titles/meta/JSON-LD 平氏・源氏 ×5; ja-tenjin
section+1 h2+1 ul+8 li+1 a+1 p + 天神祭り 35→0 / 大川川 15→0 (standalone
天神祭 +35, 大川 +15) + sources block (8 EN li) + DYK companion; ja-yayoi
section+1 div+1 p+4 h2+1 ul+3 li+5 a + 古朝鮮 ×4 / 朝鮮半島 JSON-LD /
倭国王帥升 ×2 + callout companion p + full Continue Exploring section.
check:ja 0/21 (strict titles incl. new 天神祭 title), check:data 61/101 FAQ
parity, check:parity, tsc, build green. **No EN edits** — every EN fact
flagged in annot-05 checked out (Ikasuri/Zama, Suishou, Gojoseon, Okawa,
Taira, 814–1192, 645–1185).

**Research resolved:** 坐摩神社 identity confirmed via websearch (Wikipedia
坐摩神社 + Ikasuri Jinja official via osaka-info/lumen-tree): Jingū founded it
after the Three Korean Campaigns, five deities 坐摩神, relocated 1608 for
Osaka Castle — EN "Ikasuri Shrine (Zama-san)" was correct all along, JA
生駒神社 was the error (kanji = 坐, not 座). annot-05 line 28 self-corrects
the earlier "814–1192 range" complaint and validates Round A's restore.
Phantoms confirmed absent: 斉世親王 (pages use 時康親王 paired with EN
Tokiyo), 大倉幕府 (page has 大倉宮 ✓), 本領安堵, 鉾流神事, 平正盛.

**Missing-JA blocks added:** box tour blurb (all 4; genpei own-EN variant);
Continue Exploring sections (empress 5-li / genpei 3-li / yayoi 3-li, all with
Explore All → `/osaka_history_things_to_do.html`, list labels follow §3
established set: 蘇我氏、藤原氏と皇室 / 応神天皇の皇位継承 / 藤原摂関政治 /
上町台地 ── ディープタイム・タイムライン / 日本の弥生時代); tenjin selected-
references section (mirrors EN 8-item list, h2 主要な参照資料) — tenjin has
**no** Continue section on either locale (annot item 40 was wrong); trailing
companion sentence in tenjin DYK; companion p in yayoi callout.

## 5g. Round 7 — dump 6/6: fujiwara + ojin + hideyori (+ osaka death date) (2026-10-01)

Count-asserted two-phase pipeline (roundC-apply/verify): 9 files
(3 JA + 3 EN fact fixes + 2 llms + ja/osaka), +134/−80. Fingerprints:
ja-fujiwara section+1 div+1 p+3 h2+1 ul+5 li+6 a + 后 sweep 23→11 (9 mothers
→ 母; 立后/皇后 protected) + card retitles 二人の母と三つの治世 / 乙牟漏・旅子 /
師輔・伊尹 / FAQ streak 聖武; ja-ojin section+1 div+1 p+3 h2+1 ul+4 li+5 a +
菟道稚郎子×5 / 王子→皇子×11 / 『日本書紀』24・『宋書』7 wrapped / 水歯別→瑞歯別×7 /
履中↔反正 slot fixes (允恭 6→0, 履中 8, 反正 7) / title 記録×5 + llms×2;
ja-hideyori section+1 div+1 p+3 h2+1 ul+3 li+4 a(+1 companion a) + 黄金の鳥籠×8 /
浪人 / 1598年に5歳 / 自害 hedge / callout h2+companion link. EN fact fixes
(flagged): fujiwara streak Monmu→Shōmu ×2 + card body/title (Two Mothers,
Three Reigns), hideyori age four→five-in-1598 + moat inner-claim drop,
osaka-castle-history May 8→June 4 ×4 (both locales). check:ja 0/21
(strict titles incl. 記録/鳥籠 titles), check:data 61/101 FAQ parity,
check:parity, tsc, build green.

**Research resolved (mothers genealogy):** 文武's mother = 元明天皇 not Miyako
— streak began with 聖武 (國史: 「藤原氏を外戚に持つ初の天皇」); Shōmu←宮子,
Kōken/Shōtoku←光明子 ✓. Card 490: 乙牟漏 (Yoshitsugu)/旅子 (Momokawa)/明子
(Fuyutsugu) ✓, tail Takaiko/Sawako added. Card 531: 安子=師輔 (Morosuke —
冷泉/円融 both his sons), 懐子=**伊尹** (Koretada = これただ per 国史大辞典/花山
— EN was right, JA 兼忠 was the error), 超子=兼家 ✓. EN 572 Kishi=嬉子 minor
flag only.

**Missing-JA blocks added:** box tour blurb (all 3; fujiwara own-EN variant),
full Continue Exploring sections (fujiwara 5-li / ojin 4-li / hideyori 3-li,
Explore All → `/osaka_history_things_to_do.html`; labels follow §3: 蘇我氏、
藤原氏と皇室 / 神功皇后 / 上町台地 ── / 現実のベネ・ゲッセリット (EN-href, no JA
article) / 豊臣秀吉 — 太閤の軌跡 / 睡龍 / 真田信繁). EN-only flags to raise in
the end-of-work reply: EN hideyori flat seppuku statement, EN fujiwara cta blurb
missing comma ("its masters Osaka Castle"), EN "Kishi" vs Kisako.

## 5h. Round 8 — museum/archive-verified yayoi accuracy review (2026-10-02)

47-item external review against museum/archive sources on ja/yayoi (+ EN twin,
deeptimeline pair). Applied:

- **Chronology:** extended Yayoi **紀元前1000年頃～300年頃 / c. 1000 BCE – 300 CE**
  everywhere (title-safe: lead, FAQ, JSON-LD, intro, hero caption
  紀元前5～4世紀頃, era bands 初期弥生への移行／集落の拡大と首長制社会の形成／
  複雑な社会と政治勢力の形成 with 頃 ranges + 1〜3世紀) + methodology ※ note
  under the JA/EN intro (resolves §4 **紀元前1000 vs 紀元前300**). 魏蜀呉
  card-date 3世紀後期→**3世紀** (220 CE body); 古墳 card **3世紀後期～4世紀**,
  body no longer claims "horse culture".
- **Terminology:** 水稲農耕→**水田稲作** everywhere except the reviewer's verbatim
  FAQ sentences; 首長国家→首長制社会／政治勢力; 国造 dropped (EN `kuni no
  miyatsuko` too); シャーマンの女王→『魏志』倭人伝 **鬼道に仕えた女王** (EN
  "served the spirits (kido)"); 通道→経路; 辰韓同盟→**三韓の形成 — 馬韓・辰韓・
  弁韓**; 青銅鏡→銅鏡; 仏教の布教 card **removed** (1st c. CE = 后漢明帝伝説/
  538/384 range, not yayoi-era Japan) — row now Japan+Korea only;
  中国を二分 dropped; のちの韓国 dropped (both locales, §3 row).
- **Facts:** 57–108 row split — 金印/『後漢書』 detail on the Japan card, China
  card framed as Han-side diplomacy; 古朝鮮 2333 BCE flagged as Dangun legend;
  四郡 kept (108 BCE) but framed as one route among networks; 107 CE = 帥升ら
  生口160人 per 『後漢書』; Himiko = 238 CE/親魏倭王/銅鏡百面;
  百済/新羅 dates hedged as 『三国史記』伝承; callout rewritten (移住者/天然の港
  claims dropped).
- **Osaka evidence card:** 猪刃遺跡 (unverifiable) replaced with verified sites —
  西福井遺跡 (茨木, 前期 石包丁・蛤刃石斧), 瓜生堂遺跡 (東大阪, 住居遺構・方形周溝墓
  per Wikipedia 東大阪市), 池島・福万寺遺跡 (縄文晩期〜, 生産遺構); footprints
  claim dropped (not verifiable). deeptimeline 稲葉/Inaba → 瓜生堂/Guruido
  (card no longer claims "early" for Guruido).
- **deeptimeline pair:** corrupted strings 約38,000 – 14,紀元前000年 /
  約14,紀元前000〜紀元前300年 restored (14,000年前 / 紀元前1000年 — Jōmon band
  end now matches yayoi start; EN "c. 14,000 – 1000 BCE").
- **Glossary:** 4 warn terms added — 首長国家 / 通道 / シャーマンの女王 / 辰韓同盟
  (国造 deliberately **not** added: valid in later Yamato contexts).
- **Both locales:** FAQ visible ↔ JSON-LD byte-synced ×3, dateModified
  2026-10-02, EN lead/intro/era labels/callout mirrored; no structure/href/tag
  changes (§2 intact).

Verification: check:ja 0 warnings, check:data, check:parity, tsc, assertion
greps (0 hits: 猪刃|辰韓同盟|首長国家|国造|シャーマン|中国を二分|仏教の布教|
通道|のちの韓国|紀元前000|稲葉|Inaba on the touched pages), FAQ byte-identity
script.

## 5i. Round 9 — empress_jingu historical-accuracy rewrite (2026-10-02)

External historian review (40-item critique + full 改訂版 draft): the page's
claims had escalated from "scholars propose X" to "X happened". Rewrote both
locales to keep 記紀の伝承 / independent evidence / archaeology / modern
interpretation visibly separate, and added per-card epistemic badges.
+243/−166 across 3 files.

- **Thesis (header + Article JSON-LD):** 「8世紀の朝廷が、女性の皇権を正
  当化するために…組み立てた」 (an unknowable motive, asserted as fact) →
  layered-transmission version: 伝承上の人物 / 『日本書紀』は…描きます / 記憶と
  王統の歴史観が重なっていると考えられています. Subtitle 境目 → 境界.
- **FAQ 4 → 5** (visible + JSON-LD byte-synced): Q1 どのような人物 → 720年 +
  伝承過程 caveat, no 女帝; Q2 朝鮮半島へ出兵 → 三韓征伐=伝承, no direct
  evidence, Gwanggaeto = 別系統の金石文史料 (4世紀末〜5世紀初頭, 解釈に議論あり);
  Q3 住吉 (縁起 framing, 住吉三神, 211年 = 『帝王編年記』推定 + 社自身の注記);
  Q4 坐摩 (創祀縁起, 生井神・福井神・綱長井神・波比祇神・阿須波神の五柱,
  旧社地=渡辺津/石町, 久太郎町, 築城移転伝承 — order verified vs ja.wikipedia
  坐摩神社); Q5 卑弥呼 → name absent, 神功紀引用『魏志』239年, 対応関係が論じられて
  きた + 単純な同一視ではない (NDL レファレンス cited).
- **Timeline:** dividers → 「『日本書紀』が置く年代（3世紀初頭）」/「別系統の史料と
  考古学（4世紀末〜8世紀）」; card dates 193〜200/200/211年頃 → 3世紀初頭,
  Gwanggaeto 391年 → 4世紀末〜5世紀初頭, Hōenzaka 400年代頃 → **5世紀**
  (reviewer's key correction: warehouses cannot evidence a 3rd-c episode).
  Titles: 神託と仲哀天皇の死 / 三韓征伐の伝承 / 難波と上町台地 / 坐摩大神の伝承 /
  住吉大神の鎮座 / 法円坂の大型高床倉庫群 (16棟・約90㎡・博物館も5世紀) /
  『日本書紀』と卑弥呼の時代. Removed: 不審な最期, 冒涜, 大艦隊→大規模な船団,
  朝鮮三国への侵攻, 最高の武将→王権を支える重要な女性, 上町台地戦略断定,
  「高級品・武器・先進技術」・「証明」, 独立した同時代の証拠, はぎ取って貼り付け,
  皇室には決して登場しません, 統一されていた.
- **Badges (new, both locales):** CSS `.item-badge` + `.b-legend/.b-source/
  .b-arch`; 5 myth cards = 伝承/Legend, Gwanggaeto + 720 = 史料/Source,
  Hōenzaka = 考古学/Archaeology (reviewer's production suggestion, applied).
- **Callout:** 「物語が書き換えられた土地に立つ…力の軸の真実」 → 「物語が重ねられた
  土地に立つ」 + 4層の時間差 (3世紀/4世紀末/5世紀/8世紀) + 台地を歩けば…問い.
  Continue-Exploring motive claim softened (both locales).
- **EN twin: fully mirrored** — header, lead, 5 FAQs byte-synced, both
  dividers, all 8 cards (Jilin Province, readings debated, 5th-century
  Hōenzaka, "independently confirms" not "proving"), callout, page-date →
  October 2026, fixed pre-existing `influencial` typo, cta heading
  "rode at the head of an empire" → "led a fleet in legend".
- **女帝 kept** only where it means later empresses (称徳天皇 refs); never for
  Jingū. Hero caption kept (already 伝説的 + Nihon Shoki's own dating).
- **Glossary:** 3 terms added — error 大陸の金石学 (→朝鮮半島・中国側の金石文),
  error 朝鮮三国への侵攻 (→三韓征伐の伝承／新羅への遠征), warn 大艦隊 (→大規模な船団).

Verification: check:ja 0 warnings, check:data (61 pages/101 blocks, FAQ
parity), check:parity, tsc, npm run build; FAQ byte-identity 5/5 both
locales; assertion greps 0 hits (朝鮮三国|不審な最期|最高の武将|血の流れていない|
はぎ取って|高級材|大艦隊|境目|大陸の金石学|作られた存在|独立した証拠|統一されていた|
保証するもの|冒涜|193〜200|200〜211|391|shaman queen|stripped|bloodless|
Three Korean Kingdoms|justify female|armada|suspicious death|influencial).
Note: 女帝 (×2) and 正当化する神話的叙述 remain by design — later-empress
contexts and the reviewer's own mythic-narrative sentence.

## 5j. Round 10 — ojinsuccession three-record rewrite (2026-10-02)

External historian review (40-item critique + full 改訂版 draft): the page
argued that the Nihon Shoki "deliberately suppressed" Chinese-recorded events
and presented a calculated-provocation / assassination / covering-up reading
as fact. Rewrote both locales into a neutral three-record structure —
『日本書紀』が伝える物語 / 『宋書』が伝える記録 / 遺跡から見る考古学 — where
each source states its own claims and the identifications remain disputed.

- **Factual fixes:** no regnal years anywhere (395–410 dropped entirely;
  traditional 270–310 not substituted); 讃 missions = 421 + 425 (司馬曹達);
  438 = 珍's accession, six-kingdom generalship requested, Song granted only
  安東将軍・倭国王; 珍＝反正 as *a* theory via 国立国会図書館, never asserted;
  法円坂 = 5世紀・上町台地北端・16棟・約90㎡・水運想定 + 「証明する遺跡では
  ない」; 720年 compilation stated; "deliberate suppression" reframed as the
  two sources having different purposes and compilation dates.
- **Structure (both locales):** single-column 4-chapter timeline (『日本書紀』が
  描く継承 / 『宋書』が伝える倭王権 / 二つの記録を重ねる / 5世紀の難波), 9
  expandable cards, badges 伝承/史料/考古学, tour badges only on 履中・住吉仲皇子
  and 法円坂 cards; era-nav buttons + 3-column grid + col-headers removed, CSS
  rebuilt, filterEra deleted; new intro + 記録の空白をどう読むか + 倉庫は今も
 ここにある sections; callout replaced (家康/1200年/Hideyoshi-Ieyasu aside
  deleted both locales); cta-inline dropped from EN for locale parity.
- **FAQ:** 4 → 5 (継承危機 / なぜ単独では判断できない / 中国の記録は /
  矛盾するのか / 大阪との関係), multi-paragraph 改訂版 answers merged to single
  `<p>`, byte-identity 5/5 both locales.
- **Titles/metas:** JA 応神天皇の継承 — 同じ時代を語る、三つの記録 (77-char meta
  description) / EN The Ōjin Succession — Three Records of the Same Era;
  dateModified 2026-10-02; propagated to llms.txt ×2, site-graph (EN+JA),
  deeptimeline blurbs ×2, empress-shotoku li ×2; EN page-date → October 2026.
- **Glossary:** 3 error terms — 初期日本史 (→古代日本史), 公式の『日本書紀』
  (→『日本書紀』が描く王統), 三つの異なるバージョン (→同じ時代を語る三つの記録).
  暗殺未遂 entry added then reverted: the 改訂版 quotes the label only to
  negate it — page-local assertion instead.

Verification: check:ja 0 warnings, check:data (61 pages/101 blocks, FAQ
parity), check:parity, tsc, npm run build; FAQ byte-identity 5/5 both locales;
assertion greps clean — the only hits are by design: negated quotes (意図的/
隠蔽/クーデター/記述が短い in「…とは断定できない」contexts), nav links (float-menu
家康), and CSS (max-width:1200px).

## 5k. Round 11 — shitennojihistory accuracy/terminology rewrite (2026-10-02)

External historian critique of `shitennojihistory` (JA + EN): the page read
like a translated English essay — 極楽浄土庭園, 官営寺院, 渡来人系譜, 青写真,
国際港 — and stated later-tradition/lend claims as 593年 fact (四箇院 as
contemporary administration, 客館・官僚の訓練場, 天命 framing, mid-6th-century
cosmology for the Pure Land garden, "oldest surviving Pure Land garden").
Rewrote both locales preserving the core argument (593 四天王寺 → 上町台地 →
難波津 → 大陸交流 → 仏教と王権 → 国家形成 → 都市大阪).

- **Terminology (glossary-first):** 12 error terms added to
  `data/ja-glossary.json` — 官営寺院→官寺, 極楽浄土庭園→極楽浄土の庭,
  渡来人系譜→渡来系氏族との関係, 蘇我氏の指導者の暗殺→蘇我入鹿の暗殺
  （乙巳の変）, 絶え間ない破壊と再生→災害と戦乱、そして再建の歴史,
  皇室の権威を根づかせ→仏教と王権の結びつきを示す, 国際港→国際交流・
  海上交通の拠点, 制度としての役割→寺院としての役割, 外国使節用の客館→
  四箇院の伝承（敬田院・施薬院・療病院・悲田院）, 官僚の訓練場→仏教信仰と
  太子信仰の拠点, 皇室とのつながりのおかげで→寺院としての役割を担い続け,
  商業の中心へと変えていきました→都市形成に影響を与えた. Excluded as
  legitimate elsewhere → page-local assertions only: 中央集権国家 (deeptimeline
  大化の改新), 天命 (deeptimeline 漢/唐), 施薬院・悲田院 (empress-shotoku
  光明皇后 context), 6世紀中頃, plus one-off deletions (青写真, 母方を通じて,
  役所の建物, 渡来人の集まり, 国家の僧侶).
- **Accuracy fixes:** all founding statements → 伝えられる/伝承 (subtitle,
  header, QA intro, FAQ1, fact table now 創建/開基 rows, metas, Article
  description); FAQ2/QA callout 四箇院 reframed as 後世の『四天王寺縁起』の
  伝承 with explicit later-source caveat; FAQ5 rewritten (二河白道, present
  garden is 近世以降, not founding-era); FAQ3 四天王寺式伽藍配置; 天命 section
  → 仏教、王権、そして国家形成 (item 10/12) with new 645 乙巳の変 →
  難波長柄豊碕宮 bridge sentence; image labels → 蘇我入鹿の暗殺 — 645年
  （乙巳の変）; 明治 item → 神仏分離 framing, 1945年3月大阪大空襲 + 1963 再建
  完成; medieval item → 寺領・荘園・門前町; final section → 四天王寺式伽藍配置
  straight-line description replacing 役所の建物/渡来人の集まり blueprint claim.
- **User decisions (2026-10-02):** series subtitle → 歴史探究シリーズ on BOTH
  shitennoji + tenjin (EN: Historical Inquiry Series); full EN mirror now;
  cautious FAQ1 rewrite (`593年（推古天皇元年）…建立されたと伝えられ、日本最古の
  官寺の一つとされています`); 645 bridge sentence added.
- **EN mirror:** same fixes — state temples, Four Cloisters (Kyōden-in,
  Shiyaku-in, Ryōbyō-in, Hiden-in), Shitennoji-style garan layout, Two Rivers
  and the White Path, Isshi Incident, Great Osaka Air Raids March 1945/1963,
  Naniwa-Nagaraka-Toyosaki Palace; h1/headline casing shitenno-ji→Shitenno-ji
  fixed; removed pre-existing duplicated-sentence bug in medieval item;
  dateModified 2026-10-02, page-date October 2026; FAQ byte-sync 5/5 both
  locales.
- **Peripherals:** tenjin JA/EN subtitle 歴史探究シリーズ / Historical Inquiry
  Series; deeptimeline index blurbs ×2 → 初期の王権と仏教が結びついた寺院 /
  the temple where royal power and Buddhism joined; `llms.txt`/`site-graph.json`
  untouched (titles unchanged).

Verification: check:ja 0 warnings (21 pages; new glossary rules cause no
site-wide collisions), check:data 61 pages/101 blocks FAQ parity,
check:parity 8/18/10, tsc, npm run build; FAQ byte-identity 5/5 both locales;
assertion greps clean both locales (EN: officially administered/international
port/blueprint/Mandate of Heaven/guesthouse/training center/oldest surviving
Pure Land/etc.; JA: all glossary terms + 6世紀中頃/青写真/天命/歴史参照シリーズ
0 hits); JA meta 83 chars ≤120.

## 6. Automated gates (must stay green after any edit)

`npm run check:ja` runs with **strict titles by default**
(`JA_STRICT_TITLES=0` opts out for exploratory runs only) and is wired into
`npm run build` / `preview` / `deploy` and CI. Term rule changes go into
`data/ja-glossary.json` first, then the pages. Do not bypass
`scripts/check-ja-style.mjs`, `scripts/check-structured-data.mjs` or
`scripts/check-deeptimeline-parity.mjs`.
