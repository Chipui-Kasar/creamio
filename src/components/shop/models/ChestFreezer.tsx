"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useWake } from "@/hooks/useWake";
import { getMaterials } from "@/lib/materials";
import { markShadowsDirty } from "@/lib/sceneClock";
import { labelTexture } from "@/lib/textures";
import { Box, Cyl, PI, Plane } from "./parts";

interface Props {
  /**
   * 'packed'  = customer self-serve: packed tubs to choose from (400 L).
   * 'scoop'   = scooping counter: open flavour tubs, staff scoop from behind (350 L).
   */
  variant: "packed" | "scoop";
  w: number;
  d: number;
  h: number;
  /** Slides the staff-side / right-hand glass panel open. */
  open: boolean;
  /** Text on the capacity badge, e.g. "400 L". */
  badge: string;
  /** Trim colour override from the theme picker. */
  trim?: "auto" | "pink" | "teal" | "navy" | "gold";
}

const FLAVOURS = ["vanilla", "strawberry", "chocolate", "mango", "pistachio", "blueberry"] as const;

/**
 * Commercial horizontal chest freezer with a **sliding glass top** (display freezer).
 * Local origin: floor, centre of footprint.  Front (customer side) is +z; the staff side is -z.
 *
 * Two glass panels run in aluminium rails. The upper one slides over the lower one when `open`.
 */
