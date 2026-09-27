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
- Cadence: **monthly**, same three platforms.

## Platforms

| ID | Platform | Where |
|---|---|---|
| P1 | Google AI Overviews | google.com search results (search the prompt as-is) |
| P2 | ChatGPT | chatgpt.com with search enabled |
| P3 | Perplexity | perplexity.ai |

## Prompts

### Tier 1 — commercial intent (proven converters)

| ID | Prompt |
|---|---|
| T1-1 | best historical tour of Osaka Castle |
| T1-2 | Osaka Castle guided tour in English — how to book |
| T1-3 | private English-speaking guide for Osaka Castle history |
| T1-4 | is it worth hiring a guide at Osaka Castle |
| T1-5 | top-rated Osaka Castle tours |

### Tier 2 — theme queries where the inventory is uniquely strong

| ID | Prompt |
|---|---|
| T2-1 | Osaka Castle tour about the siege and samurai history |
| T2-2 | Osaka Castle night photography tour |
| T2-3 | tour about women in Japanese history in Osaka |
| T2-4 | We've already visited Osaka Castle — what tour should we take on a repeat visit? |

### Tier 3 — informational (timeline articles, education program)

| ID | Prompt |
|---|---|
| T3-1 | history of Osaka Castle before Toyotomi Hideyoshi |
| T3-2 | Osaka Castle school field trip student history program |

### Control

| ID | Prompt |
|---|---|
| CTRL-1 | Osaka Castle Walks with Edward |

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
