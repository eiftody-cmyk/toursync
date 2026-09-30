#!/usr/bin/env node
// JSON-LD / AEO guard for the static pages (public/**.html).
// Verifies, on every build/preview/deploy and in CI:
//   1. every <script type="application/ld+json"> block parses as JSON
//   2. no raw HTML entities inside JSON-LD string values
//   3. rel=canonical, og:url and hreflang never use the .html form
//      (middleware 301s every .html URL — a canonical that redirects is a
//      self-contradiction), and canonical === og:url when both exist
//   4. every first-party hreflang target resolves to a file under public/
//   5. every first-party JSON-LD image resolves to a file; JSON-LD URLs
//      are syntactically valid
//   6. EN/JA FAQPage parity: if one locale's page declares FAQPage, the
//      slug-matched twin on the other side must too
//   7. JA pages declare inLanguage "ja"; EN pages never declare "ja"
//   8. indexable pages carry meta description, og:title, og:description
//      and a canonical (noindex pages are exempt from 3 and 8)
//
// Companion to scripts/check-deeptimeline-parity.mjs — see AGENTS.md.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const SITE = "https://osakacastletours.com";

const problems = [];

function fail(msg) {
  console.error(`check-structured-data: ${msg}`);
  process.exit(1);
}

function pages() {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".html")) out.push(p);
    }
  };
  walk(pub);
  return out.sort();
}

const rel = (p) => p.slice(pub.length + 1).split("\\").join("/");
const isJa = (r) => r.startsWith("ja/") || r.startsWith("ja\\");

function ldBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => m[1]
  );
}

function isNoindex(html) {
  return /<meta name="robots" content="[^"]*noindex/i.test(html);
}

// Resolve a first-party path (extensionless or .html) to a file under public/.
function resolves(pathname) {
  const path = pathname.replace(/\/$/, "") || "/";
  const bare = path === "/" ? "index.html" : path.replace(/^\//, "");
  const cands =
    path === "/"
      ? ["index.html"]
      : [bare, `${bare}.html`, join(bare, "index.html")];
  return cands.some((c) => existsSync(join(pub, c)));
}

function toPathname(url) {
  if (url.startsWith(SITE)) {
    const p = url.slice(SITE.length).split(/[?#]/)[0];
    return p === "" ? "/" : p;
  }
  return null;
}

function walkValues(node, visit, path = "") {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkValues(v, visit, `${path}[${i}]`));
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) walkValues(v, visit, `${path}.${k}`);
    return;
  }
  if (typeof node === "string") visit(node, path);
}

function hasFaqPage(blocks) {
  const visit = (o) => {
    if (!o || typeof o !== "object") return false;
    if (Array.isArray(o)) return o.some(visit);
    if (o["@type"] === "FAQPage") return true;
    return Object.values(o).some(visit);
  };
  return blocks.some((b) => {
    try {
      return visit(JSON.parse(b));
    } catch {
      return false;
    }
  });
}

function declaresJa(blocks) {
  const visit = (o) => {
    if (!o || typeof o !== "object") return false;
    if (Array.isArray(o)) return o.some(visit);
    if (o.inLanguage === "ja") return true;
    return Object.values(o).some(visit);
  };
  return blocks.some((b) => {
    try {
      return visit(JSON.parse(b));
    } catch {
      return false;
    }
  });
}

// Attribute order and line breaks vary between hand-authored pages — match
// whole <meta>/<link> tags, then read the attributes.
function meta(html, property) {
  for (const m of html.matchAll(/<meta\s[^>]*>/g)) {
    const name = /(?:property|name)="([^"]*)"/.exec(m[0]);
    if (!name || name[1] !== property) continue;
    const content = /content="([^"]*)"/.exec(m[0]);
    return content ? content[1] : null;
  }
  return null;
}

function linkHref(html, relValue, hreflang) {
  for (const m of html.matchAll(/<link\s[^>]*>/g)) {
    const tag = m[0];
    const rel = /rel="([^"]*)"/.exec(tag);
    if (!rel || rel[1] !== relValue) continue;
    if (hreflang !== undefined) {
      const hl = /hreflang="([^"]*)"/.exec(tag);
      if (!hl || hl[1] !== hreflang) continue;
    }
    const href = /href="([^"]*)"/.exec(tag);
    if (href) return href[1];
  }
  return null;
}

function hreflangLinks(html) {
  const out = [];
  for (const m of html.matchAll(/<link\s[^>]*>/g)) {
    const tag = m[0];
    if (!/rel="alternate"/.test(tag)) continue;
    const hl = /hreflang="([^"]*)"/.exec(tag);
    const href = /href="([^"]*)"/.exec(tag);
    if (hl && href) out.push({ hreflang: hl[1], href: href[1] });
  }
  return out;
}

const files = pages();
if (!files.length) fail("no HTML files found under public/");

