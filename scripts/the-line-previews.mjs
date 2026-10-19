// Génère des aperçus SVG « The Line » — silhouette caricaturée (beaucoup d’ups/downs)
import { writeFile } from "node:fs/promises";

const W = 1200;
const NNBSP = "\u202f";

// Crête caricaturée style The Line Summit :
// beaucoup de dents / cols entre les sommets nommés, amplitude verticale forte.
// Format: [xNorm, altitudeVisuelle, name?, altitudeRéelle?]
// Silhouette caricaturée type The Line Summit (Chamonix / Mont-Blanc) :
// amplitude irrégulière, cols profonds, sommets nommés qui dominent clairement.
const RIDGE = [
  [0.0, 1720],
  [0.025, 1980],
  [0.045, 1560],
  [0.065, 1880],
  [0.085, 1527, "Forclaz", 1527], // col
  [0.105, 2040],
  [0.12, 1680],
  [0.14, 2280],
  [0.155, 1960],
  [0.175, 2410],
  [0.195, 2120],
  [0.215, 2550],
  [0.235, 1980], // creux marqué
  [0.255, 2620],
  [0.275, 2340],
  [0.3, 2665, "Arpette", 2665],
  [0.32, 2180],
  [0.34, 2480],
  [0.355, 1880], // col profond (fenêtre)
  [0.375, 2360],
  [0.39, 2060],
  [0.41, 2780],
  [0.425, 2420],
  [0.445, 3010],
  [0.46, 2640],
  [0.48, 2890],
  [0.495, 2510],
  [0.515, 3180],
  [0.535, 3271, "Orny", 3271],
  [0.555, 2780],
  [0.57, 3090],
  [0.585, 2460], // fenêtre
  [0.605, 2920],
  [0.62, 2680],
  [0.64, 3360],
  [0.655, 2980],
  [0.675, 3480],
  [0.69, 3120],
  [0.71, 3540, "Tour", 3540],
  [0.73, 3040],
  [0.745, 3380],
  [0.76, 2820], // creux
  [0.78, 3520],
  [0.795, 3180],
  [0.815, 3660],
  [0.83, 3280],
  [0.85, 3480],
  [0.865, 3020],
  [0.885, 3720],
  [0.9, 3440],
  [0.92, 3901, "Argentière", 3901],
  [0.94, 3360],
  [0.96, 2980],
  [0.98, 2720],
  [1.0, 2480],
];

