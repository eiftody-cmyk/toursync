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
`26cc219` (round 11, §5k — shitennojihistory accuracy/terminology rewrite),
`ab4250a` (round 12, §5l — soga-fujiwara-timeline native/accuracy rewrite),
`6fa6464` (round 13, §5m — empress-shotoku accuracy/historiography rewrite),
`3e18e10` (round 14, §5n — fujiwara-shadow-politics accuracy/title rewrite),
`d7ecede` (round 15, §5o — tenjin-matsuri-history accuracy/continuity rewrite),
`91d9634` (round 16, §5p — genpei-timeline locked-decision rewrite).

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
| Ishiyama ending | **和議 / 講和 … 本願寺が** (round 17: never 降伏 — court-mediated 1580 peace, FAQ4 + JSON-LD byte-synced ×2 per locale, card 講和と退去 / Peace and Evacuation); **「鉄甲船」と呼ばれる大型の安宅船** (never 世界初の「鉄甲艦」, construction debated); **門徒・本願寺勢 / 本願寺の坊官ら** in body prose (never 僧兵 except title/meta/link 「僧兵、百姓、将軍」; never undocumented 下間仲之); **水軍** not 海軍; fire cause always hedged **諸説** — both forbidden strings live as error rules in `data/ja-glossary.json` |
| Azai ending | **離反** for the 1570 defection in factual prose (裏切り kept in titles/hero/filter label as narrative framing), **自害** not 切腹/終焉を悟った, **戦国大名として滅亡** not 断絶/一族の壊滅, **本能寺の変（1582）** not 織田の崩壊, 1564 marriage/6年後 locked (round 17) |
| Hideyoshi ending | **露と落ち　露と消えにし** as the death poem (never 露の世は露の世ながら — that is Kobayashi Issa's おらが春; error rule in `data/ja-glossary.json`); **木下弥右衛門** for the father (never 足軽（百姓兵）の弥助; status uncertain); era labels **立身期/権力掌握期/天下人期/晩年** (never 登極期 — imperial accession); **兵糧攻め** (never 飢餓封鎖); **一夜城 = 伝承** (墨俣 + 石垣山, 石垣山 actual build ~80日); 高松 water attack = **1582** (never 1581); kanpaku **1585-07-11** (近衛前久の猶子・藤原氏), 豊臣姓・太政大臣 = **1586**; shogun answer never claims blood bar; 石山本願寺 = **推定地**; FAQ visible↔JSON-LD byte-synced ×2 per locale |
| Hideyoshi–Rikyū ending | `<title>` + h1 = **協力者から「政治問題」へ** (round 19; EN “From Partners to ‘Political Problem’” — curly quotes in all title slots/OG/headline/breadcrumb); era buttons/headers **出会いと基盤 / 関係の深化 / 茶の湯と権力 / 政治空間の変化 / 終焉** (filter keys foundations/recognition/summit/asymmetry/rupture unchanged); **山崎の戦い = 1582年（天正10年）** (never 1583); **1585年に関白** alone (never 関白（摂政）), 1586 豊臣姓・太政大臣; 豊臣秀長 = **異母弟** (never 異父弟); 北野大茶湯 = **四人の茶堂 + 八百三人** per 『兼見卿記』 (never 亭主 framing); 大徳寺木像 = **金毛閣 + 1591年処分時の問題点** (never fixed 1589 installation; card-date 1589〜1591); 中村修也 = **有力な異説の一つ** (never settled truth); 唐物→和物 = **傾向** (never complete replacement); 承認/命令 column device kept as interpretive frame only — lead/quick answer/conclusion never present it as scholarly consensus; FAQ visible↔JSON-LD byte-synced ×5 both locales |
| osaka-castle-history ending | 5 era buttons/headers **豊臣の夢 / 大坂の陣と豊臣家の滅亡 / 徳川による大坂城再築 / 近代軍事拠点 / 現代の大阪城** (EN: Toyotomi's Vision / The Siege & Toyotomi's End / Tokugawa Rebuilding / Modern Military Arsenal / Modern Osaka Castle; keys toyotomi/siege/edo/arsenal/modern; headers 1583〜1598 / 1614〜1615 / 1620〜1868 / 1868〜1945 / 1945〜現在 — round 20; never 大坂の陣と抹消 / 大阪城の再建); **`<title>` keeps 豊臣の夢、徳川の抹消** (round-20 item 42 rejected); death date **1615年6月4日 / June 4** site standard (item 14's 1615年5月8日 rejected; 城が**落ちた** never 落んだ); key dates **1627 天守 / 1629〜1665 / 1620〜1629 / 1868年1月6日 / 1931 募金・大坂夏の陣図屏風 / 1959 筒井文庫・1984 修復** (never 1626/1628/1630); **豊臣期大坂図屏風 / ねね = 1548/1549〜1624 / 奈阿姫** (never 豊臣襖絵/宁々/名姫/1546); pre-1868 **大坂城・大坂城代・大坂町奉行**; bibliography = round-20 source set (JA 7 li / EN 10 li; JA h2 **参考文献・関連史料**; never 『難波戦記』/『大阪記』 labeled 一次史料, never すべて英語で出版); motive prose = 覆うように築かれた/盛土で覆う (never 意図的な…殲滅戦・埋め立て・罠/見せかけ); FAQ visible↔JSON-LD byte-synced ×4 both locales |
| Hideyori ending | 5 era buttons/headers **奇跡の子 / 孤立した継承者 / 運命の衝突 / 和議と城の崩壊 / 夏の陣と滅亡** (EN: The Miracle Child / The Isolated Heir / The Fateful Clash / Peace & the Unmaking / The Summer Siege; keys miracle/isolation/clash/peace/final; headers 1593〜1598 / 1600〜1611 / 1614〜1615 / 1614〜1615 / 1615 — round 21; cards **15** = 3/5/3/2/2, new: 1595 秀次事件と継承の確定, 1605 右大臣・二重構造, 片桐且元をめぐる対立, 堀の埋め立てと真田丸の破却); column labels **大坂の陣と軍事的局面 / 史料と後世の伝承** (never 主な攻城戦と役割 / 噂と戦略 / 戦役と攻城戦 / 策略と滅亡); death **1615年6月4日** plain Gregorian site standard (round-21 item 3's 5月8日（新暦6月4日）rejected — same date, wareki declined, and 「元和元年」is the wrong era since 元和 starts 1615-07; death/fall same day = **落城の際に** never 落城の翌日); **黄金の鳥籠** kept as title + now defined in lead para 2 and the 1603 政権 card (item 24); 二条城会見 = 19歳 / 『当代記』/ 後世の解釈として慎重に扱う (never 18歳 / 深く警戒したと噂 / 血統を断ち切らねば); 1603 wedding = 11歳・7歳 marriage (ages swapped nowhere); metas rewritten both locales (no 徳川幕府が残した「自殺」説と…真相を検証 / "'suicide' story, and what really happened" promise); dateModified 2026-10-03; FAQ visible↔JSON-LD byte-synced ×4 both locales |
| Toyotomi house end | **豊臣氏は滅亡** for 1615 (round 22: never **豊臣の血筋** — the blood continued via Senhime/Tokugawa; fixed ×8 across five JA pages — three-unifiers, tokugawa-ieyasu-timeline ×4, lordconcubineshogunlie, toyotomi_hideyori, osaka-castle-history — error rule in `data/ja-glossary.json`; EN "Toyotomi line" idiom kept) |
| three-unifiers ending | FAQ1 Q = **日本統一を進めた三人とは誰ですか？** (round 22; JSON-LD breadcrumb name **三英傑**, was 三人の統一者); FAQ answers = **江戸幕府を開きました** + **三人の政権とその継承** (never 江戸幕府として制度化 / 体制を築きました / 三人の関係が); FAQ2 = **尾張国に生まれ**…1583年（天正11年）に大坂城の築城を開始・政治的・軍事的拠点 (never 百姓の出身から関白へ上り詰めた / 権威を示す宣言); FAQ3 Q = **石山本願寺と10年にわたって戦った**, A = 寺内町 + 1570〜1580 石山合戦 + 門徒・武将・水軍・海上交通 + **朝廷の仲介による和議・顕如が大坂を退去** (never 10年も包囲 / 一向一揆の要塞都市 / 飢餓と講和によって攻略); FAQ4 = **徳川方が勝利しました・和議によっていったん終結・江戸幕府の政治秩序が定着…大きな転換点** (never 勝利が帰しました / 講和で一旦は決着 / 約260年の幕府時代); portraits = **十年** (row 72 enforcement) / **無名の家臣から** (never 一農民から) / **天下統一の拠点として築かれた** (never 世界への彼の宣言); catchphrase h1 + og/twitter descriptions kept; FAQ visible↔JSON-LD byte-synced ×5 both locales; dateModified 2026-10-03 |

## 4. ⚠ Uncertain phrases — review these first

| Page | Item | Why |
|---|---|---|
| `tenjin-matsuri-history`, `fujiwara-shadow-politics` | **時康親王** | EN said "Prince Tokiyo" — **resolved both rounds**: fujiwara round 14 (§5n), tenjin round 15 (§5o); both locales on both pages now 斉世親王 / "Prince Tokiyoshi" | closed 2026-10-02 |
| `ishiyama-timeline` | **焦土作戦** | calque of EN "scorched-earth campaign" — resolved round 17: card h3 → 講和と退去 (EN Peace and Evacuation), glossary error rule added; fire cause now stated as 諸説 | closed 2026-10-02 |
| `osaka-castle-history` | **国松** | EN "Kunimatsu" — confirm presentation (国松 with 幼名 千丸?) |
| `deeptimeline` | **政治の座から外された台地** | original JA said 昇格させられた (opposite of EN "Politically sidelined") — new wording follows EN; confirm intent |
| `empress-shotoku` | **紀百継 → 吉備真備**, card title **直接皇権の再主張** | agent-side factual/title corrections — **resolved round 13**: page reads 吉備真備 (紀百継 gone) and the title is now 称徳天皇の政治的権威 (§5m) |
| `empress-shotoku` | round-13 new vocabulary — **史学上の論点**, **史学上の再検討**, **立太子**, **宣命**, **長屋王の変**, **恭仁京**, **紫香楽宮**, **二重権力状態**, **令外官**, **奏上**, **別部穢麻呂（わけべのきたなまろ）**, **淡路へ配流**, **下野国薬師寺別当**, **崩御**, **明正天皇**, **男系・男子優先** | agent-introduced historical terms — confirm naturalness/registers (立太子 vs 指名, 宣命 vs 勅令, 奏上 vs 持ち帰る); content closed 2026-10-02 (§5m), open for prose review |
| `empress_jingu_timeline` | round-6 items (朝鮮×3, 女王, contradictory 200年頃 line) — **resolved round 9**: full historical rewrite removed 女帝 for Jingū, reframed Gwanggaeto/Himiko/Hōenzaka claims (§5i) | closed 2026-10-02 |
| `fujiwara-shadow-politics` | readings **侃子・重子**; **別部穢麻呂**; **詔を読み上げている儀式** (was 誥文) — round 7 resolved 諸盛の娘・安子 → 師輔の娘・安子 and 乙縄と多治比の娘 → 乙牟漏/旅子, added 伊尹（=Koretada, father of 懐子; 国史大辞典 花山天皇 entry) and fixed 文武→聖武 streak; round 14 added **三国の調の儀式・上表文・石川麻呂** (card 001 killers' reading), **大宰権帥** (EN "deputy governor at Dazaifu") | EN names ambiguous or terminology avoided |
| `fujiwara-shadow-politics` | round-14 new vocabulary — **官撰史書**, **研究上の論点**, **外戚政治**, **武力政変**, **弘仁格式**, **内覧**, **阿衡の事件**, **望月の歌**, **最古級の公家日記**, **8代の治世** | agent-introduced/standardized historical terms — confirm naturalness/registers; content closed 2026-10-02 (§5n), open for prose review |
| `ojinsuccession` (Group C era) | 元明天皇 → 祖母で文武天皇の母; 厩戸王（のちの聖徳太子）; 敏達; 山背大兄王; 645年（大化元年） anchor | superseded — page fully rewritten round 10 (§5j); items no longer on the page |
| `ojinsuccession` | round-10 reviewer items (**395–410 regnal years**, 国家レベル overclaims, **商業的**難波, era headers 挑発/外交的沈黙, Hideyoshi–Ieyasu 1200年 aside) — **resolved round 10**: three-record rewrite removed all regnal years, interpretation-as-fact reframed, aside deleted (§5j). Native review still wanted on the new prose: 宋書 honorific quote (使持節・都督倭…六国諸軍事・安東大将軍・倭国王), readings 大鷦鷯尊/瑞歯別皇子, 倭の五王 transliteration (讃・珍・済・興・武) | open for prose review; content closed 2026-10-02 |
| `soga-fujiwara-timeline` | **藤原氏と摂関政治** (dedup), **皇室との婚姻** (was 王室結婚) | wording de-duplication |
| `soga-fujiwara-timeline` | round-12 new vocabulary — **歴史叙述**, **公伝**, **外戚**, **夫人**, **左遷**, **内印**, **駅鈴**, **荘園整理令**, **記録荘園券契所**, **薬子の変**, **異母兄妹** | agent-introduced historical terms — confirm naturalness/registers (公伝 vs 公伝来, 内印 vs 御璽 alternatives avoided, 記録荘園券契所 reading); content closed 2026-10-02 (§5l), open for prose review |
| `shitennojihistory` | round-11 new vocabulary — **官寺**, **四箇院（敬田院・施薬院・療病院・悲田院）**, **二河白道**, **四天王寺式伽藍配置**, **開基**, **乙巳の変**, **難波長柄豊碕宮**, **厩戸皇子**, **門前町** | agent-introduced historical terms — confirm naturalness/registers (官寺 vs 寺院, 四箇院 reading, 難波長柄豊碕宮 full name); content closed 2026-10-02 (§5k), open for prose review |
| `azaiclanbetrayal` | **1564 marriage date** — round-2 review claimed 1567 "almost certainly"; sources actually split (Wikipedia Oichi body says 1567, its own infobox + Azai article say 1564), traditional/majority = 1564, site EN says 1564 ×7 (+ warriormonks teaser ×2). **Kept 1564 everywhere** (decision 2026-10-01); JA-only change would have contradicted EN. **Reaffirmed round 17**: the new external review's #3/#27/#56 pushed 1567 / 約3年後 again — rejected; 1564 ×6 JA / ×7 EN + 6年後 / "Six years later" verified in place |
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

## 5l. Round 12 — soga-fujiwara-timeline native/accuracy rewrite (2026-10-02)

External native/history critique of `soga-fujiwara-timeline` (47 items, JA +
EN): the JA read like a translated English essay (大和朝廷, 政策を支配, 御璽,
義父, 異父兄, 逃れるように, 愚かな女帝と悪僧), and the page stated later
narratives and source claims as settled fact (『日本書紀』stories as direct
history, 710–784 when the page itself spans to 794, 道真 card dated 891–901
with the "exile to check Fujiwara dominance" framing, "the Soga fell in a
single coup / the Fujiwara then controlled the throne", the concluding
Soga→Fujiwara→shoguns conveyor belt). Rewrote both locales preserving the
core argument (6–7c 蘇我 → 645 乙巳の変 → 藤原氏の台頭 → 摂関 → 道真 →
摂関政治の限界と後三条 → 政治構造の変化).

- **User decisions (2026-10-02):** subtitle → 歴史叙述 / Historical Narratives;
  FAQ2 question → 藤原氏は、摂関政治でどのような影響力を持ちましたか？ /
  What influence did the Fujiwara clan gain through regency politics?; AOE
  heading → 概要：蘇我氏と藤原氏 — 宮廷権力の二つのかたち / At a Glance: The
  Soga and the Fujiwara — Two Shapes of Court Power; keep the 粛清 taxonomy
  (legend/col-header/print CSS/metas/JSON-LD/card title 山背大兄王の粛清) and
  fix prose only; full EN mirror in the same ship.
- **Terminology (glossary-first):** 19 error terms added to
  `data/ja-glossary.json` — 大和朝廷→ヤマト王権/朝廷, 国家行政を近代化し→
  政治的な変化を支えました, 仏教の公式の導入→仏教の公伝, 隋中国へ→隋へ,
  策士→主導者の一人, 御璽→内印, 皇太子に対して兵を起こした→孝謙太上天皇側と
  対立して兵を挙げた, 皇室本来の政治→王権本来の政治, 愚かな女帝と悪僧→女帝と
  道鏡, 経済的な独占を打ち破り→荘園整理, 皇室そのものの政府→藤原氏に依存しない
  朝廷政治, 逃れるように→距離を取りながら, 義父→母方の祖父, 異父兄→異母兄妹,
  政務を握った→影響力を持った, クーデター一つで滅びました→乙巳の変によって
  本宗家が倒れました, 着せられた→謀反の疑いをかけられて, 大宰府へ流され→
  大宰府へ左遷され, 政策を支配→政策に影響を与えた. Excluded as legitimate
  elsewhere → page-local assertions only: 粛清 (card title 山背大兄王の粛清,
  taxonomy retained per user), 公式記録・近代化 (deeptimeline Meiji), generic
  支配/独占, 現代の研究は (osaka-castle-history), 現代の歴史家 (genpei +
  tenjin), クーデター (FAQ1 + card title 乙巳の変：クーデターか回復か？).
- **Accuracy fixes (item numbers from the review):** header/QA/FAQ2 reframed as
  影響力 not 支配; era header 奈良時代 710〜794 (was 710–784); 『日本書紀』
  attribution added to 乙巳の変・山背大兄王・蘇我蝦夷/入鹿 cards; 一般に…
  最初の女性天皇; 隋へ (not 隋中国); 异母兄妹 for Bidatsu–Suiko; 御璽→内印,
  駅鈴 in the 仲麻呂 card; 孝謙–道鏡 card retitled 女帝と道鏡 and framed as
  後世の歴史叙述 with Usa-haku controversy as 政治問題; 桓武 784/794 without
  "escaped monks"; 摂関 9世紀後半以降 (not a monopolised institution from the
  start); 道真 card-date 894〜901年 with 899右大臣 → 901大宰権帥左遷 (no
  "falsely accused/exile to check dominance"); 後三条 reformed with
  荘園整理令・記録荘園券契所; concluding callout replaced wholesale with the
  user's 4-paragraph text (relationships being rearranged, 王権と摂関の共存,
  征夷大将軍→幕府 run, 大阪城を歩く = 千年の政治史を歩く).
- **EN mirror:** same fixes — subtitle Historical Narratives; header/QA/FAQ2
  byte-matched rewrite; era header Nara Period 710–794; cards mirrored
  (Yamato no Ayabe no Koma romanization fixed, Nihon Shoki attribution,
  Generally regarded as the first empress, half-siblings, ritsuryō,
  Heijō-kyō move, The Later Narrative of the Empress and Dōkyō, regency
  "second half of the ninth century", Michizane 894–901 with no
  check-dominance framing, Kusuko, Uda, Go-Sanjō land-reclamation orders +
  Record of Estates and Contracts Bureau); 4-paragraph callout translation;
  dateModified 2026-10-02, page-date October 2026; FAQ byte-sync 2/2 both
  locales; H1/title/metas untouched except dateModified (llms.txt,
  site-graph, deeptimeline labels use 藤原氏と皇室 → untouched).

Verification: check:ja 0 warnings (21 pages; 19 new glossary rules cause no
site-wide collisions), check:data 61 pages/101 blocks FAQ parity,
check:parity 8/18/10, tsc, npm run build; FAQ byte-identity 2/2 both locales;
assertion greps clean both locales (EN: Official Chronicles/dominate/purge
that reshaped/control Japanese emperors/710–784/891–901/Modern
scholarship/modern historians/proper imperial government/economic
monopoly/attempted escape/no longer needed to control; JA: all glossary terms
+ 大和朝廷/近代化/公式記録/粛清は/愚かな女帝/御璽/義父/異父兄/皇室本来/
逃れるように/経済的な独占/皇室そのもの/政務を握/クーデター一つ/着せられた/
隋中国/二人目の女性/流されました 0 hits); dump regenerated
(`ja-review-cards.md`).

## 5m. Round 13 — empress-shotoku accuracy/historiography rewrite (2026-10-02)

External native/historiography critique of `empress-shotoku` (32 items,
JA + EN): the page claimed consensus that does not exist (「日本の学界の合意」
as a legend label, 日本の研究は/現代日本の研究/学術的合意 in cards), stated
interpretation as settled fact (「法の抜け穴」説を退けています, 難波が放棄
implying Naniwa was dead after 745, 神権的な王権, 二重構造, 直接支配/直接
皇権の再主張, 神聖権力の統合), and carried factual errors (阿倍内親王 made
crown princess "when no surviving male imperial prince remained" — 安積親王
was alive; 720s "rebuilding" of Naniwa instead of the 726 building/744 move;
仲麻呂 defeated "at Miozaki in Takashima" as the whole story; the nonexistent
English volume 『Shoku Nihongi 697–791』; a 762 "Hōra Palace" card that read
like an established source claim). Rewrote both locales, keeping the four-
column structure, era groups, entry counts and tour badges intact.

- **User decisions (2026-10-02):** (1) items 8/9 are plain-text-concatenation
  false positives — era-filter buttons, legend key labels and card chips
  (tour-badge「ツアーで訪問」/On Tour, present on 11 JA pages) are deliberate
  UI; keep them, apply item 8's label copy only. (2) 日本の学界の合意 /
  学術的合意 fixes scoped to `empress-shotoku` (fujiwara-shadow-politics ×6,
  deeptimeline ×2 flagged as possible follow-up) — both strings are page-local
  assertions, not glossary terms. (3) full EN mirror in the same ship.
  (4) references: keep a verified Bender cite and drop the nonexistent
  697–791 volume claim.
- **Title (item 1):** retitle to the exact strings —
  `称徳天皇・道鏡・難波宮 — 王権をめぐる政治` + em `史学上の論点、都の移転、
  公式記録`, kicker → エドワードと歩く大阪城 — 奈良時代の朝廷政治; rippled
  to `<title>`/og/twitter/JSON-LD (Breadcrumb name, Article headline, WebPage
  name); `dateModified` 2026-10-02. EN: `Empress Shōtoku, Dōkyō & Naniwa —
  Power and Royal Authority` + `Historiographical Debates, Capital Shifts,
  and Official Chronicles`, kicker Nara Court Politics, page-date October 2026.
- **Terminology (glossary-first):** 30 error terms added to
  `data/ja-glossary.json` — 現代日本の研究/近年の日本の研究/日本の研究は→
  近年の研究, 神権的な王権, 難波が放棄, 大港, 三尾崎, 二重構造, 存命する
  男性皇族, 法の抜け穴, 学術的見解→史学上の論点, 学術的再評価→史学上の再
  検討, 直接支配/天皇による直接支配, お亡くなりになり→崩御し, 淡路へ移され→
  淡路へ配流され, 恵美家の印→恵美押勝の名, 皇太子に指名→皇太子に立てられ,
  都が次々と移る, 最強の貴族, 再び確認しました, 皇位の世襲を認める, 信頼され
  る顧問, 治世に対する否定的な印象, 男系・男子中心の制度へと移っていく, 都の
  真ん中に立つことはなくなった, 下野薬師寺の別当として送られています, 宣告が
  取り上げられ, 宣命と呼ばれる勅令, 上皇となった孝謙の病を治療. Excluded as
  kept/legitimate → page-local assertions only: 日本の学界の合意, 学術的合意
  (removed from the page but present on fujiwara/deeptimeline), 二度統治
  (reviewer kept it in metas/quick answer/FAQ1), 近代 (card-date 770～近代),
  generic 史学/歴史叙述.
- **Accuracy fixes (item numbers from the review):** opening gives the
  749–758/764–770 reigns instead of "二度統治しました…この宮庭を形づくった
  のは…難波が都としての最後の時期" (item 2); QA 女性皇太子に指名された人→
  となった人物, 宇佐八幡宮神託をめぐる…騒動→宇佐八幡宮神託事件, final QA
  clause replaced with reviewer's Naniwa sentence (items 3, 7); FAQ1 738年、
  皇太子に立てられ + 女性が皇太子となった例 (item 4); FAQ2 762 保良宮・
  近江, 側近, 近年の研究では…見方も示されています (item 5); FAQ3 伝達+『続
  日本紀』は記しています attribution (item 6); FAQ4 726造営/744遷都
  consistency (chronology fix); 光明 card: 長屋王の変, 宣命 (dropped 法の
  抜け穴説・磐姫・経済基盤説法, item 10); 阿倍 card: 基王 was the dead
  designated heir and 安積親王 was alive — no male-heir-absent claim, title→
  立太子 (item 11); 信仰 card: 施薬院・悲田院 for sick and poor, deleted
  神権的な王権 sentence (item 12); 難波 card: 726造営/744遷都, 瀬戸内海に
  つながる交通・交流の要地, 平城京・恭仁京・難波宮・紫香楽宮 move list,
  title→難波宮の造営と遷都 (item 13); 仲麻呂: 譲位/賜り/太保・太師, dropped
  特権・貨幣・恵美家の印 (item 14); 二重権力状態 with 国家の大事と賞罰 (item
  15); 道鏡 card: 近江の保良宮・孝謙上皇, 側近 (dropped 信頼される顧問, item
  16); 平城中心 card: 744難波遷都→745復帰 chronology, dropped 難波が放棄
  (item 17); 乱 card: 近江で兵を挙げ/朝廷軍に敗れ/殺害 + 淡路へ配流 (dropped
  三尾崎・移されます, item 18); era-3 header + callout: 天皇による直接支配→
  権力の集中/天皇のもとに集まる政治権力 (item 19); 法王宮職=令外官・家政と
  政務の機構 (dropped 二重構造, item 20); 直接皇権の再主張→称徳天皇の政治的
  権威, 最強の貴族→制約していた有力な政治勢力 (item 21 — closes the §4
  card-title row); 宇佐 card: 『続日本紀』は…奏上した + 別部穢麻呂（わけべの
  きたなまろ）, title→宇佐八幡宮神託事件と和気清麻呂 (item 22); 帝位野心:
  現存する同時代史料から直接確認できない + 近年の研究では + 再検討する研究
  もあります (item 23); 神聖権力の統合→道鏡と仏教的権威 with 研究上の議論
  (item 24); 神託 card: 『続日本紀』は記しています (item 25); 崩御 +
  天智系の光仁 + と道鏡に対する後世の否定的なイメージ (items 26, 27);
  流罪: 下野国薬師寺別当に左遷, 770下野/772没, dropped 宠愛による保護 claim,
  明正天皇まで + 男系・男子優先の原則 (item 28); 784–94 cards de-duplicated —
  card 3 political/geographic relations, card 4 urban transition with
  都の中心に位置する構造から距離を置きつつ (item 29); legend/col-header
  labels: 公式記録 — 『続日本紀』/史学上の論点/都の移転と難波宮, era buttons →
  聖武天皇と難波宮・孝謙天皇と二重権力・藤原仲麻呂の乱・宇佐八幡宮神託事件・
  記憶と歴史叙述, chips → 史学上の論点 ×3 / 史学上の再検討 (items 8, 32);
  references: dropped 「すべて英語」 (続日本紀 is JA), Bender verified cite
  (Nara Japan, 749–770, 4 vols., 2015–16) + Snellen 1937, Rekihaku
  de-promotionalized (item 30); HistoricalEvent JSON-LD description
  source-attributed (removed the 難波と大宰府の対立/正当化するために利用
  claim); metas keep 二度統治 per item-2 scope.
- **EN mirror:** all 32 items — legend Historiographical Debates,
  chips Scholarly View/Consensus×2/Revision → Debates/Reassessment, buttons
  Emperor Shōmu & Naniwa / Empress Kōken & Dual Authority / Fujiwara no
  Nakamaro's Rebellion / Usa Shrine Oracle Incident (question renamed in
  summary + JSON-LD together), era headers Concentration of Authority /
  Usa Shrine Oracle Incident & Imperial Succession; cards mirrored (Kōmyō
  senmyō without "Modern scholarship rejects", Princess Abe made Crown
  Princess, welfare without orphanage/poorhouse/sacred kingship, 726/744/
  Heijō-Kuni-Naniwa-Shigaraki, Hora Palace confidant, Naniwa abandoned →
  744 move/745 return, Nakamaro rose in Ōmi, Hōō-gūshoku extra-statutory,
  Shōtoku's Political Authority, Shoku Nihongi attributions, Dōkyō bettō
  770/772 + Meishō, temple-geography sentences); callout → recent scholarship
  + authority concentrated around the emperor; references mirror JA;
  FAQ byte-sync 4/4 both locales.

Verification: check:ja 0 warnings (21 pages; 30 new glossary rules cause no
site-wide collisions), check:data 61 pages/101 blocks FAQ parity, check:parity
8/18/10, tsc, npm run build; FAQ byte-identity 4/4 both locales; assertion
greps clean (JA: all glossary terms + 日本の学界の合意/学術的合意/難波が都と
して果たした/神権的な王権/皇太子に指名/大港/三尾崎/淡路へ移されます/お亡くな
くなりになり 0 hits; EN: Japanese Scholarly Consensus/Scholarly
Consensus/View/Scholarship Consensus/Modern scholarship rejects/Naniwa
abandoned/Miozaki/orphanage-poorhouse/sacred kingship/direct imperial
autocracy/Modern Japanese scholarship/trusted adviser/counter-oracle/
Crown Princess Designation/Shoku Nihongi 697–791 0 hits); peripherals updated
(llms.txt ×2, site-graph ×2 with 稱徳→称徳, fujiwara EN anchor); dump
regenerated (`ja-review-cards.md`).

## 5n. Round 14 — fujiwara-shadow-politics accuracy/title rewrite (2026-10-02)

External 43-item accuracy/terminology critique of `fujiwara-shadow-politics`
(JA + EN): the page was sold as 「五百年にわたる影の支配」/shadow politics
(title/og/CTA), mixed the term 学術的合意 (EN "Japanese Scholarly Consensus")
into a site whose chosen label is 研究上の論点, used 公式記録 for官撰史書/
同時代史料 and 玉座 for 皇位, mis-assigned mothers (EN gave 文徳 and 清和 the
same mother 明子; JA genealogy readings 侃子・重子・長子), claimed Michinaga
had held the kampaku (he never did — 内覧 995 / 摂政 1016 / 太政大臣 1017;
「御堂関白」はあだ名), dropped 一条天皇 from the Fujiwara-mother genealogy
while counting "five consecutive reigns", kept the phantom Bender/Shoku
Nihongi 697–791 English volume and a mis-titled Cambridge History of Japan
Vol. 2, and stated Fuhito's posthumous honors as if held in life. Rewrote
both locales keeping the four-column structure, era groups, entry counts,
tour badges and UI labels intact.

- **User decisions (2026-10-02):** (1) retitle exactly — JA `<title>` 「藤原
  摂関 — 皇位を支えた外戚政治」+ h1 「藤原氏：皇位を支えた外戚政治」+ kicker
  史料、研究史、主要官職、そして天皇の母; EN `The Fujiwara Regency — In-Law
  Politics That Sustained the Throne` + h1 `The Fujiwara: The Imperial In-Laws
  Who Sustained the Throne` + kicker `Court Chronicles, Current Research,
  Political Posts &amp; Imperial Mothers` (rippled to metas/og/twitter/JSON-LD
  Breadcrumb+headline+WebPage, dateModified 2026-10-02, page-date October
  2026). (2) 公式記録→官撰史書/同時代史料 in kicker/meta/quick answer/card
  prose; UI labels kept (legend key c1, col-header c1, card 013 chip — 3 JA
  + 2 EN remaining by design); c2 → 研究上の論点 (EN `Current Research`).
  (3) 玉座→皇位 page-local incl. the tour CTA. (4) genealogy card 024 =
  reviewer's exact list (二条 dropped). (5) dazai no sōchi EN = "the post of
  deputy governor at Dazaifu" (romanization avoided — original wording had
  blocked on a reading).
