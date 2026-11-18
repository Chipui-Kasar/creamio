import type { EquipmentId, Placement, SeatingConfig, ViewId } from "@/types";

/**
 * SHOP FLOOR PLAN ENGINE (units: feet).
 *
 * The room is adjustable (width × depth). `computeLayout()` derives every placement from the
 * room size, so the 3D scene, the hotspot pins, the floor-plan SVG and the stats always agree.
 *
 * Origin = room centre.  +x → east, +z → the shop front (glass + door), -z → back wall.
 *
 *            BACK WALL (z = -D/2)
 *  ┌────────────────────────────────────────────────────────┐
 *  │ 400L │ Stab.   │ Juicer · Coffee prep counter │ Visi    │  back run
 *  │ self │         │                               │ cooler  │
 *  │ serve│  lane   │      STAFF AISLE 2.6 ft  ──►  │ Sink    │
 *  │ glass│         │ Softy base │ 350 L glass-top  │         │  service counter
 *  │ top  │         └────────────┴──────────────────┘         │
 *  │ Seat │          customer queue lane         [ door ]      │
 *  └────────────────────────────────────────────────────────┘
 *            SHOP FRONT (z = +D/2)
 *
 * • The 400 L chest freezer is *customer self-serve*: glass top, against the west wall, reachable from the lane.
 * • The 350 L chest freezer is the *scooping counter*: glass top, customers look in from the front,
 *   staff scoop from the aisle behind it. It is the east half of the service counter.
 * • The visi cooler sits in the back-right corner (staff side, glass facing the aisle) so it never
 *   covers or blocks the 350 L counter or its customers.
 */

export interface RoomSize {
  width: number;
  depth: number;
}

/** Default shop: a rectangle, narrower side-to-side (12 ft) than front-to-back (13 ft). */
export const DEFAULT_ROOM: RoomSize = { width: 12, depth: 13 };

export const ROOM_LIMITS = {
  min: 12,
  /** Minimum depth: the west wall must fit freezer + cooler + seating (≈ 12 ft). */
  minDepth: 12,
  max: 18,
  step: 0.5,
  height: 9,
  wall: 0.3,
  counterHeight: 3,
} as const;

/** Fixed size of the staff block (back run + aisle + service counter), anchored to the NE corner. */
const BLOCK_W = 7.6;
const BACK_D = 2; // back run depth
const AISLE_D = 2.6; // staff aisle
const COUNTER_D = 2.2; // service counter depth
const FREEZER_D = 2.2;
const FREEZER_400_L = 4.3;
const FREEZER_350_L = 3.8;

