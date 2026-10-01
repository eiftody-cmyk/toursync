# JA Naturalness Review Checklist — 日本語ネイティブレビュー用チェックリスト

Reviewer: an outside native Japanese speaker (the rewrites below are
machine-generated and have **not** yet been reviewed by a human native).
Scope: all 21 pages under `public/ja/*.html`.

Work landed in: `38b5641` (guide/lint), `5039c49` (P0 term fixes),
`b84a8b9` (Group A, 9 pages), `bf991dc` (Group B, 7 pages),
`e5e0e6f` (Group C, 5 pages).

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

## 4. ⚠ Uncertain phrases — review these first

| Page | Item | Why |
|---|---|---|
| `tenjin-matsuri-history`, `fujiwara-shadow-politics` | **時康親王** | EN says "Prince Tokiyo" — verify reading/attribution and whether both pages need the same figure |
| `ishiyama-timeline` | **焦土作戦** | calque of EN "scorched-earth campaign" — check if 焦土化作戦 / 焦土と化した is the natural JA military-historical term |
| `yayoi_timeline`, `deeptimeline` | **紀元前1000 vs 紀元前300** | internal dating inconsistency carried from EN — which start date should JA use? |
| `osaka-castle-history` | **国松** | EN "Kunimatsu" — confirm presentation (国松 with 幼名 千丸?) |
| `deeptimeline` | **政治の座から外された台地** | original JA said 昇格させられた (opposite of EN "Politically sidelined") — new wording follows EN; confirm intent |
| `empress-shotoku` | **紀百継 → 吉備真備**, card title **直接皇権の再主張** | agent-side factual/title corrections |
| `empress_jingu_timeline` | **朝鮮 ×3** (was 韓国 in ancient contexts), **女王** (was シャマンの女王), removal of contradictory 「200年頃創建」 FAQ/timeline line | verify removal was right vs adding a caveat |
| `fujiwara-shadow-politics` | readings **侃子・重子 / 諸盛の娘・安子 / 乙縄と多治比の娘**; **別部穢麻呂**; **詔を読み上げている儀式** (was 誥文) | EN names ambiguous or terminology avoided |
| `ojinsuccession` | 元明天皇 → **祖母で文武天皇の母** (EN called her "mother" — impossible); **厩戸王（のちの聖徳太子）** (was 宇治川王); **敏達** (was 応達); **山背大兄王は聖徳太子の子** kept (traditional attribution); anchor **645年（大化元年）** added | EN self-contradictions resolved — confirm choices |
| `soga-fujiwara-timeline` | **藤原氏と摂関政治** (dedup), **皇室との婚姻** (was 王室結婚) | wording de-duplication |
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

## 6. Automated gates (must stay green after any edit)

`npm run check:ja` runs with **strict titles by default**
(`JA_STRICT_TITLES=0` opts out for exploratory runs only) and is wired into
`npm run build` / `preview` / `deploy` and CI. Term rule changes go into
`data/ja-glossary.json` first, then the pages. Do not bypass
`scripts/check-ja-style.mjs`, `scripts/check-structured-data.mjs` or
`scripts/check-deeptimeline-parity.mjs`.