let checkedBlocks = 0;

for (const file of files) {
  const r = rel(file);
  const html = readFileSync(file, "utf8");
  const ja = isJa(r);
  const noindex = isNoindex(html);
  const blocks = ldBlocks(html);
  checkedBlocks += blocks.length;

  // 1 + 2: parse + no entities
  for (const [i, raw] of blocks.entries()) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      problems.push(`${r}: JSON-LD block ${i + 1} does not parse (${e.message})`);
      continue;
    }
    walkValues(data, (v, path) => {
      if (/&(amp|quot|lt|gt|#\d+);/.test(v)) {
        problems.push(`${r}: JSON-LD block ${i + 1} ${path} contains an HTML entity: ${v.slice(0, 60)}`);
      }
      if (/^https?:\/\//.test(v)) {
        try {
          new URL(v);
        } catch {
          problems.push(`${r}: JSON-LD block ${i + 1} ${path} is not a valid URL: ${v}`);
        }
      }
    });
    // 5: first-party images resolve
    const visitImages = (o) => {
      if (!o || typeof o !== "object") return;
      if (Array.isArray(o)) return o.forEach(visitImages);
      for (const [k, v] of Object.entries(o)) {
        if (typeof v === "string" && ["image", "thumbnailUrl", "logo"].includes(k)) {
          const p = toPathname(v);
          if (p && !resolves(p)) problems.push(`${r}: JSON-LD ${k} does not resolve: ${v}`);
        } else visitImages(v);
      }
    };
    visitImages(data);
  }

  // 7: language hints
  if (ja && blocks.length && !declaresJa(blocks)) {
    problems.push(`${r}: JA page has JSON-LD but no inLanguage "ja" anywhere`);
  }
  if (!ja && blocks.length && declaresJa(blocks)) {
    problems.push(`${r}: EN page declares inLanguage "ja"`);
  }

  // 3: canonical / og:url / hreflang form (skip noindex)
  const canonical = linkHref(html, "canonical");
  const ogUrl = meta(html, "og:url");
  if (!noindex) {
    for (const [label, value] of [
      ["canonical", canonical],
      ["og:url", ogUrl],
    ]) {
      if (value === null) continue;
      if (!value.startsWith(SITE)) {
        problems.push(`${r}: ${label} is not absolute first-party: ${value}`);
      } else if (value.endsWith(".html")) {
        problems.push(`${r}: ${label} uses the .html form (it 301s): ${value}`);
      }
    }
    if (canonical && ogUrl && canonical !== ogUrl) {
      problems.push(`${r}: canonical (${canonical}) !== og:url (${ogUrl})`);
    }
    for (const { href } of hreflangLinks(html)) {
      if (href.endsWith(".html")) {
        problems.push(`${r}: hreflang uses the .html form (it 301s): ${href}`);
        continue;
      }
      if (href.startsWith(SITE)) {
        const p = toPathname(href);
        if (p && !resolves(p)) problems.push(`${r}: hreflang target does not resolve: ${href}`);
      }
    }
  }

  // 8: indexable page needs the basic AEO tags
  if (!noindex) {
    for (const [label, value] of [
      ["meta description", meta(html, "description")],
      ["og:title", meta(html, "og:title")],
      ["og:description", meta(html, "og:description")],
      ["canonical", canonical],
    ]) {
      if (value === null || value === "") {
        problems.push(`${r}: indexable page missing ${label}`);
      }
    }
  }
}

// 6: EN/JA FAQ parity by slug
const slugOf = (r) => r.replace(/^(ja[\\/])?/, "").replace(/\.html$/, "");
const bySlug = new Map();
for (const file of files) {
  const r = rel(file);
  const s = slugOf(r);
  if (!bySlug.has(s)) bySlug.set(s, {});
  bySlug.get(s)[r.startsWith("ja") ? "ja" : "en"] = r;
}
for (const [slug, sides] of bySlug) {
  if (!sides.en || !sides.ja) continue;
  const read = (r) => readFileSync(join(pub, r), "utf8");
  const enFaq = hasFaqPage(ldBlocks(read(sides.en)));
  const jaFaq = hasFaqPage(ldBlocks(read(sides.ja)));
  if (enFaq && !jaFaq) problems.push(`FAQ parity: ${sides.en} has FAQPage but ${sides.ja} does not`);
  if (jaFaq && !enFaq) problems.push(`FAQ parity: ${sides.ja} has FAQPage but ${sides.en} does not`);
}

if (problems.length) {
  for (const p of problems) console.error(`check-structured-data: ${p}`);
  console.error(
    `check-structured-data: ${problems.length} problem(s) — JSON-LD/AEO drift`
  );
  process.exit(1);
}

console.log(
  `check-structured-data: OK — ${files.length} pages, ${checkedBlocks} JSON-LD blocks parse, canonicals extensionless, EN/JA FAQ parity holds`
);
