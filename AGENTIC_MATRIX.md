# Agentic Search & AI Discovery Test Matrix — Osaka History Investigations

Fixed, frozen query set. Do **not** edit the queries between measurement rounds —
the entire value of this exercise is comparing identical queries over time.

## How to run each round

1. Replay every query in each target system, in order, one at a time.
2. Record the first AI answer for each query per system.
3. Fill one row per query per system. Keep EN and JA analysis separate (they answer
   different markets and are expected to behave differently).
4. The assistant runs the full 35-query set every week via the live web-search proxy
   (the "weekly check" — Round 1 started 2026-09-22). Chat-model rounds (ChatGPT /
   Perplexity / Google AI / Bing Copilot) are spot-checks at the 2, 4, and 8-week
   marks using the R1–R5 regression probes below. The R1–R5 spot-check is the only
   way to inspect real chat answers, because the assistant cannot operate those
   chat products directly (live web search is the same retrieval layer feeding them).
5. NEVER change the query set mid-experiment.

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

## Hit definition

A term counts as a **HIT** when a result points to any education page on
osakacastletours.com: `/education`, `/ja/education`, `/education/junior-high`,
`/education/high-school`, `/education/university`, `/education/teacher-pack`, or any
education program sub-page. Tour pages, the homepage, blog/chronicle articles, and
supplier (Viator/GYG) listings DO NOT count as hits; they are recorded separately in the
Notes column as "SITE visible".

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

## Round 1 — 2026-09-22 (weekly #1, web-search proxy)

Same 35 queries as Round 0, re-run live in full. **Result: 0/35 education-page HITs.**
JA 0/25, EN 0/10. EN tour graph still surfaces the site (homepage / blog article only);
EN and JA education-intent queries resolve to authorities (municipal, museum, university,
publisher) with no osakacastletours.com presence.

| # | Lang | Dominant interpretation | Mentioned | Cited URL | Notes |
|---|---|---|---|---|---|
| J1 | JA | U / S | N | — | Osaka Univ Museum Links, 類塾 |
| J2 | JA | P / M | N | — | 実教出版 日本史探究, Asahi News |
| J3 | JA | M / T | N | — | osakacastlepark (xsrv.jp), 大阪城天守閣 |
| J4 | JA | U / P | N | — | Keio 歴史総合 PDF, 河合塾 |
| J5 | JA | M | N | — | osakacastle.net, osakacastlepark.jp, city.osaka.lg.jp |
| J6 | JA | U / S | N | — | let.osaka-u.ac.jp, studyinosaka.com |
| J7 | JA | M / U | N | — | osakamushis.jp, nabunken.go.jp (奈文研) |
| J8 | JA | M / U | N | — | osaka-castle.org, osakamushis.jp, let.osaka-u.ac.jp |
| J9 | JA | S / U | N | — | ja.wikipedia.org, kaichigakuen.ed.jp, osaka-kyoiku.ac.jp |
| J10 | JA | U / N | N | — | art.idai.ly, blog.wenxuecity.com, history.osu.edu |
| J11 | JA | S / P | N | — | mext.go.jp (文科省), osaka-c.ed.jp (市教委), owis.org |
| J12 | JA | U | N | — | let.osaka-u.ac.jp, ila.doshisha.ac.jp |
| J13 | JA | M / T | N | — | osakacastle.net, yomyma.com, serai.jp |
| J14 | JA | T | N | — | japan.travel, liontravel.com, intojapanwaraku.com |
| J15 | JA | M / U | N | — | osakamushis.jp, bunka.go.jp (文化庁), naniwanomiya.jp |
| J16 | JA | M | N | — | osakacastlepark.jp, manabi.city.osaka.lg.jp |
| J17 | JA | T / S | N | — | octb.osaka-info.jp, acis.com |
| J18 | JA | M | N | — | osakacastle.net, nomurakougei.co.jp |
| J19 | JA | U / S | N | — | let.osaka-u.ac.jp, kyoto-seika.ac.jp |
| J20 | JA | T / S | N | — | octb.osaka-info.jp, getyourguide.com |
| J21 | JA | U | N | — | let.osaka-u.ac.jp, osaka-kyoiku.ac.jp |
| J22 | JA | S / N | N | — | osaka-c.ed.jp, lv-bilingual.com |
| J23 | JA | T / M | N | — | osaka-castle.org, msroad.fudan.edu.cn |
| J24 | JA | U | N | — | let.osaka-u.ac.jp, omu.ac.jp (大阪公立大) |
| J25 | JA | M / U | N | — | osakamushis.jp, naniwanomiya.jp |
| E1 | EN | T — SITE visible (homepage ~#3 + blog article) | Y | osakacastletours.com | tour graph only; no education page |
| E2 | EN | T — SITE visible (homepage ~#4) | Y | osakacastletours.com | no education page |
| E3 | EN | T — SITE visible (homepage ~#2; GYG supplier ~#9) | Y | osakacastletours.com | no education page |
| E4 | EN | M | N | — | osakacastle.org, city.osaka.lg.jp, osakacastle.net |
| E5 | EN | U | N | — | en.wikipedia.org, ir.library.osaka-u.ac.jp |
| E6 | EN | M | N | — | osakamushis.jp, osaka-info.jp, naniwanomiya.jp |
| E7 | EN | S / N | N | — | mtsac.edu, owis.org, education.com |
| E8 | EN | T — SITE visible (homepage #1) | Y | osakacastletours.com | no education page |
| E9 | EN | M | N | — | osakacastle.org, osakacastle.net, city.osaka.lg.jp |
| E10 | EN | U | N | — | lang.osaka-u.ac.jp, en.wikipedia.org |

**Round 1 read:** identical pattern to Round 0 — expected. Both education graphs still
thoroughly owned by authorities; site visible only on genuine tour queries (E1/E2/E3/E8)
and never as an education page. First meaningful comparison will be the 2-week chat
spot-check; weekly proxy runs confirm the retrieval layer hasn't shifted. Watch for ANY
change in E4–E7 and E9–E10 (EN education) first, then J1–J25.

## P4 regression probes (representative subset for quick re-checks)

Run these at each round for a fast signal; full matrix for depth.

| # | Query |
|---|---|
| R1 | 大阪城で豊臣秀吉について探究学習できるプログラム |
| R2 | 大阪城 外部講師 日本史 高校 |
| R3 | 大阪城 学校 探究学習 |
| R4 | Osaka Castle history field investigation school |
| R5 | Osaka Castle historian led tour |