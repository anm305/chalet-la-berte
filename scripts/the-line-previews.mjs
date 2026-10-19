// Génère des aperçus SVG « The Line » pour separateurs-the-line.html
import { writeFile } from "node:fs/promises";

const W = 1200;
const NNBSP = "\u202f";

const RIDGE = [
  [0.0, 1760],
  [0.08, 1527, "Forclaz", 1527],
  [0.2, 2100],
  [0.32, 2665, "Arpette", 2665],
  [0.42, 2400],
  [0.55, 3271, "Orny", 3271],
  [0.65, 3050],
  [0.78, 3540, "Tour", 3540],
  [0.88, 3200],
  [0.96, 3901, "Argentière", 3901],
  [1.0, 2800],
];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPath(seed, levels, roughness) {
  const rand = rng(seed);
  const out = [];
  for (let k = 0; k < RIDGE.length - 1; k++) {
    const [xa, ha] = RIDGE[k];
    const [xb, hb] = RIDGE[k + 1];
    const steps = 5;
    let seg = [];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const h = hb > ha ? ha + (hb - ha) * t ** 1.7 : hb + (ha - hb) * (1 - t) ** 1.7;
      seg.push([xa + (xb - xa) * t, h]);
    }
    let amp = roughness * (Math.abs(hb - ha) + 180) / steps;
    for (let l = 0; l < levels; l++) {
      const next = [seg[0]];
      for (let i = 0; i < seg.length - 1; i++) {
        const [x0, y0] = seg[i];
        const [x1, y1] = seg[i + 1];
        const t = 0.5 + (rand() - 0.5) * 0.28;
        let h = y0 + (y1 - y0) * t + (rand() * 2 - 1) * amp;
        h = Math.min(Math.max(ha, hb) - 15, Math.max(Math.min(ha, hb) - 140, h));
        next.push([x0 + (x1 - x0) * t, h], seg[i + 1]);
      }
      seg = next;
      amp *= 0.5;
    }
    out.push(...(k === 0 ? seg : seg.slice(1)));
  }
  return out;
}

function scale(pts, top, bottom, hMin = 1400, hMax = 4000) {
  return pts.map(([x, h]) => {
    const n = ((h - hMin) / (hMax - hMin)) ** 1.2;
    return [40 + x * (W - 80), bottom - n * (bottom - top)];
  });
}

function yAt(pts, x) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((x - x0) / (x1 - x0 || 1)) * (y1 - y0);
  }
  return pts.at(-1)[1];
}

const fmt = (n) => (Math.round(n * 10) / 10).toString();
const d = (pts) => "M" + pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L");
const alt = (h) => `${String(h).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP)}${NNBSP}m`;

const peaks = RIDGE.filter((p) => p[2]);
const raw = buildPath(19, 2, 0.45);
const pts = scale(raw, 90, 210);

function labels(style) {
  return peaks
    .map(([xn, , name, h]) => {
      const x = 40 + xn * (W - 80);
      const y = yAt(pts, x);
      if (style === "flat") {
        return `<line x1="${fmt(x)}" y1="${fmt(y - 4)}" x2="${fmt(x)}" y2="${fmt(y - 18)}" stroke="currentColor" stroke-width="0.8"/><text x="${fmt(x)}" y="${fmt(y - 24)}" text-anchor="middle" font-size="11" letter-spacing="0.12em">${name.toUpperCase()}</text><text x="${fmt(x)}" y="${fmt(y - 38)}" text-anchor="middle" font-size="10" opacity="0.7">${alt(h)}</text>`;
      }
      if (style === "tilt") {
        return `<line x1="${fmt(x)}" y1="${fmt(y - 3)}" x2="${fmt(x)}" y2="${fmt(y - 14)}" stroke="currentColor" stroke-width="0.7"/><text transform="translate(${fmt(x + 4)} ${fmt(y - 18)}) rotate(-28)" font-size="12">${name} – ${alt(h)}</text>`;
      }
      // whisper: name only tiny
      return `<text x="${fmt(x)}" y="${fmt(y - 10)}" text-anchor="middle" font-size="9" letter-spacing="0.16em">${name.toUpperCase()}</text>`;
    })
    .join("");
}

const path = d(pts);
const baseY = 218;

