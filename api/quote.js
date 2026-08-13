/**
 * Quote API — nightly rates indexed via PriceLabs (synced with Airbnb),
 * then direct-booking discount applied.
 *
 * Env:
 *   PRICELABS_API_KEY
 *   PRICELABS_LISTING_ID
 *   PRICELABS_PMS          (default: airbnb)
 *   PUBLIC_DIRECT_DISCOUNT_PERCENT (default: 10)
 *   PUBLIC_AIRBNB_NIGHTLY_CHF      (fallback flat rate if PriceLabs unset)
 */

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const d = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : value;
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
          // PriceLabs range is inclusive; checkout night is not billed
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
    if (date && Number.isFinite(price)) byDate.set(date.slice(0, 10), price);
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
    const rates = (await fetchPriceLabsRates(checkin, checkout)) || fallbackRates(checkin, checkout);
    if (!rates) {
      return json(res, 503, {
        error: "pricing_not_configured",
        message: "Connectez PriceLabs (Airbnb) ou définissez PUBLIC_AIRBNB_NIGHTLY_CHF."
      });
    }

    const nightsList = eachNight(checkin, checkout);
    const missing = nightsList.filter((d) => !rates.byDate.has(d));
    if (missing.length) {
      return json(res, 422, {
        error: "incomplete_rates",
        missing,
        message: "Tarifs incomplets pour ces dates."
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
    const airbnbAvg = Math.round(airbnbTotal / nights);
    const directAvg = Math.round(directTotal / nights);

    return json(res, 200, {
      checkin,
      checkout,
      nights,
      currency: rates.currency || "CHF",
      discountPercent: pct,
      source: rates.source,
      airbnb: { avgNightly: airbnbAvg, total: Math.round(airbnbTotal) },
      direct: { avgNightly: directAvg, total: Math.round(directTotal) },
      nightsDetail: airbnbNights
    });
  } catch (err) {
    return json(res, 502, {
      error: "upstream_failed",
      message: err.message || "Pricing upstream failed"
    });
  }
};