- **Terminology (glossary-first):** 9 error terms added to
  `data/ja-glossary.json` at level error — 学術的合意/日本の学界の合意 →
  研究上の論点, 影の政治 → 皇位の背後で動いた政治, 母系戦略 → 母方のつながり
  を重ねる方針, 皇位乗っ取り → 皇位をめぐる政変, 日本を支配 → 朝廷政治を動か
  した, 派閥クーデター → 宮廷内の派閥による武力政変, 機械を回 → 形式だけが動
  き続ける職, つまみ → 形式だけの職. Page-local only (not glossary): 玉座,
  公式記録, 嫁がせ, 独占. 二度統治 never added.
- **Accuracy fixes (item numbers where known):** card 001: 三国の調の儀式 +
  佐伯子麻呂と葛城稚犬養網田 cutting down 蘇我入鹿 beside 石川麻呂's 上表文
  (EN killers corrected to Saeki no Komaro and Katsuragi no Wakainukai no
  Amita; 東西 memorials read to Empress Kōgyoku by Ishikawa no Maro); card
  002 title → 道徳的復興ではなく、宮廷内の派閥の武力政変; card 004 母方の
  つながりを重ねていく方針 (was 嫁がせ・独占 phrasing); card 005: Fuhito
  698姓継承 + 701大納言/708右大臣/718辞退/720死後追贈 (posthumous honors no
  longer read as held in life); card 007: 武智麻呂 734右大臣/737左大臣・翌日
  没, 正一位・太政大臣は追贈, 独占→主導; card 008: 一世紀もたたないうちに
  (was "barely fifty years"); card 009: 冬嗣 821右大臣/825左大臣 + 弘仁格
  式 (Kōnin Code); card 011: 884基経の事実上の創設/887宇多の詔/888阿衡の
  事件 (titular-name reading); card 012: 文徳←順子(冬嗣), 清和←明子(良房)
  — EN had both ←明子 — + 良房 = 文徳の母方の叔父・清和の母方の祖父; card 013:
  大宰権帥 (plain-English gloss), 時平39歳, 斉世親王 → EN "Prince Tokiyoshi"
  (was "Prince Tokiyo"); card 015/016: 一条天皇←詮子(兼家) added (old card
  skipped 一条 entirely), full 醍醐60〜三条67 list with mothers 胤子/穏子/
  安子/懐子/詮子/超子 → 「醍醐から三条まで、8代の治世がすべて藤原氏の母」;
  card 017: 道長 never held the kampaku — 995内覧/1016摂政/1017太政大臣,
  「御堂関白」はあだ名, 現存する最古級の公家日記 (was 最古の日記); card 018:
  望月の歌 quoted correctly 「この世をば我が世とぞ思ふ 望月の かけたることも
  なしと思へば」 (was corrupt 「この世は我が世ならむ…」) with 『小右記』
  attribution; card 019: 頼通 1027内覧・1049太政大臣, 1067関白→弟・教通
  (dropped the "nineteen years" claim); card 020: only 後一条 acceded during
  道長's lifetime, 後朱雀1036/後冷泉1045 both after his death (末の孫 claim
  dropped; Go-Reizei b. 1024 removed — actually 1025; no birth-year claim
  remains); card-date 1008〜1034 → **1008〜1036 / 1008–1036** (Go-Ichijō
  died 15 May 1036 — verified against sources after the round; pre-existing
  in both locales, outside the review's 43 but fixed here); cards 022/023:
  独占→主導的地位, 機械の比喩→形式だけが動き続ける職/通り過ぎられ (EN
  "predominance", "empty form"); card 024: reviewer's exact list (白河←茂
  子, 堀河←賢子, 鳥羽←苡子, 崇徳・後白河←璋子, 後鳥羽←殖子, 順徳←重子,
  仲恭←立子; 二条 dropped, readings corrected from 侃子・暲子・長子); card
  021: 保元・平治の乱; references: Bender dropped, 『続日本紀』 = third of
  the six national histories, Cambridge Vol. 2 → `The Cambridge History of
  Japan, Vol. 2: Heian Japan, 794–1185` (Cambridge University Press, 1999);
  metas/FAQ: 影の政治 blurb → new descriptor in both locales, FAQ2 rewritten
  together (887宇多の詔/888阿衡の事件), FAQ3 EN "some 1,344" → "1,344";
  HistoricalEvent JSON-LD description mirrored to JA.
