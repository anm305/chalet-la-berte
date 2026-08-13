#!/usr/bin/env node
/**
 * Import an Airbnb host calendar CSV into data/rates.csv
 *
 * Usage:
 *   node scripts/import-rates.mjs ~/Downloads/airbnb-rates.csv
 *   npm run import:rates -- ~/Downloads/airbnb-rates.csv
 *
 * Accepts:
 *   - Airbnb Host Rate Exporter (Date, Nightly rate, …)
 *   - Simple date,price
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = resolve(root, "data", "rates.csv");
const input = process.argv[2];

if (!input) {
  console.error("Usage: node scripts/import-rates.mjs <export.csv>");
  process.exit(1);
}

function splitCsvLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function normalizeHeader(h) {
  return String(h || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function parseDate(value) {
  const raw = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const eu = raw.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (eu) return `${eu[3]}-${eu[2].padStart(2, "0")}-${eu[1].padStart(2, "0")}`;
  const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  // Prefer ISO from exporter; if ambiguous skip
  if (us && Number(us[1]) > 12) return `${us[3]}-${us[2].padStart(2, "0")}-${us[1].padStart(2, "0")}`;
  return null;
}

function parsePrice(value) {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

const text = readFileSync(resolve(input), "utf8").replace(/^\uFEFF/, "");
const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith("#"));
if (lines.length < 2) {
  console.error("CSV vide ou invalide");
  process.exit(1);
}

const headers = splitCsvLine(lines[0]).map(normalizeHeader);
const dateIdx = headers.findIndex((h) => ["date", "pricingdate", "day"].includes(h));
const priceIdx = headers.findIndex((h) =>
  ["price", "airbnb", "airbnbprice", "nightlyrate", "nightly", "rate", "amount"].includes(h)
);
const centsIdx = headers.findIndex((h) =>
  ["nightlyrateincents", "priceincents", "cents"].includes(h)
);

const hasHeader = dateIdx >= 0 || priceIdx >= 0 || centsIdx >= 0;
const rows = [];
const start = hasHeader ? 1 : 0;
const dIdx = hasHeader ? (dateIdx >= 0 ? dateIdx : 0) : 0;
const pIdx = hasHeader ? (priceIdx >= 0 ? priceIdx : -1) : 1;
const cIdx = hasHeader ? centsIdx : -1;

for (let i = start; i < lines.length; i++) {
  const cols = splitCsvLine(lines[i]);
  const date = parseDate(cols[dIdx]);
  let price = pIdx >= 0 ? parsePrice(cols[pIdx]) : null;
  if (price == null && cIdx >= 0) {
    const cents = parsePrice(cols[cIdx]);
    if (cents != null) price = cents / 100;
  }
  if (date && price != null) rows.push({ date, price });
}

if (!rows.length) {
  console.error("Aucune ligne date/prix trouvée. Colonnes attendues : Date + Nightly rate");
  process.exit(1);
}

rows.sort((a, b) => a.date.localeCompare(b.date));
mkdirSync(resolve(root, "data"), { recursive: true });
const body = [
  "# Tarifs Airbnb (CHF / nuit) — généré par scripts/import-rates.mjs",
  `# Importé le ${new Date().toISOString().slice(0, 10)} depuis ${input}`,
  "date,price",
  ...rows.map((r) => `${r.date},${r.price}`)
].join("\n") + "\n";

writeFileSync(outFile, body);
console.log(`OK — ${rows.length} nuits → ${existsSync(outFile) ? outFile : "data/rates.csv"}`);
console.log(`Période : ${rows[0].date} → ${rows[rows.length - 1].date}`);
console.log("Ensuite : git add data/rates.csv && git commit && git push (ou vercel deploy)");
