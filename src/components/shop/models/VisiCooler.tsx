"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useWake } from "@/hooks/useWake";
import { getMaterials } from "@/lib/materials";
import { markShadowsDirty } from "@/lib/sceneClock";
import { labelTexture, loadImageTexture } from "@/lib/textures";
import { Box, Cyl, PI, Plane } from "./parts";

const BOTTLE_COLORS = ["#ffa42c", "#ff7da1", "#7fd1c7", "#ffe27a", "#ffffff", "#b4a7f0", "#ff8a5c"];

/**
 * Upright single-glass-door visi cooler, 2.0 × 2.0 × 5.6 ft.
 * Four shelves, LED strips, bottles/cartons/fruit crates, lit sign box on top.
 * Local origin: floor, centre of footprint. Glass door on the +z face, hinged on the left.
 */
export function VisiCooler({ open }: { open: boolean }) {
  const m = getMaterials();
  const W = 2.0;
  const D = 2.0;
  const H = 5.6;
  const plinth = 0.4;
  const topBox = 0.62;
  const doorH = H - plinth - topBox - 0.04;
  const doorY = plinth + 0.02 + doorH / 2;
  const door = useRef<THREE.Group>(null);
  const t = useRef(0);

  const first = useRef(true);
  useWake([open]);
  useFrame((state, dt) => {
    const target = open ? 1 : 0;
    if (t.current === target && !first.current) return;
    first.current = false;
    t.current = THREE.MathUtils.damp(t.current, target, 4.5, dt);
    if (Math.abs(t.current - target) < 0.002) t.current = target;
    if (door.current) door.current.rotation.y = -t.current * 1.45;
    markShadowsDirty(2);
    state.invalidate();
  });

  const signMat = useMemo(() => {
    const logo = loadImageTexture("/images/brand/wordmark-light.png");
    return new THREE.MeshBasicMaterial({ map: logo, transparent: true, toneMapped: false });
  }, []);
  const signBackMat = useMemo(() => {
    const t = labelTexture(
      [{ text: "FRESH · COLD · READY TO GO", size: 34, color: "#ffffff", weight: "700", y: 40, spacing: 8 }],
      1024,
      72,
      "#14304f",
    );
    return new THREE.MeshBasicMaterial({ map: t, toneMapped: false });
  }, []);

  const shelfYs = [0.95, 1.95, 2.95, 3.95];

  // products
  const bottles = useRef<THREE.InstancedMesh>(null);
  const cartons = useRef<THREE.InstancedMesh>(null);
  const fruit = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    if (bottles.current) {
      let n = 0;
      for (let s = 1; s < shelfYs.length + 1; s++) {
        const y = (shelfYs[s] ?? 4.9) + 0.02; // shelves 2..4 + top
        if (s === shelfYs.length) break;
        for (let r = 0; r < 2; r++)
          for (let c = 0; c < 6; c++) {
            if (n >= 36) break;
            o.position.set(-0.7 + c * 0.28, y + 0.26, -0.5 + r * 0.42);
            o.rotation.set(0, 0, 0);
            o.scale.set(1, 1, 1);
            o.updateMatrix();
            bottles.current.setMatrixAt(n, o.matrix);
            col.set(BOTTLE_COLORS[(c + r * 2 + s) % BOTTLE_COLORS.length]);
            bottles.current.setColorAt(n, col);
            n++;
          }
      }
      bottles.current.count = n;
      bottles.current.instanceMatrix.needsUpdate = true;
      if (bottles.current.instanceColor) bottles.current.instanceColor.needsUpdate = true;
    }
    if (cartons.current) {
      let n = 0;
      for (let c = 0; c < 5; c++)
        for (let r = 0; r < 2; r++) {
          o.position.set(-0.75 + c * 0.38, shelfYs[3] + 0.02 + 0.28, 0.4 + r * 0.36);
          o.rotation.set(0, 0, 0);
          o.scale.set(1, 1, 1);
          o.updateMatrix();
          cartons.current.setMatrixAt(n, o.matrix);
          col.set(BOTTLE_COLORS[(c * 2 + r) % BOTTLE_COLORS.length]);
          cartons.current.setColorAt(n, col);
          n++;
        }
      cartons.current.instanceMatrix.needsUpdate = true;
      if (cartons.current.instanceColor) cartons.current.instanceColor.needsUpdate = true;
    }
    if (fruit.current) {
      let n = 0;
      for (let c = 0; c < 7; c++)
        for (let r = 0; r < 4; r++) {
          o.position.set(-0.78 + c * 0.26, shelfYs[0] + 0.02 + 0.3 + (r % 2) * 0.02, -0.55 + r * 0.38);
          o.rotation.set(c, r, 0);
          o.scale.set(1, 1, 1);
          o.updateMatrix();
          fruit.current.setMatrixAt(n, o.matrix);
          col.set(["#f39a2d", "#ffd23f", "#8bd45a", "#ff6b6b"][(c + r) % 4]);
          fruit.current.setColorAt(n, col);
          n++;
        }
      fruit.current.instanceMatrix.needsUpdate = true;
      if (fruit.current.instanceColor) fruit.current.instanceColor.needsUpdate = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group>
      {/* plinth + grille */}
      <Box s={[W, plinth, D]} p={[0, plinth / 2, 0]} m={m.charcoal} radius={0.03} />
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} s={[1.5, 0.025, 0.02]} p={[0, 0.08 + i * 0.055, D / 2 + 0.006]} m={m.black} cast={false} />
      ))}

      {/* cabinet shell */}
      <Box s={[0.12, H - plinth - topBox, D]} p={[-W / 2 + 0.06, plinth + (H - plinth - topBox) / 2, 0]} m={m.enamel} />
      <Box s={[0.12, H - plinth - topBox, D]} p={[W / 2 - 0.06, plinth + (H - plinth - topBox) / 2, 0]} m={m.enamel} />
      <Box s={[W - 0.2, H - plinth - topBox, 0.1]} p={[0, plinth + (H - plinth - topBox) / 2, -D / 2 + 0.05]} m={m.enamel} />
      <Box s={[W - 0.2, 0.1, D - 0.1]} p={[0, plinth + 0.05, 0]} m={m.plastic} />
      <Box s={[W - 0.2, 0.08, D - 0.1]} p={[0, H - topBox - 0.04, 0]} m={m.plastic} />
      {/* interior back panel light tone + LED strips */}
      <Box s={[W - 0.28, H - plinth - topBox - 0.2, 0.02]} p={[0, plinth + (H - plinth - topBox) / 2, -D / 2 + 0.11]} m={m.plastic} cast={false} />
      {[-1, 1].map((sx) => (
        <Box key={sx} s={[0.05, H - plinth - topBox - 0.3, 0.05]} p={[sx * (W / 2 - 0.16), plinth + (H - plinth - topBox) / 2, D / 2 - 0.12]} m={m.ledCool} cast={false} />
      ))}

      {/* shelves */}
      {shelfYs.map((y) => (
        <group key={y}>
          <Box s={[W - 0.28, 0.035, D - 0.3]} p={[0, y, -0.02]} m={m.chrome} cast={false} />
          <Box s={[W - 0.28, 0.12, 0.025]} p={[0, y + 0.06, D / 2 - 0.2]} m={m.chrome} cast={false} />
        </group>
      ))}

      {/* products */}
      <instancedMesh ref={bottles} args={[undefined, undefined, 36]} castShadow>
        <cylinderGeometry args={[0.09, 0.095, 0.52, 14]} />
        <meshStandardMaterial roughness={0.25} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={cartons} args={[undefined, undefined, 10]} castShadow>
        <boxGeometry args={[0.3, 0.56, 0.3]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={fruit} args={[undefined, undefined, 28]} castShadow>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>
      {/* wooden crate under the fruit */}
      <Box s={[1.85, 0.1, 1.55]} p={[0, shelfYs[0] + 0.07, -0.05]} m={m.woodLight} cast={false} />

      {/* top light box */}
      <Box s={[W, topBox, D]} p={[0, H - topBox / 2, 0]} m={m.navy} radius={0.04} />
      <Plane s={[1.4, 0.42]} p={[0, H - topBox / 2 + 0.02, D / 2 + 0.006]} m={signMat} />
      <Plane s={[1.9, 0.135]} p={[0, H - topBox + 0.1, D / 2 + 0.006]} m={signBackMat} />

      {/* door — hinged on the left edge, swings outwards */}
      <group ref={door} position={[-W / 2 + 0.04, doorY, D / 2 + 0.02]}>
        <Box s={[W - 0.08, doorH, 0.07]} p={[(W - 0.08) / 2, 0, 0]} m={m.glass} cast={false} />
        {/* aluminium frame */}
        <Box s={[W - 0.08, 0.11, 0.1]} p={[(W - 0.08) / 2, doorH / 2 - 0.055, 0]} m={m.stainless} />
        <Box s={[W - 0.08, 0.11, 0.1]} p={[(W - 0.08) / 2, -doorH / 2 + 0.055, 0]} m={m.stainless} />
        <Box s={[0.11, doorH, 0.1]} p={[0.055, 0, 0]} m={m.stainless} />
        <Box s={[0.11, doorH, 0.1]} p={[W - 0.08 - 0.055, 0, 0]} m={m.stainless} />
        {/* long vertical handle */}
        <Cyl rad={0.035} h={doorH * 0.6} p={[W - 0.08 - 0.2, 0, 0.17]} m={m.chrome} seg={14} />
        {[-1, 1].map((s) => (
          <Cyl key={s} rad={0.03} h={0.14} p={[W - 0.08 - 0.2, s * doorH * 0.28, 0.1]} r={[PI / 2, 0, 0]} m={m.chrome} seg={10} />
        ))}
        {/* subtle diagonal glare so glass reads as glass */}
        <Box s={[0.18, doorH * 0.85, 0.075]} p={[0.55, 0, 0.0]} r={[0, 0, 0.14]} m={m.glassTint} cast={false} />
      </group>
    </group>
  );
}
