// Génère les profils alpins (accueil + page de propositions) à partir des
// sommets du massif du Trient (altitudes réelles) et d'un relief à graine fixe.
// Usage : node scripts/separateurs.mjs
import { readFile, writeFile } from "node:fs/promises";

const ROOT = new URL("..", import.meta.url);
const PAGE = new URL("separateurs.html", ROOT);
const HOME = new URL("index.html", ROOT);
const W = 2400;
const NNBSP = "\u202f";

// x normalisé, altitude (m), nom affiché éventuel
const RIDGE = [
  [0.0, 1760],
  [0.045, 2191],
  [0.085, 2343, "Croix de Fer"],
  [0.135, 2120],
  [0.235, 3824, "Aiguille du Chardonnet"],
  [0.285, 3480],
  [0.33, 3901, "Aiguille d’Argentière"],
  [0.4, 3140],
  [0.465, 3540, "Aiguille du Tour"],
  [0.52, 3040],
  [0.565, 3271, "Pointe d’Orny"],
  [0.61, 3090],
  [0.665, 3519, "Aiguilles Dorées"],
  [0.72, 3160],
  [0.77, 3344, "Le Portalet"],
  [0.815, 2690],
  [0.855, 2873, "Pointe des Écandies"],
  [0.895, 2740],
  [0.94, 3101, "Pointe des Grands"],
  [1.0, 2080],
];

const MASSIF_NAMES = [
  "Aiguille d’Argentière",
  "Aiguille du Tour",
  "Aiguilles Dorées",
  "Pointe des Grands",
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

// Relief en altitude (m) le long de x ∈ [0, W], par déplacement du point milieu.
// Les sommets nommés restent les points hauts de leurs versants.
function relief({ seed, levels, roughness, decay, steps = 6 }) {
  const rand = rng(seed);
  const out = [];
  for (let k = 0; k < RIDGE.length - 1; k++) {
    const [xa, ha] = RIDGE[k];
    const [xb, hb] = RIDGE[k + 1];
    const cap = Math.max(ha, hb) - 25;
    const floor = Math.min(ha, hb) - 260;
    // Versants convexes : cols larges, sommets en pointe.
    let seg = [];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const h = hb > ha ? ha + (hb - ha) * t ** 1.8 : hb + (ha - hb) * (1 - t) ** 1.8;
      seg.push([(xa + (xb - xa) * t) * W, h]);
    }
    let amp = (roughness * (Math.abs(hb - ha) + 260)) / steps;
    for (let l = 0; l < levels; l++) {
      const next = [seg[0]];
      for (let i = 0; i < seg.length - 1; i++) {
        const [x0, y0] = seg[i];
        const [x1, y1] = seg[i + 1];
        const t = 0.5 + (rand() - 0.5) * 0.35;
        const x = x0 + (x1 - x0) * t;
        let h = y0 + (y1 - y0) * t + (rand() * 2 - 1) * amp;
        h = Math.min(cap, Math.max(floor, h));
        next.push([x, h], seg[i + 1]);
      }
      seg = next;
      amp *= decay;
    }
    out.push(...(k === 0 ? seg : seg.slice(1)));
  }
  return out;
}

// Moyenne glissante sur l'altitude : adoucit le grain sans déplacer les sommets.
function smooth(pts, radius) {
  return pts.map(([x], i) => {
    let sum = 0;
    let n = 0;
    for (let j = Math.max(0, i - radius); j <= Math.min(pts.length - 1, i + radius); j++) {
      sum += pts[j][1];
      n++;
    }
    return [x, sum / n];
  });
}

const fmt = (n) => (Math.round(n * 10) / 10).toString();
const toPath = (pts) =>
  "M" + pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L");

// Exagération verticale légère pour détacher les hauts sommets.
function scaleY(pts, top, bottom, hMin = 1600, hMax = 3950) {
  return pts.map(([x, h]) => {
    const n = Math.max(0, (h - hMin) / (hMax - hMin)) ** 1.3;
    return [x, bottom - n * (bottom - top)];
  });
}

function yAt(pts, x) {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((x - x0) / (x1 - x0 || 1)) * (y1 - y0);
  }
  return pts[pts.length - 1][1];
}

