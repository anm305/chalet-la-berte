/**
 * Quote API — nightly rates from:
 *   1. PriceLabs (optional, auto)
 *   2. data/rates.csv (free Airbnb export)
 *   3. PUBLIC_AIRBNB_NIGHTLY_CHF (flat fallback)
 *
 * Then applies PUBLIC_DIRECT_DISCOUNT_PERCENT for direct booking.
 */

const fs = require("fs");
const path = require("path");

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function parseDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T12:00:00Z`);
    return Number.isNaN(d.getTime()) ? null : raw;
  }
  // DD/MM/YYYY or MM/DD/YYYY — prefer ISO from exporter; also accept DD.MM.YYYY
  const eu = raw.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (eu) {
    const iso = `${eu[3]}-${eu[2].padStart(2, "0")}-${eu[1].padStart(2, "0")}`;
    const d = new Date(`${iso}T12:00:00Z`);
    return Number.isNaN(d.getTime()) ? null : iso;
  }
  return null;
}

function parsePrice(value) {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function nightsBetween(checkin, checkout) {
  const a = new Date(`${checkin}T12:00:00Z`);
  const b = new Date(`${checkout}T12:00:00Z`);
  return Math.round((b - a) / 86400000);
}

function eachNight(checkin, checkout) {
  const out = [];
  let cur = checkin;
  while (cur < checkout) {
    out.push(cur);
    const d = new Date(`${cur}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    cur = d.toISOString().slice(0, 10);
  }
  return out;
}

function discountPercent() {
  const n = Number(process.env.PUBLIC_DIRECT_DISCOUNT_PERCENT || "10");
  return Number.isFinite(n) && n >= 0 && n < 100 ? n : 10;
}

function applyDiscount(amount, pct) {
  return Math.round(amount * (1 - pct / 100));
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
      } else {
        inQuotes = !inQuotes;
      }
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
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function loadRatesCsv() {
  const file = path.join(process.cwd(), "data", "rates.csv");
  if (!fs.existsSync(file)) return null;

  const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith("#"));
  if (lines.length < 2) return null;

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const dateKeys = ["date", "pricingdate", "day"];
  const priceKeys = [
    "price",
    "airbnb",
    "airbnbprice",
    "nightlyrate",
    "nightly",
    "rate",
    "amount"
  ];
  // Prefer cents column only if no plain price
  const centsKeys = ["nightlyrateincents", "priceincents", "cents"];

  let dateIdx = headers.findIndex((h) => dateKeys.includes(h));
  let priceIdx = headers.findIndex((h) => priceKeys.includes(h));
  let centsIdx = headers.findIndex((h) => centsKeys.includes(h));

  // Headerless fallback: date,price
  const hasHeader = dateIdx >= 0 || priceIdx >= 0 || centsIdx >= 0;
  if (!hasHeader) {
    dateIdx = 0;
    priceIdx = 1;
  }

  const byDate = new Map();
  const startRow = hasHeader ? 1 : 0;
  for (let i = startRow; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const date = parseDate(cols[dateIdx >= 0 ? dateIdx : 0]);
    let price = null;
    if (priceIdx >= 0) price = parsePrice(cols[priceIdx]);
    if (price == null && centsIdx >= 0) {
      const cents = parsePrice(cols[centsIdx]);
      if (cents != null) price = cents / 100;
    }
    if (date && price != null) byDate.set(date, price);
  }

  if (!byDate.size) return null;

  let syncedAt = null;
  try {
    syncedAt = fs.statSync(file).mtime.toISOString();
  } catch (_) { /* ignore */ }

  return { byDate, currency: "CHF", source: "csv", syncedAt };
}

