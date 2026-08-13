import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  if (!existsSync(file)) return;
  const text = readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv(resolve(root, ".env"));

function unfoldIcal(raw) {
  return raw.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function icalDate(value) {
  if (!value) return null;
  const compact = value.replace(/[^0-9T]/g, "");
  if (compact.length >= 8) {
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  }
  return null;
}

function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function parseIcal(raw) {
  const text = unfoldIcal(raw);
  const booked = new Set();
  const blocks = text.split(/BEGIN:VEVENT/i).slice(1);
  for (const block of blocks) {
    const startMatch = block.match(/DTSTART(?:;[^:\n]*)?:([^\s]+)/i);
    const endMatch = block.match(/DTEND(?:;[^:\n]*)?:([^\s]+)/i);
    const start = icalDate(startMatch && startMatch[1]);
    if (!start) continue;
    let end = icalDate(endMatch && endMatch[1]);
    if (!end) end = addDays(start, 1);
    for (let day = start; day < end; day = addDays(day, 1)) {
      booked.add(day);
    }
  }
  return booked;
}

async function fetchAvailability() {
  const urls = (process.env.ICAL_FEED_URLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!urls.length) return null;

  const booked = new Set();
  for (const url of urls) {
    const res = await fetch(url, { headers: { "User-Agent": "ChaletLaBerte/1.0" } });
    if (!res.ok) {
      throw new Error(`iCal feed failed (${res.status}): ${url}`);
    }
    const dates = parseIcal(await res.text());
    for (const day of dates) booked.add(day);
  }

  return {
    booked: [...booked].sort(),
    syncedAt: new Date().toISOString()
  };
}

function loadRatesCsv() {
  const file = resolve(root, "data", "rates.csv");
  if (!existsSync(file)) return null;
  const rates = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [date, priceRaw] = trimmed.split(",").map((s) => s.trim());
    if (date === "date") continue;
    const price = Number(priceRaw);
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(price) && price > 0) {
      rates[date] = price;
    }
  }
  return Object.keys(rates).length ? rates : null;
}

function jsString(value) {
  return JSON.stringify(value ?? "");
}

const availability = await fetchAvailability();
const rates = loadRatesCsv();

const airbnbNightly = Number(process.env.PUBLIC_AIRBNB_NIGHTLY_CHF || "");
const discountPercent = Number(process.env.PUBLIC_DIRECT_DISCOUNT_PERCENT || "10");
const hasPrice = Number.isFinite(airbnbNightly) && airbnbNightly > 0;
const safeDiscount = Number.isFinite(discountPercent) && discountPercent >= 0 && discountPercent < 100
  ? discountPercent
  : 10;
const directNightly = hasPrice
  ? Math.round(airbnbNightly * (1 - safeDiscount / 100))
  : null;

const pricing = hasPrice
  ? {
      airbnbNightly,
      discountPercent: safeDiscount,
      directNightly
    }
  : {
      discountPercent: safeDiscount
    };

const config = `window.CHALET_CONFIG = {
  formEndpoint: ${jsString(process.env.PUBLIC_FORM_ENDPOINT || "")},
  formAccessKey: ${jsString(process.env.PUBLIC_FORM_ACCESS_KEY || "")},
  contactEmail: ${jsString(process.env.PUBLIC_CONTACT_EMAIL || "")},
  contactPhone: ${jsString(process.env.PUBLIC_CONTACT_PHONE || "")},
  pricing: ${JSON.stringify(pricing, null, 2).replace(/\n/g, "\n  ")},
  rates: ${JSON.stringify(rates)},
  availability: ${JSON.stringify(availability, null, 2).replace(/\n/g, "\n  ")}
};
`;

writeFileSync(resolve(root, "config.js"), config);

const html = readFileSync(resolve(root, "index.html"), "utf8");
const js = readFileSync(resolve(root, "script.js"), "utf8");
const css = readFileSync(resolve(root, "styles.css"), "utf8");
const sources = html + js + css;

if (/mailto:/i.test(html)) {
  throw new Error("Build check: an email address is still exposed via mailto: in index.html");
}
if (/stripe/i.test(sources)) {
  throw new Error("Build check: payment-provider name still present in site source");
}
if (/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(html + css)) {
  throw new Error("Build check: Google Fonts request still present");
}

const calendarMode = availability ? "iCal" : "interactive (Excel rates)";
const ratesCount = rates ? Object.keys(rates).length : 0;
console.log(`Build OK — form endpoint ${process.env.PUBLIC_FORM_ENDPOINT ? "set" : "empty"}, calendar: ${calendarMode}, rates: ${ratesCount} nights`);
