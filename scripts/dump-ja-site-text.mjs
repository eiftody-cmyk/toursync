#!/usr/bin/env node
// dump-ja-site-text.mjs — extract every reviewable Japanese text field from
// public/ja/*.html into one markdown dump (ja-review-cards.md) for external
// LLM review. Regenerate with: node scripts/dump-ja-site-text.mjs

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const jaDir = join(root, "public", "ja");
const outFile = join(root, "ja-review-cards.md");

const JA_RE = /[぀-ヿ㐀-䶿一-鿿豈-﫿ｦ-ﾟ]/;

const FROZEN_TEXT = new Set([
  "この歴史を実際の場所で探究してみませんか？",
  "クイックアンサー",
  "質問と回答",
  "知っていますか？",
  "ご存知でしたか？",
  "主要な参照資料",
  "ツアーで訪問",
  "クリックして展開",
  "クリックして調査",
]);

const CARD_FIELDS = [
  ["card-date", "date"],
  ["card-title", "title"],
  ["card-body", "body"],
  ["card-note", "note"],
  ["card-dynasty", "dynasty"],
];
const ERA_FIELDS = [
  ["era-g-title", "title"],
  ["era-g-years", "years"],
  ["era-g-desc", "desc"],
];
const ITEM_FIELDS = [
  ["item-date", "date"],
  ["item-label", "label"],
  ["item-title", "title"],
  ["item-body", "body"],
  ["year", "year"],
  ["title", "title"],
  ["text", "text"],
];
const GENERIC_PATTERNS = [
  { re: /<(h1)(?=[\s>])/g, field: "heading" },
  { re: /<(h2)(?=[\s>])/g, field: "heading" },
  { re: /<(h3)(?=[\s>])/g, field: "heading" },
  { re: /<(h4)(?=[\s>])/g, field: "heading" },
  { re: /<(p)(?=[\s>])/g, field: "text" },
  { re: /<([a-z0-9]+)[^>]*class="hero-caption"/g, field: "caption" },
  { re: /<([a-z0-9]+)[^>]*class="research-footnote"/g, field: "footnote" },
  { re: /<([a-z0-9]+)[^>]*class="page-date"/g, field: "date" },
];

function findTagEnd(html, lt) {
  let i = lt + 1;
  let quote = null;
  while (i < html.length) {
    const c = html[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === ">") {
      return i;
    }
    i++;
  }
  return -1;
}

function innerOf(html, lt, tag) {
  const end = findTagEnd(html, lt);
  if (end < 0) return null;
  if (html[end - 1] === "/")
    return { innerStart: end + 1, innerEnd: end + 1, closeEnd: end + 1 };
  const tokenRe = new RegExp(`<(/?)${tag}(?=[\\s>/])[^>]*>`, "g");
  tokenRe.lastIndex = end + 1;
  let depth = 1;
  let m;
  while ((m = tokenRe.exec(html))) {
    if (m[1] === "/") {
      depth--;
      if (depth === 0)
        return {
          innerStart: end + 1,
          innerEnd: m.index,
          closeEnd: m.index + m[0].length,
        };
    } else if (!m[0].endsWith("/>")) {
      depth++;
    }
  }
  return null;
}

function norm(s) {
  return s.replace(/\s+/g, " ").trim();
}

function stripTags(s) {
  return norm(s.replace(/<[^>]+>/g, ""));
}

