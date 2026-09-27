#!/usr/bin/env python3
"""Score AEO baseline snapshots from results.csv.

Usage: python3 aeo/score.py [path/to/results.csv]

One row per prompt run:
  date,platform,prompt_id,cited,position,competitors_named,answer_notes

cited: 1/0 (also accepts yes/no/true/false).
Share of voice = mean of per-prompt mean(cited) for each (date, platform).
"""

import csv
import pathlib
import sys
from collections import defaultdict

PLATFORM_ORDER = ["Google AI Overviews", "ChatGPT", "Perplexity"]
TIERS = ["T1", "T2", "T3", "CTRL"]


def tier_of(prompt_id: str) -> str:
    return prompt_id.split("-", 1)[0]


def to_cited(raw: str) -> int:
    return 1 if raw.strip().lower() in {"1", "yes", "y", "true"} else 0


def main() -> None:
    path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).parent / "results.csv"
    if not path.exists():
        sys.exit(f"{path} not found")
    with path.open(newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    if not rows:
        print("No data rows yet — collect runs into results.csv first.")
        return

    for r in rows:
        r["cited"] = to_cited(r["cited"])

    # (date, platform, prompt_id) -> list of cited values (one per run)
    runs = defaultdict(list)
    for r in rows:
        runs[(r["date"], r["platform"], r["prompt_id"])].append(r["cited"])

    dates = sorted({k[0] for k in runs})
    platforms = sorted(
        {k[1] for k in runs},
        key=lambda p: (PLATFORM_ORDER.index(p) if p in PLATFORM_ORDER else len(PLATFORM_ORDER), p),
    )

    for date in dates:
        print(f"=== Snapshot {date} ===")
        for platform in platforms:
            prompt_means = {
                pid: sum(v) / len(v)
                for (d, pl, pid), v in runs.items()
                if d == date and pl == platform
            }
            if not prompt_means:
                continue
            won = sum(1 for m in prompt_means.values() if m >= 0.5)
            total = len(prompt_means)
            print(f"\n  {platform}")
            print(f"    Share of voice: {round(100 * won / total)}% ({won}/{total} prompts)")
            for tier in TIERS:
                tier_prompts = {p: m for p, m in prompt_means.items() if tier_of(p) == tier}
                if tier_prompts:
                    t_won = sum(1 for m in tier_prompts.values() if m >= 0.5)
                    print(f"      {tier}: {round(100 * t_won / len(tier_prompts))}% ({t_won}/{len(tier_prompts)})")
            misses = sorted(p for p, m in prompt_means.items() if m < 0.5)
            if misses:
                print("    Misses (punch list):")
                for pid in misses:
                    comps = sorted(
                        {
                            c.strip()
                            for (d, pl, p), _ in runs.items()
                            if d == date and pl == platform and p == pid
                            for r in rows
                            if (r["date"], r["platform"], r["prompt_id"]) == (d, pl, p) and r["competitors_named"]
                            for c in r["competitors_named"].split(";")
                            if c.strip()
                        }
                    )
                    comp_str = f"  [won by: {', '.join(comps)}]" if comps else ""
                    print(f"      {pid}{comp_str}")
        print()


if __name__ == "__main__":
    main()