- **EN mirror:** all 43 items — title/og/twitter/breadcrumb/headline/
  descriptions, kicker+h1+lead, quick answer (imperial throne, court
  chronicles beside current research, rise of the warrior government),
  `Japanese Scholarly Consensus`/`Scholarship Consensus` → `Current Research`
  (×8), all 24 cards mirrored (Isshi killers, Fuhito offices, Muchimaro
  734/737, Fuyutsugu 821/825, Uda/Ako/基経, uncle/grandfather, Dazaifu post,
  eight-reign genealogy with Senshi/Chōshi, never-held-kampaku, Mochimitsu
  poem, Yorimichi/Norimichi 1067–68, Go-Ichijō-only accession, 1008–1036,
  genealogy readings), refs 1003/1009, page-date October 2026; FAQ
  byte-sync 4/4 both locales.

Verification: check:ja 0 warnings (21 pages; 9 new glossary rules cause no
site-wide collisions), check:data 61 pages/101 blocks FAQ parity, check:parity
8/18/10, tsc, npm run build; FAQ byte-identity 4/4 both locales (node regex
over `<details>` pairs); assertion greps clean (JA: 影の政治/学術的合意/日本の
学界の合意/玉座/独占 0 hits — 公式記録 remains only in the 3 UI labels by
decision; EN: shadow politics/Scholarly Consensus/monopoly/Prince Tokiyo/
Shoku Nihongi 697–791 0 hits); peripherals updated (llms.txt ×2, site-graph
×2, deeptimeline callouts ×2 incl. EN anchor); card regnal numbers spot-
verified against official numbering (聖武45/醍醐60/一条66/後一条68/白河72/
後鳥羽82/順徳84/仲恭85 — all correct).