function extractPage(filename) {
  const html = readFileSync(join(jaDir, filename), "utf8");
  const slug = filename.replace(/\.html$/, "");
  const entries = [];
  const ranges = [];
  const excl = [];
  const warnings = [];

  const covers = (arr, s, e) => arr.some((r) => s < r.e && e > r.s);
  const blocked = (s, e) => covers(excl, s, e) || covers(ranges, s, e);
  const addRange = (s, e) => ranges.push({ s, e });

  const title = /<title>([\s\S]*?)<\/title>/.exec(html);
  const meta = /<meta name="description" content="([^"]*)"/.exec(html);

  for (const m of html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g))
    excl.push({ s: m.index, e: m.index + m[0].length });
  for (const m of html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g))
    excl.push({ s: m.index, e: m.index + m[0].length });
  for (const m of html.matchAll(/<!--[\s\S]*?-->/g))
    excl.push({ s: m.index, e: m.index + m[0].length });

  const fm = html.indexOf('class="float-menu"');
  if (fm >= 0) {
    const lt = html.lastIndexOf("<div", fm);
    const inner = innerOf(html, lt, "div");
    if (inner) excl.push({ s: lt, e: inner.closeEnd });
  }
  let footAt = html.indexOf("<footer");
  const sf = html.indexOf('class="site-footer"');
  if (sf >= 0) {
    const lt = html.lastIndexOf("<div", sf);
    if (footAt < 0 || lt < footAt) footAt = lt;
  }
  if (footAt >= 0) {
    const bodyEnd = html.indexOf("</body>", footAt);
    excl.push({ s: footAt, e: bodyEnd > 0 ? bodyEnd + 7 : html.length });
  }
  const navAt = html.indexOf("<nav");
  if (navAt >= 0) {
    const inner = innerOf(html, navAt, "nav");
    if (inner) excl.push({ s: navAt, e: inner.closeEnd });
  }
  for (const marker of [
    "歴史的参考索引",
    "Historical Reference Index",
    "<!-- CONTINUE EXPLORING -->",
  ]) {
    let from = 0;
    for (;;) {
      const i = html.indexOf(marker, from);
      if (i < 0) break;
      const sec = html.indexOf("</section>", i);
      excl.push({ s: i, e: sec >= 0 ? sec + 10 : html.length });
      from = i + marker.length;
    }
  }

  const cardStarts = [];
  for (const re of [
    /class="event-card/g,
    /class="era-g-card/g,
    /class="timeline-item/g,
  ]) {
    for (const m of html.matchAll(re)) cardStarts.push(m.index);
  }
  cardStarts.sort((a, b) => a - b);

  const cards = [];
  for (let i = 0; i < cardStarts.length; i++) {
    const start = cardStarts[i];
    const end = i + 1 < cardStarts.length ? cardStarts[i + 1] : html.length;
    const fields = [];
    let fieldSet = CARD_FIELDS;
    if (html.startsWith('class="era-g-card', start)) fieldSet = ERA_FIELDS;
    else if (html.startsWith('class="timeline-item', start)) fieldSet = ITEM_FIELDS;
    for (const [cls, name] of fieldSet) {
      const re = new RegExp(`<([a-z0-9]+)(?=[\\s>])[^>]*class="${cls}"`, "g");
      re.lastIndex = start;
      let m;
      while ((m = re.exec(html))) {
        if (m.index >= end) break;
        const pos = html.indexOf(`class="${cls}"`, m.index);
        const lt = html.lastIndexOf("<", pos);
        const inner = innerOf(html, lt, m[1]);
        if (!inner || inner.innerEnd > end) continue;
        if (blocked(inner.innerStart, inner.innerEnd)) continue;
        fields.push({ name, ...inner });
        addRange(inner.innerStart, inner.innerEnd);
        re.lastIndex = inner.closeEnd;
        break;
      }
    }
    const id = `${slug}.${String(i + 1).padStart(3, "0")}`;
    for (const f of fields)
      entries.push({ id, field: f.name, raw: html.slice(f.innerStart, f.innerEnd) });
    const kind = html.startsWith('class="era-g-card', start)
      ? "era"
      : html.startsWith('class="timeline-item', start)
        ? "item"
        : "event";
    cards.push({ id, n: fields.length, kind });
  }

  let faqN = 0;
  for (const m of html.matchAll(/<details[^>]*class="faq-item"[^>]*>/g)) {
    const inner = innerOf(html, m.index, "details");
    if (!inner || blocked(inner.innerStart, inner.innerEnd)) continue;
    faqN++;
    const id = `${slug}.faq-${String(faqN).padStart(2, "0")}`;
    const win = html.slice(inner.innerStart, inner.innerEnd);
    const sum = /<summary(?=[\s>])[^>]*>/.exec(win);
    if (sum) {
      const s = innerOf(win, sum.index, "summary");
      if (s) {
        entries.push({ id, field: "q", raw: win.slice(s.innerStart, s.innerEnd) });
        addRange(inner.innerStart + s.innerStart, inner.innerStart + s.innerEnd);
      }
    }
    let pN = 0;
    const pre = /<(p)(?=[\s>])[^>]*>/.exec(win);
    if (pre) {
      const p = innerOf(win, pre.index, "p");
      if (p) {
        pN++;
        entries.push({ id, field: "a", raw: win.slice(p.innerStart, p.innerEnd) });
        addRange(inner.innerStart + p.innerStart, inner.innerStart + p.innerEnd);
      }
    }
    addRange(inner.innerStart, inner.innerEnd);
    if (pN === 0) warnings.push(`${filename}: FAQ #${faqN} has no <p> answer`);
  }

  let liN = 0;
  for (const m of html.matchAll(/<(li)(?=[\s>])/g)) {
    const inner = innerOf(html, m.index, "li");
    if (!inner || blocked(m.index, inner.closeEnd)) continue;
    const raw = html.slice(inner.innerStart, inner.innerEnd);
    if (/<a\s/.test(raw)) continue;
    liN++;
    entries.push({ id: `${slug}.li-${String(liN).padStart(2, "0")}`, field: "text", raw });
    addRange(inner.innerStart, inner.innerEnd);
  }

  let keyN = 0;
  for (const m of html.matchAll(/<([a-z0-9]+)(?=[\s>])[^>]*class="key-item"/g)) {
    const lt = html.lastIndexOf("<", m.index);
    const inner = innerOf(html, lt, m[1]);
    if (!inner || blocked(inner.innerStart, inner.innerEnd)) continue;
    keyN++;
    entries.push({
      id: `${slug}.key-${String(keyN).padStart(2, "0")}`,
      field: "text",
      raw: html.slice(inner.innerStart, inner.innerEnd),
    });
    addRange(inner.innerStart, inner.innerEnd);
  }

  let divN = 0;
  for (const m of html.matchAll(/<([a-z0-9]+)(?=[\s>])[^>]*class="timeline-divider"/g)) {
    const lt = html.lastIndexOf("<", m.index);
    const inner = innerOf(html, lt, m[1]);
    if (!inner || blocked(inner.innerStart, inner.innerEnd)) continue;
    divN++;
    entries.push({
      id: `${slug}.divider-${String(divN).padStart(2, "0")}`,
      field: "text",
      raw: html.slice(inner.innerStart, inner.innerEnd),
    });
    addRange(inner.innerStart, inner.innerEnd);
  }

  const stops = [];
  const ms = html.indexOf("const mapStops = [");
  if (ms >= 0) {
    const open = html.indexOf("[", ms);
    let depth = 0;
    let close = -1;
    for (let i = open; i < html.length; i++) {
      if (html[i] === "[") depth++;
      else if (html[i] === "]") {
        depth--;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    if (close > 0) {
      try {
        const arr = JSON.parse(html.slice(open, close + 1));
        for (const stop of arr) {
          const id = `${slug}.stop-${stop.id}`;
          const fields = [];
          for (const k of ["name", "date", "teaser", "caption"]) {
            if (typeof stop[k] === "string") {
              fields.push(k);
              entries.push({ id, field: k, raw: stop[k], json: true });
            }
          }
          stops.push({ id, fields });
        }
      } catch (e) {
        warnings.push(`${filename}: mapStops JSON parse failed — ${e.message}`);
      }
    }
  }

  let tN = 0;
  for (const { re, field } of GENERIC_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(html))) {
      const inner = innerOf(html, m.index, m[1]);
      if (!inner) continue;
      if (blocked(m.index, inner.closeEnd)) continue;
      const raw = html.slice(inner.innerStart, inner.innerEnd);
      const plain = stripTags(raw);
      if (!plain || FROZEN_TEXT.has(plain)) {
        addRange(m.index, inner.closeEnd);
        continue;
      }
      tN++;
      entries.push({ id: `${slug}.t-${String(tN).padStart(3, "0")}`, field, raw });
      addRange(inner.innerStart, inner.innerEnd);
      re.lastIndex = inner.closeEnd;
    }
  }

  const uncovered = [];
  let i = 0;
  while (i < html.length) {
    if (html.startsWith("<!--", i)) {
      const c = html.indexOf("-->", i);
      i = c < 0 ? html.length : c + 3;
      continue;
    }
    const lt = html.indexOf("<", i);
    const segEnd = lt < 0 ? html.length : lt;
    const seg = html.slice(i, segEnd);
    if (norm(seg).length > 3 && JA_RE.test(seg) && !blocked(i, segEnd)) {
      uncovered.push(`  L${html.slice(0, i).split("\n").length}: ${norm(seg).slice(0, 70)}`);
    }
    if (lt < 0) break;
    const end = findTagEnd(html, lt);
    i = end < 0 ? html.length : end + 1;
  }

  return {
    filename,
    slug,
    entries,
    cards,
    faqN,
    liN,
    keyN,
    divN,
    stops,
    tN,
    title: title ? norm(title[1]) : "",
    meta: meta ? meta[1] : "",
    uncovered,
    warnings,
  };
}