export function ChestFreezer({ variant, w, d, h, open, badge, trim = "auto" }: Props) {
  const m = getMaterials();
  const slider = useRef<THREE.Group>(null);
  const t = useRef(0);

  const plinthH = 0.34;
  const wall = 0.2;
  const railH = 0.16;
  const bodyTop = h - railH - 0.06; // top of the cabinet walls
  const glassW = (w - 0.12) / 2 + 0.06;
  const glassD = d - 0.3;

  const first = useRef(true);
  useWake([open]);
  useFrame((state, dt) => {
    const target = open ? 1 : 0;
    if (t.current === target && !first.current) return;
    first.current = false;
    t.current = THREE.MathUtils.damp(t.current, target, 4.5, dt);
    if (Math.abs(t.current - target) < 0.002) t.current = target;
    if (slider.current) slider.current.position.x = -(w - 0.12) / 4 + t.current * ((w - 0.12) / 2 - 0.02);
    markShadowsDirty(2);
    state.invalidate();
  });

  const badgeMat = useMemo(() => {
    const tex = labelTexture(
      [
        { text: badge, size: 150, color: "#ffffff", weight: "700", y: 100, family: "Montserrat, sans-serif" },
        { text: variant === "packed" ? "SELF-SERVE · PACKED" : "SCOOPING COUNTER", size: 42, color: "#ffffff", weight: "600", y: 205, spacing: 5 },
      ],
      512,
      256,
    );
    return new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
  }, [badge, variant]);

  const sign = useMemo(() => {
    if (variant !== "packed") return null;
    const tex = labelTexture(
      [
        { text: "CHOOSE YOUR", size: 46, color: "#14304f", weight: "800", y: 64, spacing: 4 },
        { text: "FLAVOUR", size: 72, color: "#f9729b", weight: "800", y: 150, spacing: 3 },
        { text: "slide the glass · grab a tub", size: 30, color: "#14304f", weight: "600", y: 232 },
      ],
      512,
      280,
      "#fff4e4",
    );
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
  }, [variant]);

  // contents (instanced)
  const items = useMemo(() => {
    const innerW = w - wall * 2 - 0.12;
    const innerD = d - wall * 2 - 0.12;
    const out: { x: number; z: number; c: number; hgt: number; wd: number; dd: number }[] = [];
    if (variant === "scoop") {
      const cols = Math.max(4, Math.round(innerW / 0.62));
      const rows = 3;
      const tw = innerW / cols;
      const td = innerD / rows;
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++)
          out.push({ x: -innerW / 2 + tw * (i + 0.5), z: -innerD / 2 + td * (j + 0.5), c: (i + j * 2) % FLAVOURS.length, hgt: 0.5, wd: tw * 0.88, dd: td * 0.88 });
    } else {
      const cols = Math.max(6, Math.round(innerW / 0.4));
      const rows = Math.max(3, Math.round(innerD / 0.46));
      const tw = innerW / cols;
      const td = innerD / rows;
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++)
          out.push({ x: -innerW / 2 + tw * (i + 0.5), z: -innerD / 2 + td * (j + 0.5), c: (i * 2 + j) % FLAVOURS.length, hgt: 0.55 + ((i + j) % 3) * 0.06, wd: tw * 0.84, dd: td * 0.84 });
    }
    return out;
  }, [variant, w, d]);

  const body = useRef<THREE.InstancedMesh>(null);
  const lids = useRef<THREE.InstancedMesh>(null);
  const floorY = bodyTop - 0.92;
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    items.forEach((it, i) => {
      const f = m[FLAVOURS[it.c]] as THREE.MeshStandardMaterial;
      if (body.current) {
        o.position.set(it.x, it.hgt / 2, it.z);
        o.scale.set(variant === "packed" ? it.wd : it.wd, it.hgt, variant === "packed" ? it.wd : it.dd);
        o.updateMatrix();
        body.current.setMatrixAt(i, o.matrix);
        col.copy(f.color);
        if (variant === "packed") col.lerp(new THREE.Color("#ffffff"), 0.2);
        body.current.setColorAt(i, col);
      }
      if (lids.current && variant === "packed") {
        o.position.set(it.x, it.hgt + 0.015, it.z);
        o.scale.set(it.wd * 1.04, 1, it.wd * 1.04);
        o.updateMatrix();
        lids.current.setMatrixAt(i, o.matrix);
        lids.current.setColorAt(i, col.set("#ffffff"));
      }
    });
    for (const im of [body.current, lids.current]) {
      if (!im) continue;
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }
  }, [items, m, variant]);

  const accent = trim === "auto" ? (variant === "scoop" ? m.pink : m.teal) : m[trim];
  const glassY = bodyTop + 0.08;

  return (
    <group>
      {/* plinth + casters */}
      <Box s={[w - 0.16, plinthH, d - 0.16]} p={[0, plinthH / 2, 0]} m={m.charcoal} />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => <Cyl key={`${sx}${sz}`} rad={0.09} h={0.1} p={[sx * (w / 2 - 0.35), 0.05, sz * (d / 2 - 0.3)]} m={m.rubber} seg={12} />),
      )}

      {/* cabinet shell: four walls + floor */}
      <Box s={[w, bodyTop - plinthH, wall]} p={[0, (bodyTop + plinthH) / 2, d / 2 - wall / 2]} m={m.enamel} radius={0.05} />
      <Box s={[w, bodyTop - plinthH, wall]} p={[0, (bodyTop + plinthH) / 2, -d / 2 + wall / 2]} m={m.enamel} radius={0.05} />
      <Box s={[wall, bodyTop - plinthH, d - wall * 2]} p={[w / 2 - wall / 2, (bodyTop + plinthH) / 2, 0]} m={m.enamel} />
      <Box s={[wall, bodyTop - plinthH, d - wall * 2]} p={[-w / 2 + wall / 2, (bodyTop + plinthH) / 2, 0]} m={m.enamel} />
      <Box s={[w - 0.1, 0.1, d - 0.1]} p={[0, floorY - 0.05, 0]} m={m.plastic} />

      {/* brand trim + capacity badge on the customer-facing front */}
      <Box s={[w + 0.01, 0.34, 0.03]} p={[0, bodyTop - 0.5, d / 2 + 0.005]} m={accent} cast={false} />
      <Box s={[1.42, 0.78, 0.015]} p={[-w / 2 + 1.0, bodyTop - 1.15, d / 2 + 0.004]} m={accent} cast={false} radius={0.03} />
      <Plane s={[1.3, 0.65]} p={[-w / 2 + 1.0, bodyTop - 1.15, d / 2 + 0.012]} m={badgeMat} />
      {Array.from({ length: 7 }).map((_, i) => (
        <Box key={i} s={[1.5, 0.025, 0.02]} p={[w / 2 - 1.1, 0.5 + i * 0.07, d / 2 + 0.01]} m={m.charcoal} cast={false} />
      ))}
      {/* thermostat panel on the staff-side face */}
      <group position={[0, 0, -d / 2 - 0.02]} rotation={[0, PI, 0]}>
        <Box s={[0.95, 0.3, 0.06]} p={[w / 2 - 0.85, bodyTop - 0.9, 0]} m={m.charcoal} radius={0.04} />
        <Cyl rad={0.09} h={0.07} p={[w / 2 - 1.12, bodyTop - 0.9, 0.05]} r={[PI / 2, 0, 0]} m={m.stainless} seg={20} />
        <Box s={[0.07, 0.04, 0.02]} p={[w / 2 - 0.82, bodyTop - 0.88, 0.04]} m={m.ledGreen} cast={false} />
        <Box s={[0.07, 0.04, 0.02]} p={[w / 2 - 0.68, bodyTop - 0.88, 0.04]} m={m.ledRed} cast={false} />
      </group>

      {/* contents under the glass */}
      <group position={[0, floorY, 0]}>
        <instancedMesh ref={body} args={[undefined, undefined, items.length]} castShadow receiveShadow>
          {variant === "packed" ? <cylinderGeometry args={[0.5, 0.45, 1, 18]} /> : <boxGeometry args={[1, 1, 1]} />}
          <meshStandardMaterial roughness={0.6} />
        </instancedMesh>
        {variant === "packed" && (
          <instancedMesh ref={lids} args={[undefined, undefined, items.length]}>
            <cylinderGeometry args={[0.5, 0.5, 0.03, 18]} />
            <meshStandardMaterial roughness={0.5} />
          </instancedMesh>
        )}
        <Box s={[w - wall * 2 - 0.12, 0.02, d - wall * 2 - 0.12]} p={[0, 0.0, 0]} m={m.frost} cast={false} />
      </group>

      {/* rim cap + aluminium rails along the length */}
      <Box s={[w, 0.06, 0.22]} p={[0, bodyTop + 0.03, d / 2 - 0.11]} m={m.stainless} cast={false} />
      <Box s={[w, 0.06, 0.22]} p={[0, bodyTop + 0.03, -d / 2 + 0.11]} m={m.stainless} cast={false} />
      <Box s={[0.14, 0.06, d - 0.4]} p={[w / 2 - 0.07, bodyTop + 0.03, 0]} m={m.stainless} cast={false} />
      <Box s={[0.14, 0.06, d - 0.4]} p={[-w / 2 + 0.07, bodyTop + 0.03, 0]} m={m.stainless} cast={false} />
      {/* rail guides */}
      {[-1, 1].map((sz) => (
        <group key={sz}>
          <Box s={[w - 0.2, 0.05, 0.05]} p={[0, bodyTop + 0.085, sz * (d / 2 - 0.2)]} m={m.black} cast={false} />
          <Box s={[w - 0.2, 0.03, 0.04]} p={[0, bodyTop + 0.15, sz * (d / 2 - 0.2)]} m={m.black} cast={false} />
        </group>
      ))}
      {/* edge cap along the customer side */}
      <Box s={[w, 0.12, 0.05]} p={[0, bodyTop + 0.08, d / 2 - 0.03]} m={m.stainless} cast={false} />
      <Box s={[w, 0.12, 0.05]} p={[0, bodyTop + 0.08, -d / 2 + 0.03]} m={m.stainless} cast={false} />

      {/* fixed lower glass (right half) */}
      <group position={[(w - 0.12) / 4, glassY, 0]}>
        <Box s={[glassW, 0.025, glassD]} m={m.glass} cast={false} />
        {[-1, 1].map((sz) => (
          <Box key={sz} s={[glassW, 0.04, 0.04]} p={[0, 0, sz * (glassD / 2)]} m={m.stainless} cast={false} />
        ))}
        <Box s={[0.04, 0.04, glassD]} p={[glassW / 2, 0, 0]} m={m.stainless} cast={false} />
      </group>
      {/* sliding upper glass (left half) — slides over the fixed one when opened */}
      <group ref={slider} position={[-(w - 0.12) / 4, glassY + 0.07, 0]}>
        <Box s={[glassW, 0.025, glassD]} m={m.glass} cast={false} />
        {[-1, 1].map((sz) => (
          <Box key={sz} s={[glassW, 0.04, 0.04]} p={[0, 0, sz * (glassD / 2)]} m={m.stainless} cast={false} />
        ))}
        <Box s={[0.04, 0.04, glassD]} p={[-glassW / 2, 0, 0]} m={m.stainless} cast={false} />
        <Box s={[0.04, 0.04, glassD]} p={[glassW / 2, 0, 0]} m={m.stainless} cast={false} />
        {/* pull handle on the customer-side edge */}
        <Box s={[0.5, 0.05, 0.07]} p={[0, 0.03, glassD / 2 + 0.02]} m={m.chrome} radius={0.02} />
        {/* glare */}
        <Box s={[0.25, 0.005, glassD * 0.9]} p={[0.2, 0.016, 0]} r={[0, 0.0, 0]} m={m.glassTint} cast={false} />
      </group>

      {/* self-serve tent card on the rim */}
      {sign && (
        <group position={[w / 2 - 0.55, h + 0.0, d / 2 - 0.28]} rotation={[-0.45, 0, 0]}>
          <Box s={[0.9, 0.5, 0.025]} p={[0, 0.25, 0]} m={sign} radius={0.01} />
        </group>
      )}
      {variant === "scoop" && (
        /* dipper well + scoop on the staff side of the counter top */
        <group position={[-w / 2 + 0.55, h, -d / 2 + 0.25]}>
          <Cyl rad={0.17} h={0.05} p={[0, 0.0, 0]} m={m.stainless} seg={20} />
          <Cyl rad={0.13} h={0.02} p={[0, 0.03, 0]} m={m.water} seg={20} cast={false} />
          <mesh position={[0.35, 0.05, 0.02]} rotation={[0, 0.4, 0]} castShadow material={m.stainless}>
            <sphereGeometry args={[0.07, 14, 10, 0, PI * 2, 0, PI / 1.8]} />
          </mesh>
        </group>
      )}
    </group>
  );
}