## 5o. Round 15 — tenjin-matsuri-history accuracy/continuity rewrite (2026-10-02)

External 23-item accuracy/terminology critique of `tenjin-matsuri-history`
(JA + EN): the page was sold as 「大阪が日本最大の水上祭りを祝う理由」/"Japan's
largest water festival" (title/og/twitter/lead/section), stated the 951 origin
as fact when the shrine itself only says 始まりとされ (legend), claimed an
unbroken thousand-year ritual although the spear ceremony lapsed in the Edo
period (元和7年/1621 祭場が雑喉場に定められ鉾流神事取りやめ) and only returned
in 1930 as 鉾流神事, today held on the 堂島川; used 学者から神になった /
宗教的な川祭り / 帝位の左右, named the succession prince 時康親王 (childhood
name — 斉世親王 / "Prince Tokiyoshi"), dated 時平's death to 38 (39), and the
Edo card lacked 元禄 (御迎人形, 三大祭り fame) and 享保 (「講」). Rewrote both
locales keeping the quick-answer/FAQ/fact-table/timeline structure, entry
counts and kicker intact.

- **User decisions (2026-10-02):** (1) subtitle exactly — JA 「大阪が日本屈指
  の水上祭りを祝う理由」+ EN `Why Osaka Celebrates One of Japan's Largest
  Water Festivals` (title/og/twitter/JSON-LD headline/lead p/section title;
  kicker 「エドワードと歩く大阪城 — 歴史探究シリーズ」 unchanged). (2) 時平 39 /
  thirty-nine. (3) 斉世親王 → EN "Prince Tokiyoshi". (4) `public/ja/llms.txt`
  「大阪最大の祭礼」 + site-graph Osaka-scoped entry kept — no peripheral
  changes. (5) L651 soften — exam-prayer tradition no longer claimed as an
  unbroken thousand-year line. (6) 鉾流神事 verified by websearch before
  editing: 951 = shrine tradition (大阪天満宮社伝/ja-wiki 始まりとされ, en-wiki
  "legendary"), ceremony suspended in the Edo period, revived 1930 (食満南北
  の提言), modern rite on 堂島川; 元禄時代 = 御迎人形 + 隆盛, 享保年間 = 「講」
  (shrine official site + ja-wiki).
