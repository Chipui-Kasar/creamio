"use client";

import { Line } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { EQUIPMENT } from "@/data/equipment";
import type { ShopLayout } from "@/data/shopLayout";
import type { EquipmentId, Placement, SeatingConfig } from "@/types";
import { ChestFreezer } from "./models/ChestFreezer";
import { CoffeeMachine } from "./models/CoffeeMachine";
import { JuicerMixer } from "./models/JuicerMixer";
import { FoldingSeating, TableSeating } from "./models/Seating";
import { SoftyMachine } from "./models/SoftyMachine";
import { Stabilizer } from "./models/Stabilizer";
import { VisiCooler } from "./models/VisiCooler";
import { WashBasin } from "./models/WashBasin";

export interface EquipmentLayerProps {
  layout: ShopLayout;
  trim?: "auto" | "pink" | "teal" | "navy" | "gold";
  selected: EquipmentId | null;
  hovered: EquipmentId | null;
  visiCooler: boolean;
  seating: SeatingConfig;
  tableFolded: boolean;
  quiet?: boolean;
  onSelect: (id: EquipmentId) => void;
  onHover: (id: EquipmentId | null) => void;
}

/** Selection ring may need to cover props that spill outside the nominal footprint. */
const RING: Partial<Record<EquipmentId, { w: number; d: number; cx: number; cz: number }>> = {
  coffee: { w: 3.0, d: 1.35, cx: 0.4, cz: 0.15 },
  juicer: { w: 1.6, d: 1.9, cx: 0, cz: 0.3 },
  softy: { w: 1.9, d: 2.2, cx: 0, cz: 0.1 },
};
const HILITE = new THREE.Color("#ff7aa8");

/**
 * Wraps a model with pointer events, an emissive highlight (hover / selected),
 * a floor ring and a numbered hotspot pin.
 */
function Interactive({
  id,
  place,
  selected,
  hovered,
  quiet = false,
  onSelect,
  onHover,
  children,
}: {
  id: EquipmentId;
  place: Placement;
  selected: boolean;
  hovered: boolean;
  quiet?: boolean;
  onSelect: (id: EquipmentId) => void;
  onHover: (id: EquipmentId | null) => void;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  const level = useRef(0);
  const ring = useRef<THREE.Group>(null);

  // clone materials once so highlighting never leaks onto shared ones
  useLayoutEffect(() => {
    const list: THREE.MeshStandardMaterial[] = [];
    group.current?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.Material;
      if (!(mat instanceof THREE.MeshStandardMaterial)) return;
      if (mat.transparent && mat.opacity < 0.5) return; // leave glass alone
      const c = mat.clone();
      c.emissive = HILITE.clone();
      c.emissiveIntensity = 0;
      mesh.material = c;
      list.push(c);
    });
    mats.current = list;
    return () => {
      list.forEach((m) => m.dispose());
    };
  }, []);

  const { invalidate } = useThree();
  useFrame((state, dt) => {
    const target = quiet ? 0 : selected ? 0.085 : hovered ? 0.05 : 0;
    if (level.current === target) return;
    level.current = THREE.MathUtils.damp(level.current, target, 9, dt);
    if (Math.abs(level.current - target) < 0.002) level.current = target;
    for (const m of mats.current) m.emissiveIntensity = level.current;
    state.invalidate();
  });
  useEffect(() => {
    if (ring.current) ring.current.visible = !quiet && (selected || hovered);
    invalidate();
  }, [selected, hovered, quiet, invalidate]);

  const r = RING[id] ?? { w: place.w, d: place.d, cx: 0, cz: 0 };
  const hw = r.w / 2 + 0.12;
  const hd = r.d / 2 + 0.12;
  const pts: [number, number, number][] = [
    [r.cx - hw, 0.03, r.cz - hd],
    [r.cx + hw, 0.03, r.cz - hd],
    [r.cx + hw, 0.03, r.cz + hd],
    [r.cx - hw, 0.03, r.cz + hd],
    [r.cx - hw, 0.03, r.cz - hd],
  ];

  return (
    <group
      position={[place.x, place.y, place.z]}
      rotation={[0, place.rotY, 0]}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onHover(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (e.delta > 6) return; // was a drag, not a click
        e.stopPropagation();
        onSelect(id);
      }}
    >
      <group ref={group} userData={{ equipId: id }}>{children}</group>

      <group ref={ring} visible={false}>
        <Line points={pts} color={selected ? "#f9729b" : "#4db6ac"} lineWidth={2.6} />
        <mesh position={[r.cx, 0.02, r.cz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[hw * 2, hd * 2]} />
          <meshBasicMaterial color={selected ? "#f9729b" : "#4db6ac"} transparent opacity={0.14} depthWrite={false} />
        </mesh>
      </group>

    </group>
  );
}

/** Every piece of equipment, wired to selection + hover state. */
export function EquipmentLayer({
  layout,
  trim,
  selected,
  hovered,
  visiCooler,
  seating,
  tableFolded,
  quiet,
  onSelect,
  onHover,
}: EquipmentLayerProps) {
  const common = (id: EquipmentId) => ({
    id,
    selected: selected === id,
    hovered: hovered === id,
    quiet,
    onSelect,
    onHover,
  });
  const P = layout.placements;

  return (
    <>
      <Interactive {...common("freezer-400")} place={P["freezer-400"]}>
        <ChestFreezer variant="packed" w={P["freezer-400"].w} d={P["freezer-400"].d} h={P["freezer-400"].h} open={selected === "freezer-400"} badge="400 L" trim={trim} />
      </Interactive>

      <Interactive {...common("freezer-350")} place={P["freezer-350"]}>
        <ChestFreezer variant="scoop" w={P["freezer-350"].w} d={P["freezer-350"].d} h={P["freezer-350"].h} open={selected === "freezer-350"} badge="350 L" trim={trim} />
      </Interactive>

      <Interactive {...common("stabilizer")} place={P.stabilizer}>
        <Stabilizer />
      </Interactive>

      <Interactive {...common("softy")} place={P.softy}>
        <SoftyMachine />
      </Interactive>

      <Interactive {...common("juicer")} place={P.juicer}>
        <JuicerMixer />
      </Interactive>

      <Interactive {...common("coffee")} place={P.coffee}>
        <CoffeeMachine />
      </Interactive>

      {visiCooler && (
        <Interactive {...common("visi-cooler")} place={P["visi-cooler"]}>
          <VisiCooler open={selected === "visi-cooler"} />
        </Interactive>
      )}

      <Interactive {...common("sink")} place={P.sink}>
        <WashBasin />
      </Interactive>

      <Interactive key={seating} {...common("seating")} place={P.seating}>
        {seating === "table" ? <TableSeating /> : <FoldingSeating folded={tableFolded} />}
      </Interactive>
    </>
  );
}

export const EQUIPMENT_IDS = EQUIPMENT.map((e) => e.id);
