#!/usr/bin/env node
// EN/JA parity guard for the deeptimeline pages.
// Verifies that public/deeptimeline.html and public/ja/deeptimeline.html carry:
//   1. the same Historical Reference Index (same sections, same entry counts,
//      same slugs in the same order, every entry linked), and
//   2. the same "Continue Exploring" list (same slugs in the same order),
// and that every internal href on both sides resolves to a file in public/.
// Regression guard: the JA index once lost 8 links in a dead-link cleanup
// (osaka-timeline 21684db) and was never re-linked after the JA pages landed.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

const EN_PAGE = join(pub, "deeptimeline.html");
const JA_PAGE = join(pub, "ja", "deeptimeline.html");

const INDEX_MARKER_EN = "Historical Reference Index";
const INDEX_MARKER_JA = "歴史的参考索引";
const LIST_MARKER = "<!-- CONTINUE EXPLORING -->";

const problems = [];

function fail(msg) {
  console.error(`check-deeptimeline-parity: ${msg}`);
  process.exit(1);
}

function read(file, label) {
  if (!existsSync(file)) fail(`${label} not found: ${file}`);
  return readFileSync(file, "utf8");
}

// Body of the first block that follows `marker` and ends at the next </section>.
function blockAfter(html, marker, label) {
  const start = html.indexOf(marker);
  if (start === -1) fail(`${label}: marker not found (${marker})`);
  const end = html.indexOf("</section>", start);
  if (end === -1) fail(`${label}: no </section> after marker (${marker})`);
  return html.slice(start, end);
}

// Per-section entries of the reference index: [{ title, href }], href null
// when the entry is plain text with no link.
function indexEntries(body, label) {
  const chunks = body.split(/<h3>([\s\S]*?)<\/h3>/);
  // chunks: [pre, title1, body1, title2, body2, ...]
  const sections = [];
  for (let i = 1; i < chunks.length; i += 2) {
    const heading = chunks[i].replace(/<[^>]+>/g, "").trim();
    const sectionBody = chunks[i + 1] ?? "";
    const entries = [];
    for (const piece of sectionBody.split(/<p[^>]*>/).slice(1)) {
      const inner = piece.split("</p>")[0];
      const strong = /<strong>([\s\S]*?)<\/strong>/.exec(inner);
      if (!strong) continue;
      const anchor = /<a\s+href="([^"]+)"/.exec(inner);
      entries.push({
        title: strong[1].replace(/<[^>]+>/g, "").trim(),
        href: anchor ? anchor[1] : null,
      });
    }
    sections.push({ heading, entries });
  }
  if (!sections.length) fail(`${label}: no <h3> sections in the index`);
  return sections;
}

// Ordered hrefs of the Continue Exploring list.
function listHrefs(body, label) {
  const hrefs = [...body.matchAll(/<li>\s*<a\s+href="([^"]+)"/g)].map(
    (m) => m[1]
  );
  if (!hrefs.length) fail(`${label}: no <li><a> entries found`);
  return hrefs;
}

// EN and JA spell the same page differently (/ja/x.html vs /x.html,
// /articles/x vs /ja/x.html, extensionless vs .html). Compare slugs.
function slug(href) {
  return href
    .split(/[?#]/)[0]
    .replace(/^\/(ja|articles)\//, "/")
    .replace(/\/$/, "")
    .replace(/\.html$/, "")
    .replace(/^\//, "");
}

function resolve(href) {
  if (/^(https?:|mailto:|tel:|#|\/book)/.test(href)) return true; // not local HTML
  const path = href.split(/[?#]/)[0];
  const candidates = path.endsWith(".html")
    ? [path]
    : [path, `${path}.html`, path.replace(/\/$/, "") + ".html"];
  return candidates.some((c) => existsSync(join(pub, c.replace(/^\//, ""))));
}

function checkHref(href, where) {
  if (!resolve(href)) problems.push(`${where}: dead link ${href}`);
}

function checkIndex(enHtml, jaHtml) {
  const en = indexEntries(blockAfter(enHtml, INDEX_MARKER_EN, "EN index"), "EN index");
  const ja = indexEntries(blockAfter(jaHtml, INDEX_MARKER_JA, "JA index"), "JA index");

  if (en.length !== ja.length) {
    problems.push(`index: ${en.length} EN sections vs ${ja.length} JA sections`);
  }
  en.forEach((sec, i) => {
    const other = ja[i];
    if (!other) return;
    const where = `index section ${i + 1} (${sec.heading})`;
    if (sec.entries.length !== other.entries.length) {
      problems.push(
        `${where}: ${sec.entries.length} EN entries vs ${other.entries.length} JA entries`
      );
    }
    const n = Math.min(sec.entries.length, other.entries.length);
    for (let k = 0; k < n; k++) {
      const e = sec.entries[k];
      const j = other.entries[k];
      const item = `${where} #${k + 1}`;
      if (!e.href) problems.push(`${item} (EN ${e.title}): entry is not linked`);
      if (!j.href) problems.push(`${item} (JA ${j.title}): entry is not linked`);
      if (e.href && j.href && slug(e.href) !== slug(j.href)) {
        problems.push(
          `${item}: order/slug mismatch — EN ${e.href} vs JA ${j.href}`
        );
      }
      if (e.href) checkHref(e.href, `${item} (EN)`);
      if (j.href) checkHref(j.href, `${item} (JA)`);
    }
  });
  return {
    sections: en.length,
    entries: en.reduce((n, s) => n + s.entries.length, 0),
  };
}

function checkList(enHtml, jaHtml) {
  const en = listHrefs(blockAfter(enHtml, LIST_MARKER, "EN Continue Exploring"), "EN list");
  const ja = listHrefs(blockAfter(jaHtml, LIST_MARKER, "JA Continue Exploring"), "JA list");
  if (en.length !== ja.length) {
    problems.push(`Continue Exploring: ${en.length} EN links vs ${ja.length} JA links`);
  }
  const n = Math.min(en.length, ja.length);
  for (let i = 0; i < n; i++) {
    if (slug(en[i]) !== slug(ja[i])) {
      problems.push(
        `Continue Exploring #${i + 1}: EN ${en[i]} vs JA ${ja[i]}`
      );
    }
    checkHref(en[i], `Continue Exploring #${i + 1} (EN)`);
    checkHref(ja[i], `Continue Exploring #${i + 1} (JA)`);
  }
  return { links: en.length };
}

const enHtml = read(EN_PAGE, "EN deeptimeline");
const jaHtml = read(JA_PAGE, "JA deeptimeline");

const index = checkIndex(enHtml, jaHtml);
const list = checkList(enHtml, jaHtml);

if (problems.length) {
  for (const p of problems) console.error(`check-deeptimeline-parity: ${p}`);
  console.error(
    `check-deeptimeline-parity: ${problems.length} problem(s) — EN/JA deeptimeline drifted`
  );
  process.exit(1);
}

console.log(
  `check-deeptimeline-parity: OK — ${index.sections} sections / ${index.entries} index entries, ${list.links} Continue Exploring links, all local hrefs resolve`
);