export interface Rect {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export interface Box3 {
  id: string;
  min: [number, number, number];
  max: [number, number, number];
}

export interface Fixture {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
}

export interface ShopLayout {
  room: { width: number; depth: number; height: number; wall: number; hx: number; hz: number; counterHeight: number };
  door: { x: number; width: number; height: number };
  /** x of the west edge of the staff block. */
  bx: number;
  /** z of the aisle start / counter start / counter front. */
  zAisle: number;
  zCounter: number;
  zFront: number;
  prepCounter: Fixture;
  serviceBase: Fixture;
  placements: Record<EquipmentId, Placement>;
  seating: SeatingConfig;
  /** Floor finishes. */
  floors: { tile: Rect[]; wood: Rect[] };
  /** Solid volumes (for camera occlusion tests). */
  boxes: Box3[];
  /** Customer lane width beside the 400 L freezer (ft). */
  lane: number;
  /** Depth of the customer queue strip in front of the counter (ft). */
  frontStrip: number;
  warnings: string[];
}

function aabb(id: string, p: Placement): Box3 {
  const c = Math.abs(Math.cos(p.rotY));
  const s = Math.abs(Math.sin(p.rotY));
  const hw = (p.w * c + p.d * s) / 2;
  const hd = (p.w * s + p.d * c) / 2;
  return { id, min: [p.x - hw, p.y, p.z - hd], max: [p.x + hw, p.y + p.h, p.z + hd] };
}

const PI = Math.PI;

export const SEATING_INFO: Record<
  SeatingConfig,
  { id: SeatingConfig; name: string; summary: string; footprint: number; stowed: number }
> = {
  table: {
    id: "table",
    name: "Table + four chairs",
    summary: "A 2.4 ft square table with four tucked-in cafe chairs. Familiar and comfortable.",
    footprint: 16,
    stowed: 16,
  },
  foldable: {
    id: "foldable",
    name: "Wall-mounted fold-down table + stools",
    summary: "A 4.6 ft counter-height shelf on the west wall with four slim stools that tuck under.",
    footprint: 10.5,
    stowed: 2.3,
  },
};

export const SEAT_DEFAULT: SeatingConfig = "foldable";

export function clampRoom(r: RoomSize): RoomSize {
  const c = (v: number, lo: number) => Math.min(ROOM_LIMITS.max, Math.max(lo, Math.round(v / ROOM_LIMITS.step) * ROOM_LIMITS.step));
  return { width: c(r.width, ROOM_LIMITS.min), depth: c(r.depth, ROOM_LIMITS.minDepth) };
}

export function computeLayout(sizeIn: RoomSize, seating: SeatingConfig): ShopLayout {
  const { width: W, depth: D } = clampRoom(sizeIn);
  const E = W / 2; // east wall x
  const Wx = -W / 2; // west wall x
  const z0 = -D / 2; // back wall z
  const F = D / 2; // front wall z
  const H = ROOM_LIMITS.counterHeight;

  const bx = E - BLOCK_W;
  const zAisle = z0 + BACK_D;
  const zCounter = zAisle + AISLE_D;
  const zFront = zCounter + COUNTER_D;

  // ── back run ──
  // Wash bay = west end of the back run (the "dirty" end). Prep counter = the rest of the back run.
  const SINK_W = 2.6;
  const prepCounter: Fixture = { x: bx + SINK_W + (BLOCK_W - SINK_W) / 2, z: z0 + BACK_D / 2, w: BLOCK_W - SINK_W, d: BACK_D, h: H };
  const juicer: Placement = { id: "juicer", x: bx + SINK_W + 0.7, z: z0 + BACK_D / 2, y: H, rotY: 0, w: 1.1, d: 1.1, h: 1.9 };
  const coffee: Placement = { id: "coffee", x: bx + SINK_W + 1.9, z: z0 + BACK_D / 2 - 0.05, y: H, rotY: 0, w: 1.25, d: 1.1, h: 1.35 };

  // west edge of the 400 L freezer (customer self-serve, west wall)
  const f400x = Wx + FREEZER_D / 2 + 0.02;
  const gapX0 = Wx + FREEZER_D;
  const stabilizer: Placement = {
    id: "stabilizer",
    x: (gapX0 + bx) / 2,
    z: z0 + 0.36,
    y: 3.65,
    rotY: 0,
    w: 1.25,
    d: 0.7,
    h: 1.5,
  };

  // ── wash bay: back-left end of the back run, facing the aisle; as far from the scooping counter as the block allows ──
  const sink: Placement = { id: "sink", x: bx + SINK_W / 2, z: z0 + BACK_D / 2, y: 0, rotY: 0, w: SINK_W, d: 2, h: 3 };

  // ── service counter (customer-facing) ──
  const serviceBase: Fixture = { x: bx + 1.9, z: zCounter + COUNTER_D / 2, w: 3.8, d: COUNTER_D, h: H };
  const softy: Placement = { id: "softy", x: bx + 1.1, z: serviceBase.z - 0.1, y: H, rotY: 0, w: 1.75, d: 2.05, h: 2.9 };
  const f350: Placement = {
    id: "freezer-350",
    x: E - FREEZER_350_L / 2,
    z: zCounter + COUNTER_D / 2,
    y: 0,
    rotY: 0,
    w: FREEZER_350_L,
    d: FREEZER_D,
    h: 3,
  };

  // ── 400 L self-serve freezer: west wall, facing east into the customer lane ──
  const f400: Placement = {
    id: "freezer-400",
    x: f400x,
    z: z0 + FREEZER_400_L / 2 + 0.05,
    y: 0,
    rotY: PI / 2,
    w: FREEZER_400_L,
    d: FREEZER_D,
    h: 3,
  };

  // ── seating, front-left against the west wall ──
  const seatPlacement: Placement =
    seating === "foldable"
      ? { id: "seating", x: Wx + 0.65, z: F - 2.5, y: 0, rotY: 0, w: 1.3, d: 4.6, h: 3 }
      : { id: "seating", x: Wx + 2.05, z: F - 2.2, y: 0, rotY: 0, w: 4, d: 4, h: 3 };

  // ── visi cooler: customer side, west wall, between the self-serve freezer and the seating,
  //    glass door facing the lane. Nothing stands in front of its door, and it is nowhere near the sink or the counter.
  const gapStart = f400.z + FREEZER_400_L / 2;
  const gapEnd = seatPlacement.z - seatPlacement.d / 2;
  const visi: Placement = { id: "visi-cooler", x: Wx + 1.02, z: (gapStart + gapEnd) / 2, y: 0, rotY: PI / 2, w: 2, d: 2, h: 5.6 };

  const placements: Record<EquipmentId, Placement> = {
    "freezer-400": f400,
    "freezer-350": f350,
    stabilizer,
    softy,
    juicer,
    coffee,
    "visi-cooler": visi,
    sink,
    seating: seatPlacement,
  };

  const door = { x: bx + 2.6, width: 3, height: 7 };

  // floors: tile for the staff block, wood elsewhere
  const floors = {
    tile: [{ x0: bx, x1: E, z0, z1: zFront }],
    wood: [
      { x0: Wx, x1: bx, z0, z1: F },
      { x0: bx, x1: E, z0: zFront, z1: F },
    ],
  };

  // seating is checked with its real parts (table + chairs / shelf + stools), not one big block
  const seatBoxes: Box3[] =
    seating === "table"
      ? [
          { id: "seating", min: [seatPlacement.x - 1.2, 0, seatPlacement.z - 1.2], max: [seatPlacement.x + 1.2, 2.6, seatPlacement.z + 1.2] },
          ...[[0, -1], [0, 1], [-1, 0], [1, 0]].map(([dx, dz]): Box3 => ({
            id: "seating",
            min: [seatPlacement.x + dx * 1.35 - 0.65, 0, seatPlacement.z + dz * 1.35 - 0.65],
            max: [seatPlacement.x + dx * 1.35 + 0.65, 2.8, seatPlacement.z + dz * 1.35 + 0.65],
          })),
        ]
      : [
          { id: "seating", min: [Wx, 0, seatPlacement.z - 2.3], max: [Wx + 1.35, 3.1, seatPlacement.z + 2.3] },
          ...[-1.74, -0.58, 0.58, 1.74].map((dz): Box3 => ({
            id: "seating",
            min: [Wx + 0.65 + 0.5, 0, seatPlacement.z + dz - 0.44],
            max: [Wx + 0.65 + 1.4, 2.5, seatPlacement.z + dz + 0.44],
          })),
        ];

  const boxes: Box3[] = [
    ...Object.entries(placements).filter(([id]) => id !== "seating").map(([id, p]) => aabb(id, p)),
    ...seatBoxes,
    { id: "bin", min: [bx + 2.55, 0, zAisle + 0.1], max: [bx + 3.35, 1.6, zAisle + 0.9] },
    { id: "prep", min: [prepCounter.x - prepCounter.w / 2, 0, prepCounter.z - prepCounter.d / 2], max: [prepCounter.x + prepCounter.w / 2, H, prepCounter.z + prepCounter.d / 2] },
    { id: "base", min: [serviceBase.x - serviceBase.w / 2, 0, serviceBase.z - serviceBase.d / 2], max: [serviceBase.x + serviceBase.w / 2, H, serviceBase.z + serviceBase.d / 2] },
  ];

  // ── sanity checks ──
  const lane = bx - (Wx + FREEZER_D);
  const frontStrip = F - zFront;
  const warnings: string[] = [];
  if (lane < 1.79) warnings.push(`Customer lane beside the 400 L freezer is only ${lane.toFixed(1)} ft — widen the room to at least 10 ft.`);
  if (frontStrip < 3) warnings.push(`Queue lane in front of the counter is ${frontStrip.toFixed(1)} ft — aim for 3 ft or more.`);
  const seatMinZ = seatPlacement.z - seatPlacement.d / 2;
  const f400MaxZ = f400.z + FREEZER_400_L / 2;
  if (seatMinZ < f400MaxZ + 0.6) warnings.push("Seating is crowding the 400 L freezer — increase the depth.");
  if (stabilizer.x - stabilizer.w / 2 - gapX0 < 0.25) warnings.push("Stabilizer ventilation clearance is tight — widen the room.");

  return {
    room: { width: W, depth: D, height: ROOM_LIMITS.height, wall: ROOM_LIMITS.wall, hx: W / 2, hz: D / 2, counterHeight: H },
    door,
    bx,
    zAisle,
    zCounter,
    zFront,
    prepCounter,
    serviceBase,
    placements,
    seating,
    floors,
    boxes,
    lane,
    frontStrip,
    warnings,
  };
}

/** View labels. Camera poses are computed from the layout in lib/cameraPoses.ts. */
export const VIEWS: Record<ViewId, { label: string; hint: string }> = {
  overview: { label: "Overview", hint: "Cut-away three-quarter view" },
  front: { label: "Front counter", hint: "What a customer sees at the door" },
  seating: { label: "Seating", hint: "Customer corner" },
  equipment: { label: "Equipment line", hint: "Staff-side arrangement" },
  left: { label: "Left section", hint: "Cut-away from the west" },
  right: { label: "Right section", hint: "Cut-away from the east" },
  plan: { label: "Floor plan", hint: "Top-down, to scale" },
  walk: { label: "Walk-through", hint: "First person, WASD + mouse" },
};

export const VIEW_ORDER: ViewId[] = ["overview", "front", "seating", "equipment", "left", "right", "plan", "walk"];

/** Equipment that can be hidden from the scene. */
export const OPTIONAL_EQUIPMENT: EquipmentId[] = ["visi-cooler"];

/** Rough free-floor figures for the panel. */
export function floorStats(layout: ShopLayout, visiCooler: boolean, folded = false) {
  const room = layout.room.width * layout.room.depth;
  const fixed =
    4.3 * 2.2 +
    3.8 * 2.2 +
    layout.prepCounter.w * layout.prepCounter.d +
    layout.serviceBase.w * layout.serviceBase.d +
    2.6 * 2.0 +
    (visiCooler ? 4 : 0);
  const info = SEATING_INFO[layout.seating];
  const seats = layout.seating === "foldable" && folded ? info.stowed : info.footprint;
  const used = fixed + seats;
  return { room, used, free: room - used, freePct: Math.round(((room - used) / room) * 100) };
}