- **Terminology (glossary-first):** 5 error terms added to
  `data/ja-glossary.json` at level error — 学者から神になった → 死後に神格化
  された, 宗教的な川祭り → 水上の神事を中心とする都市祭礼, 日本最大の水上祭
  り → 日本屈指の水上祭り, 時康親王 → 斉世親王, 帝位の左右 → 皇位の継承をめ
  ぐる政治勢力. 二度統治 never added.
- **Accuracy/continuity fixes (JA):** meta/og/twitter 「951年に大阪天満宮で
  始まった祭りへ」→「951年と伝えられる大阪天満宮の祭りへ」; quick answer 死後に
  神格化された + 社伝では951年; FAQ1 + JSON-LD 「大阪天満宮の社伝では、…伝え
  られています」; FAQ5 + JSON-LD 最初の御神槍の儀式は951年のことと伝えられ;
  fact table 初開催「951年（天暦5年・社伝）」+ 祭りの種類 水上の神事を中心とす
  る都市祭礼; 帝位の左右 → 皇位の継承をめぐる政治勢力; 時康親王 → 斉世親王;
  時平 38 → 39歳; L651 死後千年以上経った今も受け継がれています + img caption
  学者として神になった → 死後に神格化された菅原道真; 951 card 始まりと伝えら
  れています + 江戸時代に一度途絶え1930年に鉾流神事として復活 + caption いま
  も堂島川で斎行される鉾流神事として受け継がれています; 大坂の陣 card すぐに
  復活 → 再び盛んに; 江戸 card + 元禄時代（御迎人形・三大祭りに数えるほどの
  隆盛）/享保年間（「講」の組織・町ぐるみの参加）; 現代 card 社伝で951年に始
  まったとされる + 船行列 caption 約千年の歴史を持つ天神祭の伝統; closing
  951年と伝えられる最初の御神槍の儀式で神鉾が流された.
- **EN mirror:** subtitle ×3 + lead + section title; meta/twitter largest →
  one of largest; quick answer (deified as Tenjin after death + shrine
  tradition); FAQ1/FAQ5 + JSON-LD twins byte-identical to visible; table 951 CE
  (shrine tradition) + Urban Festival Centred on Water Rituals; imperial-
  succession sentence (was "controlling the throne"); Prince Tokiyoshi;
  thirty-nine; students/devotion line; img caption deified after his death;
  951 card traditional origin + lapsed/revived 1930 as Hōkonagashi on the
  Dōjigawa; Siege "flourished again" (was "quickly returned"); Edo card
  Genroku mukaebina + Kyōhō kō; modern card traditionally dated + boat caption
  "history of nearly a thousand years"; closing waterway line; FAQ byte-sync
  6/6 both locales.

Verification: check:ja 0 warnings (21 pages; 5 new glossary rules cause no
site-wide collisions), check:data 61 pages/101 blocks FAQ parity, check:parity
8/18/10, tsc, npm run build (all three guards green inside build); FAQ byte-
identity 6/6 both locales (node regex over `<summary>`/`<p>` pairs vs FAQPage
JSON-LD); assertion greps clean (JA: 日本最大の水上祭り/学者から神になった/
宗教的な川祭り/帝位の左右/時康親王/38歳 all 0 hits; EN: "Japan's Largest
Water Festival"/Prince Tokiyo/thirty-eight 0 hits — scoped claims kept by
decision: JA 日本最大の学者の一人 / 日本最大の商人祭り / 日本最大の商都, EN
"one of Japan's most recognisable summer celebrations").

## 5p. Round 16 — genpei-timeline locked-decision rewrite (2026-10-02)

**Provenance caveat:** the original 57-item review for this round was never
persisted to disk and was lost when the session was compacted. What survived
was three locked user decisions + one reference flag (persisted post-hoc as
`ja-review-annot-07.md`, untracked); the remaining ~53 items are gone.
Execution = those decisions + the flag + an independent accuracy pass by the
applying agent (card dates/claims spot-checked; no further defects found
beyond what the decisions covered).

- **User decisions (2026-10-02):** (1) series title — JA header-subtitle
  「エドワードと歩く大阪城 — 鎌倉史」→ 「エドワードと歩く大阪城 — 武士政権の
  誕生」, EN `Kamakura History` → `The Birth of the Warrior Government` (h1,
  metas and breadcrumbs unchanged by decision). (2) opening thesis = "Option
  2, full" *(exact wording lost — reconstructed)*: the old thesis claimed the
  war "ended aristocratic rule" and "the first shogunate would last 700
  years"; the replacement states the war did **not** end aristocratic rule,
  began as a court struggle, and attributes the **~700 years to warrior
  government counted from 1185** (Kamakura bakufu itself lasted to 1333).
  (3) FAQ keep question 「日本で最初の幕府は、何だったのですか？」/ `What was
  Japan's first shogunate?` (visible + JSON-LD name), **answer only**
  rewritten *(target wording lost — reconstructed)*: parallel military
  government at Kamakura, shaped by the 1192 seii-taishōgun appointment but
  working from the 1185 Dan-no-ura victory, emperor as legitimacy source,
  shugo/jitō to shogunal warriors — a double structure.
