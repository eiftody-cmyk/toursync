# AEO baseline — prompt list

Frozen prompt set for measuring AI-citation share of voice. Do not reword between
snapshots; drift breaks the month-over-month comparison.

## Collection rules

- Fresh/incognito session per platform (or new chat with no prior context).
- Run each prompt **2–3 times** per platform per snapshot — AI answers vary.
- Log **every run** as a row in `results.csv` (one row per run).
- `cited = 1` only if the AI's answer cites or links `osakacastletours.com`
  (or explicitly names "Osaka Castle Walks with Edward").
- In `competitors_named`, list who the AI pushed instead: Viator, GetYourGuide,
  Klook, Tripadvisor, Airbnb, Osaka Museum of History, japan-guide.com, …
- In `answer_notes`, capture what the AI actually said about you — tour named?
  price? booking link? — or a one-line summary of the recommendation it made instead.
- Score the snapshot with `python3 aeo/score.py`.
- Cadence: **monthly — monthly core only**. The discovery bank runs **quarterly**
  (every third snapshot); its rows sit in the same CSV and are scored as extra
  prompts for that date only.

## Platforms

| ID | Platform | Where |
|---|---|---|
| P1 | Google AI Overviews | google.com search results (search the prompt as-is) |
| P2 | ChatGPT | chatgpt.com with search enabled |
| P3 | Perplexity | perplexity.ai |

---

# Monthly core (20 prompts)

## Tier 1 — commercial intent (proven converters)

| ID | Prompt |
|---|---|
| T1-1 | best historical tour of Osaka Castle |
| T1-2 | Osaka Castle guided tour in English — how to book |
| T1-3 | private English-speaking guide for Osaka Castle history |
| T1-4 | is it worth hiring a guide at Osaka Castle |
| T1-5 | top-rated Osaka Castle tours |
| T1-6 | Osaka Castle walking tour price |
| T1-7 | best company for guided tours in Osaka Castle |

## Tier 2 — theme queries aligned to tour landing pages

| ID | Prompt | Landing page target |
|---|---|---|
| T2-1 | Osaka Castle tour about the siege and samurai history | Warrior Monks, a Peasant, and a Shogun |
| T2-2 | Osaka Castle night photography tour | Photography after dark |
| T2-3 | tour about women in Japanese history in Osaka | Goddess, Queen, Empress, Concubine |
| T2-4 | We've already visited Osaka Castle — what tour should we take on a repeat visit? | Historian's Choice |
| T2-5 | Osaka Castle political history tour | A Lord, a Concubine, and a Shogun's Lie |
| T2-6 | Osaka Castle deep history and archaeology tour | Before Japan Had a Name |
| T2-7 | Shogun TV series historical tour Osaka | Warrior Monks, a Peasant, and a Shogun |
| T2-8 | Osaka itinerary for history buffs | Homepage / llms.txt |
| T2-9 | full-day Osaka Castle history tour | Goddess, Queen, Empress, Concubine |

## Tier 3 — informational (timeline articles, education program)

| ID | Prompt |
|---|---|
| T3-1 | history of Osaka Castle before Toyotomi Hideyoshi |
| T3-2 | Osaka Castle school field trip student history program |

## Control

| ID | Prompt |
|---|---|
| CTRL-1 | Osaka Castle Walks with Edward |
| CTRL-2 | Edward Osaka Castle tour |

---

# Discovery bank (quarterly)

Not part of the monthly snapshot. Run every third month to hunt new queries;
promote winners (or useful misses) into the monthly core.

| ID | Prompt |
|---|---|
| D-01 | Toyotomi vs Tokugawa history tour Osaka |
| D-02 | tour of the 1614 siege of Osaka |
| D-03 | women's history tour Japan |
| D-04 | Jomon Yayoi Kofun tour Osaka |
| D-05 | Osaka Castle tour for serious historians |
| D-06 | hidden history tour of Osaka Castle |
| D-07 | private customizable tour with a historian at Osaka Castle |
| D-08 | small group Osaka Castle tour |
| D-09 | Osaka Castle tour vs exploring on your own |
| D-10 | private guide Osaka Castle cost |
| D-11 | book an Osaka Castle tour this week |
| D-12 | who built Osaka Castle and why |
| D-13 | things most visitors miss at Osaka Castle |
| D-14 | how to visit Osaka Castle like a historian |
| D-15 | study abroad Japan history field trip Osaka |
| D-16 | 大阪城 歴史 ツアー 案内人 |
| D-17 | 大阪城 専用ガイド 予約 |
| D-18 | 大阪城 歴史 深い 体験 |
| D-19 | 大阪城 ツアー 予約 |
| D-20 | Osaka castle tour for families and kids |
| D-21 | 大阪城 校外学習 プログラム 学校向け |
| D-22 | 中学校 歴史 現地学習 大阪城 |
| D-23 | 修学旅行 大阪 歴史 体験 学校 |

---

## Reading the score

- **Share of voice** = prompts where you were cited ÷ prompts asked (per platform,
  averaged across runs). Track month-over-month per platform.
- **Miss list** = every prompt you didn't win, with the competitors that did —
  that is the content-action punch list.
  - Tier-1 miss → the aggregator owns your best commercial answer: strengthen the
    on-page answer AI can pull from, and/or the third-party listing it cites.
  - Tier-2 miss → usually fixable on-site: your unique inventory isn't described
    where the AI looks.
  - Tier-3 miss → points at timeline/education pages as the vehicle.

## Known content gaps (found 2026-09-27)

- `/historianschoice` returns 404 — tour data points at a dead URL.
- Photography after dark has no landing page (`url` points at the homepage).