const alt = (h) => `${String(h).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP)}${NNBSP}m`;
const peaks = RIDGE.filter((p) => p[2]);

// ---------- 01 Massif : silhouette pleine, facettes nettes ----------
function massif() {
  const pts = scaleY(relief({ seed: 7, levels: 2, roughness: 0.55, decay: 0.5, steps: 2 }), 14, 236);
  const d = `${toPath(pts)}L${W} 260L0 260Z`;
  const labels = MASSIF_NAMES.map((name) => {
    const [x] = RIDGE.find((p) => p[2] === name);
    const [first, ...rest] = name.split(" ");
    const html = rest.length ? `${first}<br>${rest.join(" ")}` : first;
    return `<li style="left:${(x * 100).toFixed(1)}%">${html}</li>`;
  });
  return {
    labels: `<ul class="massif-names">\n          ${labels.join("\n          ")}\n        </ul>`,
    svg: `<svg viewBox="0 0 ${W} 260" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/></svg>`,
  };
}

// ---------- 02 Trait : une ligne fine, relief plus fin ----------
function trait() {
  const pts = scaleY(smooth(relief({ seed: 23, levels: 4, roughness: 0.7, decay: 0.55 }), 1), 16, 214);
  return `<svg viewBox="0 0 ${W} 230" preserveAspectRatio="none" role="img" aria-label="Ligne d’horizon du massif du Trient"><path d="${toPath(pts)}"/></svg>`;
}

// ---------- 03 Profil : trait épais, sommets cotés ----------
function profil() {
  const H = 560;
  const left = 30;
  const span = W - 200;
  const raw = smooth(relief({ seed: 41, levels: 3, roughness: 0.7, decay: 0.5 }), 1);
  const pts = scaleY(raw, 230, 510).map(([x, y]) => [left + (x / W) * span, y]);
  const stroke = 18;
  const size = 19;
  const ang = (34 * Math.PI) / 180;
  const dir = [Math.cos(ang), -Math.sin(ang)];
  const down = [Math.sin(ang), Math.cos(ang)];

  const texts = peaks.map(([xn, h, name]) => {
    const label = `${name} – ${alt(h)}`;
    const len = label.length * size * 0.54;
    const px = left + xn * span + 6;
    const peakY = yAt(pts, px - 6);
    let lift = stroke / 2 + 12;
    for (let guard = 0; guard < 80; guard++) {
      let clear = true;
      for (let s = 0; s <= 24; s++) {
        const t = (s / 24) * len;
        const bx = px + dir[0] * t + down[0] * size * 0.25;
        const by = peakY - lift + dir[1] * t + down[1] * size * 0.25;
        if (yAt(pts, bx) - by < stroke / 2 + 10) clear = false;
      }
      if (clear) break;
      lift += 3;
    }
    return `<line x1="${fmt(px - 6)}" y1="${fmt(peakY - stroke / 2 - 4)}" x2="${fmt(px - 6)}" y2="${fmt(peakY - lift + 4)}"/><text transform="translate(${fmt(px)} ${fmt(peakY - lift)}) rotate(-34)">${label}</text>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Profil coté du massif du Trient"><title>Profil coté du massif du Trient</title><path class="profil-stroke" d="${toPath(pts)}"/><g class="profil-labels" font-size="${size}">${texts.join("")}</g></svg>`;
}

function inject(html, name, content) {
  const re = new RegExp(`(<!-- gen:${name} -->)[\\s\\S]*?(<!-- /gen:${name} -->)`, "g");
  if (!re.test(html)) throw new Error(`marqueur gen:${name} absent`);
  return html.replace(re, `$1\n        ${content}\n        $2`);
}

const m = massif();
const profilSvg = profil();

let html = await readFile(PAGE, "utf8");
html = inject(html, "massif-labels", m.labels);
html = inject(html, "massif-svg", m.svg);
html = inject(html, "trait-svg", trait());
html = inject(html, "profil-svg", profilSvg);
await writeFile(PAGE, html);

let home = await readFile(HOME, "utf8");
home = inject(home, "profil-svg", profilSvg);
await writeFile(HOME, home);

console.log("separateurs.html et index.html mis à jour");
