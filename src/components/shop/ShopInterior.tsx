"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Fixture, ShopLayout } from "@/data/shopLayout";
import { getMaterials, tiled } from "@/lib/materials";
import { kelvinToColor } from "@/lib/kelvin";
import type { EquipmentId, LightingState, Quality, ThemeState, WallId, WallMode } from "@/types";
import { EquipmentLayer } from "./Equipment";
import { Box, Cyl, PI } from "./models/parts";
import { ShopShell } from "./ShopShell";

export interface ShopInteriorProps {
  layout: ShopLayout;
  walls: Record<WallId, WallMode>;
  lighting: LightingState;
  theme: ThemeState;
  quality: Quality;
  shutterOpen: boolean;
  selected: EquipmentId | null;
  hovered: EquipmentId | null;
  visiCooler: boolean;
  tableFolded: boolean;
  planMode: boolean;
  quiet?: boolean;
  onSelect: (id: EquipmentId) => void;
  onHover: (id: EquipmentId | null) => void;
}

/* ───────────────────── lighting ───────────────────── */
function Lighting({ L, lighting, shadowSize }: { L: ShopLayout; lighting: LightingState; shadowSize: number }) {
  const { width: W, depth: D } = L.room;
  const span = Math.max(W, D);
  const seat = L.placements.seating;
  const reach = span * 0.8;
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const k = kelvinToColor(lighting.kelvin);
  const i = lighting.intensity;
  const warm = `#${k.getHexString()}`;
  const sky = `#${k.clone().lerp(new THREE.Color("#ffffff"), 0.55).getHexString()}`;
  const sun = `#${k.clone().lerp(new THREE.Color("#ffffff"), 0.7).getHexString()}`;
  useLayoutEffect(() => {
    scene.environmentIntensity = 0.6 + 0.4 * i;
    invalidate();
  }, [scene, i, invalidate]);
  return (
    <>
      <hemisphereLight args={[sky, "#f4d6c4", 0.85 * i]} />
      {/* daylight through the shopfront */}
      <directionalLight
        castShadow
        position={[span * 0.6, span * 1.4, span * 1.1]}
        intensity={1.9 * i}
        color={sun}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-left={-reach}
        shadow-camera-right={reach}
        shadow-camera-top={reach}
        shadow-camera-bottom={-reach}
        shadow-camera-near={2}
        shadow-camera-far={span * 3.4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={4}
      />
      {/* warm pendant / downlight fills (no shadows — cheap) */}
      {lighting.pendants && (
        <>
          <pointLight position={[seat.x + 1, 6.6, seat.z]} intensity={9 * i} distance={14} decay={1.6} color={warm} />
          <pointLight position={[L.door.x, 6.8, L.zFront + 1.4]} intensity={9 * i} distance={14} decay={1.6} color={warm} />
        </>
      )}
      {lighting.downlights && (
        <>
          <pointLight position={[L.bx + 2, 7.6, L.zAisle + 1.3]} intensity={10 * i} distance={15} decay={1.6} color={warm} />
          <pointLight position={[-W / 2 + 2.2, 7.2, L.placements["freezer-400"].z + 0.5]} intensity={8 * i} distance={12} decay={1.6} color={warm} />
        </>
      )}
      {lighting.cove && <pointLight position={[0, 8.4, -D / 2 + 0.8]} intensity={5 * i} distance={12} decay={1.6} color={warm} />}
      <Environment resolution={256} frames={1} background={false}>
        <Lightformer form="rect" intensity={2.2} color="#fff3e0" position={[0, 9, 0]} rotation-x={Math.PI / 2} scale={[span * 1.4, span * 1.4, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#ffe9cc" position={[0, 4, span * 0.9]} scale={[span * 1.4, 6, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#ffd6e2" position={[-span * 0.9, 4, 0]} rotation-y={Math.PI / 2} scale={[span * 1.2, 6, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#d3f1ec" position={[span * 0.9, 4, 0]} rotation-y={-Math.PI / 2} scale={[span * 1.2, 6, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[0, 4, -span * 0.9]} rotation-y={Math.PI} scale={[span * 1.2, 6, 1]} />
      </Environment>
    </>
  );
}

/* ───────────────────── floors ───────────────────── */
function Floors({ L, floor }: { L: ShopLayout; floor: ThemeState["floor"] }) {
  const m = getMaterials();
  const { width: W, depth: D, hz } = L.room;
  const rects = useMemo(() => {
    const mk = (r: { x0: number; x1: number; z0: number; z1: number }, kind: "wood" | "tile") => {
      const w = r.x1 - r.x0;
      const d = r.z1 - r.z0;
      const customer = kind === "wood";
      let mat;
      if (floor === "checker") mat = tiled(m.floorTile, w / 2, d / 2);
      else if (floor === "terrazzo" && customer) mat = tiled(m.floorTerrazzo, w / 4, d / 4);
      else mat = customer ? tiled(m.floorWood, w / 4, d / 4) : tiled(m.floorTile, w / 2, d / 2);
      return { x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2, w, d, mat };
    };
    return [...L.floors.tile.map((r) => mk(r, "tile")), ...L.floors.wood.map((r) => mk(r, "wood"))];
  }, [m, L, floor]);
  return (
    <group>
      {rects.map((r, i) => (
        <mesh key={i} position={[r.x, 0, r.z]} rotation={[-PI / 2, 0, 0]} receiveShadow material={r.mat}>
          <planeGeometry args={[r.w, r.d]} />
        </mesh>
      ))}
      {/* brass threshold where the staff aisle opens onto the customer floor */}
      <Box s={[0.06, 0.015, L.zCounter - L.zAisle]} p={[L.bx, 0.008, (L.zAisle + L.zCounter) / 2]} m={m.brass} cast={false} />
      {/* base slab + sidewalk so the shop reads as a built object */}
      <Box s={[W + 0.9, 0.4, D + 0.9]} p={[0, -0.21, 0]} m={m.concrete} cast={false} />
      <Box s={[W + 0.9, 0.4, 3]} p={[0, -0.21, hz + 2.4]} m={m.concrete} cast={false} />
      {/* door mat */}
      <Box s={[2.6, 0.03, 1.5]} p={[L.door.x, 0.02, hz - 0.9]} m={m.navy} radius={0.01} cast={false} />
    </group>
  );
}

/* ───────────────────── counters + fixtures ───────────────────── */
const COUNTER_TINT: Record<ThemeState["counter"], string> = { oak: "#ffffff", pink: "#f2a4bd", mint: "#a6e0d6", navy: "#6f89a8" };

function Cabinet({ f, doors, topMat, tint, glow }: { f: Fixture; doors: number; topMat?: THREE.Material; tint: string; glow: boolean }) {
  const m = getMaterials();
  const { w, d, h } = f;
  const fluted = useMemo(() => {
    const c = tiled(m.fluted, w / 1.4, 1.6);
    c.color = new THREE.Color(tint);
    return c;
  }, [m, w, tint]);
  const kick = 0.28;
  const dw = (w - 0.08) / doors;
  return (
    <group position={[f.x, 0, f.z]}>
      <Box s={[w - 0.04, kick, d - 0.1]} p={[0, kick / 2, -0.02]} m={m.charcoal} />
      {glow && <Box s={[w - 0.1, 0.035, 0.03]} p={[0, kick + 0.02, d / 2 - 0.12]} m={m.ledWarm} cast={false} />}
      <Box s={[w, h - kick - 0.1, d - 0.06]} p={[0, kick + (h - kick - 0.1) / 2, -0.01]} m={m.cream} radius={0.02} />
      {Array.from({ length: doors }).map((_, i) => (
        <group key={i} position={[-w / 2 + 0.04 + dw * (i + 0.5), kick + (h - kick - 0.12) / 2, d / 2 - 0.015]}>
          <Box s={[dw - 0.04, h - kick - 0.14, 0.035]} m={fluted} radius={0.008} />
          <Cyl rad={0.014} h={0.38} p={[i % 2 ? -dw / 2 + 0.12 : dw / 2 - 0.12, 0.45, 0.06]} m={m.brass} seg={8} />
        </group>
      ))}
      <Box s={[w + 0.06, 0.1, d + 0.1]} p={[0, h - 0.05, 0.02]} m={topMat ?? m.woodLight} radius={0.02} />
    </group>
  );
}

function Shelf({ x, y, z, w }: { x: number; y: number; z: number; w: number }) {
  const m = getMaterials();
  return (
    <group position={[x, y, z]}>
      <Box s={[w, 0.08, 0.55]} m={m.woodLight} radius={0.015} />
      {[-1, 1].map((s) => (
        <Box key={s} s={[0.04, 0.25, 0.4]} p={[s * (w / 2 - 0.25), -0.16, -0.05]} m={m.brass} cast={false} />
      ))}
    </group>
  );
}

/** Wall shelves above the prep counter: cups, jars, cone boxes, a trailing plant. */
function ShelfStock({ L }: { L: ShopLayout }) {
  const m = getMaterials();
  const cups = useRef<THREE.InstancedMesh>(null);
  const x0 = L.bx + 2.8; // over the prep counter, not the sink
  const zs = -L.room.hz + 0.3;
  useLayoutEffect(() => {
    if (!cups.current) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const cols = ["#14304f", "#4db6ac", "#f9729b", "#fff4e4"];
    let n = 0;
    for (let s = 0; s < 2; s++)
      for (let i = 0; i < 5; i++) {
        o.position.set(x0 + 0.1 + s * 0.95 + i * 0.16, 5.62, zs);
        o.updateMatrix();
        cups.current.setMatrixAt(n, o.matrix);
        cups.current.setColorAt(n, c.set(cols[(i + s) % 4]));
        n++;
      }
    cups.current.instanceMatrix.needsUpdate = true;
    if (cups.current.instanceColor) cups.current.instanceColor.needsUpdate = true;
  }, [x0, zs]);
  return (
    <group>
      <Shelf x={x0 + 1.1} y={5.4} z={zs} w={2.3} />
      <Shelf x={x0 + 1.1} y={6.4} z={zs} w={2.3} />
      <instancedMesh ref={cups} args={[undefined, undefined, 10]} castShadow>
        <cylinderGeometry args={[0.1, 0.075, 0.36, 14]} />
        <meshStandardMaterial roughness={0.45} />
      </instancedMesh>
      {[0.4, 0.95].map((dx, i) => (
        <group key={dx} position={[x0 + dx, 6.44, zs]}>
          <Cyl rad={0.2} h={0.5} p={[0, 0.25, 0]} m={m.polycarb} seg={20} />
          <Cyl rad={0.17} h={0.34} p={[0, 0.19, 0]} m={i ? m.pistachio : m.strawberry} seg={18} cast={false} />
          <Cyl rad={0.21} h={0.07} p={[0, 0.54, 0]} m={m.brass} seg={20} />
        </group>
      ))}
      {[1.3, 1.75].map((dx, i) => (
        <group key={dx} position={[x0 + dx, 6.44, zs]}>
          <Box s={[0.4, 0.5, 0.35]} p={[0, 0.25, 0]} m={i ? m.pink : m.teal} radius={0.02} />
          <Cyl rad={0.1} rb={0.0} h={0.34} p={[0.0, 0.67, 0]} m={m.gold} seg={14} />
        </group>
      ))}
      <group position={[x0 + 2.1, 6.44, zs]}>
        <Cyl rad={0.17} rb={0.12} h={0.3} p={[0, 0.15, 0]} m={m.cream} seg={16} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.1) * 0.12, 0.38 + (i % 3) * 0.08, Math.sin(i * 1.1) * 0.12]} rotation={[0.3, i, 0.4]} castShadow>
            <sphereGeometry args={[0.1, 8, 6]} />
            <meshStandardMaterial color="#5f9c63" roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Pendants({ L, on }: { L: ShopLayout; on: boolean }) {
  const m = getMaterials();
  const seat = L.placements.seating;
  const list: [number, number][] = [
    [seat.x + (L.seating === "foldable" ? 1.4 : 0), seat.z],
    [L.door.x, L.zFront + 1.6],
  ];
  return (
    <>
      {list.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Cyl rad={0.01} h={1.8} p={[0, L.room.height - 0.9, 0]} m={m.black} seg={4} cast={false} />
          <Cyl rad={0.12} h={0.14} p={[0, 7.15, 0]} m={m.brass} seg={16} cast={false} />
          <mesh position={[0, 6.8, 0]} material={on ? m.ledWarm : m.cream}>
            <sphereGeometry args={[0.3, 20, 16]} />
          </mesh>
          <mesh position={[0, 6.8, 0]} material={m.glass}>
            <sphereGeometry args={[0.34, 20, 16]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Topping station on the east end of the prep counter: jars of sprinkles, chips, nuts, cherries and crumble. */
function ToppingStation({ L }: { L: ShopLayout }) {
  const m = getMaterials();
  const x0 = L.room.hx - 0.75;
  const z0 = -L.room.hz;
  const fills = [m.strawberry, m.chocolate, m.mango, m.pistachio, m.blueberry, m.vanilla];
  return (
    <group position={[x0, L.room.counterHeight, z0]}>
      <Box s={[1.45, 0.04, 1.7]} p={[0.0, 0.02, 1.0]} m={m.stainless} radius={0.02} />
      {fills.map((f, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <group key={i} position={[-0.25 + col * 0.5, 0.04, 0.4 + row * 0.55]}>
            <Cyl rad={0.21} h={0.56} p={[0, 0.28, 0]} m={m.polycarb} seg={20} />
            <Cyl rad={0.185} h={0.4} p={[0, 0.21, 0]} m={f} seg={18} cast={false} />
            <Cyl rad={0.22} h={0.07} p={[0, 0.6, 0]} m={m.brass} seg={20} />
            <Cyl rad={0.02} h={0.3} p={[0.12, 0.7, 0]} r={[0, 0, 0.5]} m={m.stainless} seg={6} cast={false} />
          </group>
        );
      })}
      <Box s={[0.45, 0.3, 0.3]} p={[0.0, 0.2, 1.62]} m={m.cream} radius={0.03} />
    </group>
  );
}

/** Glass splash guard on the east end of the wash bay: keeps water and suds off the prep counter and the ice-cream side. */
function SplashGuard({ L }: { L: ShopLayout }) {
  const m = getMaterials();
  const x = L.bx + 2.62;
  const z0 = -L.room.hz;
  return (
    <group position={[x, L.room.counterHeight, z0 + 0.05]}>
      <Box s={[0.03, 1.7, 1.55]} p={[0, 0.85, 0.78]} m={m.glass} cast={false} />
      <Box s={[0.06, 0.04, 1.6]} p={[0, 1.71, 0.78]} m={m.stainless} cast={false} />
      <Box s={[0.06, 0.04, 1.6]} p={[0, 0.02, 0.78]} m={m.stainless} cast={false} />
      <Box s={[0.06, 1.7, 0.04]} p={[0, 0.85, 1.58]} m={m.stainless} cast={false} />
      {/* hand-wash sign */}
      <Box s={[0.012, 0.32, 0.32]} p={[-0.02, 1.0, 0.78]} m={m.teal} cast={false} />
    </group>
  );
}

/** Pay-and-collect end of the service counter: card terminal, receipt printer, cone and cup rack. */
function ServePoint({ L }: { L: ShopLayout }) {
  const m = getMaterials();
  const b = L.serviceBase;
  const cones = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!cones.current) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < 6; i++) {
      o.position.set((i % 3) * 0.2 - 0.2, 0.34 + Math.floor(i / 3) * 0.0, Math.floor(i / 3) * 0.2 - 0.1);
      o.updateMatrix();
      cones.current.setMatrixAt(i, o.matrix);
    }
    cones.current.instanceMatrix.needsUpdate = true;
  }, []);
  const x = b.x + 0.55; // right of the softy machine
  return (
    <group position={[x, b.h, b.z - 0.3]}>
      {/* POS: tablet on a stand, card reader, receipt printer */}
      <Box s={[0.5, 0.04, 0.4]} p={[0.55, 0.02, 0.3]} m={m.charcoal} radius={0.02} />
      <Box s={[0.38, 0.27, 0.025]} p={[0.55, 0.28, 0.2]} r={[-0.25, 0, 0]} m={m.black} radius={0.015} />
      <Box s={[0.3, 0.2, 0.012]} p={[0.55, 0.285, 0.213]} r={[-0.25, 0, 0]} m={m.screen} cast={false} />
      <Box s={[0.16, 0.05, 0.28]} p={[0.28, 0.07, 0.4]} m={m.charcoal} radius={0.02} />
      <Box s={[0.28, 0.2, 0.3]} p={[0.85, 0.12, 0.2]} m={m.cream} radius={0.03} />
      {/* cone rack: stacked waffle cones in a stainless tray */}
      <group position={[1.35, 0, 0.35]}>
        <Box s={[0.7, 0.05, 0.5]} p={[0, 0.025, 0]} m={m.stainless} radius={0.02} />
        <instancedMesh ref={cones} args={[undefined, undefined, 6]} castShadow>
          <coneGeometry args={[0.09, 0.5, 14]} />
          <meshStandardMaterial color="#e6b56a" roughness={0.7} />
        </instancedMesh>
      </group>
    </group>
  );
}

function Fixtures({ L, theme, lighting }: { L: ShopLayout; theme: ThemeState; lighting: LightingState }) {
  const m = getMaterials();
  return (
    <group>
      <Cabinet f={L.prepCounter} doors={3} tint={COUNTER_TINT[theme.counter]} glow={lighting.counterGlow} />
      <Cabinet f={L.serviceBase} doors={2} tint={COUNTER_TINT[theme.counter]} glow={lighting.counterGlow} />
      <ShelfStock L={L} />
      <ToppingStation L={L} />
      <SplashGuard L={L} />
      <ServePoint L={L} />
      <Pendants L={L} on={lighting.pendants} />
      {/* pedal bin at the aisle entrance */}
      <group position={[L.bx + 2.95, 0, L.zAisle + 0.5]}>
        <Cyl rad={0.4} rb={0.36} h={1.55} p={[0, 0.78, 0]} m={m.stainless} seg={28} />
        <Cyl rad={0.42} h={0.1} p={[0, 1.58, 0]} m={m.charcoal} seg={28} />
        <Box s={[0.25, 0.04, 0.2]} p={[0, 0.03, 0.46]} m={m.charcoal} cast={false} />
      </group>
    </group>
  );
}

const SHADOW: Record<Quality, number> = { fast: 1024, balanced: 2048, best: 2048 };

export function ShopInterior({
  layout,
  walls,
  lighting,
  theme,
  quality,
  shutterOpen,
  selected,
  hovered,
  visiCooler,
  tableFolded,
  planMode,
  quiet,
  onSelect,
  onHover,
}: ShopInteriorProps) {
  return (
    <group>
      <Lighting L={layout} lighting={lighting} shadowSize={SHADOW[quality]} />
      <Floors L={layout} floor={theme.floor} />
      <ShopShell layout={layout} planMode={planMode} walls={walls} lighting={lighting} shutterOpen={shutterOpen} />
      <Fixtures L={layout} theme={theme} lighting={lighting} />
      <EquipmentLayer
        layout={layout}
        trim={theme.trim}
        selected={selected}
        hovered={hovered}
        visiCooler={visiCooler}
        seating={layout.seating}
        tableFolded={tableFolded}
        quiet={quiet}
        onSelect={onSelect}
        onHover={onHover}
      />
    </group>
  );
}
