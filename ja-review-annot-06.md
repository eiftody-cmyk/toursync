# Reviewer annotation — dump part 6/6 (persisted from chat 2026-10-01, untracked)
# Pages: fujiwara-shadow-politics, ojinsuccession, toyotomi_hideyori
# Source: reviewer's annotated message in chat; dump pairs in ja-review-dump-06.md

# JA wording review dump — part 6/6
Format: EN line = meaning reference (do not review), JA line = review target.
Still unreviewed: I haven't seen parts 1/6 and 2/6 of this dump format, so those
pages are unreviewed. The Sanada page only appeared as title and meta in the
first paste. ~100 EN factual points are flagged across all parts; several are
shared EN/JA. I would flag each EN change separately.

## fujiwara-shadow-politics.html
- 「天皇の后」×3 sweep → **母**: rows where the person is the emperor's mother,
  not his consort (e.g., 藤原高子 = 陽成の母? — the table's "后" column is
  actually mothers of emperors). Fix each row; EN says "mother of Emperor X" —
  JA must mirror 母. (Round-0 note: `天皇の后` x3 verified still present.)
- 「阿衡事件」— verify the incident name/date and the actor (the 969?/10th-c.
  阿衡 wording incident involving Fujiwara court officials); if the JA row
  conflates it with 安和の変, fix; flag EN if same.
- 「昌泰の変」— 901 vs 900: Michizane's exile = 901 (Enryaku/Chōtai 2? =
  901-08); if the page says 900, fix both; verify EN year.
- Imperial-mothers genealogy table (verify each): 陽成天皇 = 藤原高子,
  光孝天皇 = 藤原沢子, 白河天皇 = 藤原苡子, 堀河天皇 = 藤原賢子,
  plus whatever rows the page lists — confirm mothers against ja.wikipedia
  before shipping (research item).
- 「望月の歌」— Kiyomaro's exile poem at 望月駅 (望月の歌): JA phrasing should
  quote the poem line correctly (「わが庵は…」? the 望月駅 poem text) — verify
  against 『菅家遺誡』/ja.wikipedia and fix the line if paraphrased wrongly.
- 「藤原氏摂関政治」rows: keep 摂関 not 攝関 (simplified forms banned);
  sweep if present.
- Missing JA: tour blurb, links list, Explore All button.

## ojinsuccession.html
- 「宇治和気郎子」→ **菟道稚郎子** (Uji no Waki-Iratuko) ×8 sweep; EN "Prince
  Uji no Waki-Iratsuko" — JA must be 菟道稚郎子 (菟 not 宇, and 稚 not 和気).
- 履中天皇 / 反正天皇 / 允恭天皇 mixups: rows assign the wrong brother to the
  wrong slot (the 4 brothers of Nintoku: 履中=first, 反正=second, 允恭=third,
  雄略=fourth). Fix each row's name/order in JA; check EN slots too.
- 「宣化天皇 → 钦明」succession statements: verify 開花 vs 欽明 spellings and
  the 507/531 dates in both locales.
- 「皇子」sweep (never 王子 for imperial sons).
- 『日本書紀』『宋書』— book-title brackets: ensure 『』 everywhere (no 「」
  for book titles); sweep.
- 「中華」/「中国」 — ancient China references = 中国 (not 中華 where EN says
  China); only keep 中華 in fixed phrases like 中華思想 if the page has them.
- 「木菟」? / 「百済」rows — 百濟 → 百済 (no traditional forms); sweep if present.
- Title: current JA title is too literal a calque of EN — rework (keep
  `| エドワードと歩く大阪城` suffix; sync <title>/og/twitter/JSON-LD headline
  if changed; run check:data + strict title lint).
- Missing JA: tour blurb, links list, Explore All button; Did-You-Know card
  count vs EN (align).

## toyotomi_hideyori.html
- Age claim: JA 「4歳で大坂城の防衛を任され」+ EN "four" — wrong. Hideyori
  b. 1593; after Hideyoshi's death (1598) he became Toyotomi heir at 5; he
  never "defended Osaka at 4". Fix both locales to a verified statement
  (e.g., inherited at 5 / nominal lord from 1598) — research item.
- Death date: align 1615-06-04 / 慶長20年5月7日 across this page,
  osaka-castle-history, lordconcubineshogunlie and deeptimeline (check which
  convention each uses; standardize wording, keep both calendars if the
  page style uses both).
- 「黄金の籠」title — too literal; rework JA title (EN "Golden Cage"?).
  Sync <title>/og/twitter/JSON-LD if changed.
- Continue heading 「大阪城で物語を継ぐ」→ **大阪城で物語を続けましょう**
  (site-wide standard from round 4).
- 「浪士」→ **浪人** (EN "masterless samurai/swordsmen" = 浪人; 浪士 is the
  Edo/ Bakumatsu "rōshi" term — verify per row, likely 浪人 everywhere).
- 「自害」statements: 淀殿/Yodogimi's death — how the page phrases it vs EN
  (and vs lordconcubineshogunlie) — verify historical framing (killed during
  the fall / 切腹 claims are Tokugawa propaganda — the page's own line about
  将軍は自殺だと言い、証拠はそう言わない must not contradict this page).
- Moat-filling account: this page says Tokugawa filled the moats after 1615 —
  reconcile with osaka-castle-history's account (which moats: 本丸/西の丸;
  date ~1617+; 『駿府記』?) — make the two pages consistent (research item).
- Sources wordings: align with the round-4 sources trio + standard citations.
- EN-too fixes flagged separately.

## Across the three pages
- 摂関 not 攝関; 皇子 not 王子; book titles 『』; 百済 not 百濟;
  上皇/法皇 for retired emperors.
- ツアーで訪問 / 専属 / イフトディ done (round 0 ✓).
- CTA trio strings already standardized (round 4 ✓).