const files = readdirSync(jaDir)
  .filter((f) => f.endsWith(".html"))
  .sort();
const pages = files.map(extractPage);

let totalCards = 0;
let totalFaq = 0;
let totalEntries = 0;
const ids = new Set();
const dupes = [];
for (const p of pages) {
  totalCards += p.cards.length;
  totalFaq += p.faqN;
  totalEntries += p.entries.length;
  for (const e of p.entries) {
    const k = `${e.id} ${e.field}`;
    if (ids.has(k)) dupes.push(k);
    ids.add(k);
  }
}

const out = [];
out.push("# JA site text review — all cards & prose (public/ja)");
out.push("# Generated by scripts/dump-ja-site-text.mjs — regenerate, do not hand-edit.");
out.push(`# Pages: ${pages.length} · entries: ${totalEntries} (cards ${totalCards}, FAQ ${totalFaq})`);
out.push("#");
out.push("# Format: [stable-id field] current Japanese text — one entry per line.");
out.push("#   (context)  = read-only reference (page title/meta); not part of the contract.");
out.push("#   ⚠EN        = no Japanese in the line (proper noun / brand). Do not translate.");
out.push("#");
out.push("# What to fix:");
out.push("#   1. Natural Japanese. Prose (bodies, FAQ answers, paragraphs) must be 敬体");
out.push("#      (です・ます). Headings, card titles and labels stay noun phrases.");
out.push("#      No だ・である体 in prose. No です・ます inside a noun-phrase title.");
out.push("#   2. Terminology per JA_STYLE_GUIDE.md and data/ja-glossary.json: no simplified");
out.push("#      forms, no forbidden terms, 『』 for book titles, correct proper nouns.");
out.push("#   3. Factual/date errors: correct only when certain; otherwise put in flags.");
out.push("#   4. Keep roughly the same length (cards sit in fixed-width layouts).");
out.push("#");
out.push("# Hard rules:");
out.push("#   - Reproduce every <tag …> and attribute inside a value byte-for-byte.");
out.push("#     Only Japanese text between tags may change. Never add/remove <a href>.");
out.push("#   - Do not touch (context) lines, ⚠EN lines, dates/numbers unless certain.");
out.push("#   - JSON-LD/meta are excluded from this dump; suggest those only in flags.");
out.push("#");
out.push("# Return contract — exactly two fenced blocks:");
out.push("#   1) ```json");
out.push('#      { "<id>": { "<field>": "corrected text", ... }, ... }');
out.push("#      Include ONLY changed entries. An omitted id/field = unchanged.");
out.push("#      Wrong id/field = the entry is skipped by the applier.");
out.push("#   2) ```flags");
out.push("#      Prose: issues you did not fix, each with its [id] (uncertain dates,");
out.push("#      EN-side problems, structure suggestions, missing content).");
out.push("#");
out.push("# If the file is too large for one pass, review page by page and return one");
out.push("# JSON block per reply chunk, keyed the same way; flags accumulate.");
out.push("");

