# Search Console & Agentic Measurement Runbook

Measurement schedule for the education-discovery project. Technical implementation is frozen
(P1A); the only changes that should land while these observations run are content-level
additions (P2/P3) that move the matrix dials, or fixes for defects the measurements surface.

## Schedule

| When | Action |
|---|---|
| 2026-09-22 | Baseline — Round 0 matrix + Search Console snapshot (before new content indexed) |
| Every week (user: "run the weekly check") | Full 35-query proxy re-run + plain-English email summary (Round 1/2026-09-22 → 0/35 hits) |
| 2026-10-06 (2 weeks) | Chat-model spot-check (R1–R5) + SC delta |
| 2026-10-20 (4 weeks) | Chat-model spot-check + SC delta + first JA indexed-page expectation check |
| 2026-11-17 (8 weeks) | Chat-model spot-check + SC delta + go/no-go on further investment |

Each round uses the **exact** frozen query set in `AGENTIC_MATRIX.md`. Do not edit queries
between rounds; log new observations as new rows in the same table.

## Weekly check protocol (the "run the weekly check" ritual)

The assistant cannot self-schedule — the user starts a session, says "run the weekly check,"
and this ritual is followed identically every week.

1. **Run the queries.** All 35 (J1–J25, E1–E10) via live web search, one at a time, in
   order. Delegate in batches to subagents when context is a concern, but each query must be
   an actual live search — never guessed. The R1–R5 regression probes are a 5-query subset
   that can serve as a quick signal, but the full 35 is the canonical weekly run.
2. **Record.** Fill one row per query in the current round's table in `AGENTIC_MATRIX.md`,
   using the hit definition there (education page = hit; homepage/tour/blog = "SITE
   visible", not a hit). Keep JA and EN separate.
3. **Write the read.** One short paragraph: what moved, what didn't, any first-time hits or
   losses, which graph (EN tour / EN education / JA education) changed.
4. **Email the summary.** POST the round results to the deployed weekly-report endpoint so
   the email actually sends (Resend key exists only on the Cloudflare worker):

   ```
   curl -s -X POST https://osakacastletours.com/api/cron/weekly-report \
     -H "Authorization: Bearer $CRON_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"roundName":"Round N — YYYY-MM-DD","runDate":"YYYY-MM-DD","verdict":"<read>","hits":[{lang,query,page,rank,note}]}'
   ```

   Email goes to edward@osakacastletours.com the moment the round finishes. No separate
   reminder system.
5. **True chat answer (2/4/8-week marks only).** Paste R1–R5 into chatgpt.com (search
   mode) / Perplexity by hand and record what the chat model actually says. This is the only
   window into real chat answers; the assistant's live web search is the same retrieval
   layer feeding them, so the weekly number is the honest proxy.

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

### Automated capture (read-only APIs, run locally)

```bash
npm run report:gsc      # Search Console: fills the rows below + top queries
npm run report:bing     # Bing Webmaster: 28d traffic + top queries
npm run report:search   # both
node scripts/search-console.mjs --inspect   # + URL-level indexing verdicts (small daily quota)
```

- Credentials (never committed): `~/.config/toursync/gsc-sa.json` (override path with
  `GSC_SERVICE_ACCOUNT_FILE` in `.env.local`) and `BING_WEBMASTER_API_KEY` in `.env.local`.
- Property auto-detected: `sc-domain:osakacastletours.com` (service account has Full access).
- Each run writes a raw snapshot to `data/search/<engine>-YYYY-MM-DD.json` — keep them;
  they are the round record backing the table below.
- Caveats: GSC data lags 2–3 days; "pages with impressions" is a proxy, not a true index
  count — use `--inspect` for per-URL indexing verdicts when a row looks off.

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