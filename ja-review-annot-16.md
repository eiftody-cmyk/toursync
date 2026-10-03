# JA external review — annot 16 (round 25): tokugawa-ieyasu-timeline Ieyasu review

Status: **accepted for round 25** (2026-10-03). Targets: `public/tokugawa-ieyasu-timeline.html`
+ JA twin + cross-page epithet links in 9 other pages (7 EN, 3 JA — `osaka_history_things_to_do`
and `warriormonkspeasantshogun` are EN-only).

## Owner decisions (2026-10-03)

1. **Keep 27 cards** — reviewer's 25-card set rejected; すでに勝っていた関ヶ原 and
   江戸大建設 stay as separate cards. Itemized fixes only.
2. **Title** → `忍耐の天下人 — 徳川家康の年表` (brand suffix `| エドワードと歩く大阪城`
   unchanged). Reviewer's 大坂城 title suffix rejected. EN: `The Patient Unifier —
   A Tokugawa Ieyasu Timeline`.
3. **FAQ4 keeps the site standard** (和議の条件 agreed / southern-approach removal,
   per round-21 hideyori row 93); the trap assertion 「それが罠だと気づいていませんでした」
   (and EN "They do not yet understand the trap") is **deleted** from the winter-siege card.
4. **FAQ3** — low-birth claim deleted AND replaced with the positive 武家関白制
   (buke-kanpaku) explanation: Hideyoshi chose Kanpaku/Grand Minister, leaving the
   shogunate vacant; Ieyasu took it 1603, abdicated to Hidetada 1605 to show it was
   hereditary.

## Fixed (itemized)

- **Epithet** 眠れる龍/The Sleeping Dragon → **忍耐の天下人/The Patient Unifier**
  site-wide: title/og/twitter/breadcrumb/JSON-LD headline + description on the timeline
  page (both locales), subtitle (`— 忍耐の天下人編` / `— The Patient Unifier Edition`),
  h1 em, and cross-links: ishiyama EN+JA, sanada EN, hideyori EN+JA, hideyoshi EN,
  lordconcubine EN+JA, warriormonk EN, things-to-do CTA (`The Last Unifier` →
  `The Shogun Who Unified Japan`). 睡龍/臥龍 variants banned in glossary.
- **h1 em** 最後の統一者 / The Last Unifier → 天下統一を成し遂げた将軍 /
  The Shogun Who Unified Japan (Ieyasu unified by making one shogunate; "last
  unifier" invites who-was-first disputes).
- **Lead** — hostage count corrected ~13 years (1547–1560); three houses framed as
  人質・同盟者・家臣 (Imagawa captive → Nobunaga ally → Toyotomi vassal), replacing
  25/30-year and "served three lords" claims. Quick answer: 「培った忍耐」 arc —
  忍耐 → 関ヶ原 1600 → 幕府 1603 → 豊臣家滅亡 1614–15; "30 years" and the
  castle-fate parenthetical dropped.
- **FAQ1** Q → 「忍耐の人」 (EN: "a man of patience"); A keeps the house framing but
  「何十年ものあいだ信長に仕えた」 → 「青年期に信長と同盟を結び」 (EN A already said ally —
  unchanged). FAQ2 unchanged (Gregorian only). FAQ5 Q → 外堀は本当にすべて埋め立てられた
  のですか / "completely filled in" (answer text unchanged).
- **征夷大将軍 card (L1057 EN L1051)** — second low-birth claim removed; replaced with
  buke-kanpaku wording matching FAQ3.
- **Scholars** 千田嘉博・谷口克博・大和田哲夫 → 谷口克広・小和田哲男 (EN spellings
  Katsuhiro Taniguchi / Tetsuo Owada were already correct — only JA kanji wrong).
- **Era headers (5 pairs)**: 人質の時代 — 政治の道具とされた幼少期 (A Childhood Made
  into a Political Tool); 同盟者の時代 — 信長とともに (Alongside Nobunaga); 生存者の
  時代 — 混迷の戦国を生き抜く (Riding Out an Age of Chaos); 勝利者の時代 — 関ヶ原と
  幕府開設 (Sekigahara & the Shogunate's Founding); 建設者の時代 — 豊臣家滅亡と平和の
  確立 (The Toyotomi's End & a Lasting Peace).
- **Chips/titles (8)**: 最初の拉致→織田氏による人質奪取; 涙なき義務→苦渋の決断;
  伊賀越え→神君伊賀越え + 敵地を越える逃避→決死の脱出行 (EN chip The Iga Crossing →
  Lord Ieyasu's Iga Crossing, title → The Desperate Escape); 機会主義的忍耐→甲斐・信濃への
  進出 (title 甲斐と信濃の吸収 stays); 江戸 — 八つの沼と漁村→関東八州と湿地帯の江戸;
  王朝の示唆→将軍職の世襲と徳川体制の確立; 天の政治→日光での神格化; 東照大権現として
  神格化→…としての神格化.
- **Winter card**: trap sentence deleted both locales (decision 3).

## Kept as-is (reviewer objections rejected)

- Birth `c. 1543` / 1547 card 「わずか4歳」 (internally consistent; 6歳 rejected).
- Sekigahara 1600-10-21 Gregorian.
- FAQ5 / Senda moat answers; 豊臣氏は滅亡 standard; JSON-LD Person dates;
  27 cards / 5 FAQ / 5 buttons (structure parity verified both locales).

## Mechanics

- Glossary 222 → **246** (24 new error rules; all grep-first verified page-local to the
  timeline except 睡龍/臥龍, whose 3 cross-page hits are fixed in this round).
- FAQ visible ↔ JSON-LD byte-sync ×5 per locale; breadcrumb JSON-LD name/headline/
  description synced with metas; ItemPage L1283 keeps the short epithet-free name.
- Cross-page `dateModified` bumps: ishiyama EN+JA (2026-07-07→2026-10-03 + page-date
  Sept→October), lordconcubine EN + warriormonk EN (2026-09-23→2026-10-03 + page-date
  Sept→October). sanada/hideyori/hideyoshi/things-to-do already 2026-10-03. Timeline
  page itself already 2026-10-03.
- EN `low birth` phrasing in `osaka-castle-history.html` was observed but not flagged
  by the reviewer — left untouched.
