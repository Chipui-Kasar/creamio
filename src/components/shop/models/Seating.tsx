"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useWake } from "@/hooks/useWake";
import { getMaterials, type Mats } from "@/lib/materials";
import { markShadowsDirty } from "@/lib/sceneClock";
import { Box, Cyl, PI } from "./parts";

type CushionKey = "fabricPink" | "fabricTeal" | "fabricCream" | "fabricGold";
const CUSHIONS: CushionKey[] = ["fabricPink", "fabricTeal", "fabricGold", "fabricCream"];

function Chair({ m, cushion }: { m: Mats; cushion: CushionKey }) {
  // seat 1.3 × 1.3, seat height 1.5, back to 2.75. Faces +z (back at -z).
  return (
    <group>
      {[
        [-0.54, -0.54],
        [0.54, -0.54],
        [-0.5, 0.5],
        [0.5, 0.5],
      ].map(([x, z], i) => (
        <Cyl key={i} rad={0.045} rb={0.032} h={1.42} p={[x, 0.71, z]} m={m.woodDark} seg={10} />
      ))}
      {/* seat frame + cushion */}
      <Box s={[1.2, 0.1, 1.2]} p={[0, 1.44, 0]} m={m.woodDark} radius={0.03} />
      <Box s={[1.12, 0.16, 1.12]} p={[0, 1.57, 0.01]} m={m[cushion]} radius={0.07} />
      {/* back posts + curved back panel */}
      {[-0.54, 0.54].map((x) => (
        <Cyl key={x} rad={0.04} h={1.3} p={[x, 2.15, -0.56]} r={[-0.08, 0, 0]} m={m.woodDark} seg={10} />
      ))}
      <Box s={[1.1, 0.5, 0.09]} p={[0, 2.35, -0.6]} r={[-0.08, 0, 0]} m={m[cushion]} radius={0.04} />
      <Box s={[1.12, 0.08, 0.07]} p={[0, 2.0, -0.58]} r={[-0.08, 0, 0]} m={m.woodDark} radius={0.02} />
      {/* stretcher */}
      <Box s={[1.0, 0.05, 0.05]} p={[0, 0.5, -0.54]} m={m.woodDark} />
    </group>
  );
}

/** Option A — small square table with four tucked-in chairs. 4 × 4 ft block. */
export function TableSeating() {
  const m = getMaterials();
  const offs = 1.35;
  return (
    <group>
      {/* pedestal table */}
      <Box s={[2.4, 0.11, 2.4]} p={[0, 2.45, 0]} m={m.woodLight} radius={0.05} />
      <Box s={[2.3, 0.04, 2.3]} p={[0, 2.38, 0]} m={m.woodDark} radius={0.02} cast={false} />
      <Cyl rad={0.1} rb={0.13} h={2.3} p={[0, 1.2, 0]} m={m.navy} seg={22} />
      <Cyl rad={0.4} rb={0.5} h={0.08} p={[0, 0.04, 0]} m={m.navy} seg={28} />
      {/* table-top props */}
      <group position={[0.3, 2.51, -0.2]}>
        <Cyl rad={0.2} rb={0.15} h={0.34} p={[0, 0.17, 0]} m={m.ceramic} seg={20} />
        <Cyl rad={0.17} h={0.02} p={[0, 0.33, 0]} m={m.strawberry} seg={20} cast={false} />
        <mesh position={[0, 0.5, 0]} castShadow material={m.strawberry}>
          <sphereGeometry args={[0.17, 18, 14]} />
        </mesh>
        <mesh position={[0.02, 0.7, 0]} castShadow material={m.vanilla}>
          <sphereGeometry args={[0.15, 18, 14]} />
        </mesh>
      </group>
      <group position={[-0.5, 2.51, 0.45]}>
        <Cyl rad={0.055} h={0.2} p={[0, 0.1, 0]} m={m.pink} seg={12} />
        <Cyl rad={0.045} h={0.12} p={[0.18, 0.06, 0]} m={m.stainless} seg={12} />
      </group>
      {/* chairs — each rotated to face the table centre */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i * PI) / 2;
        return (
          <group key={i} position={[Math.sin(a) * offs, 0, Math.cos(a) * offs]} rotation={[0, a + PI, 0]}>
            <Chair m={m} cushion={CUSHIONS[i]} />
          </group>
        );
      })}
    </group>
  );
}