- **Reference flag:** JA line 966 / EN line 1012 cited `The Cambridge
  History of Japan, Vol. 2: The Twelfth and Thirteenth Centuries` — not a real
  volume title. Verified via cambridge.org: Vol. 2 = `Heian Japan, 794–1185`
  (Shively & McCullough, print 1999), Vol. 3 = `Medieval Japan` (Yamamura,
  1990, opens with the Kamakura bakufu's founding). Both locales now cite
  Vol. 2 for the Hōgen/Heiji/Genpei chapters and Vol. 3 for Kamakura
  government — matching the round-14 fujiwara wording for Vol. 2.
- **EN mirror:** all of the above — subtitle, thesis (no "ended aristocratic
  rule"/"last 700 years"), FAQ answer byte-identical to its JSON-LD twin,
  Cambridge two-volume reference. FAQ byte-sync 4/4 both locales (FAQPage
  nested in the page's JSON-LD graph).

Verification: check:ja 0 warnings (21 pages), check:data 61 pages/101 blocks
FAQ parity, check:parity 8/18/10, tsc, npm run build (guards green inside
build); assertion greps — 鎌倉史/Kamakura History/700年-as-bakufu-lifespan/
`The Twelfth and Thirteenth Centuries`/old FAQ strings all 0 hits (new thesis
keeps 約700年にわたる武家政権 by design); no llms/site-graph ripple (their
genpei labels never carried the subtitle).

## 5q. Round 17 — azaiclanbetrayal (56 items) + ishiyama-timeline (42 items) (2026-10-02)

**Provenance:** both external reviews persisted verbatim **before** execution
for the first time — `ja-review-annot-08.md` (untracked), with the 8-row locked
decision table at its top. Applying agent worked item-by-item off those files.

- **Locked user decisions (2026-10-02):**
  1. **azaiclan keep 1564 / 「6年後」 everywhere** — never 1567 / 「約3年後」
     (Japanese scholarship: 永禄7年 = 1564; 1567 is a digital-era artifact).
     Rejects review #3, #27, #56.
  2. **Research-credit line frozen site-wide** — rejects #55; `research-footnote`
     untouched on both pages.
  3. **Keep tour badges, fix labels** — rejects #46 badge removal; all
     `tour-badge` spans stay (JA `ツアーで訪問` / EN `On Tour`), only adjacent
     `card-dynasty` labels renamed.
  4. **Nav = text-only polish** — rejects #30 structural replacement; keep the
     5 filter buttons すべて/同盟/裏切り/滅亡/遺産, adopt #31/#34 label wording
     only (`織田氏（尾張・京都）`, `浅井氏（北近江）`, `豊臣家と大坂城`,
     `同盟 — 運命の分岐点`).
  5. **Ishiyama keep 十年 / 10年 everywhere** (round-5 §3 lock; actual span
     元亀元年9月12日→天正8年8月2日 = 9y11m; 11年 is inclusive-year counting)
     — rejects ishiyama #2.
  6. **Ishiyama title/meta kept (10年 + 僧兵); body only** — `僧兵 → 門徒・
     本願寺勢` applies to quick answer/FAQ/cards/continue-li, **not**
     `<title>`/og/twitter/JSON-LD headline/Article description (protects the
     locked link 「僧兵、百姓、将軍」).
  7. **Ishiyama adopt 和議/講和, both locales** — FAQ Q4 + JSON-LD rewritten
     byte-identically with subject lock `本願寺が`, card h3
     「降伏と焦土作戦」→「講和と退去」 / `The Surrender and Scorched Earth` →
     `Peace and Evacuation` (closes §4 焦土作戦 flag).
  8. **Full EN mirror of factual fixes** on both pages.
- **azaiclan adopted (JA + EN mirror):** header lead re-dated to the 1570
  Echizen invasion (defection = 離反, not the 1570 Anegawa battle; route via
  若狭・朽木); `壊滅寸前/挟撃の危機`, `激怒/Enraged` → `離反を受けた` /
  `Reacting to the Azai defection` (June 1570, falls back to own bases);
  `終焉を悟った切腹` → `自害`; `浅井家は断絶` → `戦国大名として滅亡`;
  `救出` → `織田方に引き取られ`; Chacha card 1569年頃 + unconfirmed birthplace
  (dropped 和平の象徴); Tsurumatsu (1591, no "age two"), Hideyori bloodline via
  母・淀殿, Hidetsugu/1595 = 継承問題 + `三条河原での処刑` (dropped 虐殺 +
  "30 decapitated"), 1614–15 = 落城・城内自害の伝承・経緯は不明な点も残る
  (dropped 燃える天守 + "official government account"), final chain =
  1564年の婚姻から political/blood ties (dropped 血塗られた), `織田の崩壊
  （1582）` → `本能寺の変（1582）`; era headers 炎とともに消えた小谷城 /
  継承問題と豊臣家の最期; dynasty labels 織田後の空白→本能寺から賤ヶ岳へ,
  大坂城の世継ぎ→豊臣家の後継者, 京都の虐殺→秀次一族の処刑, 王朝の猜疑→
  豊臣家の継承問題, 最終の大火→大坂の陣 — 豊臣家の最期; titles 敵の懐へ→
  豊臣家へ, Sanjō-gawara Slaughter → Sanjō Riverbed Executions. FAQ 4/4
  byte-synced visible↔JSON-LD both locales; Article description mirrors the
  new lead both locales.
- **Ishiyama adopted (JA + EN mirror):** opening = 上町台地北端…大阪城一帯に
  あったと考えられています (kept 10年); quick answer/FAQ = 浄土真宗本願寺教団
  の本拠・門徒や武装した勢力, Fróis = unquoted paraphrase + 「最も堅牢」
  dropped; FAQ2 = 畿内の交通と政治に影響力を持つ本願寺勢力 + 顕如率いる本願寺
  勢力は抗戦を呼びかけ + 陸上包囲/海上輸送の構造; FAQ3 = 毛利氏の水軍…
  兵糧や弾薬, 足に鉄砲傷; FAQ4 = 講和 + 正親町天皇の勅命・朝廷仲介・本願寺が
  講和 + 顕如4月/教如8月 + 火災原因は諸説 + 1583築城開始 (byte-identical
  ×2 per locale); 1576 card = 十か所の付城・本願寺勢約一万五千・明智光秀らが
  守る砦・約三千で自ら救援 (dropped 15,000 defenders / Araki / 諸将退け /
  飢餓目前 / 屈辱的敗北); 1576–78 = 「鉄甲船」と呼ばれる大型の安宅船・
  構造や規模については議論あり (dropped 世界初の鉄甲艦 + fire-arrow design
  intent), 優位を確立/海上補給を困難に (dropped 完全に断ち切り); 1578–80 =
  本願寺の坊官ら (dropped undocumented 下間仲之) + 兵糧不足が深刻; 1580 card
  = 講和と退去 + 火災諸説 + 放棄されてから破壊された → 講和によって退去した
  後に焼失; callout = 1583築城・豊臣/徳川に姿を変える (dropped 三つの砦・
  同じ標的・僧兵たちが同じ場所). **2 new glossary error rules** added to
  `data/ja-glossary.json` (forbidden `世界初の「鉄甲艦」`, `焦土作戦`).
- Verification: check:ja 0 warnings (21 pages), check:data 61 pages/101 blocks
  FAQ parity, check:parity, tsc, npm run build; assertion greps — `1567`/
  `約3年後` 0 hits both pages, azaiclan `1564` ×6 JA / ×7 EN + `6年後`/`Six
  years later` present, ishiyama `11年` 0 hits, `下間仲之`/`世界初`/`焦土作戦`
  0 hits, title/meta 僧兵 intact ×7; FAQ byte-sync 4/4 both pages both locales.
- **Follow-up pass (2026-10-02, same ishiyama 42-item review re-presented):**
  three user decisions — (a) **keep 10年 everywhere, re-reject #1/#2** (Osaka
  Castle's 「11年に及ぶ」 stays a rejected source; 13 JA + 8 EN occurrences,
  title/meta/FAQ question, deeptimeline card all untouched); (b) **item 42
  content-only** — no card-title renames (長期消耗戦 / 海戦と鉄甲船 kept);
  (c) **item 40 body-prose only** — titles/meta/headline/alt keep 要塞.
  Fixes applied both locales: JA JSON-LD ItemList #4 (dropped 完全に断つ /
  6隻, now 九鬼・大型安宅船・1578第二次木津川口・優位を確立・孤立が深まる);
  ItemList #5 both locales (dropped 完全に閉ざされ/飢餓・entirely
  closed/starve out → 兵糧・弾薬不足が深刻); 1570 card + ItemList #1 both
  (仏敵と宣言 → 顕如率いる本願寺勢力は抗戦を呼びかけ, item 10) + 野田・福島
  framing (item 42); 1571–75 card p1 + ItemList #2 = 広域的な戦いへ展開 with
  長島・越前・加賀 × 武田・毛利 linkage; 1576 card + ItemList #3 = 1576年5月
  / May 1576; 探索/Continue paragraph both locales rewritten to 1583築城・
  豊臣から徳川 (dropped 灰は大坂城の礎・betrayals and battles, item 39
  twin); 要塞/fortress body prose → 石山本願寺/Ishiyama Honganji (石山本願寺内
  に退却・一箇所ではなく・兵を向ける前に; FAQ question + meta/title
  untouched); JA continue-li 大阪城→大坂城 (item 41, Tokugawa context).
  Verification: check:ja / check:data / check:parity / tsc / build green;
  greps `11年` `仏敵と宣言` `完全に断つ` `6隻` `飢餓` 0 hits, 10年 ×13 JA /
  "ten years|decade" ×8 EN unchanged; FAQ byte-sync 4/4 both locales.

## 5r. Round 18 — toyotomihideyoshi (27 items) (2026-10-02)

**Provenance:** external reviewer working from Japanese-language scholarship
and JA museum/archival/official sources only (豊臣家文書・任命文書, Osaka
Castle Museum, NDL/CiNii on 墨俣/『天正記』, JA geographical research on the
Takamatsu flood, Odawara City archaeology on 石垣山). Full item record +
decision table persisted in `ja-review-annot-09.md` (untracked). Verdict was
"would not publish in current form"; ratings 6.5/5.5/6 (naturalness/
terminology/accuracy).