async function fetchPriceLabsRates(checkin, checkout) {
  const apiKey = (process.env.PRICELABS_API_KEY || "").trim();
  const listingId = (process.env.PRICELABS_LISTING_ID || "").trim();
  const pms = (process.env.PRICELABS_PMS || "airbnb").trim();
  if (!apiKey || !listingId) return null;

  const res = await fetch("https://api.pricelabs.co/v1/listing_prices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": apiKey
    },
    body: JSON.stringify({
      listings: [
        {
          listing_id: listingId,
          pms,
          date_from: checkin,
          date_to: (() => {
            const d = new Date(`${checkout}T12:00:00Z`);
            d.setUTCDate(d.getUTCDate() - 1);
            return d.toISOString().slice(0, 10);
          })()
        }
      ]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PriceLabs ${res.status}: ${text.slice(0, 200)}`);
  }

  const payload = await res.json();
  const listing = Array.isArray(payload) ? payload[0] : (payload.listings && payload.listings[0]) || payload;
  if (!listing || listing.error) {
    throw new Error((listing && listing.error) || "PriceLabs listing error");
  }

  const byDate = new Map();
  for (const row of listing.data || []) {
    const date = row.date || row.pricing_date;
    const price = Number(row.price ?? row.recommended_price ?? row.adr);
    if (date && Number.isFinite(price)) byDate.set(String(date).slice(0, 10), price);
  }
  return { byDate, currency: listing.currency || "CHF", source: "pricelabs" };
}

function fallbackRates(checkin, checkout) {
  const base = Number(process.env.PUBLIC_AIRBNB_NIGHTLY_CHF || "");
  if (!Number.isFinite(base) || base <= 0) return null;
  const byDate = new Map();
  for (const night of eachNight(checkin, checkout)) {
    byDate.set(night, base);
  }
  return { byDate, currency: "CHF", source: "flat" };
}

function resolveRates(checkin, checkout) {
  // Priority: PriceLabs → CSV → flat
  return (
    fetchPriceLabsRates(checkin, checkout).then((pl) => {
      if (pl && pl.byDate.size) return pl;
      const csv = loadRatesCsv();
      if (csv) return csv;
      return fallbackRates(checkin, checkout);
    })
  );
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return json(res, 204, {});
  }

  if (req.method !== "GET") {
    return json(res, 405, { error: "method_not_allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  const url = new URL(req.url, "http://localhost");
  const checkin = parseDate(url.searchParams.get("checkin"));
  const checkout = parseDate(url.searchParams.get("checkout"));

  if (!checkin || !checkout || checkout <= checkin) {
    return json(res, 400, { error: "invalid_dates" });
  }

  const nights = nightsBetween(checkin, checkout);
  if (nights < 1 || nights > 60) {
    return json(res, 400, { error: "invalid_stay_length" });
  }

  try {
    const rates = await resolveRates(checkin, checkout);
    if (!rates) {
      return json(res, 503, {
        error: "pricing_not_configured",
        message: "Ajoutez data/rates.csv (export Airbnb) ou PriceLabs / PUBLIC_AIRBNB_NIGHTLY_CHF."
      });
    }

    const nightsList = eachNight(checkin, checkout);
    const missing = nightsList.filter((d) => !rates.byDate.has(d));
    if (missing.length) {
      return json(res, 422, {
        error: "incomplete_rates",
        missing,
        source: rates.source,
        message: "Tarifs incomplets pour ces dates — mettez à jour data/rates.csv."
      });
    }

    const pct = discountPercent();
    const airbnbNights = nightsList.map((date) => ({
      date,
      airbnb: rates.byDate.get(date),
      direct: applyDiscount(rates.byDate.get(date), pct)
    }));

    const airbnbTotal = airbnbNights.reduce((s, n) => s + n.airbnb, 0);
    const directTotal = airbnbNights.reduce((s, n) => s + n.direct, 0);

    return json(res, 200, {
      checkin,
      checkout,
      nights,
      currency: rates.currency || "CHF",
      discountPercent: pct,
      source: rates.source,
      syncedAt: rates.syncedAt || null,
      airbnb: { avgNightly: Math.round(airbnbTotal / nights), total: Math.round(airbnbTotal) },
      direct: { avgNightly: Math.round(directTotal / nights), total: Math.round(directTotal) },
      nightsDetail: airbnbNights
    });
  } catch (err) {
    return json(res, 502, {
      error: "upstream_failed",
      message: err.message || "Pricing upstream failed"
    });
  }
};