function Stool({ m, cushion }: { m: Mats; cushion: CushionKey }) {
  const tilt = 0.055;
  return (
    <group>
      {[0.25, 1.25, 2.25, 3.25].map((a, i) => {
        const ox = Math.cos(a * (PI / 2) + 0.78);
        const oz = Math.sin(a * (PI / 2) + 0.78);
        return (
          <Cyl
            key={i}
            rad={0.03}
            rb={0.036}
            h={2.2}
            p={[ox * 0.28, 1.1, oz * 0.28]}
            r={[-oz * tilt, 0, ox * tilt]}
            m={m.stainless}
            seg={10}
          />
        );
      })}
      <mesh position={[0, 0.85, 0]} rotation={[PI / 2, 0, 0]} castShadow material={m.stainless}>
        <torusGeometry args={[0.3, 0.018, 8, 28]} />
      </mesh>
      <Cyl rad={0.4} h={0.05} p={[0, 2.25, 0]} m={m.woodDark} seg={28} />
      <Cyl rad={0.44} rb={0.42} h={0.17} p={[0, 2.36, 0]} m={m[cushion]} seg={30} />
    </group>
  );
}

/**
 * Option B — wall-mounted fold-down table with four stools.
 * Local origin: floor, centred on the footprint; the west wall is at local x = -0.65.
 * `folded` swings the shelf flat against the wall and tucks the stools in.
 */
export function FoldingSeating({ folded }: { folded: boolean }) {
  const m = getMaterials();
  const shelf = useRef<THREE.Group>(null);
  const brace = useRef<THREE.Group>(null);
  const stools = useRef<THREE.Group>(null);
  const t = useRef(0);
  const wallX = -0.65;
  const len = 4.6;

  const first = useRef(true);
  useWake([folded]);
  useFrame((state, dt) => {
    const target = folded ? 1 : 0;
    if (t.current === target && !first.current) return;
    first.current = false;
    t.current = THREE.MathUtils.damp(t.current, target, 3.5, dt);
    if (Math.abs(t.current - target) < 0.002) t.current = target;
    markShadowsDirty(2);
    state.invalidate();
    if (shelf.current) shelf.current.rotation.z = -t.current * (PI / 2 - 0.02);
    if (brace.current) {
      brace.current.scale.set(1, Math.max(0.001, 1 - t.current * 1.2), 1);
      brace.current.visible = t.current < 0.85;
    }
    if (stools.current) stools.current.position.x = THREE.MathUtils.lerp(0, -0.55, t.current);
  });

  const zs = [-1.74, -0.58, 0.58, 1.74];
  const cushions = CUSHIONS;

  return (
    <group>
      {/* wooden backboard (fluted) */}
      <Box s={[0.05, 3.7, len + 0.2]} p={[wallX + 0.03, 2.05, 0]} m={m.fluted} />
      <Box s={[0.08, 0.07, len + 0.3]} p={[wallX + 0.04, 3.9, 0]} m={m.woodDark} />

      {/* hinged shelf (3 ft high, 1.3 ft deep) */}
      <group ref={shelf} position={[wallX + 0.09, 2.97, 0]}>
        <Box s={[1.3, 0.09, len]} p={[0.65, -0.045, 0]} m={m.woodLight} radius={0.03} />
        <Box s={[1.24, 0.03, len - 0.06]} p={[0.65, -0.105, 0]} m={m.woodDark} cast={false} />
        {/* hinge barrels */}
        {[-1.8, -0.6, 0.6, 1.8].map((z) => (
          <Cyl key={z} rad={0.035} h={0.5} p={[0.0, -0.04, z]} r={[PI / 2, 0, 0]} m={m.stainless} seg={10} />
        ))}
        {/* shelf-top props: two ice-cream cups + napkins */}
        <group position={[0.7, 0.0, -1.7]}>
          <Cyl rad={0.14} rb={0.1} h={0.28} p={[0, 0.14, 0]} m={m.navy} seg={22} />
          <mesh position={[0, 0.34, 0]} castShadow material={m.strawberry}>
            <sphereGeometry args={[0.15, 16, 12]} />
          </mesh>
        </group>
        <group position={[0.7, 0.0, 0.58]}>
          <Cyl rad={0.14} rb={0.1} h={0.28} p={[0, 0.14, 0]} m={m.teal} seg={22} />
          <mesh position={[0, 0.34, 0]} castShadow material={m.chocolate}>
            <sphereGeometry args={[0.15, 16, 12]} />
          </mesh>
        </group>
        <Box s={[0.2, 0.14, 0.2]} p={[0.55, 0.07, 1.8]} m={m.stainless} radius={0.02} />
      </group>

      {/* diagonal brace arms (hide when the shelf is folded) */}
      <group ref={brace} position={[wallX + 0.09, 2.0, 0]}>
        {[-1.6, 1.6].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <Box s={[0.05, 1.3, 0.06]} p={[0.48, 0.5, 0]} r={[0, 0, -0.62]} m={m.charcoal} radius={0.01} />
            <Box s={[0.07, 0.3, 0.1]} p={[0.0, 0.0, 0]} m={m.charcoal} />
          </group>
        ))}
      </group>

      {/* stools */}
      <group ref={stools}>
        {zs.map((z, i) => (
          <group key={z} position={[0.95, 0, z]}>
            <Stool m={m} cushion={cushions[i]} />
          </group>
        ))}
      </group>
    </group>
  );
}
