export type EquipmentId =
  | "freezer-400"
  | "freezer-350"
  | "stabilizer"
  | "softy"
  | "juicer"
  | "coffee"
  | "visi-cooler"
  | "sink"
  | "seating";

export type SeatingConfig = "table" | "foldable";

export type ViewId = "overview" | "front" | "seating" | "equipment" | "left" | "right" | "plan" | "walk";

export type WallId = "back" | "left" | "right" | "front" | "ceiling";
export type WallMode = "auto" | "show" | "ghost" | "hide";
export type Quality = "fast" | "balanced" | "best";

export interface LightingState {
  /** Overall brightness multiplier (0.4 – 1.6). */
  intensity: number;
  /** Colour temperature in kelvin (2700 warm – 6500 daylight). */
  kelvin: number;
  downlights: boolean;
  cove: boolean;
  pendants: boolean;
  /** Under-counter LED glow. */
  counterGlow: boolean;
}

export interface ThemeState {
  floor: "oak" | "checker" | "terrazzo";
  counter: "oak" | "pink" | "mint" | "navy";
  trim: "auto" | "pink" | "teal" | "navy" | "gold";
}

export type EquipmentCategory =
  | "Ice-cream storage"
  | "Electrical"
  | "Ice-cream preparation"
  | "Fresh juice"
  | "Coffee"
  | "Chilled display"
  | "Washing"
  | "Customer seating";

export interface SpecRow {
  label: string;
  value: string;
}

export interface EquipmentSpec {
  id: EquipmentId;
  /** Number shown on the 3D hotspot and on the floor plan. */
  number: number;
  name: string;
  shortName: string;
  category: EquipmentCategory;
  /** Short role line, e.g. "Packed ice-cream storage". */
  role: string;
  /** Short chip shown on the 3D hotspot, e.g. "400 L". */
  tag?: string;
  description: string;
  specs: SpecRow[];
  placement: string;
  /** Material / finish, shown in the properties panel. */
  finish: string;
  /** Indicative connected load in kW (planning figure, not a nameplate value). */
  powerKw: number;
  optional?: boolean;
  /** Brand accent used for chips and the floor highlight. */
  accent: string;
  /** Camera framing used when the item is focused. */
  focus: { distance: number; height: number; lift?: number; swing?: number };
}

/** A placed object, in feet. x → east, z → towards the shop front, y → up. */
export interface Placement {
  id: EquipmentId;
  x: number;
  z: number;
  /** Elevation of the object's base above the floor. */
  y: number;
  /** Rotation about Y (radians). Local +z is the "front" of the appliance. */
  rotY: number;
  /** Footprint along local x / z. */
  w: number;
  d: number;
  h: number;
}

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Size / variant → price (placeholder numbers, edit in data/menu.ts). */
  prices: { label: string; price: number }[];
  art: "scoops" | "softy" | "juice" | "shake" | "coffee" | "cold";
  /** Optional photograph under /public/images. Falls back to illustrated art. */
  photo?: string;
  accent: string;
  tint: string;
  notes?: string[];
}
