# JA review annotations — round 21 — `toyotomi_hideyori` (JA + EN)

Provenance file (untracked — do NOT commit). Records the external reviewer's 28-section
historical/editorial audit of `public/ja/toyotomi_hideyori.html` and how each item was
dispositioned. Applied together with the full EN mirror `public/toyotomi_hideyori.html`.

## Decisions (locked with user, 2026-10-03)

1. **Full 5-chapter restructure** — 3 era buttons/headers (11 cards) → **5 chapters / 6 era
   buttons / 15 cards**. New chapter keys: `peace`, `final`.
   - ch1 `miracle` (3 cards: 1593, **new 1595**, 1598), ch2 `isolation` (3: 1600, 1603 千姫,
     1603 政権, **new 1605** → 4), ch3 `clash` (3: 1611, 鐘銘, **new 片桐且元** → 4… actually
     4 cards in isolation? Final map below is authoritative), ch4 `peace` (2: 和議, **new 堀の
     埋め立て・真田丸の破却**), ch5 `final` (2: 夏の陣, 最終滅亡).
   - Final card map (15): miracle 1593 / 1595 / 1598 · isolation 1600 / 1603千姫 / 1603政権 /
     1605 · clash 1611 / 鐘銘 / 且元 / 冬の陣 · peace 和議 / 破却 · final 夏の陣 / 最終滅亡.
     → chapters = 3+4+4+2+2.
   - Chapter names (reviewer left ch4/5 unnamed): JA ch4 **和議と城の崩壊（1614〜1615年）**,
     ch5 **夏の陣と豊臣家の滅亡（1615年）**; EN "Peace & the Unmaking of the Castle (1614–1615)" /
     "The Summer Siege & the Fall of the Toyotomi (1615)".
2. **Keep plain `1615年6月4日`** — declined reviewer item 3's 「5月8日（新暦6月4日）」 wareki.
   Site §3 convention is Gregorian-primary. Fact-check: 慶長20年5月8日 = 1615-06-04 (same
   date); reviewer's era label 「（元和元年）」 is wrong — 元和 starts 1615-07.
