import * as THREE from "three";

/**
 * Procedural, canvas-generated textures. No image downloads, tiny memory cost,
 * and crisp at any zoom because every one tiles seamlessly.
 */

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

function tex(c: HTMLCanvasElement, repeat: [number, number] = [1, 1], srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

/** Deterministic pseudo random so textures never shimmer between renders. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function grain(g: CanvasRenderingContext2D, w: number, h: number, amount: number, seed = 7) {
  const r = rng(seed);
  const img = g.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * amount;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
}

/** Warm oak planks. 1 repeat ≈ 2 ft × 2 ft. */
export function woodFloorTexture() {
  const { c, g } = canvas(1024, 1024);
  const r = rng(11);
  const plankW = 128;
  const tones = ["#d5ae7e", "#caa070", "#dcb88a", "#c69a69", "#d2aa78"];
  for (let i = 0; i < 8; i++) {
    const x = i * plankW;
    // each board is split in two staggered lengths
    const split = 180 + r() * 640;
    for (const [y0, y1] of [
      [0, split],
      [split, 1024],
    ]) {
      g.fillStyle = tones[Math.floor(r() * tones.length)];
      g.fillRect(x, y0, plankW, y1 - y0);
      // long grain
      for (let k = 0; k < 26; k++) {
        g.strokeStyle = `rgba(${120 + r() * 40},${80 + r() * 30},${40 + r() * 20},${0.05 + r() * 0.09})`;
        g.lineWidth = 0.6 + r() * 1.6;
        const gx = x + 4 + r() * (plankW - 8);
        g.beginPath();
        g.moveTo(gx, y0);
        g.bezierCurveTo(gx + (r() - 0.5) * 14, y0 + (y1 - y0) * 0.33, gx + (r() - 0.5) * 14, y0 + (y1 - y0) * 0.66, gx + (r() - 0.5) * 6, y1);
        g.stroke();
      }
      g.fillStyle = "rgba(60,36,18,0.55)";
      g.fillRect(x, y0, plankW, 2); // end joint
    }
    g.fillStyle = "rgba(60,36,18,0.45)";
    g.fillRect(x, 0, 2, 1024); // board gap
  }
  grain(g, 1024, 1024, 10, 3);
  return tex(c, [2.5, 2.5]);
}

/** Cream + mint 6 in. tile with soft grout for the staff area. 1 repeat = 1 ft². */
export function checkerTileTexture(a = "#fbf0dd", b = "#bfe6df") {
  const { c, g } = canvas(512, 512);
  const n = 4; // 4 tiles per repeat → 3 in. tiles; two repeats make 6 in. check
  const s = 512 / n;
  const r = rng(5);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      g.fillStyle = (x + y) % 2 === 0 ? a : b;
      g.fillRect(x * s, y * s, s, s);
      g.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.06})`;
      g.fillRect(x * s, y * s, s, s * 0.5);
    }
  g.strokeStyle = "rgba(120,110,95,0.45)";
  g.lineWidth = 3;
  for (let i = 0; i <= n; i++) {
    g.beginPath();
    g.moveTo(i * s, 0);
    g.lineTo(i * s, 512);
    g.moveTo(0, i * s);
    g.lineTo(512, i * s);
    g.stroke();
  }
  grain(g, 512, 512, 6, 9);
  return tex(c, [3, 3]);
}

/** Subway tile back-splash. */
export function subwayTileTexture(base = "#f6efe2", grout = "rgba(150,140,125,0.6)") {
  const { c, g } = canvas(512, 512);
  const rows = 8;
  const h = 512 / rows;
  const w = 128;
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 512);
  const r = rng(21);
  for (let y = 0; y < rows; y++) {
    const off = (y % 2) * (w / 2);
    for (let x = -1; x < 512 / w + 1; x++) {
      g.fillStyle = `rgba(255,255,255,${0.12 + r() * 0.12})`;
      g.fillRect(x * w + off + 2, y * h + 2, w - 4, h / 2);
      g.fillStyle = `rgba(0,0,0,${r() * 0.035})`;
      g.fillRect(x * w + off + 2, y * h + h / 2, w - 4, h / 2 - 2);
    }
    g.fillStyle = grout;
    g.fillRect(0, y * h, 512, 2.5);
    for (let x = -1; x < 512 / w + 1; x++) g.fillRect(x * w + off, y * h, 2.5, h);
  }
  return tex(c, [2, 2]);
}

/** Soft plaster / painted wall with a very faint mottle. */
export function plasterTexture(color = "#fff4e4") {
  const { c, g } = canvas(512, 512);
  g.fillStyle = color;
  g.fillRect(0, 0, 512, 512);
  const r = rng(77);
  for (let i = 0; i < 120; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "190,150,110"},${0.015 + r() * 0.025})`;
    g.beginPath();
    g.arc(r() * 512, r() * 512, 20 + r() * 80, 0, Math.PI * 2);
    g.fill();
  }
  grain(g, 512, 512, 7, 13);
  return tex(c, [2, 2]);
}

