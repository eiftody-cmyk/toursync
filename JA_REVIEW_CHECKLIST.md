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

## 6. Automated gates (must stay green after any edit)

`npm run check:ja` runs with **strict titles by default**
(`JA_STRICT_TITLES=0` opts out for exploratory runs only) and is wired into
`npm run build` / `preview` / `deploy` and CI. Term rule changes go into
`data/ja-glossary.json` first, then the pages. Do not bypass
`scripts/check-ja-style.mjs`, `scripts/check-structured-data.mjs` or
`scripts/check-deeptimeline-parity.mjs`.