3. **Rewrite JA + EN meta/og/twitter descriptions** — drop unimplemented promise
   「徳川幕府が残した『自殺』説と1615年の真相を検証します」 (EN: "the Tokugawa's
   'suicide' story, and what really happened").
4. **Reviewer's given JA texts adopted verbatim** with two micro-fixes:
   - item 3 death: 「落城の翌日に」→**「落城の際に」** (fall & death same day; 今川家文書
     even dates death 5/7 — the hedge covers it) + wareki dropped per decision 2.
   - nothing else altered.
5. FAQ visible ↔ JSON-LD byte-identical ×4 ×2 locales preserved (FAQ answer texts replaced
   in both places). No Q count change.
6. 黄金の鳥籠 title/motif kept (item 24) — metaphor now explicitly defined (item 24 text
   appended to lead + a definition sentence in ch2 header card).
7. `dateModified` → `2026-10-03` both locales; EN `.page-date` "Last updated: September 2026"
   → October 2026.
8. Old problem strings verified site-wide clean before adoption (reviewer's suggested replacements
   checked for existing clean usage where relevant; false-positive carve-outs as in prior rounds:
   完全に無防備で / 伝説の真田幸村 / 捏造した口実 are phrase-scoped — all new phrasings verified
   0 elsewhere after application).

## Item dispositions (28)

| # | Issue | Disposition |
|---|-------|-------------|
| 1 | Lead paragraph trivializes rise/fall; "boy of five in 1598" framed as defender | Rewrite (reviewer text verbatim); metaphor-definition paragraph added after lead |
| 2 | Quick answer repeats lead + overstates control of Osaka Castle | Rewrite (reviewer text = items 2 + 3 death, wareki dropped) |
| 3 | Death date wareki + 「翌日」 wrong; 1615-06-04 for both | Adopt with 微修正 (落城の際に, plain Gregorian) |
| 4 | FAQ2 "official justification" framing | Rewrite (reviewer text verbatim), both locales, visible+JSON-LD |
| 5 | Bell card Japanese prose | Replace with reviewer text (方広寺鐘銘事件) |
| 6 | 黄金の鳥籠 metaphor undefined | Insert reviewer definition sentence (ch2 1603政権 card + lead) |
| 7 | 「血判を署名」 anachronistic/vague | 「誓約させました」 rewording per reviewer |
| 8 | Sekigahara card: 静かに220万石→65万石 downplay | 「約220万石から…65万石へと縮小されました」 per reviewer |
| 9 | 影の摂政戦略 card title misleading | Retitle 関ヶ原の戦いと所領の縮小 (glossary rule) |
| 10–11 | Senhime marriage card | Rewrite (1603, 11歳/7歳 wedding) + political-purpose sentence |
| 12 | 将軍の排除 title unfair + 主従 oversimplification | Retitle 徳川政権の成立; reviewer text (内大臣昇進, 単純な「主従」でない) |
| 13 | (implies) 二条城会見 needs record-based rewrite | Reviewer text verbatim (『当代記』, 固辞, 家康に先に礼) |
| 14 | 吉田静治-style over-interpretation of 会見 | Reviewer text verbatim (体格に驚いた逸話 + 後世の解釈として慎重に扱う) |
| 15 | Winter siege card specifics (10万以上の浪人, 包囲せよ) | Rewrite per reviewer (20万包囲, 多数の浪人・旧豊臣系武将, 真田丸機能) |
| 16 | 「停戦を余儀なくされ」 causal claim | 「講和交渉に入り、和議が成立」 per reviewer |
| 17 | Peace terms card conflates fill-ins | Split: 和議 card (conditions) + new 堀の埋め立て・真田丸の破却 card (履行 + 結果句) |
| 18 | 「ほぼ不落を失った」 ambiguous | 「防御施設を大きく失い…」 reviewer sentence (new card) |
| 19 | 夏の陣 card claims 家康追い詰め/10万→8万 without sources | Reviewer text verbatim (各地の戦闘で敗れ…追い込まれました) |
| 20 | Death narration asserts date/place | Yamazato-maru record sentence; date in card-date; 翌5月8日 dropped |
| 21 | Senhime "rescued" framing | 「城を離れ、徳川方に戻りました」 + 奈阿姫助命 (追記) |
| 22 | 「燃え尽くした」 rhetorical | 「炎とともに終わりを迎えました」 per reviewer |
| 23 | Longstanding callout too tidy | Full 3-paragraph rewrite (reviewer text verbatim); ToyotomiHideyoshi inline link preserved in P1 |
| 24 | 黄金の鳥籠 undefined in-page | Definition paragraph (decision 6) |
| 25 | Chapter names split (reviewer ch4/5 unnamed, order conflicts with 26) | Resolved in favor of item 26's chapter set; see Decision 1 |
| 26 | 5-chapter structure with named eras | Adopted (buttons/headers/groups + card map above) |
| 27 | Col-key/header labels 「攻城戦」「噂」 | 大坂の陣と軍事的局面 / 史料と後世の伝承 (both locales) |
| 28 | Meta descriptions promise unimplemented 「自殺」説検証 content | Rewritten both locales (decision 3); Article description updated too |

## Notable fact-check notes

- 慶長20年5月8日 = 1615-06-04 (same Gregorian date as plain 6月4日). 元和 starts 1615-07,
  so 「元和元年5月8日」 (reviewer item 3 era label) is incorrect — declined.
- Hideyori/Senhime 1603 wedding ages 11/7 per National Archives of Japan (for 1603-07-28).
- 和議 signed 1615-01-18; fill-ins Jan–Feb 1615; Sanada-maru dismantled per settlement.
- 1605: Hideyori → 右大臣; same year Tokugawa Hidetada succeeds as shogun (二重構造 card).
