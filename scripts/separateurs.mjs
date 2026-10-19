// Trois profils cotés du massif du Trient (vue depuis le village) :
//   cols      — premier plan : cols & fenêtres
//   glacier   — second plan : couronne du glacier
//   aiguilles — lointain : grandes aiguilles
// Usage : npm run separateurs
import { readFile, writeFile } from "node:fs/promises";

const ROOT = new URL("..", import.meta.url);
const PAGE = new URL("separateurs.html", ROOT);
const HOME = new URL("index.html", ROOT);
const W = 2400;
const NNBSP = "\u202f";

/** @typedef {[number, number, string?]} RidgePoint */

/** @type {Record<string, { title: string, seed: number, stroke: number, hMin: number, hMax: number, ridge: RidgePoint[] }>} */
const PROFILES = {
  cols: {
    title: "Profil des cols et fenêtres autour de Trient",
    seed: 11,
    stroke: 4.5,
    hMin: 1400,
    hMax: 3000,
    ridge: [
      [0.0, 1520],
      [0.08, 1527, "Col de la Forclaz"],
      [0.18, 1780],
      [0.28, 2598, "La Catogne"],
      [0.38, 2100],
      [0.48, 2343, "Croix de Fer"],
      [0.58, 2050],
      [0.68, 2191, "Col de Balme"],
      [0.78, 2400],
      [0.88, 2665, "Fenêtre d’Arpette"],
      [0.95, 2873, "Pointe des Écandies"],
      [1.0, 2200],
    ],
  },
  glacier: {
    title: "Profil de la couronne du glacier du Trient",
    seed: 41,
    stroke: 5,
    hMin: 2600,
    hMax: 3650,
    ridge: [
      [0.0, 2800],
      [0.1, 3101, "Pointe des Grands"],
      [0.2, 2950],
      [0.32, 3344, "Le Portalet"],
      [0.42, 3120],
      [0.52, 3271, "Pointe d’Orny"],
      [0.62, 3180],
      [0.72, 3519, "Aiguilles Dorées"],
      [0.82, 3300],
      [0.9, 3540, "Aiguille du Tour"],
      [0.96, 3520, "Petite Fourche"],
      [1.0, 3100],
    ],
  },
  aiguilles: {
    title: "Profil des aiguilles lointaines depuis Trient",
    seed: 73,
    stroke: 5.5,
    hMin: 3200,
    hMax: 4200,
    ridge: [
      [0.0, 3400],
      [0.12, 3754, "Les Drus"],
      [0.28, 3600],
      [0.42, 3824, "Aiguille du Chardonnet"],
      [0.55, 3650],
      [0.68, 3901, "Aiguille d’Argentière"],
      [0.82, 3800],
      [0.92, 4122, "Aiguille Verte"],
      [1.0, 3550],
    ],
  },
};

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

function relief(ridge, { seed, levels = 3, roughness = 0.7, decay = 0.5, steps = 6 }) {
  const rand = rng(seed);
  const out = [];
  for (let k = 0; k < ridge.length - 1; k++) {
    const [xa, ha] = ridge[k];
    const [xb, hb] = ridge[k + 1];
    const cap = Math.max(ha, hb) - 20;
    const floor = Math.min(ha, hb) - Math.max(120, (Math.abs(hb - ha) + 200) * 0.35);
    let seg = [];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const h = hb > ha ? ha + (hb - ha) * t ** 1.8 : hb + (ha - hb) * (1 - t) ** 1.8;
      seg.push([(xa + (xb - xa) * t) * W, h]);
    }
    let amp = (roughness * (Math.abs(hb - ha) + 220)) / steps;
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
const toPath = (pts) => "M" + pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L");

function scaleY(pts, top, bottom, hMin, hMax) {
  return pts.map(([x, h]) => {
    const n = Math.max(0, (h - hMin) / (hMax - hMin)) ** 1.25;
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

function profil(key) {
  const cfg = PROFILES[key];
  const H = 560;
  const left = 30;
  const span = W - 200;
  const raw = smooth(
    relief(cfg.ridge, { seed: cfg.seed, levels: 3, roughness: 0.65, decay: 0.5 }),
    1,
  );
  const pts = scaleY(raw, 230, 510, cfg.hMin, cfg.hMax).map(([x, y]) => [
    left + (x / W) * span,
    y,
  ]);
  const stroke = cfg.stroke;
  const size = 19;
  const ang = (34 * Math.PI) / 180;
  const dir = [Math.cos(ang), -Math.sin(ang)];
  const down = [Math.sin(ang), Math.cos(ang)];
  const peaks = cfg.ridge.filter((p) => p[2]);

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

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${cfg.title}"><title>${cfg.title}</title><path class="profil-stroke" style="stroke-width:${stroke}" d="${toPath(pts)}"/><g class="profil-labels" font-size="${size}">${texts.join("")}</g></svg>`;
}

function injectOnce(html, name, content) {
  const re = new RegExp(`(<!-- gen:${name} -->)[\\s\\S]*?(<!-- /gen:${name} -->)`);
  if (!re.test(html)) throw new Error(`marqueur gen:${name} absent`);
  return html.replace(re, `$1\n        ${content}\n        $2`);
}

function injectAll(html, name, content) {
  const re = new RegExp(`(<!-- gen:${name} -->)[\\s\\S]*?(<!-- /gen:${name} -->)`, "g");
  if (!re.test(html)) throw new Error(`marqueur gen:${name} absent`);
  return html.replace(re, `$1\n        ${content}\n        $2`);
}

const svgs = {
  cols: profil("cols"),
  glacier: profil("glacier"),
  aiguilles: profil("aiguilles"),
};

let home = await readFile(HOME, "utf8");
// Remplace les trois marqueurs génériques par des marqueurs distincts si besoin
if (home.includes("<!-- gen:profil-svg -->")) {
  let n = 0;
  const keys = ["cols", "glacier", "aiguilles"];
  home = home.replace(
    /<!-- gen:profil-svg -->[\s\S]*?<!-- \/gen:profil-svg -->/g,
    () => {
      const key = keys[n++] || "cols";
      return `<!-- gen:profil-${key} -->\n        ${svgs[key]}\n        <!-- /gen:profil-${key} -->`;
    },
  );
} else {
  home = injectOnce(home, "profil-cols", svgs.cols);
  home = injectOnce(home, "profil-glacier", svgs.glacier);
  home = injectOnce(home, "profil-aiguilles", svgs.aiguilles);
}
await writeFile(HOME, home);

let page = await readFile(PAGE, "utf8");
for (const key of Object.keys(svgs)) {
  if (page.includes(`<!-- gen:profil-${key} -->`)) {
    page = injectAll(page, `profil-${key}`, svgs[key]);
  }
}
// Ancien marqueur unique → les trois versions pour comparaison
if (page.includes("<!-- gen:profil-svg -->")) {
  page = injectAll(
    page,
    "profil-svg",
    `${svgs.cols}\n        ${svgs.glacier}\n        ${svgs.aiguilles}`,
  );
}
await writeFile(PAGE, page);

console.log("Profils générés :", Object.keys(svgs).join(", "));