function scale(pts, top, bottom, hMin = 1450, hMax = 4000) {
  return pts.map(([x, h]) => {
    // léger écrasement haut pour garder de l’air aux labels, mais amplitude forte
    const n = ((h - hMin) / (hMax - hMin)) ** 0.92;
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
const pts = scale(RIDGE, 78, 218);

function labels(style) {
  return peaks
    .map(([xn, , name, h]) => {
      const x = 40 + xn * (W - 80);
      const y = yAt(pts, x);
      if (style === "flat") {
        return `<line x1="${fmt(x)}" y1="${fmt(y - 3)}" x2="${fmt(x)}" y2="${fmt(y - 16)}" stroke="currentColor" stroke-width="0.7"/><text x="${fmt(x)}" y="${fmt(y - 22)}" text-anchor="middle" font-size="10" letter-spacing="0.14em">${name.toUpperCase()}</text><text x="${fmt(x)}" y="${fmt(y - 35)}" text-anchor="middle" font-size="9" opacity="0.7">${alt(h)}</text>`;
      }
      if (style === "tilt") {
        return `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="1.4" fill="currentColor"/><text transform="translate(${fmt(x + 3)} ${fmt(y - 10)}) rotate(-32)" font-size="11">${name} – ${alt(h)}</text>`;
      }
      return `<text x="${fmt(x)}" y="${fmt(y - 9)}" text-anchor="middle" font-size="9" letter-spacing="0.16em">${name.toUpperCase()}</text>`;
    })
    .join("");
}

const path = d(pts);
const baseY = 226;
const SW = 1.6; // fil fin ≈ 1,5 mm The Line

// Variante encore plus « dentée » pour les plans lointains
function offsetRidge(dx, dh) {
  return RIDGE.map(([x, h, ...rest], i) => {
    const wobble = Math.sin(i * 1.7) * 90 + Math.cos(i * 0.9) * 60;
    return [Math.min(1, Math.max(0, x + dx)), Math.max(1400, h + dh + wobble), ...rest];
  });
}

const designs = {
  fil: {
    title: "01 · Fil d’acier",
    blurb: "Trait très fin, dents et cols marqués comme la découpe The Line. Labels droits au-dessus des sommets.",
    svg: `<svg viewBox="0 0 ${W} 250" role="img"><g fill="currentColor" font-family="Work Sans, sans-serif">${labels("flat")}<path d="${path}" fill="none" stroke="currentColor" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"/></g></svg>`,
  },
  socle: {
    title: "02 · Sur socle",
    blurb: "Même silhouette dentelée, avec une base plate — l’objet mural The Line posé sur le mur.",
    svg: `<svg viewBox="0 0 ${W} 250" role="img"><g fill="currentColor" font-family="Work Sans, sans-serif">${labels("whisper")}<path d="${path}L${W - 40} ${baseY}L40 ${baseY}Z" fill="none" stroke="currentColor" stroke-width="${SW}" stroke-linejoin="miter"/><line x1="40" y1="${baseY}" x2="${W - 40}" y2="${baseY}" stroke="currentColor" stroke-width="${SW}"/></g></svg>`,
  },
  incline: {
    title: "03 · Légende inclinée",
    blurb: "Fil dentelé + cotes en diagonale (comme l’autocollant The Line Summit).",
    svg: `<svg viewBox="0 0 ${W} 250" role="img"><g fill="currentColor" font-family="Work Sans, sans-serif">${labels("tilt")}<path d="${path}" fill="none" stroke="currentColor" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"/></g></svg>`,
  },
  triple: {
    title: "04 · Trois fils",
    blurb: "Trois horizons dentelés empilés (cols / glacier / lointain), plans de profondeur.",
    svg: (() => {
      const layers = [
        { ridge: offsetRidge(0.012, -380), top: 145, bottom: 232, op: 0.28, sw: 1.2 },
        { ridge: offsetRidge(-0.01, -160), top: 110, bottom: 222, op: 0.5, sw: 1.35 },
        { ridge: RIDGE, top: 70, bottom: 210, op: 1, sw: SW },
      ];
      const paths = layers
        .map((L) => {
          const p = scale(L.ridge, L.top, L.bottom);
          return `<path d="${d(p)}" fill="none" stroke="currentColor" stroke-width="${L.sw}" opacity="${L.op}" stroke-linejoin="round" stroke-linecap="round"/>`;
        })
        .join("");
      const front = scale(RIDGE, 70, 210);
      const labs = peaks
        .slice(2)
        .map(([xn, , name, h]) => {
          const x = 40 + xn * (W - 80);
          const y = yAt(front, x);
          return `<text x="${fmt(x)}" y="${fmt(y - 11)}" text-anchor="middle" font-size="10" letter-spacing="0.1em">${name.toUpperCase()} · ${alt(h)}</text>`;
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
  .ref{margin:1.4rem 0 0;padding:1rem 0 0;border-top:1px dashed rgba(28,36,32,0.15);font-size:0.88rem;color:var(--ink-soft);line-height:1.5;}
</style>
</head>
<body>
  <div class="wrap">
    <p class="eyebrow">Style The Line</p>
    <h1>Quatre lectures du fil</h1>
    <p class="lead">Silhouette Trient caricaturée : beaucoup plus d’ups &amp; downs entre les sommets nommés — comme Chamonix / Mont-Blanc chez The Line. Trait fin ≈&nbsp;1,5&nbsp;mm.</p>
    <p class="ref">Réf. produit : une seule ligne d’acier, dents serrées, cols marqués, labels au-dessus des pics — pas une rampe douce.</p>
    ${cards}
    <p class="note">Dites 01, 02, 03 ou 04 — on l’applique aux trois séparateurs du site.</p>
  </div>
</body>
</html>
`;

await writeFile(new URL("../separateurs-the-line.html", import.meta.url), html);
console.log("wrote separateurs-the-line.html —", RIDGE.length, "points,", peaks.length, "labels");
