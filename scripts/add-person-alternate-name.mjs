#!/usr/bin/env node
// Bridge EN/JA name entity: add alternateName to canonical Person and LocalBusiness
// JSON-LD nodes across public/**/*.html.
//
// Person  @id https://osakacastletours.com/#edward-iftody + name Edward Iftody
//   → alternateName: ["イフトウデイ　エドワード"]; ensure education URL in sameAs
// LocalBusiness @id https://osakacastletours.com/#business + name Osaka Castle Walks with Edward
//   → alternateName includes JA brand; founder → Person @id when missing
//
// Dry-run: node scripts/add-person-alternate-name.mjs --dry
// Apply:   node scripts/add-person-alternate-name.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

const PERSON_ID = "https://osakacastletours.com/#edward-iftody";
const PERSON_NAME = "Edward Iftody";
const PERSON_ALT = "イフトウデイ　エドワード";
const EDUCATION_URL = "https://osakacastletours.com/education";
const BUSINESS_ID = "https://osakacastletours.com/#business";
const BUSINESS_NAME = "Osaka Castle Walks with Edward";
const BUSINESS_ALT = "大阪城ウォークス with イフトウデイ　エドワード";

const dry = process.argv.includes("--dry");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
}

function extractBlocks(html) {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const blocks = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push({ start: m.index, end: m.index + m[0].length, body: m[1] });
  }
  return blocks;
}

function isPersonMatch(node) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return false;
  const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
  if (!types.includes("Person")) return false;
  return node["@id"] === PERSON_ID && node.name === PERSON_NAME;
}

function isBusinessMatch(node) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return false;
  const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
  if (!types.includes("LocalBusiness")) return false;
  return node["@id"] === BUSINESS_ID && node.name === BUSINESS_NAME;
}

function visit(node, stats) {
  if (Array.isArray(node)) {
    for (const child of node) visit(child, stats);
    return;
  }
  if (!node || typeof node !== "object") return;

  if (isPersonMatch(node)) {
    stats.personNodes++;
    let changed = false;
    if (!Array.isArray(node.alternateName)) {
      node.alternateName = [PERSON_ALT];
      changed = true;
    } else if (!node.alternateName.includes(PERSON_ALT)) {
      node.alternateName.push(PERSON_ALT);
      changed = true;
    }
    if (Array.isArray(node.sameAs) && !node.sameAs.includes(EDUCATION_URL)) {
      node.sameAs.push(EDUCATION_URL);
      changed = true;
    }
    if (changed) stats.personUpdated++;
  }

  if (isBusinessMatch(node)) {
    stats.businessNodes++;
    let changed = false;
    if (!Array.isArray(node.alternateName)) {
      node.alternateName = [BUSINESS_ALT];
      changed = true;
    } else if (!node.alternateName.includes(BUSINESS_ALT)) {
      node.alternateName.push(BUSINESS_ALT);
      changed = true;
    }
    const hasFounder =
      node.founder &&
      (node.founder["@id"] === PERSON_ID ||
        (typeof node.founder === "object" && node.founder["@id"] === PERSON_ID));
    if (!hasFounder) {
      node.founder = { "@id": PERSON_ID };
      changed = true;
    }
    if (changed) stats.businessUpdated++;
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === "object") visit(value, stats);
  }
}

function processFile(file) {
  const html = readFileSync(file, "utf8");
  const blocks = extractBlocks(html);
  if (blocks.length === 0) return null;

  const stats = {
    personNodes: 0,
    personUpdated: 0,
    businessNodes: 0,
    businessUpdated: 0,
    blockErrors: 0,
  };
  let next = html;
  let anyChange = false;

  // Process from last to first so offsets stay valid
  for (let i = blocks.length - 1; i >= 0; i--) {
    const { start, end, body } = blocks[i];
    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      stats.blockErrors++;
      console.error(`JSON parse error in ${relative(root, file)}: ${e.message}`);
      continue;
    }

    const before = JSON.stringify(data);
    const local = {
      personNodes: 0,
      personUpdated: 0,
      businessNodes: 0,
      businessUpdated: 0,
      blockErrors: 0,
    };
    visit(data, local);
    const after = JSON.stringify(data);
    stats.personNodes += local.personNodes;
    stats.personUpdated += local.personUpdated;
    stats.businessNodes += local.businessNodes;
    stats.businessUpdated += local.businessUpdated;
    stats.blockErrors += local.blockErrors;

    if (before !== after) {
      anyChange = true;
      // Preserve original indentation style when pretty (multi-line body)
      const pretty = body.includes("\n");
      const serialized = pretty
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
      const scriptOpen = `<script type="application/ld+json">`;
      const newBlock = `${scriptOpen}${serialized}</script>`;
      next = next.slice(0, start) + newBlock + next.slice(end);
    }
  }

  if (!anyChange) return null;
  if (!dry) writeFileSync(file, next, "utf8");
  return stats;
}

const files = walk(pub);
const totals = {
  files: files.length,
  changed: 0,
  personNodes: 0,
  personUpdated: 0,
  businessNodes: 0,
  businessUpdated: 0,
  blockErrors: 0,
};

for (const file of files) {
  const stats = processFile(file);
  if (!stats) continue;
  totals.changed++;
  totals.personNodes += stats.personNodes;
  totals.personUpdated += stats.personUpdated;
  totals.businessNodes += stats.businessNodes;
  totals.businessUpdated += stats.businessUpdated;
  totals.blockErrors += stats.blockErrors;
  if (stats.personUpdated || stats.businessUpdated) {
    console.log(
      `${dry ? "[dry] " : ""}${relative(root, file)}: ` +
        `person ${stats.personUpdated}/${stats.personNodes}, ` +
        `business ${stats.businessUpdated}/${stats.businessNodes}`
    );
  }
}

console.log(
  `\n${dry ? "[dry] " : ""}files scanned=${totals.files} changed=${totals.changed} ` +
    `personUpdated=${totals.personUpdated}/${totals.personNodes} ` +
    `businessUpdated=${totals.businessUpdated}/${totals.businessNodes} ` +
    `parseErrors=${totals.blockErrors}`
);

if (totals.blockErrors > 0) process.exit(1);
if (!dry && totals.personUpdated === 0 && totals.businessUpdated === 0) {
  console.error("no Person/Business updates — expected at least aboutme/index on first run");
  process.exit(1);
}
