# Search Console & Agentic Measurement Runbook

Measurement schedule for the education-discovery project. Technical implementation is frozen
(P1A); the only changes that should land while these observations run are content-level
additions (P2/P3) that move the matrix dials, or fixes for defects the measurements surface.

## Schedule

| Round | Date | Action |
|---|---|---|
| 0 | 2026-09-22 | Baseline — full agentic matrix run + Search Console snapshot (before new content indexed) |
| 1 | 2026-10-06 (2 weeks) | Chat-model matrix round (ChatGPT / Perplexity / Google AI / Gemini / Bing Copilot) + SC delta |
| 2 | 2026-10-20 (4 weeks) | Repeat matrix + SC delta + first JA indexed-page expectation check |
| 3 | 2026-11-17 (8 weeks) | Repeat matrix + SC delta + go/no-go on further investment |

Each round uses the **exact** frozen query set in `AGENTIC_MATRIX.md`. Do not edit queries
between rounds; log new observations as new rows in the same table.

## Matrix execution protocol

1. Run one system at a time. Record: dominant interpretation, whether osakacastletours.com is
   mentioned, cited URL, whether Edward is identified, whether the program is described
   correctly.
2. EN and JA analyzed separately — they are at different maturity stages by design.
3. Registers: chat models (ChatGPT 4o/4.1, Perplexity, Google AI Studio/Gemini, Bing
   Copilot), plus the web-search layer (proxy as in round 0).
4. Flag class of result: surfaced-correctly, surfaced-partially, surfaced-but-wrong, absent.
5. A "pass" for JA = the site already associated with "Osaka Castle + historical
   investigation + school + evidence + historian" for at least one query on at least one chat
   model, absent other authority present.

## Search Console metric table

Capture at each round; compare against Round 0. Property: osakacastletours.com.

| Metric | Round 0 | R1 (2w) | R2 (4w) | R3 (8w) | Notes |
|---|---|---|---|---|---|
| JA pages indexed | | | | | Expect → growth from round 2; baseline captured in SC |
| `ja/*.html` indexed (chronicles) | | | | | Should stay indexed; watch for suppression |
| `/ja/education*` indexed | | | | | Round 0: education pages present in sitemap |
| JA education impressions (28d) | | | | | Compare to ~0 baseline |
| JA education clicks | | | | | |
| JA education avg position | | | | | |
| Top JA education queries | | | | | Watch for 探究/難波宮/フィールド terms appearing |
| Timeline → /ja/education clicks | | | | | Internal-nav clicks from ja/*.html CTA |
| /education (EN) impressions | | | | | Mature graph; expect stable |
| AI referral sessions (if instrumented) | | | | | Only if crawler-bot sessions are measurable |

## Expected milestones

- **2 weeks:** EN education-program presence may begin to appear in chat answers ("Naniwa
  Palace on-site field learning" niche). JA: minimal movement expected — content needs an
  indexing cycle.
- **4 weeks:** first JA indexed-page expectation check. If JA education pages are indexed but
  the semantic association is absent from chat models, elevate P2/P3 content (cross-links,
  evidence chains) rather than re-touching frozen schema.
- **8 weeks:** go/no-go. Pass = the language-colored queries (J1–J25) earn at least one
  mention of the site or Edward in a chat-model response with a correct program description
  on one or more systems. Partial = EN-only surfacing; direct more content investment at JA.

## Decision rules (no technical changes unless…)

- **Defect:** crawler blocked, metadata mis-rendered, lang wrong, canonical wrong, sitemap
  stale → fix, redeploy, re-baseline that round's row.
- **Content lever:** matrix indicates weak association on a topic we already chronicled →
  strengthen via content (new investigation blocks, chronicle cross-links, entity mention),
  not by schema/config edits.
- **No lever:** absence persists despite correct content at 8 weeks → reassess strategy
  before any further spend; record in `<repo>/AGENTIC_MATRIX.md`.