const designs = {
  fil: {
    title: "01 · Fil d’acier",
    blurb: "Trait très fin, comme la découpe laser The Line. Labels droits au-dessus des sommets.",
    svg: `<svg viewBox="0 0 ${W} 250" role="img"><g fill="currentColor" font-family="Work Sans, sans-serif">${labels("flat")}<path d="${path}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></g></svg>`,
  },
  socle: {
    title: "02 · Sur socle",
    blurb: "Même fil, avec une base plate — l’objet mural The Line posé sur le mur.",
    svg: `<svg viewBox="0 0 ${W} 250" role="img"><g fill="currentColor" font-family="Work Sans, sans-serif">${labels("whisper")}<path d="${path}L${W - 40} ${baseY}L40 ${baseY}Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="miter"/><line x1="40" y1="${baseY}" x2="${W - 40}" y2="${baseY}" stroke="currentColor" stroke-width="2"/></g></svg>`,
  },
  incline: {
    title: "03 · Légende inclinée",
    blurb: "Fil fin + cote en diagonale légère, plus topo que murale.",
    svg: `<svg viewBox="0 0 ${W} 250" role="img"><g fill="currentColor" font-family="Work Sans, sans-serif">${labels("tilt")}<path d="${path}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></g></svg>`,
  },
  triple: {
    title: "04 · Trois fils",
    blurb: "Trois horizons fins empilés (cols / glacier / lointain), comme des plans de profondeur.",
    svg: (() => {
      const layers = [
        { seed: 11, top: 150, bottom: 230, op: 0.35, sw: 1.4 },
        { seed: 41, top: 110, bottom: 215, op: 0.55, sw: 1.8 },
        { seed: 73, top: 70, bottom: 200, op: 1, sw: 2.2 },
      ];
      const paths = layers
        .map((L) => {
          const p = scale(buildPath(L.seed, 2, 0.4), L.top, L.bottom);
          return `<path d="${d(p)}" fill="none" stroke="currentColor" stroke-width="${L.sw}" opacity="${L.op}" stroke-linejoin="round"/>`;
        })
        .join("");
      // labels only on front layer peaks
      const front = scale(buildPath(73, 2, 0.4), 70, 200);
      const labs = peaks
        .slice(2)
        .map(([xn, , name, h]) => {
          const x = 40 + xn * (W - 80);
          const y = yAt(front, x);
          return `<text x="${fmt(x)}" y="${fmt(y - 12)}" text-anchor="middle" font-size="10" letter-spacing="0.1em">${name.toUpperCase()} · ${alt(h)}</text>`;
        })
        .join("");
      return `<svg viewBox="0 0 ${W} 250" role="img"><g fill="currentColor" font-family="Work Sans, sans-serif">${labs}${paths}</g></svg>`;
    })(),
  },
};

const cards = Object.entries(designs)
  .map(
    ([id, D]) => `
  <article class="card" id="${id}">
    <p class="eyebrow">${D.title}</p>
    <p class="blurb">${D.blurb}</p>
    <div class="stage stage--snow">${D.svg}</div>
    <div class="stage stage--pine">${D.svg}</div>
  </article>`,
  )
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>The Line — propositions · Chalet La Berte</title>
<link rel="stylesheet" href="fonts.css">
<link rel="stylesheet" href="styles.css">
<style>
  body{background:var(--snow);margin:0;}
  .wrap{max-width:920px;margin:0 auto;padding:3.5rem 6vw 4rem;}
  .wrap h1{font-size:clamp(1.8rem,3.5vw,2.6rem);margin:0 0 0.8rem;}
  .wrap .lead{color:var(--ink-soft);line-height:1.65;max-width:42rem;}
  .card{margin:3.2rem 0 0;padding-top:2rem;border-top:1px solid rgba(28,36,32,0.12);}
  .card .eyebrow{margin-bottom:0.45rem;}
  .blurb{color:var(--ink-soft);font-size:0.95rem;line-height:1.55;margin:0 0 1.2rem;max-width:40rem;}
  .stage{padding:1.4rem 0 0.6rem;color:var(--pine);}
  .stage svg{display:block;width:100%;height:auto;}
  .stage--pine{background:var(--pine);color:var(--fog);padding:1.6rem 1.2rem;margin-top:0.6rem;}
  .stage--snow{background:var(--snow);}
  .note{font-family:var(--mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--brass);margin-top:2.5rem;}
</style>
</head>
<body>
  <div class="wrap">
    <p class="eyebrow">Style The Line</p>
    <h1>Quatre lectures du fil</h1>
    <p class="lead">Même crête inspirée de Trient, trait beaucoup plus fin — proche du fil d’acier 1,5&nbsp;mm de The Line. Quatre traitements typographiques et de profondeur.</p>
    ${cards}
    <p class="note">Dites 01, 02, 03 ou 04 — on l’applique aux trois séparateurs du site.</p>
  </div>
</body>
</html>
`;

await writeFile(new URL("../separateurs-the-line.html", import.meta.url), html);
console.log("wrote separateurs-the-line.html");