- **Locked user decisions (2026-10-02):**
  1. **Keep tour badges** ツアーで訪問 / On Tour ×12 per locale (round-17 lock
     upheld); reviewer's badge deletion rejected — they are functional links.
  2. **Adopt reviewer's era labels** — buttons すべて/立身期/権力掌握期/
     天下人期/晩年 (filter keys rise/ascension/unification/twilight unchanged);
     the 「すべて崛起期登極期…」"UI artifact" is 5 separate buttons — kept, not
     deleted (same structure as azaiclan's locked nav).
  3. **EN h1 em = translated death poem** ("Dew that falls, dew that fades —
     my life").
  4. Standing: FAQ visible↔JSON-LD byte-identical ×4 both locales; full EN
     mirror; `<title>`/meta untouched (poem was never in head); glossary-first
     error rules.
- **Headline correction:** h1 subtitle 「露の世は露の世ながらさりながら」 was
  小林一茶 (『おらが春』, daughter's death 1819), not Hideyoshi → replaced with
  露と落ち　露と消えにし　我が身かな (manuscript-backed per Osaka Prefecture
  cultural-heritage DB) in h1 + death card + callout, both locales.
- **Adopted (JA + EN mirror):** new lead (尾張国中村…天下人, Article JSON-LD
  description synced); quick answer = 朝廷の最高位…全国の大名を統合 +
  包囲・兵糧攻め・築城・水攻め (dropped 第二の統治者/奇想天外/横死); FAQ1
  retitled 秀吉はどのようにして関白になったのか？ + 弥右衛門・出自不明・
  『信長公記』殿軍の一員 with source-difference caveat (dropped Yaesuke/
  百姓兵/兵站の才); FAQ2 rewritten — bloodline bar deleted, 近衛前久の猶子・
  藤原氏・関白 1585-07-11, 豊臣姓・太政大臣 1586, 摂政 conflation removed;
  FAQ3 = 墨俣伝承・鳥取兵糧攻め・高松 **1582** + 自然堤防 hedge (dropped
  1581/12日4km as fact); FAQ4 = 石山本願寺推定地 + 象徴する政治・軍事拠点;
  era buttons/headers per §22; cards — 1537 尾張・中村に生まれる (dropped
  日吉丸/弥助), 1550s 逸話framing (草履 = 後世の伝説), 1560 織田家中での活動
  (dropped 粮草係/兵站支援), 1561 寧寧 (杉原氏・浅野長勝養女; dropped 一期
  一会/織田家の家臣の娘), 1566 墨俣築城の伝承, 1570 金ヶ崎 hedged to
  『信長公記』, 鳥取 兵糧攻めによる制圧 (dropped 凄惨/心理戦), **高松 card
  moved to 権力掌握期 top + re-dated 1582年 + title 備中高松城の水攻め**,
  山崎 = 和議+約200km+6月13日 (dropped 数日/完全に不意打ち/掌握), 大坂城 =
  推定地+象徴, 賤ヶ岳 = 後継をめぐる対立 label + 1583年4月決戦・北ノ庄城・
  自害 (dropped 篡奪者/内部粛清), 関白 card re-titled 1585年 only (近衛前久
  の猶子), **NEW 1586 card 豊臣姓の賜与・太政大臣就任** at 天下人期 top,
  九州 = 降伏・服属・再編 (dropped 20万/殲滅/牢固), 小田原 = 包囲+陣城+茶会能+
  7月氏直降伏 (dropped 祭りに変えて士気壊滅), 石垣山 = 「一夜城」の伝承 +
  約80日, 天下統一 = 小田原+奥州仕置+**1591奥羽再仕置** (dropped 疑う余地の
  ない主人 → 服属させる天下人), 秀吉をめぐる歴史と伝説 = 『天正記』(大村由己)
  + 北野大茶湯（1587）諸説 (dropped 敏感/神勅/無理やり), 文禄・慶長の役 =
  大陸侵攻の時代 + 詳細かつ強硬な指示 (dropped 明の中国/常軌を逸した冷酷),
  秀頼誕生 = 1593 出生 → 1595 秀次追放・自害・一族処刑 (dropped 最愛/容赦
  なく粛清 motive), 死 = 晩年には病が重くなり…1598-08-18(=グレゴリオ暦9月
  18日)・61歳 + full death poem (dropped 健康は完全に衰えて/露の世は), final
  callout rewritten per item 27 (17年後・大坂夏の陣・継承体制/政治秩序/統治の
  仕組み → hook 秀頼; dropped 黄金の要塞/不朽/宿敵).
- **4 new glossary error rules:** `露の世は露の世ながら`, `足軽（百姓兵）の
  弥助` (phrase-scoped so Yasuke as a person stays legal), `登極期`,
  `飢餓封鎖`.
- **Verification:** check:ja 0 warnings (21 pages, new rules pass), check:data
  61 pages/101 blocks + FAQ parity, check:parity, tsc, build green; FAQ
  byte-sync 4/4 ×2 locales; forbidden greps 0 hits both locales; poem ×2 ×2
  locales; badges 12/12 intact; structure delta as planned (+1 card +1 row ×2
  locales — new 1586 card + Takamatsu row move; +1 china-card, −1 korea-card),
  ids/hrefs identical to HEAD.

## 5s. Round 19 — hideyoshi-rikyu-timeline (34 items) (2026-10-02)

**Provenance:** external reviewer working from Japanese-language scholarship
and Japanese institutional sources only (NDL, J-STAGE, Rekihaku, Sakai City,
the cited JA studies; no Wikipedia/Reddit). Full item record + decision table
persisted in `ja-review-annot-10.md` (untracked). Verdict: thesis "very good"
but "overstates its scholarly consensus"; ratings 7 / 6.5 / 6.5 / 7.5
(naturalness / terminology / accuracy / argument).

- **Locked user decisions (2026-10-02):**
  1. **Title variant 「政治問題」→ everywhere** — `<title>`/og/twitter/JSON-LD
     headline/breadcrumb/h1 all become 協力者から「政治問題」へ (EN: From
     Partners to “Political Problem”); reviewer's item-2 fork resolved to the
     bolder option.
  2. **Both additions adopted** — Kitano card expanded with 八百三人 +
     茶堂 terminology; bibliography gains 『兼見卿記』 + 『天王寺屋会記』
     (both locales).
  3. **承認/命令 column device kept** (column-key, col-headers, card-dynasty
     chips) per item 30 — reviewer explicitly permits it as an interpretive
     sidebar; it is simply no longer presented as scholarly consensus in
     lead/quick answer/conclusion.
  4. Defaults applied: E3C2 統治者の茶人 + E4C1 命令が引き締まる left as-is
     (not cited by reviewer); E5C1 keeps its 1589〜1591 card-date span.
  5. Standing: full EN mirror; FAQ visible↔JSON-LD byte-identical ×5 both
     locales; glossary-first error rules.
- **Framing rewrite (items 1–4):** lead = 近年の研究では…単純な「金と侘び」
  の対立だけでは説明しない見方が重視されています…複数の見解があります
  (deletes 日本の研究が描くのは別の弧です + 異常な相互依存); h1 em =
  権力と承認、そしてなお論争の続く破綻の原因; quick answer = reviewer's
  defensible paragraph (drops 二つの権威の形 / 中央集権化する身分秩序 as
  assertions); Article JSON-LD description re-aimed at 1591 punishment debate.
- **Factual corrections (items 5–8, 15, 27–28):** Yamazaki = **1582年
  （天正10年）** with 1583 築城着手 (was 1583天正11年); **関白（摂政） →
  関白**; E3C1 sequence = 1585 関白就任 / 1586 豊臣姓・太政大臣; **異父弟 →
  異母弟** + 申次 framing replaces 政治の内輪にまで関与; Fukui FAQ/card =
  2011 論文 comparative review + 博士論文 discourse-formation (drops
  争いのない単一の説明); Rikyū death card = 1591 処分・京都を離れた・
  研究上の議論 (drops 命を失いました/時系列…確定していません); statue card +
  FAQ5 = 金毛閣・1591年同時代日記・象徴するものと解釈されることがあります
  (deletes 1589年に再建…安置 implication; card-date → 1589〜1591);
  **切腹像是 → 切腹像は** + Nakamura framed as 有力な異説の一つ.
- **Naturalness/interpretive de-overreach (items 9–14, 16–26, 29):**
  Hideyoshi birth = 尾張国中村 + 弥右衛門不明・史料制約 (deletes 氏族の系譜
  はありませんでした); Rikyū birth card = 堺の有力商人の家に生まれた茶人;
  結合組織 → 媒介の場, 文化的ブローカー → 文化的な仲介者, psychological
  有用性を発見した deleted; 村井 = observation (呼称からは…捉えにくい側面)
  not proof, + 地位は仕える以前から形成; 可視化する場の一つ (was 演出する
  仕組み); 唐物→和物 = trend not replacement (both card + FAQ2); 質素対金
  card = both-objects-present point (deletes 美意識の好みを異にしても +
  後年の構築物 assertion); 聚楽第周辺の政治空間 / 政治空間の中の利休 /
  異なる権威のかたち card renames + institutional rewrites (deletes
  召されず、配置された / 埋め込まれる / strong centralization-inevitability
  claim → research-question framing); interpretation section = reviewer's
  3-paragraph replacement (no claims about what Hideyoshi "needed").
- **Era relabel (items 26, 31):** 5 buttons + 5 era-headers adopted verbatim
  (終焉 — 1591年の処分とその原因; era4 range now 1587〜1590); filter keys
  untouched.
- **Additions (items 33–34):** Kitano card = 兼見卿記四茶堂順 + 八百三人 +
  public-staging point (title 四人の茶堂、一つの舞台); FAQ3 rewritten on the
  same evidence; bibliography + 『兼見卿記』/『天王寺屋会記』; Nakamura
  bibliography entry sharpened to 有力な異説.
- **10 new glossary error rules:** `異常な相互依存`, `結合組織`,
  `文化的ブローカー`, `召されず、配置された`, `切腹像是`,
  `秀吉の異父弟` (phrase-scoped — genpei legitimately uses bare 異父弟),
  `関白（摂政）`, `後年の構築物`, `争いのない単一の説明`,
  `1583年（天正11年）に山崎`.
- **Verification:** check:ja OK 21 pages/0 warnings (10 new rules, no false
  positives), check:data 61 pages/101 blocks + FAQ parity, check:parity OK,
  tsc, build green; FAQ byte-sync 5/5 ×2 locales; forbidden greps 0 both
  locales; structure delta identical across locales (+1 p +2 li +2 strong =
  3rd interpretation paragraph + 2 bibliography entries; ids/hrefs identical
  to HEAD).

## 5t. Round 20 — osaka-castle-history (45 items) (2026-10-02)

**Provenance:** external reviewer 45-item historical/editorial audit of
`osaka-castle-history` (JA primary, EN mirror audited in parallel). Full item
record + decision table persisted in `ja-review-annot-11.md` (untracked).

- **Locked user decisions (2026-10-02):**
  1. **Death date stays site standard 1615年6月4日 / June 4** — item 14's
     1615年5月8日 rejected (site standard wins, cf. §3 Siege death date);
     城が落んだ → 城が落ちた and FAQ3 "1615年5月の夏の陣" → 1615年6月 still
     applied.
  2. **5-era restructure adopted** (item 40): buttons/headers → 豊臣の夢 /
     大坂の陣と豊臣家の滅亡 / 徳川による大坂城再築 / 近代軍事拠点 /
     現代の大阪城 with new filter keys arsenal + modern (toyotomi/siege/edo
     reused); 8-section split (item 44) rejected; column-key/card-dynasty
     tags kept. Cards stay 44 with quad-rows intact — redistribution
     implemented as **12/12/12/4/4**; annot's 12/11/13/4/4 (moving
     意図的な埋め立て to the rebuild era) NOT applied — the card (retitled
     **豊臣期の城郭、盛土の下へ**) stays in the siege group, whose header reads
     大坂の陣と豊臣家の滅亡（1614〜1615）.
  3. **Bibliography replaced** (item 41): JA = reviewer's 7 Japanese sources
     (deletes すべて英語で出版 + the 一次史料 mislabel of 『難波戦記』/『大阪記』;
     5→7 li), EN = same 7 with English annotations + the 3 kept English books
     (5→10 li); JA h2 参考文献・関連図書 → 参考文献・関連史料, EN h2 Sources &
     Further Reading unchanged.
  4. **Title 豊臣の夢、徳川の抹消 kept** (item 42 rejected) — body prose uses
     覆うように築かれた / 盛土で覆う language, no motive assertions.
  5. Standing: full EN mirror; FAQ visible↔JSON-LD byte-identical ×4 both
     locales; glossary-first error rules; dateModified → 2026-10-02.
- **Factual/terminology rewrites (items 1–43):** 築城 period, 政治的空間 and
  野面積み card rewrites; ねね = **1548/1549〜1624** (never 1546), 豊臣期大坂図
  屏風 (never 豊臣襖絵), 奈阿姫 (never 名姫), 鶴松; dates **1627** 天守 (never
  1626), **1629〜1665** / **1620〜1629** (never 1628/1630); **1868年1月6日**
  大政奉還 (never 1868年2月); 1931 募金 + 大坂夏の陣図屏風, **1959** 筒井文庫
  再建 + **1984** 修復, 280万人; **大阪城代 → 大坂城代** + 大坂町奉行 + title
  城代 rows; 江戸期 restorations framed as repairs (never 復元/江戸時代の姿に
  戻る); Edo-peace claims hedged (never 265年続く徳川の平和); Kobori Enshu
  attribution removed (縄張りは藤堂高虎); FAQ ×4 rewritten in both locales.
- **Narrative de-overreach:** summer/winter campaign cards + FAQ3 = 講和の
  破綻・対立の悪化 framing (never 意図的な殲滅戦 / それは罠でした / 見せかけで
  した / 意図的な埋め立て / 日本史上に例がなく / 心中しました / 軍事的な目標と
  して使った); no victors/declining-shogunate claims.
- **18 new glossary error rules:** `豊臣襖絵`, `宁々`, `名姫`, `1546〜1624`,
  `城が落んだ`, `日本史上に例がなく`, `意図的な殲滅戦`, `それは罠でした`,
  `見せかけでした`, `藤堂高虎と小堀遠州`, `江戸時代の姿に戻`,
  `265年続く徳川の平和`, `心中しました`, `軍事的な目標として使った`,
  `意図的な埋め立て`, `大阪城代`, and the two exact bibliography-mislabel
  patterns `一次史料：</strong> <em>『難波戦記』` / `…『大阪記』` (site-wide
  grep first: bare 一次史料 stays legal — hideyoshi-rikyu uses it correctly).
- **Verification:** check:ja OK 21 pages/0 warnings (18 new rules, no false
  positives), check:data 61 pages/101 blocks + FAQ parity, check:parity OK,
  tsc, build green; FAQ byte-sync 4/4 ×2 locales (questions + answers);
  forbidden greps 0 both locales; structure delta identical across locales
  (era-group +2, era-btn +2, era-header +2 = 5/5/5, cards 44,
  li +2 JA / +5 EN; ids/hrefs identical to HEAD).

## 5u. Round 21 — toyotomi_hideyori (28 items) (2026-10-03)

**Provenance:** external reviewer 28-section historical/editorial audit of
`toyotomi_hideyori` (JA primary, full EN mirror). Full item record + decision
table persisted in `ja-review-annot-12.md` (untracked).

- **Locked user decisions (2026-10-03):**
  1. **Full 5-chapter restructure adopted** (items 25–26): buttons/headers →
     奇跡の子 / 孤立した継承者 / 運命の衝突 / 和議と城の崩壊 / 夏の陣と滅亡
     (EN: The Miracle Child / The Isolated Heir / The Fateful Clash / Peace &
     the Unmaking / The Summer Siege), new filter keys `peace` + `final`;
     cards 11 → **15** = 3/5/3/2/2; new cards 1595 秀次事件, 1605 右大臣
     (二重構造), 片桐且元, 堀の埋め立てと真田丸の破却 (和議 split per item 17).
     Reviewer's unnamed ch4/5 named per item 26's chapter set (ch4/5 order
     conflict resolved in favor of 26).
  2. **Death date stays plain `1615年6月4日`** — item 3's 「5月8日（新暦6月4日）」
     rejected (site §3 Gregorian-primary convention; same date; reviewer's
     「元和元年」era label is wrong — 元和 starts 1615-07). Micro-fix applied:
     「落城の翌日に」→**「落城の際に」** (fall & death same day; 今川家文書 even
     dates death 5/7 — the hedge covers it).
  3. **Metas rewritten both locales** (item 28): dropped the unimplemented
     「徳川幕府が残した『自殺』説と1615年の真相を検証します」/ "the Tokugawa's
     'suicide' story, and what really happened" promise; og/twitter/description
     ×3 + Article description unified; EN `.page-date` → October 2026.
  4. Standing: reviewer's given JA texts adopted verbatim otherwise; full EN
     mirror; FAQ visible↔JSON-LD byte-identical ×4 ×2 locales (no Q change);
     glossary-first error rules; dateModified → 2026-10-03.
- **Narrative rewrites (items 1–24):** lead + quick answer + FAQ2/FAQ3 +
  3-paragraph callout (item 23) rewritten, ToyotomiHideyoshi inline link
  preserved in callout P1; 黄金の鳥籠 definition paragraph added to lead
  (item 24) + 1603 政権 card; card rewrites — 1593 (秀次 purge moved out to
  new 1595 card), 1598 五大老 + 誓約させました (never 血判を署名), 1600 =
  約220万石→65万石 縮小 (never 静かに削減/疎外), 千姫 11歳・7歳 (ages fixed),
  1603 政権 = 内大臣 + 単純な「主従」でない + 鳥籠の空間 (never 将軍の排除),
  鐘銘 = reviewer verbatim (never 捏造した口実/薄弱な口実/罠), 1611 = 19歳 +
  『当代記』+ 後世の解釈として慎重に扱う, 冬の陣 = 20万包囲 + 多数の浪人・旧
  豊臣系武将 + 真田丸機能 + 講和交渉 (never 10万以上/停戦を余儀なくされ),
  和議条件/破却 split (item 17), 夏の陣 = 各地で敗れ追い込まれ (no 10万→8万),
  最終滅亡 = 山里丸蔵・史料に違い (never 焼け残った蔵に退/無事に救出/豊臣王朝/
  炎々と燃え尽く); col-key + col-header renames (item 27).
- **40 new glossary error rules** (137 → 177), incl. phrase-scoped
  `完全に無防備で、次の攻撃` (bare 完全に無防備 stays legal on
  tokugawa-ieyasu-timeline) and `伝説の真田幸村` (bare 真田幸村 stays legal on
  sanada_nobushige); site-wide grep-first on every candidate.
- **Verification:** structure fingerprint 6 era-btn / 5 era-group / 5
  era-header / 15 event-card / 8 tour-badge identical across locales; FAQ
  byte-sync 4/4 ×2 locales; forbidden greps 0 both locales (supreme lord /
  Most scholars agree / ruled from Osaka Castle / Toyotomi dynasty / last
  living witnesses / safely rescued / cunningly fill / near-impregnable / …);
   check:ja 21 pages, check:data + check:parity, tsc, build green.

## 5v. Round 22 — three-unifiers (8 items) (2026-10-03)

**Provenance:** external historical/terminology review of `three-unifiers`
(JA primary, full EN mirror). Reviewer's §8 publishable texts were no longer
verbatim in context at execution time — final byte strings reconstructed from
the round summary and approved by the site owner before any edit. Full record
persisted in `ja-review-annot-13.md` (untracked).

- **Locked user decisions (2026-10-03):**
  1. **`豊臣の血筋` fixed site-wide** (8 occurrences / 5 JA pages →
     豊臣氏は滅亡 / は滅亡した / は滅亡しました / を滅ぼした攻城戦) + error rule;
     EN "Toyotomi line" idiom untouched; dateModified bumped on touched pages
     (hideyori already 2026-10-03).
  2. **Portraits fixed** (owner-added, not in review text): 十一年→十年
     (enforces §3 row 72), 一農民から→**無名の家臣から**, 世界への彼の宣言→
     **天下統一の拠点として築かれた** (JA+EN); Ieyasu drama line kept.
  3. **FAQ1 Q** → 日本統一を進めた三人とは誰ですか？ (reviewer's publishable
     pick; 三英傑 alt declined); EN "Who were the three unifiers?" kept.
  4. **JSON-LD breadcrumb** 三人の統一者 → **三英傑** (owner-added; reviewer
     silent — only surviving instance after the FAQ1 rename).
- **Narrative rewrites (items 1–7):** quick answer + all 5 FAQ answers
  byte-identical ×2 per locale; FAQ3 Q renamed (包囲→戦った, both locales);
  Article description overclaim (「三人が…日本を統一した」/ "the three men who
  unified Japan") rewritten both locales; catchphrase h1 + og/twitter
  descriptions + eyebrow kept (review header lines naming 最終決戦編 treated as
  not applicable — that is hideyori's label); dates → 2026-10-03 /
  October 2026 (item 8).
- **10 new glossary error rules** (177 → 187), phrase-scoped
  百姓の出身から関白 (bare 百姓の出身 on toyotomihideyoshi metas stays legal);
  site-wide grep-first on every candidate.
- **Verification:** FAQ byte-sync 5/5 ×2 locales; structure 3 portrait /
  5 details identical across locales; forbidden greps 0 both locales
  (勝利が帰しました / 豊臣の血筋 / 要塞都市 / 飢餓と講和 / 約260年の幕府時代 /
  十一年 / peasant roots / Toyotomi line …); check:ja 21 pages,
  check:data + check:parity, tsc, build green.

## 6. Automated gates (must stay green after any edit)

`npm run check:ja` runs with **strict titles by default**
(`JA_STRICT_TITLES=0` opts out for exploratory runs only) and is wired into
`npm run build` / `preview` / `deploy` and CI. Term rule changes go into
`data/ja-glossary.json` first, then the pages. Do not bypass
`scripts/check-ja-style.mjs`, `scripts/check-structured-data.mjs` or
`scripts/check-deeptimeline-parity.mjs`.
