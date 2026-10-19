// Aperçus The Line Summit — composition visuelle (pas une échelle d’altitude)
// Chez The Line, les massifs sont caricaturés : grand creux central, pics qui dominent.
import { writeFile } from "node:fs/promises";

const W = 1200;
const NNBSP = "\u202f";
const SW = 1.5;

/**
 * Points [xNorm, yVisuel 0–1 (1 = sommet), name?, altRéelle?]
 * yVisuel est une composition (comme The Line), pas h/4000.
 */
const CLASSIC = [
  [0.0, 0.22],
  [0.05, 0.38],
  [0.09, 0.16], // avant-col
  [0.13, 0.12, "Forclaz", 1527],
  [0.18, 0.42],
  [0.22, 0.28],
  [0.27, 0.58],
  [0.31, 0.72, "Arpette", 2665],
  [0.35, 0.48],
  [0.4, 0.18], // GRAND CREUX — signature The Line
  [0.45, 0.32],
  [0.49, 0.24],
  [0.54, 0.62],
  [0.58, 0.78, "Orny", 3271],
  [0.62, 0.52],
  [0.66, 0.4], // fenêtre
  [0.71, 0.68],
  [0.75, 0.86, "Tour", 3540],
  [0.79, 0.58],
  [0.83, 0.74],
  [0.87, 0.55],
  [0.92, 1.0, "Argentière", 3901],
  [0.96, 0.62],
  [1.0, 0.3],
];

/** Version encore plus monumentale — 5 sommets + cols seulement */
const SPARSE = [
  [0.0, 0.2],
  [0.12, 0.1, "Forclaz", 1527],
  [0.22, 0.45],
  [0.3, 0.7, "Arpette", 2665],
  [0.4, 0.15], // grand creux
  [0.52, 0.55],
  [0.58, 0.8, "Orny", 3271],
  [0.66, 0.38],
  [0.75, 0.88, "Tour", 3540],
  [0.84, 0.5],
  [0.92, 1.0, "Argentière", 3901],
  [1.0, 0.28],
];

/** Version type objet : un peu plus de micro-relief sur les arêtes */
const OBJECT = [
  [0.0, 0.2],
  [0.04, 0.34],
  [0.08, 0.14],
  [0.12, 0.1, "Forclaz", 1527],
  [0.16, 0.36],
  [0.2, 0.26],
  [0.25, 0.52],
  [0.29, 0.4],
  [0.33, 0.72, "Arpette", 2665],
  [0.37, 0.5],
  [0.41, 0.16],
  [0.46, 0.3],
  [0.5, 0.22],
  [0.55, 0.58],
  [0.59, 0.78, "Orny", 3271],
  [0.63, 0.55],
  [0.67, 0.38],
  [0.71, 0.64],
  [0.75, 0.86, "Tour", 3540],
  [0.78, 0.62],
  [0.82, 0.76],
  [0.86, 0.52],
  [0.9, 0.7],
  [0.93, 1.0, "Argentière", 3901],
  [0.96, 0.58],
  [1.0, 0.28],
];

function toXY(ridge, top = 78, bottom = 198) {
  return ridge.map(([x, y]) => [48 + x * (W - 96), bottom - y * (bottom - top)]);
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

function labelsTilt(ridge, pts) {
  return ridge
    .filter((p) => p[2])
    .map(([xn, , name, h]) => {
      const x = 48 + xn * (W - 96);
      const y = yAt(pts, x);
      return `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="1.5" fill="currentColor"/><text transform="translate(${fmt(x + 5)} ${fmt(y - 7)}) rotate(-40)" font-size="11">${name} – ${alt(h)}</text>`;
    })
    .join("");
}

function labelsFlat(ridge, pts) {
  return ridge
    .filter((p) => p[2])
    .map(([xn, , name, h]) => {
      const x = 48 + xn * (W - 96);
      const y = yAt(pts, x);
      return `<line x1="${fmt(x)}" y1="${fmt(y - 3)}" x2="${fmt(x)}" y2="${fmt(y - 13)}" stroke="currentColor" stroke-width="0.7"/><text x="${fmt(x)}" y="${fmt(y - 18)}" text-anchor="middle" font-size="10" letter-spacing="0.12em">${name.toUpperCase()}</text><text x="${fmt(x)}" y="${fmt(y - 31)}" text-anchor="middle" font-size="9" opacity="0.65">${alt(h)}</text>`;
    })
    .join("");
}

const stroke = `fill="none" stroke="currentColor" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;

function cardSvg(ridge, labelMode, withBase = false) {
  const pts = toXY(ridge);
  const path = d(pts);
  const labs = labelMode === "tilt" ? labelsTilt(ridge, pts) : labelsFlat(ridge, pts);
  const baseY = 212;
  const shape = withBase ? `${path}L${W - 48} ${baseY}L48 ${baseY}Z` : path;
  return `<svg viewBox="0 0 ${W} 240" role="img"><g fill="currentColor" font-family="Work Sans, sans-serif">${labs}<path d="${shape}" ${stroke}/></g></svg>`;
}

const designs = {
  classique: {
    title: "01 · Classique The Line",
    blurb: "Composition comme Chamonix : deux massifs, un grand creux au milieu, Argentière en climax. Labels diagonaux (autocollant Summit).",
    svg: cardSvg(CLASSIC, "tilt"),
  },
  objet: {
    title: "02 · Objet mural",
    blurb: "Même caricature, un peu plus de micro-relief sur les arêtes, fermée sur une base plate — la découpe dans sa boîte.",
    svg: cardSvg(OBJECT, "flat", true),
  },
  epure: {
    title: "03 · Épuré",
    blurb: "Cinq sommets, quatre cols — le minimum pour lire Trient d’un trait.",
    svg: cardSvg(SPARSE, "tilt"),
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
  .stage{padding:1.5rem 0 0.5rem;color:var(--pine);}
  .stage svg{display:block;width:100%;height:auto;}
  .stage--pine{background:var(--pine);color:var(--fog);padding:1.6rem 1.2rem;margin-top:0.6rem;}
  .stage--snow{background:var(--snow);}
  .note{font-family:var(--mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--brass);margin-top:2.5rem;}
</style>
</head>
<body>
  <div class="wrap">
    <p class="eyebrow">Style The Line · v3</p>
    <h1>Caricature, pas courbe d’altitude</h1>
    <p class="lead">Comme chez The Line : on compose des massifs et un grand creux — on ne trace pas une échelle de mètres. Trait fin 1,5&nbsp;mm.</p>
    ${cards}
    <p class="note">Dites 01, 02 ou 03.</p>
  </div>
</body>
</html>
`;

await writeFile(new URL("../separateurs-the-line.html", import.meta.url), html);
console.log("wrote v3");
