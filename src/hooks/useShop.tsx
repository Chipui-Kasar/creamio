"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_ROOM, SEAT_DEFAULT, clampRoom, computeLayout, type RoomSize, type ShopLayout } from "@/data/shopLayout";
import type { EquipmentId, LightingState, Quality, SeatingConfig, ThemeState, ViewId, WallId, WallMode } from "@/types";

export const DEFAULT_LIGHTING: LightingState = { intensity: 1, kelvin: 3600, downlights: true, cove: true, pendants: true, counterGlow: true };
export const DEFAULT_THEME: ThemeState = { floor: "oak", counter: "oak", trim: "auto" };
const WALL_IDS: WallId[] = ["back", "left", "right", "front", "ceiling"];
const AUTO_WALLS = Object.fromEntries(WALL_IDS.map((w) => [w, "auto"])) as Record<WallId, WallMode>;

interface ShopContextValue {
  walls: Record<WallId, WallMode>;
  setWall: (id: WallId, mode: WallMode) => void;
  cutaway: () => void;
  resetWalls: () => void;
  lighting: LightingState;
  setLighting: (p: Partial<LightingState>) => void;
  theme: ThemeState;
  setTheme: (p: Partial<ThemeState>) => void;
  quality: Quality;
  setQuality: (q: Quality) => void;
  dims: boolean;
  toggleDims: () => void;
  shutterOpen: boolean;
  toggleShutter: () => void;

  selected: EquipmentId | null;
  hovered: EquipmentId | null;
  view: ViewId;
  visiCooler: boolean;
  seating: SeatingConfig;
  tableFolded: boolean;
  /** Bumps whenever the camera should (re)fly to the current target, even if it did not change. */
  cameraNonce: number;
  room: RoomSize;
  layout: ShopLayout;
  setRoom: (r: Partial<RoomSize>) => void;
  resetRoom: () => void;
  select: (id: EquipmentId | null) => void;
  hover: (id: EquipmentId | null) => void;
  setView: (v: ViewId) => void;
  toggleVisi: () => void;
  setSeating: (s: SeatingConfig) => void;
  toggleFold: () => void;
  /** Jump to a camera view, scroll the 3D section into view. */
  showInShop: (opts: { view?: ViewId; select?: EquipmentId }) => void;
}

const Ctx = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<EquipmentId | null>(null);
  const [hovered, setHovered] = useState<EquipmentId | null>(null);
  const [view, setViewState] = useState<ViewId>("overview");
  const [visiCooler, setVisi] = useState(true);
  const [seating, setSeatingState] = useState<SeatingConfig>(SEAT_DEFAULT);
  const [tableFolded, setFolded] = useState(false);
  const [cameraNonce, setNonce] = useState(0);
  const [room, setRoomState] = useState<RoomSize>(DEFAULT_ROOM);
  const layout = useMemo(() => computeLayout(room, seating), [room, seating]);

  const [walls, setWalls] = useState<Record<WallId, WallMode>>(AUTO_WALLS);
  const [lighting, setLightingState] = useState<LightingState>(DEFAULT_LIGHTING);
  const [theme, setThemeState] = useState<ThemeState>(DEFAULT_THEME);
  const [quality, setQuality] = useState<Quality>("balanced");
  const [dims, setDims] = useState(false);
  const [shutterOpen, setShutter] = useState(true);
  const setWall = useCallback((id: WallId, mode: WallMode) => setWalls((w) => ({ ...w, [id]: mode })), []);
  const cutaway = useCallback(() => setWalls({ back: "show", left: "hide", right: "hide", front: "hide", ceiling: "hide" }), []);
  const resetWalls = useCallback(() => setWalls(AUTO_WALLS), []);
  const setLighting = useCallback((p: Partial<LightingState>) => setLightingState((l) => ({ ...l, ...p })), []);
  const setTheme = useCallback((p: Partial<ThemeState>) => setThemeState((t) => ({ ...t, ...p })), []);
  const toggleDims = useCallback(() => setDims((d) => !d), []);
  const toggleShutter = useCallback(() => setShutter((v) => !v), []);

  const bump = useCallback(() => setNonce((n) => n + 1), []);

  const select = useCallback(
    (id: EquipmentId | null) => {
      setSelected(id);
      bump();
    },
    [bump],
  );
  const setView = useCallback(
    (v: ViewId) => {
      setViewState(v);
      setSelected(null);
      bump();
    },
    [bump],
  );
  const toggleVisi = useCallback(() => {
    setVisi((v) => {
      if (v) setSelected((s) => (s === "visi-cooler" ? null : s));
      return !v;
    });
  }, []);
  const setSeating = useCallback((s: SeatingConfig) => {
    setSeatingState(s);
    setFolded(false);
  }, []);
  const setRoom = useCallback(
    (r: Partial<RoomSize>) => {
      setRoomState((cur) => clampRoom({ ...cur, ...r }));
      bump();
    },
    [bump],
  );
  const resetRoom = useCallback(() => {
    setRoomState(DEFAULT_ROOM);
    bump();
  }, [bump]);
  const toggleFold = useCallback(() => setFolded((f) => !f), []);

  const showInShop = useCallback(
    ({ view: v, select: id }: { view?: ViewId; select?: EquipmentId }) => {
      if (v) setViewState(v);
      setSelected(id ?? null);
      bump();
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [bump],
  );

  const value = useMemo<ShopContextValue>(
    () => ({
      selected,
      hovered,
      view,
      visiCooler,
      seating,
      tableFolded,
      walls,
      setWall,
      cutaway,
      resetWalls,
      lighting,
      setLighting,
      theme,
      setTheme,
      quality,
      setQuality,
      dims,
      toggleDims,
      shutterOpen,
      toggleShutter,
      cameraNonce,
      room,
      layout,
      setRoom,
      resetRoom,
      select,
      hover: setHovered,
      setView,
      toggleVisi,
      setSeating,
      toggleFold,
      showInShop,
    }),
    [walls, setWall, cutaway, resetWalls, lighting, setLighting, theme, setTheme, quality, dims, toggleDims, shutterOpen, toggleShutter, selected, hovered, view, visiCooler, seating, tableFolded, cameraNonce, room, layout, setRoom, resetRoom, select, setView, toggleVisi, setSeating, toggleFold, showInShop],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used inside <ShopProvider>");
  return v;
}