/** Vertical fluted wood panel for the counter front. 1 repeat ≈ 1 ft. */
export function flutedWoodTexture(base = "#b9885a") {
  const { c, g } = canvas(512, 512);
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 512);
  const n = 16;
  const w = 512 / n;
  const r = rng(31);
  for (let i = 0; i < n; i++) {
    const grd = g.createLinearGradient(i * w, 0, (i + 1) * w, 0);
    grd.addColorStop(0, "rgba(0,0,0,0.32)");
    grd.addColorStop(0.22, "rgba(255,235,200,0.18)");
    grd.addColorStop(0.55, "rgba(255,235,200,0.05)");
    grd.addColorStop(1, "rgba(0,0,0,0.38)");
    g.fillStyle = grd;
    g.fillRect(i * w, 0, w, 512);
    for (let k = 0; k < 6; k++) {
      g.strokeStyle = `rgba(80,48,22,${0.06 + r() * 0.08})`;
      g.lineWidth = 1 + r() * 1.5;
      const x = i * w + w * (0.2 + r() * 0.6);
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + (r() - 0.5) * 6, 512);
      g.stroke();
    }
  }
  grain(g, 512, 512, 8, 5);
  return tex(c, [1, 1]);
}

/** Plain wood (table tops, seats, shelves). */
export function woodTexture(base = "#c9996a") {
  const { c, g } = canvas(512, 256);
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 256);
  const r = rng(41);
  for (let i = 0; i < 70; i++) {
    g.strokeStyle = `rgba(${90 + r() * 40},${55 + r() * 25},${25 + r() * 15},${0.05 + r() * 0.1})`;
    g.lineWidth = 0.6 + r() * 2.2;
    const y = r() * 256;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(170, y + (r() - 0.5) * 20, 340, y + (r() - 0.5) * 20, 512, y + (r() - 0.5) * 6);
    g.stroke();
  }
  grain(g, 512, 256, 8, 2);
  return tex(c, [1, 1]);
}

/** Brushed stainless streaks (used as a roughnessMap so highlights streak). */
export function brushedTexture() {
  const { c, g } = canvas(256, 256);
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 256, 256);
  const r = rng(3);
  for (let i = 0; i < 900; i++) {
    const v = 90 + r() * 90;
    g.strokeStyle = `rgba(${v},${v},${v},0.35)`;
    g.lineWidth = 0.5 + r();
    const y = r() * 256;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y + (r() - 0.5) * 2);
    g.stroke();
  }
  return tex(c, [2, 2], false);
}

/** Waffle texture for cones (colour map). */
export function waffleTexture() {
  const { c, g } = canvas(512, 512);
  g.fillStyle = "#e9b469";
  g.fillRect(0, 0, 512, 512);
  const n = 12;
  const s = 512 / n;
  for (let i = -n; i < n * 2; i++) {
    g.strokeStyle = "#b9742c";
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(i * s, 0);
    g.lineTo(i * s + 512, 512);
    g.moveTo(i * s, 0);
    g.lineTo(i * s - 512, 512);
    g.stroke();
    g.strokeStyle = "rgba(255,225,160,0.55)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(i * s + 4, 0);
    g.lineTo(i * s + 516, 512);
    g.moveTo(i * s + 4, 0);
    g.lineTo(i * s - 508, 512);
    g.stroke();
  }
  grain(g, 512, 512, 16, 8);
  return tex(c, [3, 2]);
}

