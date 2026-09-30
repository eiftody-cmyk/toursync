# JA Style Guide — public/ja/*.html

Applies to every Japanese page under `public/ja/`. EN pages are the meaning
reference — never translate literally. Machine-checked rules live in
`data/ja-glossary.json` + `scripts/check-ja-style.mjs` (`npm run check:ja`);
this document covers everything a script cannot judge.

## 1. Register (文体)

- **敬体（です・ます）only.** No だ・である体 anywhere in visible prose or
  JSON-LD text fields. The site is a guide talking to guests, not an encyclopedia.
- Keep sentence length varied; prefer short sentences at dramatic moments.
- Avoid 漢文調 exclamations and over-formal 定時表現 (〜にあたる、〜をもって)
  unless quoting.

## 2. Dates and 和暦

- Primary form: Gregorian — `1615年`.
- **Add 和暦 at turning points only** (battles, accessions, regime changes),
  in the form `1615年（元和元年）`. Roughly 1–3 per page. Not on every date.
- Known era anchors (verify before using): 桶狭間1560=永禄3年 · 石山和議1580=天正8年 ·
  本能寺1582=天正10年 · 大坂築城1583=天正11年 · 関ヶ原1600=慶長5年 ·
  幕府開設1603=慶長8年 · 秀吉死去1598=慶長3年 · 冬の陣1614=慶長19年 ·
  夏の陣1615=慶長20年 · 壇ノ浦1185=元暦2年 · 大化の改新645=大化元年 ·
  四天王寺創建593=推古元年 · 天神祭創始951=天暦5年.
- Pre-modern events without a reliable era name: Gregorian only, or
  「5世紀頃」 style — do not invent 和暦.

## 3. Names and terminology

- People: full name first (`真田信繁`), popular alias in parentheses on first
  mention (`真田信繁（幸村）`). Never swap the order mid-page. 徳川家康/豊臣秀吉/
  織田信長 are always full names (no bare 家康 on first mention of the page).
- **Castle: `大坂城` for the pre-1868 fortress** (sieges, Tokugawa garrison —
  JA Wikipedia article is 大坂城); **`大阪城` for the modern park, tenshukaku,
  museum and tourist context**. Never alternate within one sense inside a page.
- Battles: `大坂の陣` (never 大阪の陣); full names `大坂冬の陣`/`大坂夏の陣` on
  first mention, then `冬の陣`/`夏の陣`. `関ヶ原の戦い` (not bare 関ヶ原 for the
  battle noun). JA Wikipedia titles are the arbiter for any disputed term.
- City: `大坂` for the historical city in pre-1868 contexts (people arriving at
  大坂, 大坂 staying over, the castle town); `大阪` for modern contexts (大阪市,
  addresses, the modern park/tour). Same sense must not alternate inside a page.
- Institutions: `徳川幕府` and `江戸幕府` are both valid — pick one per page
  (徳川幕府 default; 江戸幕府 in contexts contrasting the shogunate with the
  imperial court).
- Samurai → `武士` (era/institution contexts), `武将` (commanders), `侍`
  (quotations/folklore). **Never サムライ** except inside foreign-language
  quotes.
- Titles/offices: 征夷大将軍, 太政大臣, 関白, 太閤 — kanji only, no
  katakana paraphrase. Ieyasu "abdicated the shogunate" = `将軍職を秀忠に譲った`
  (never 譲位 — that is for the throne).
- Chronology word in **titles**: `年表` (never タイムライン/時間軸). Body text
  may use タイムライン sparingly when it reads better; prefer 年表.
- Battle action: `総攻撃で落とす`/`攻め落とす`/`武力で落とす` — never 強攻
  (Chinese calque).

## 4. Titles, brand, punctuation

- Title template: `詩的前半 — ページ名の年表 | エドワードと歩く大阪城`
  (EN title uses `|` prefix → mirror it). Dash is always `—` (U+2014);
  never ― ── · ｜ | inside `<title>`.
- Brand in JA titles/breadcrumbs: **`エドワードと歩く大阪城`** — the four
  previous renderings (大阪城ウォーキング / エドワードの紀行文 / 大阪城の歴史ツアー /
  エドワードと歩く大阪城) are all retired.
- **Retire the double-em-dash appositive** (——…——). English —
  parentheticals become `、` clauses or `（…）`, max one per sentence.
  Single `—` remains allowed in titles and for genuine breaks.
- No ASCII spaces between Japanese characters; spaces around Latin words and
  numbers are fine. Full-width （）「」 for Japanese; keep Latin book titles as-is.
- Loanwords: prefer native equivalents (経路 not アプローチ, 支援 not
  サポート in historical prose). Common loanwords that read naturally (ページ,
  イベント) are fine.

## 5. Translationese — known bad patterns to rewrite on sight

| Bad | Why | Instead |
|---|---|---|
| サムライ時代／サムライ指揮官 | calque | 侍時代／武将 |
| 強攻で落とす | Chinese 强攻 | 総攻撃で落とす／攻め落とす |
| 研究：Edward Iftody、大阪拠点の歴史家、大阪城専属歴史家。 | noun-stack | 「リサーチ：エドワード・イフティ——大阪拠点の歴史家で、大阪城を拠点に活動します。」 |
| 神話根本的に修正している | missing particle | 神話**を**根本的に |
| 十字路で粉砕した | literal metaphor | 関ヶ原で壊滅した (use the real place) |
| 魔法のように／外科的切除／ロマン化的な | untranslated metaphor | 均一に「裸城」化された／部分撤去／後世の美化 |
| 永遠に統一した | literal "forever" | ついに統一した |
| 从此／关于／以后／我们 | Chinese forms | 以後／について／私たち |
| 「城の地の運命」 | garbled compound | 城の運命／この地の運命 |

## 6. Structure & sync rules (hard rules — guards will fail you)

- **Frozen:** element ids, classes, hrefs, entry order and count, FAQ pairing,
  `<details>` structure. Rewrites touch text nodes only.
- After editing visible text, sync every mirror: `<title>`, meta description,
  `og:title/og:description`, `twitter:*`, and JSON-LD text fields
  (headline, description, name, FAQ questions/answers, breadcrumb names).
- Meta description ≤ 120 JA characters, must contain the page's main term.
- FAQ answers keep EN meaning; phrasing may diverge. Never claim something the
  visible page does not show.
- Bibliography/book titles stay in their original language; the lead-in
  sentence explaining them is Japanese.
- Uncertain phrasings (you would bet neither arm on): keep them natural but
  list them in `JA_REVIEW_CHECKLIST.md` under the page heading for the native
  reviewer.

## 7. Commands

```bash
npm run check:ja      # lint (terminology/Chinese/English-prose/title rules)
npm run check:data    # JSON-LD/AEO guard
npm run check:parity  # EN/JA deep timeline parity
```

Run all three after every JA edit.