for (const p of pages) {
  out.push("---");
  out.push(`## ${p.filename}`);
  out.push(`(context) title: ${p.title}`);
  if (p.meta) out.push(`(context) meta: ${p.meta}`);
  for (const e of p.entries) {
    const text = e.json ? e.raw : norm(e.raw);
    const mark = JA_RE.test(stripTags(text)) ? "" : " ⚠EN";
    out.push(`[${e.id} ${e.field}]${mark} ${text}`);
  }
  out.push("");
}

writeFileSync(outFile, out.join("\n"));

console.log(`wrote ${outFile}`);
console.log("page                          cards faq generic li key div stops entries");
for (const p of pages) {
  console.log(
    `${p.filename.padEnd(28)} ${String(p.cards.length).padStart(5)} ${String(p.faqN).padStart(3)} ${String(p.tN).padStart(7)} ${String(p.liN).padStart(3)} ${String(p.keyN).padStart(3)} ${String(p.divN).padStart(3)} ${String(p.stops.length).padStart(5)} ${String(p.entries.length).padStart(7)}`
  );
}
console.log(
  `TOTAL: ${pages.length} pages, ${totalCards} cards, ${totalFaq} FAQ, ${totalEntries} entries`
);
if (dupes.length) console.log(`DUPLICATE id+field: ${dupes.join(", ")}`);
const unc = pages.flatMap((p) => p.uncovered.map((u) => `${p.filename} ${u}`));
if (unc.length) {
  console.log(`\nUNCOVERED Japanese text (${unc.length}):`);
  for (const u of unc.slice(0, 60)) console.log(u);
}
const warns = pages.flatMap((p) => p.warnings);
if (warns.length) {
  console.log("\nWARNINGS:");
  for (const w of warns) console.log(`  ${w}`);
}
