import * as THREE from "three";
import {
  brushedTexture,
  checkerTileTexture,
  terrazzoTexture,
  flutedWoodTexture,
  plasterTexture,
  subwayTileTexture,
  woodFloorTexture,
  woodTexture,
} from "./textures";

const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
const phys = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p);

function build() {
  const brushed = brushedTexture();
  const m = {
    // metals
    stainless: std({ color: "#dfe3e6", metalness: 1, roughness: 0.3, roughnessMap: brushed, envMapIntensity: 1.1 }),
    stainlessDark: std({ color: "#aeb4b9", metalness: 1, roughness: 0.38, roughnessMap: brushed, envMapIntensity: 1 }),
    chrome: std({ color: "#ffffff", metalness: 1, roughness: 0.07, envMapIntensity: 1.3 }),
    brass: std({ color: "#d9b26a", metalness: 1, roughness: 0.28 }),
    // painted
    enamel: std({ color: "#f7f4ee", metalness: 0.05, roughness: 0.36 }),
    cream: std({ color: "#fff1dc", roughness: 0.55 }),
    pink: std({ color: "#f9729b", roughness: 0.42 }),
    blush: std({ color: "#ffd9e3", roughness: 0.5 }),
    peach: std({ color: "#ffd2b4", roughness: 0.55 }),
    teal: std({ color: "#4db6ac", roughness: 0.42 }),
    mint: std({ color: "#bfe6df", roughness: 0.5 }),
    navy: std({ color: "#14304f", roughness: 0.4, metalness: 0.15 }),
    gold: std({ color: "#e6b56a", roughness: 0.38, metalness: 0.2 }),
    black: std({ color: "#17191c", roughness: 0.5, metalness: 0.2 }),
    charcoal: std({ color: "#33383d", roughness: 0.55, metalness: 0.3 }),
    rubber: std({ color: "#1f2124", roughness: 0.85 }),
    plastic: std({ color: "#eceff0", roughness: 0.4 }),
    // organic
    wood: std({ color: "#ffffff", map: woodTexture(), roughness: 0.62 }),
    woodDark: std({ color: "#8a5e3c", map: woodTexture("#8d6240"), roughness: 0.6 }),
    woodLight: std({ color: "#ffffff", map: woodTexture("#dcb98f"), roughness: 0.6 }),
    fluted: std({ color: "#ffffff", map: flutedWoodTexture(), roughness: 0.6 }),
    fabricPink: std({ color: "#f48aa9", roughness: 0.95 }),
    fabricTeal: std({ color: "#5cbdb3", roughness: 0.95 }),
    fabricCream: std({ color: "#f6e5c8", roughness: 0.95 }),
    fabricGold: std({ color: "#e8b866", roughness: 0.95 }),
    // glass
    glass: phys({
      color: "#e8fbf8",
      transparent: true,
      opacity: 0.18,
      roughness: 0.03,
      metalness: 0,
      envMapIntensity: 1.8,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    glassTint: phys({
      color: "#cfeee9",
      transparent: true,
      opacity: 0.32,
      roughness: 0.05,
      envMapIntensity: 1.6,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    polycarb: phys({
      color: "#f2fbff",
      transparent: true,
      opacity: 0.3,
      roughness: 0.08,
      envMapIntensity: 1.4,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    water: std({ color: "#9ed4ec", transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.1 }),
    // light / screens (basic = unlit glow)
    // emissive colours are >1 so only they cross the bloom threshold in the "Best" preset
    ledWarm: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffe7bd").multiplyScalar(1.9), toneMapped: true }),
    ledCool: new THREE.MeshBasicMaterial({ color: "#f3fbff" }),
    ledGreen: new THREE.MeshBasicMaterial({ color: new THREE.Color("#58f08b").multiplyScalar(1.8) }),
    ledRed: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff5b5b").multiplyScalar(1.8) }),
    ledAmber: new THREE.MeshBasicMaterial({ color: "#ffb347" }),
    screen: new THREE.MeshBasicMaterial({ color: "#7fe4d6" }),
    // food
    vanilla: std({ color: "#fbe9b8", roughness: 0.7 }),
    strawberry: std({ color: "#ff8fb0", roughness: 0.7 }),
    chocolate: std({ color: "#6b3f2a", roughness: 0.7 }),
    mango: std({ color: "#ffbf47", roughness: 0.7 }),
    pistachio: std({ color: "#b6d98b", roughness: 0.7 }),
    blueberry: std({ color: "#9a8fe0", roughness: 0.7 }),
    orange: std({ color: "#f39a2d", roughness: 0.55 }),
    lemon: std({ color: "#f6d845", roughness: 0.55 }),
    juice: std({ color: "#ffa42c", transparent: true, opacity: 0.88, roughness: 0.15 }),
    coffee: std({ color: "#3b2418", roughness: 0.25 }),
    crema: std({ color: "#b17848", roughness: 0.45 }),
    ceramic: std({ color: "#fdf9f1", roughness: 0.18, metalness: 0 }),
    frost: std({ color: "#eaf7ff", roughness: 0.9, transparent: true, opacity: 0.85 }),
    // architecture
    floorWood: std({ color: "#ffffff", map: woodFloorTexture(), roughness: 0.52 }),
    floorTile: std({ color: "#ffffff", map: checkerTileTexture(), roughness: 0.28, metalness: 0 }),
    floorTerrazzo: std({ color: "#ffffff", map: terrazzoTexture(), roughness: 0.3 }),
    wallCream: std({ color: "#ffffff", map: plasterTexture("#fff3e2"), roughness: 0.92 }),
    wallPink: std({ color: "#ffffff", map: plasterTexture("#ffd9e1"), roughness: 0.92 }),
    wallMint: std({ color: "#ffffff", map: plasterTexture("#c8eae4"), roughness: 0.92 }),
    tile: std({ color: "#ffffff", map: subwayTileTexture("#f7f1e4"), roughness: 0.25 }),
    tileMint: std({ color: "#ffffff", map: subwayTileTexture("#bfe4dd"), roughness: 0.22 }),
    ceiling: std({ color: "#fffaf1", roughness: 0.95 }),
    concrete: std({ color: "#c9c4bb", roughness: 0.92 }),
  };
  return m;
}

export type Mats = ReturnType<typeof build>;
let cache: Mats | null = null;

/** Lazily built, shared material kit (client only). */
export function getMaterials(): Mats {
  if (!cache) cache = build();
  return cache;
}

/** Clone a textured material with its own UV repeat (so one texture fits any surface size). */
export function tiled(src: THREE.MeshStandardMaterial, rx: number, ry: number) {
  const m = src.clone();
  if (src.map) {
    m.map = src.map.clone();
    m.map.repeat.set(rx, ry);
    m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping;
    m.map.needsUpdate = true;
  }
  return m;
}
