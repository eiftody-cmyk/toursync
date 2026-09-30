#!/usr/bin/env node
// JA naturalness/terminology lint for public/ja/*.html.
// Rules live in data/ja-glossary.json; prose rules in JA_STYLE_GUIDE.md.
//
// Checks:
//   1. simplified-Chinese characters in any JA page (body, JSON-LD, meta)
//   2. forbidden terms (glossary) — level "error" fails, "warn" prints
//   3. untranslated English paragraphs: pure-latin <p> blocks of prose length
//   4. <title> conventions (dash chars; brand suffix) — title rules are
//      "warn" until the naturalness pass lands, then flipped to error
//   5. meta description over-length (warn)
//
// Companion to check-structured-data.mjs / check-deeptimeline-parity.mjs
// — see JA_STYLE_GUIDE.md.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const jaDir = join(root, "public", "ja");
const glossary = JSON.parse(
  readFileSync(join(root, "data", "ja-glossary.json"), "utf8")
);

const STRICT_TITLES = process.env.JA_STRICT_TITLES === "1";

const errors = [];
const warnings = [];

const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function visibleHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "");
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

const files = readdirSync(jaDir)
  .filter((f) => f.endsWith(".html"))
  .sort();
if (!files.length) {
  console.error("check-ja-style: no files under public/ja/");
  process.exit(1);
}

const chinese = new Set([...glossary.chineseChars]);
const enWords = new Set([
  "the", "of", "and", "in", "on", "at", "to", "by", "from", "was", "were",
  "is", "are", "that", "with", "for", "as", "his", "her", "it", "not",
]);

for (const f of files) {
  const html = readFileSync(join(jaDir, f), "utf8");
  const body = visibleHtml(html);

  // 1. simplified-Chinese characters (raw scan so JSON-LD is covered)
  const seen = new Set();
  for (const ch of html) {
    if (chinese.has(ch) && !seen.has(ch)) {
      seen.add(ch);
      const i = html.indexOf(ch);
      err(
        f,
        `simplified-Chinese char 「${ch}」 near: …${html
          .slice(Math.max(0, i - 15), i + 15)
          .replace(/\s+/g, " ")}…`
      );
    }
  }

  // 2. forbidden glossary terms (raw scan so JSON-LD/meta are covered)
  for (const t of glossary.terms) {
    if (!html.includes(t.forbidden)) continue;
    const msg = `「${t.forbidden}」 → use 「${t.required}」 (${t.reason})`;
    if (t.level === "error") err(f, msg);
    else warn(f, msg);
  }

  // 3. untranslated English paragraphs
  const bodyStart = body.indexOf("<body");
  const live = bodyStart >= 0 ? body.slice(bodyStart) : body;
  for (const m of live.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) {
    const text = stripTags(m[1]);
    if (!text) continue;
    if (/[　-鿿-鿿぀-ヿ]/.test(text)) continue; // has CJK → not untranslated
    if (!/^[A-Za-z0-9][A-Za-z0-9\s,.'’:;!?()\-—–"&]+$/.test(text)) continue;
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length < 10) continue; // titles/captions pass
    const stoppers = words.filter((w) => enWords.has(w.toLowerCase())).length;
    if (stoppers < 3) continue; // bibliography-style noun phrases pass
    err(f, `untranslated English paragraph: “${text.slice(0, 80)}…”`);
  }

  // 4. title conventions
  const title = /<title>([^<]*)<\/title>/.exec(html);
  if (title) {
    const t = title[1];
    for (const ch of glossary.titleForbidden) {
      if (t.includes(ch)) {
        const msg = `<title> uses forbidden dash/separator 「${ch}」 — use — and | only`;
        if (STRICT_TITLES) err(f, msg);
        else warn(f, msg);
      }
    }
    if (t.includes("タイムライン") || t.includes("時間軸")) {
      const msg = `<title> uses タイムライン/時間軸 — titles use 年表`;
      if (STRICT_TITLES) err(f, msg);
      else warn(f, msg);
    }
    if (!t.includes("| エドワードと歩く大阪城")) {
      const msg = `<title> suffix is not “| エドワードと歩く大阪城”`;
      if (STRICT_TITLES) err(f, msg);
      else warn(f, msg);
    }
  }

  // 5. meta description length (JA SERP ~120 chars)
  const desc = /<meta name="description" content="([^"]*)"/.exec(html);
  if (desc && desc[1].length > 140) {
    warn(f, `meta description is ${desc[1].length} chars (target ≤120)`);
  }
}

for (const w of warnings) console.warn(`check-ja-style: warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`check-ja-style: ${e}`);
  console.error(`check-ja-style: ${errors.length} error(s)`);
  process.exit(1);
}
console.log(
  `check-ja-style: OK — ${files.length} JA pages, ${warnings.length} warning(s)`
);
