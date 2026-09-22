# Agentic Search & AI Discovery Test Matrix — Osaka History Investigations

Fixed, frozen query set. Do **not** edit the queries between measurement rounds —
the entire value of this exercise is comparing identical queries over time.

## How to run each round

1. Replay every query in each target system, in order, one at a time.
2. Record the first AI answer for each query per system.
3. Fill one row per query per system. Keep EN and JA analysis separate (they answer
   different markets and are expected to behave differently).
4. Run rounds at baseline (done 2026-09-22), then 2, 4, and 8 weeks later.
5. Never change the query set mid-experiment.

## Target systems

| System | Access | Record |
|---|---|---|
| ChatGPT Search | chatgpt.com (search mode) | answer text + cited URLs |
| Perplexity | perplexity.ai | answer text + cited URLs |
| Google AI Overviews / AI Mode | google.com | presence in AI box + cited URLs |
| Bing Copilot | bing.com | answer text + cited URLs |
| Web search proxy (baseline layer) | infra websearch | dominant-result interpretation |

## Columns (one row per query per system)

- **Query** — verbatim, as written.
- **Lang** — JA or EN.
- **System** — which AI/search tool.
- **Dominant interpretation** — what the system thinks the query is about
  (e.g. "museum/cultural institution", "university/institutional education",
  "tourist attraction", "school program offer"). This matters more than rank.
- **Mentioned** — is osakacastletours.com / Osaka History Investigations mentioned at all? Y/N.
- **Cited URL** — the exact URL cited (if any).
- **Page supplied evidence** — which page (hub, junior-high, high-school, university,
  teacher-pack, chronicle X, none).
- **Edward identified** — is Edward Iftody named as historian/provider? Y/N/partial.
- **Program described correctly** — does the AI describe the school program accurately
  (curriculum-aligned field investigations, bilingual, priced by format)? Y/N/partial.
- **Notes** — anything notable.

## Japanese queries (school/investigation intent)

| # | Query |
|---|---|
| J1 | 大阪で高校生向けの歴史探究プログラム |
| J2 | 大阪城で高校生ができる日本史探究 |
| J3 | 大阪城で歴史のフィールドワークができる学校向けプログラム |
| J4 | 大阪で高校の日本史探究に使える外部講師 |
| J5 | 大阪城で豊臣秀吉について探究学習できるプログラム |
| J6 | 大阪で英語で日本史を学べる高校向けプログラム |
| J7 | 難波宮を現地で学べる高校生向け歴史学習 |
| J8 | 大阪城で考古学・歴史学を体験できる学校向け授業 |
| J9 | 大阪の学校向け歴史フィールドワーク |
| J10 | 大阪城 外部講師 日本史 |
| J11 | 大阪城 学校 探究学習 |
| J12 | 大阪 歴史総合 探究 外部講師 |
| J13 | 大阪城 豊臣秀吉 探究 授業 |
| J14 | 大阪城 石山本願寺 探究学習 |
| J15 | 大阪 難波宮 考古学 現地学習 |
| J16 | 大阪城 校外学習 歴史 プログラム |
| J17 | 大阪 修学旅行 歴史探究 講師 |
| J18 | 大阪城 発掘 豊臣石垣 探究 |
| J19 | 高校 日本史 フィールドワーク 大阪 |
| J20 | 大阪城 学び 体験 学校 講師 |
| J21 | 大阪で歴史の探究学習を指導してくれる専門家 |
| J22 | バイリンガル 歴史学習 高校 大阪 |
| J23 | 中学校 歴史 校外学習 大阪城 講師 |
| J24 | 大学 歴史 フィールドゼミ 大阪 |
| J25 | 難波宮 現地学習 歴史教育 |

## English queries (tour + education intent)

| # | Query |
|---|---|
| E1 | Osaka Castle historian led tour |
| E2 | Osaka history walking tour with historian |
| E3 | Osaka Castle private tour Edward |
| E4 | school field investigation Osaka Castle history |
| E5 | high school history fieldwork Osaka Japan |
| E6 | Naniwa Palace on-site field learning |
| E7 | Osaka Castle inquiry based learning program for students |
| E8 | historian led educational tours Osaka |
| E9 | Osaka Castle teacher guide external lecturer Japanese history |
| E10 | bilingual history investigation Osaka for high school |

## Baseline results (Round 0 — 2026-09-22)

Run via web-search proxy (search-engine layer, not a chat model). These establish the
"before" picture only; the meaningful comparison is chat-model rounds at 2/4/8 weeks.

Dominant-interpretation legend: M = museum/cultural institution · U = university / academic ·
P = textbook publisher / curriculum · T = tourism / travel · S = school program offer ·
N = none / irrelevant · SITE = osakacastletours.com surfaced.

| # | Lang | Dominant interpretation | Mentioned | Cited URL | Notes |
|---|---|---|---|---|---|
| J1 | JA | U / S | N | — | Osaka Univ Museum Links, 類塾探求講座, Osaka Volunteer Guide |
| J2 | JA | P / U | N | — | 実教出版 日本史探究, NHK高校講座, osaka-castle.org |
| J3 | JA | M / S | N | — | Osaka castle park, 開智学園 fieldwork, city edu |
| J4 | JA | P / U | N | — | 山川出版社, NHK, Osaka Univ, tanakaippei.com |
| J5 | JA | M | N | — | osakacastlepark.jp, taiko exhibit, Osaka city sites |
| J6 | JA | S / U | N | — | studyinosaka.com, Osaka Univ Japanese History |
| J7 | JA | M / U | N | — | Osaka city PDF, Osaka History Museum, 難波宮研究, Wikipedia |
| J10 | JA | U | N | — | Tohoku Univ, Fudan, Osaka Univ |
| 石山本願寺 探究学習 | JA | T / U | N | — | JNTO, Fudan, Wikipedia, tourism sites |
| 難波宮 考古学 現地学習 | JA | M / U | N | — | nanoniwa.jp, Osaka History Museum, Wikipedia |
| E1 | EN | T — **SITE appears** | **Y** | osakacastletours.com | rank ~3, alongside osakacastle.org, livejapan, GYG |
| Naniwa Palace on-site field learning | EN | U / T | N | — | Wikipedia, osaka-info, nanoniwa, Sophia journal |

**Round 0 read:**
- **EN tour graph is mature.** "Osaka Castle historian led tour" surfaces the site.
- **EN education-program graph is not yet visible** ("Naniwa Palace on-site field learning" → academic/tourism sources only).
- **JA education graph is fully undeveloped.** All queries resolve to municipal/museum/academic/publisher authorities. The semantic association "Osaka Castle + historical investigation + school education + evidence + historian + fieldwork" is not yet established in Japanese results.
- Keep EN and JA strictly separate in all later analysis — they are at different maturity stages by design.

## P4 regression probes (representative subset for quick re-checks)

Run these at each round for a fast signal; full matrix for depth.

| # | Query |
|---|---|
| R1 | 大阪城で豊臣秀吉について探究学習できるプログラム |
| R2 | 大阪城 外部講師 日本史 高校 |
| R3 | 大阪城 学校 探究学習 |
| R4 | Osaka Castle history field investigation school |
| R5 | Osaka Castle historian led tour |