/** Orange skin / citrus texture. */
export function citrusTexture(base = "#f39a2d") {
  const { c, g } = canvas(256, 256);
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  const r = rng(61);
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? "255,200,110" : "170,70,10"},${0.06 + r() * 0.1})`;
    g.fillRect(r() * 256, r() * 256, 1.5, 1.5);
  }
  return tex(c, [2, 1]);
}

/** Orange / lemon slice face (segments + pith). */
export function citrusSliceTexture(rind = "#f08a1d", flesh = "#ffb44a") {
  const { c, g } = canvas(256, 256);
  g.fillStyle = rind;
  g.beginPath();
  g.arc(128, 128, 126, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff0cf";
  g.beginPath();
  g.arc(128, 128, 114, 0, Math.PI * 2);
  g.fill();
  const seg = 9;
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2 + 0.06;
    const a1 = ((i + 1) / seg) * Math.PI * 2 - 0.06;
    g.fillStyle = flesh;
    g.beginPath();
    g.moveTo(128 + Math.cos((a0 + a1) / 2) * 8, 128 + Math.sin((a0 + a1) / 2) * 8);
    g.arc(128, 128, 104, a0, a1);
    g.closePath();
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.22)";
    g.lineWidth = 2;
    for (let k = 0; k < 4; k++) {
      const a = a0 + ((a1 - a0) * (k + 1)) / 5;
      g.beginPath();
      g.moveTo(128 + Math.cos(a) * 22, 128 + Math.sin(a) * 22);
      g.lineTo(128 + Math.cos(a) * 94, 128 + Math.sin(a) * 94);
      g.stroke();
    }
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/** Strawberry seeds colour map. */
export function strawberryTexture() {
  const { c, g } = canvas(256, 256);
  g.fillStyle = "#e5214f";
  g.fillRect(0, 0, 256, 256);
  const r = rng(17);
  for (let i = 0; i < 70; i++) {
    const x = (i % 10) * 26 + (Math.floor(i / 10) % 2) * 13 + 8;
    const y = Math.floor(i / 10) * 36 + 12;
    g.fillStyle = "#ffe9a8";
    g.beginPath();
    g.ellipse(x, y, 2.3, 3.4, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = `rgba(0,0,0,${0.1 + r() * 0.1})`;
    g.fillRect(x - 1, y + 3, 3, 1);
  }
  return tex(c, [1, 1]);
}

/** Text / logo sign painted to a canvas, returned as a texture. */
export function labelTexture(
  lines: { text: string; size: number; color: string; weight?: string; family?: string; y: number; spacing?: number }[],
  w = 512,
  h = 256,
  bg = "transparent",
) {
  const { c, g } = canvas(w, h);
  if (bg !== "transparent") {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const l of lines) {
    g.font = `${l.weight ?? "600"} ${l.size}px ${l.family ?? "Montserrat, system-ui, sans-serif"}`;
    g.fillStyle = l.color;
    if (l.spacing) (g as unknown as { letterSpacing: string }).letterSpacing = `${l.spacing}px`;
    g.fillText(l.text, w / 2, l.y);
    if (l.spacing) (g as unknown as { letterSpacing: string }).letterSpacing = "0px";
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/** Load an image URL as a texture (used for the real brand logo on signs). */
export function loadImageTexture(url: string, onLoad?: () => void) {
  const t = new THREE.TextureLoader().load(url, onLoad);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Striped awning: teal / cream / pink / cream, echoing the brand's storefront. */
export function awningTexture(stripes = 14) {
  const { c, g } = canvas(1024, 256);
  const cols = ["#4db6ac", "#fff4e4", "#f9729b", "#fff4e4"];
  const w = 1024 / stripes;
  for (let i = 0; i < stripes; i++) {
    g.fillStyle = cols[i % cols.length];
    g.fillRect(i * w, 0, w + 1, 256);
  }
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, "rgba(0,0,0,0.0)");
  grd.addColorStop(1, "rgba(0,0,0,0.12)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 1024, 256);
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/** Chalk-style menu board painted on navy. */
export function menuBoardTexture(rows: { name: string; price: string }[], heading = "TODAY'S MENU") {
  const w = 1024;
  const h = 480;
  const { c, g } = canvas(w, h);
  g.fillStyle = "#14304f";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(255,246,233,0.35)";
  g.lineWidth = 3;
  g.strokeRect(18, 18, w - 36, h - 36);
  g.textBaseline = "middle";
  g.textAlign = "center";
  g.fillStyle = "#f9729b";
  g.font = "700 28px Montserrat, system-ui, sans-serif";
  (g as unknown as { letterSpacing: string }).letterSpacing = "10px";
  g.fillText(heading, w / 2, 62);
  (g as unknown as { letterSpacing: string }).letterSpacing = "0px";
  const colW = (w - 120) / 2;
  rows.forEach((r, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x0 = 60 + col * colW + (col ? 20 : 0);
    const y = 150 + row * 105;
    g.textAlign = "left";
    g.fillStyle = "#fff6e9";
    g.font = "600 34px Georgia, serif";
    g.fillText(r.name, x0, y);
    g.textAlign = "right";
    g.fillStyle = "#e6b56a";
    g.font = "700 32px Montserrat, system-ui, sans-serif";
    g.fillText(r.price, x0 + colW - 40, y);
    g.strokeStyle = "rgba(255,246,233,0.25)";
    g.setLineDash([2, 8]);
    g.beginPath();
    g.moveTo(x0, y + 34);
    g.lineTo(x0 + colW - 40, y + 34);
    g.stroke();
    g.setLineDash([]);
  });
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/** Pale terrazzo: cream base with pink / teal / gold chips. */
export function terrazzoTexture() {
  const { c, g } = canvas(512, 512);
  g.fillStyle = "#f6ece0";
  g.fillRect(0, 0, 512, 512);
  const r = rng(91);
  const cols = ["#f9a8c0", "#8fd3c9", "#e6b56a", "#14304f", "#ffffff", "#d9c7b0"];
  for (let i = 0; i < 520; i++) {
    g.fillStyle = cols[Math.floor(r() * cols.length)];
    g.globalAlpha = 0.55 + r() * 0.4;
    const x = r() * 512;
    const y = r() * 512;
    const w = 3 + r() * 10;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + w, y + r() * 4);
    g.lineTo(x + w * 0.7, y + w * 0.9);
    g.lineTo(x - 1, y + w * 0.5);
    g.closePath();
    g.fill();
  }
  g.globalAlpha = 1;
  grain(g, 512, 512, 6, 4);
  return tex(c, [4, 4]);
}
