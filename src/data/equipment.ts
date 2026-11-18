import type { EquipmentId, EquipmentSpec } from "@/types";

/**
 * Equipment catalogue. Everything the 3D scene, the panel, the hotspots and the
 * floor plan show comes from here — edit a spec or a model name in one place.
 *
 * NOTE: values are indicative planning figures for a typical unit of each class.
 * Confirm against the datasheet of the exact model you purchase before ordering
 * electrics, plumbing or furniture.
 */
export const BRAND = {
  navy: "#14304F",
  teal: "#4DB6AC",
  pink: "#F96B97",
  cream: "#FFF6E9",
  gold: "#E6B56A",
} as const;

export const EQUIPMENT: EquipmentSpec[] = [
  {
    id: "freezer-400",
    tag: "400 L",
    number: 1,
    name: "Deep Freezer — 400 Litres",
    shortName: "Deep freezer 400 L",
    category: "Ice-cream storage",
    role: "Self-serve packed ice cream · glass top",
    description:
      "Commercial horizontal display freezer with a sliding glass top, set against the west wall in the customer lane. Visitors look straight in, slide the glass and pick the packed tub or family pack they like — no staff needed. Stock is topped up from the same side.",
    specs: [
      { label: "Net capacity", value: "400 L" },
      { label: "Type", value: "Horizontal chest, 2-panel sliding glass top" },
      { label: "Use", value: "Customer self-serve — packed tubs, family packs, cones" },
      { label: "External size (approx.)", value: "4.3 × 2.2 × 3.0 ft  (130 × 68 × 90 cm)" },
      { label: "Temperature range", value: "−18 °C to −24 °C" },
      { label: "Clearance", value: "≥ 1.8 ft customer lane in front, 6 in. behind for airflow" },
    ],
    finish: "White powder-coated steel cabinet, aluminium-framed tempered glass top, teal trim",
    placement: "West wall, customer zone — front face towards the lane, glass top within reach.",
    powerKw: 0.28,
    accent: BRAND.teal,
    focus: { distance: 6.8, height: 2.6, lift: 4.2 },
  },
  {
    id: "freezer-350",
    tag: "350 L",
    number: 2,
    name: "Deep Freezer — 350 Litres",
    shortName: "Scooping counter 350 L",
    category: "Ice-cream storage",
    role: "Scooping counter · glass top",
    description:
      "The scooping counter. A glass-topped chest freezer forms the east half of the service counter: customers see every open flavour tub through the glass from the front, while staff slide the glass and scoop from the aisle behind. Nothing sits in front of it — the visi cooler stands on the west wall, well away from this counter.",
    specs: [
      { label: "Net capacity", value: "350 L" },
      { label: "Type", value: "Horizontal chest, 2-panel sliding glass top" },
      { label: "External size (approx.)", value: "3.8 × 2.2 × 3.0 ft  (115 × 68 × 90 cm)" },
      { label: "Flavours", value: "Up to 18 × 2 L tubs in the working basket tray" },
      { label: "Access", value: "Staff aisle 2.6 ft behind; open customer queue lane in front" },
      { label: "Extras", value: "Dipper well and scoop rest on the staff side" },
    ],
    finish: "White powder-coated steel cabinet, aluminium-framed tempered glass top, pink trim",
    placement: "Service counter, east half — glass top facing the queue, staff aisle behind.",
    powerKw: 0.22,
    accent: BRAND.pink,
    focus: { distance: 6.4, height: 2.4, lift: 3.2 },
  },
  {
    id: "stabilizer",
    tag: "7 KVA",
    number: 3,
    name: "Voltage Stabilizer — 7 KVA",
    shortName: "Stabilizer 7 KVA",
    category: "Electrical",
    role: "Protects every compressor in the shop",
    description:
      "A single-phase servo/relay stabilizer feeding all cold equipment. Wall-mounted high on the back wall, between the self-serve freezer and the prep counter: ventilated on three sides, reachable for the MCB and display, and clear of customer movement.",
    specs: [
      { label: "Rating", value: "7 KVA, single phase" },
      { label: "Input window", value: "≈ 140–280 V (typical)" },
      { label: "Output", value: "230 V ± 1–3% (typical)" },
      { label: "External size (approx.)", value: "1.25 × 0.7 × 1.5 ft  (38 × 21 × 46 cm)" },
      { label: "Mounting", value: "Wall bracket, 3.6 ft to underside" },
      { label: "Clearance", value: "≥ 3 in. each side (more as the room widens), 12 in. above" },
    ],
    finish: "Navy powder-coated steel housing, analogue + digital display",
    placement: "Back wall, beside the self-serve freezer — high, away from splashes.",
    powerKw: 0,
    accent: BRAND.gold,
    focus: { distance: 5.6, height: 4.4, swing: 0.2 },
  },
  {
    id: "softy",
    tag: "2 + 1",
    number: 4,
    name: "Softy Ice-Cream Machine — Double Compressor",
    shortName: "Softy machine",
    category: "Ice-cream preparation",
    role: "Two flavours + twist dispensing",
    description:
      "Commercial countertop softy machine with two independent compressors, one per hopper, so each flavour holds its own temperature. Three-nozzle head gives two single flavours and a twist. Sits behind the counter on a dedicated base cabinet with a clear dispensing apron.",
    specs: [
      { label: "Configuration", value: "2 flavours + twist (3 nozzles)" },
      { label: "Compressors", value: "2 (independent hopper refrigeration)" },
      { label: "Finish", value: "Stainless steel body, drip tray, nozzle housing" },
      { label: "External size (approx.)", value: "1.75 × 2.05 × 2.9 ft  (53 × 62 × 88 cm)" },
      { label: "Output (typical class)", value: "≈ 20–28 L / hour" },
      { label: "Dedicated supply", value: "Own 16 A circuit via the stabilizer" },
    ],
    finish: "Brushed stainless steel body, drip tray and nozzle housing",
    placement: "Service counter, behind the customer line.",
    powerKw: 2.2,
    accent: BRAND.pink,
    focus: { distance: 5.4, height: 4.6, swing: -0.25 },
  },
  {
    id: "juicer",
    number: 5,
    name: "Juicer Mixer Machine",
    shortName: "Juicer mixer",
    category: "Fresh juice",
    role: "Fresh juice & smoothie station",
    description:
      "Commercial-grade juicer mixer on a dedicated preparation counter. Fruit baskets and tall glasses sit within reach on the same counter, and the sink is one pace away for rinsing jars.",
    specs: [
      { label: "Type", value: "Commercial juicer mixer, heavy-duty motor base" },
      { label: "Jar", value: "1.8 L polycarbonate, lid-locked" },
      { label: "Motor (typical class)", value: "≈ 0.75 kW" },
      { label: "External size (approx.)", value: "1.1 × 1.1 × 1.9 ft" },
      { label: "Counter", value: "4.0 × 2.0 ft prep counter, wipe-clean top" },
      { label: "Stocked with", value: "Oranges, lemons, glasses, straws" },
    ],
    finish: "Brushed stainless base, polycarbonate jar",
    placement: "Back-run prep counter, back wall — a short step from the sink.",
    powerKw: 0.75,
    accent: "#F5A04A",
    focus: { distance: 4.6, height: 4.2, swing: -0.35 },
  },
  {
    id: "coffee",
    number: 6,
    name: "Agaro Espresso Coffee Machine",
    shortName: "Agaro coffee machine",
    category: "Coffee",
    role: "Freshly pulled espresso & lattes",
    description:
      "A real semi-automatic espresso machine — pump pressure, portafilter, group head and steam wand — not an instant dispenser. Sits in its own coffee corner of the prep counter, with cups, tamper, knock box and a milk jug beside it.",
    specs: [
      { label: "Make", value: "Agaro" },
      { label: "Type", value: "Semi-automatic espresso machine (portafilter)" },
      { label: "Pump pressure", value: "15 bar class" },
      { label: "Steam", value: "Steam wand for milk frothing" },
      { label: "External size (approx.)", value: "1.25 × 1.1 × 1.35 ft" },
      { label: "Confirm", value: "Exact Agaro model & wattage to be confirmed at purchase" },
    ],
    finish: "Black enamel body, stainless front plate and drip tray",
    placement: "Prep counter, beside the juicer — its own coffee corner.",
    powerKw: 1.3,
    accent: "#8A5A3C",
    focus: { distance: 4.4, height: 4.1, swing: -0.2 },
  },
  {
    id: "visi-cooler",
    tag: "Optional",
    number: 7,
    name: "Visi Cooler — Glass-Door Refrigerator",
    shortName: "Visi cooler",
    category: "Chilled display",
    role: "Cold drinks & fresh fruit (optional)",
    description:
      "Optional upright single-door visi cooler for packaged drinks and fresh fruit, with LED interior and four shelves. Stands on the west wall in the customer area, between the self-serve freezer and the seating, with its glass door facing the lane and a clear 2 ft in front so it opens freely. It is nowhere near the sink, the staff aisle or the scooping counter. Toggle it off to see the shop without it.",
    specs: [
      { label: "Type", value: "Upright single glass door, LED lit" },
      { label: "Capacity (typical class)", value: "≈ 200–250 L" },
      { label: "External size (approx.)", value: "2.0 × 2.0 × 5.6 ft  (60 × 60 × 170 cm)" },
      { label: "Temperature", value: "+2 °C to +8 °C" },
      { label: "Shelves", value: "4 adjustable wire shelves" },
      { label: "Status", value: "Optional — can be removed from the scene" },
    ],
    finish: "White steel cabinet, double-glazed glass door, navy lit sign box",
    placement: "West wall, customer zone — between the 400 L freezer and the seating, door facing the lane.",
    powerKw: 0.3,
    optional: true,
    accent: BRAND.teal,
    focus: { distance: 6.2, height: 3.2, lift: 3.4 },
  },
  {
    id: "sink",
    number: 8,
    name: "Washing Basin — Stainless Steel Sink",
    shortName: "Washing basin",
    category: "Washing",
    role: "Washing & cleaning station",
    description:
      "Stainless steel sink with a drain board, gooseneck mixer tap and a visible P-trap and waste run to the wall. Set in its own wash bay at the back-left end of the staff run — the dirty end — and as far as the block allows from the open scooping freezer, which is at the opposite end of the counter. A glass splash guard closes the bay on the prep-counter side, and the dry drain board acts as a buffer.",
    specs: [
      { label: "Bowl", value: "Single bowl 1.4 × 1.3 ft + 1 ft drain board" },
      { label: "Material", value: "Stainless steel 304, wipe-clean back-splash" },
      { label: "Tap", value: "Gooseneck mixer, swivel spout" },
      { label: "Drainage", value: "Strainer waste → P-trap → wall waste, floor drain nearby" },
      { label: "External size (approx.)", value: "2.6 × 2.0 × 3.0 ft" },
      { label: "Water", value: "Hot & cold feed (small under-sink heater)" },
    ],
    finish: "304 stainless steel, brushed finish, chrome mixer tap",
    placement: "Back wall, west end of the staff run — opposite end from the 350 L scooping counter, behind a glass splash guard.",
    powerKw: 0.0,
    accent: "#7DB9D6",
    focus: { distance: 5.6, height: 3.2, swing: 1.0 },
  },
  {
    id: "seating",
    number: 9,
    name: "Customer Seating — four seats",
    shortName: "Seating (4)",
    category: "Customer seating",
    role: "Two switchable arrangements",
    description:
      "Seating for four, in two options you can switch between: a small table with four chairs, or a wall-mounted fold-down table with four stools. In a compact shop the wall-mounted option saves roughly a third of the floor and folds away completely at close.",
    specs: [
      { label: "Capacity", value: "4 customers" },
      { label: "Option A", value: "2.4 ft square table + 4 chairs (4 × 4 ft block)" },
      { label: "Option B", value: "4.6 × 1.3 ft wall shelf at 3 ft + 4 stools" },
      { label: "Most space-efficient", value: "Option B — recommended for a compact room" },
      { label: "Circulation", value: "≥ 3 ft clear to the door in both layouts" },
    ],
    finish: "Oak table top, powder-coated frames, upholstered seats",
    placement: "Front-left, west wall — beside the self-serve freezer lane, clear of the door.",
    powerKw: 0,
    accent: BRAND.gold,
    focus: { distance: 7.2, height: 3.0, swing: 0.45 },
  },
];

export const EQUIPMENT_BY_ID = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e])) as Record<
  EquipmentId,
  EquipmentSpec
>;

/** Stabilizer capacity in kVA vs assumed 0.8 power factor. */
export const STABILIZER_KVA = 7;
export const POWER_FACTOR = 0.8;
export const LIGHTING_KW = 0.15;

export function connectedLoad(visiCooler: boolean) {
  const kw =
    EQUIPMENT.filter((e) => e.id !== "visi-cooler" || visiCooler).reduce((s, e) => s + e.powerKw, 0) +
    LIGHTING_KW;
  const capacityKw = STABILIZER_KVA * POWER_FACTOR;
  return { kw, capacityKw, pct: Math.min(100, Math.round((kw / capacityKw) * 100)) };
}
