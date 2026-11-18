"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { getMaterials } from "@/lib/materials";
import { Box, Cyl, PI } from "./parts";

/**
 * Commercial stainless-steel sink: single bowl, right-hand drain board, gooseneck mixer,
 * back-splash, under-shelf, and a visible strainer → P-trap → wall-waste drainage run.
 * Local origin: floor, centre. Width 2.6 (x), depth 2.0 (z), counter height 3.0 ft.
 * Back wall is at z = -1.0.  Front (user side) is +z.
 */
export function WashBasin() {
  const m = getMaterials();
  const W = 2.6;
  const D = 2.0;
  const TOP = 3.0;
  const T = 0.07; // sheet thickness
  const bowl = { x0: -1.2, x1: 0.1, z0: -0.5, z1: 0.8, depth: 0.62 };
  const bx = (bowl.x0 + bowl.x1) / 2;
  const bz = (bowl.z0 + bowl.z1) / 2;
  const bw = bowl.x1 - bowl.x0;
  const bd = bowl.z1 - bowl.z0;

  const faucet = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(
      [
        [0, 0, 0],
        [0, 0.4, 0],
        [0, 0.72, 0.07],
        [0, 0.82, 0.28],
        [0, 0.7, 0.5],
        [0, 0.52, 0.55],
      ].map((p) => new THREE.Vector3(...(p as [number, number, number]))),
    );
    return new THREE.TubeGeometry(c, 36, 0.034, 12, false);
  }, []);

  const trap = useMemo(() => {
    const pts = [
      [bx, TOP - bowl.depth, bz],
      [bx, 1.7, bz],
      [bx, 1.32, bz],
      [bx + 0.08, 1.14, bz],
      [bx + 0.3, 1.08, bz],
      [bx + 0.52, 1.14, bz],
      [bx + 0.6, 1.32, bz],
      [bx + 0.6, 1.55, bz - 0.02],
      [bx + 0.6, 1.6, bz - 0.4],
      [bx + 0.6, 1.6, -1.0],
    ].map((p) => new THREE.Vector3(...(p as [number, number, number])));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.08), 60, 0.058, 12, false);
  }, [bx, bz, bowl.depth]);

  const legs: [number, number][] = [
    [-W / 2 + 0.07, -D / 2 + 0.07],
    [W / 2 - 0.07, -D / 2 + 0.07],
    [-W / 2 + 0.07, D / 2 - 0.07],
    [W / 2 - 0.07, D / 2 - 0.07],
  ];

  return (
    <group>
      {/* legs + adjustable feet */}
      {legs.map(([x, z], i) => (
        <group key={i}>
          <Cyl rad={0.05} h={TOP - 0.1} p={[x, (TOP - 0.1) / 2 + 0.05, z]} m={m.stainless} seg={14} />
          <Cyl rad={0.07} h={0.06} p={[x, 0.03, z]} m={m.rubber} seg={14} />
        </group>
      ))}
      {/* rails */}
      <Box s={[W - 0.1, 0.12, 0.04]} p={[0, TOP - 0.17, D / 2 - 0.07]} m={m.stainless} />
      <Box s={[W - 0.1, 0.12, 0.04]} p={[0, TOP - 0.17, -D / 2 + 0.07]} m={m.stainless} />
      <Box s={[0.04, 0.12, D - 0.1]} p={[-W / 2 + 0.07, TOP - 0.17, 0]} m={m.stainless} />
      <Box s={[0.04, 0.12, D - 0.1]} p={[W / 2 - 0.07, TOP - 0.17, 0]} m={m.stainless} />

      {/* under-shelf with storage tub */}
      <Box s={[W - 0.14, 0.05, D - 0.14]} p={[0, 0.62, 0]} m={m.stainless} radius={0.01} />
      <Box s={[0.7, 0.28, 0.55]} p={[0.7, 0.8, 0.3]} m={m.teal} radius={0.04} />
      <Box s={[0.5, 0.2, 0.4]} p={[-0.65, 0.76, 0.35]} m={m.blush} radius={0.04} />

      {/* worktop — four sheets around the bowl opening */}
      <Box s={[W, T, bowl.z0 + D / 2]} p={[0, TOP - T / 2, (-D / 2 + bowl.z0) / 2]} m={m.stainless} radius={0.012} />
      <Box s={[W, T, D / 2 - bowl.z1]} p={[0, TOP - T / 2, (D / 2 + bowl.z1) / 2]} m={m.stainless} radius={0.012} />
      <Box s={[bowl.x0 + W / 2, T, bd]} p={[(-W / 2 + bowl.x0) / 2, TOP - T / 2, bz]} m={m.stainless} radius={0.012} />
      <Box s={[W / 2 - bowl.x1, T, bd]} p={[(W / 2 + bowl.x1) / 2, TOP - T / 2, bz]} m={m.stainless} radius={0.012} />
      {/* drain-board grooves */}
      {Array.from({ length: 7 }).map((_, i) => (
        <Box key={i} s={[0.014, 0.006, bd - 0.1]} p={[bowl.x1 + 0.2 + i * 0.14, TOP + 0.002, bz]} m={m.stainlessDark} cast={false} />
      ))}
      {/* rolled front edge */}
      <Cyl rad={0.03} h={W} p={[0, TOP - 0.02, D / 2 - 0.005]} r={[0, 0, PI / 2]} m={m.stainless} seg={10} />

      {/* bowl: four walls + base */}
      <Box s={[bw, bowl.depth, 0.04]} p={[bx, TOP - bowl.depth / 2 - 0.01, bowl.z0 + 0.02]} m={m.stainlessDark} cast={false} />
      <Box s={[bw, bowl.depth, 0.04]} p={[bx, TOP - bowl.depth / 2 - 0.01, bowl.z1 - 0.02]} m={m.stainlessDark} cast={false} />
      <Box s={[0.04, bowl.depth, bd]} p={[bowl.x0 + 0.02, TOP - bowl.depth / 2 - 0.01, bz]} m={m.stainlessDark} cast={false} />
      <Box s={[0.04, bowl.depth, bd]} p={[bowl.x1 - 0.02, TOP - bowl.depth / 2 - 0.01, bz]} m={m.stainlessDark} cast={false} />
      <Box s={[bw, 0.04, bd]} p={[bx, TOP - bowl.depth, bz]} m={m.stainless} cast={false} />
      {/* strainer */}
      <Cyl rad={0.14} h={0.03} p={[bx, TOP - bowl.depth + 0.03, bz]} m={m.chrome} seg={28} cast={false} />
      <Cyl rad={0.1} h={0.035} p={[bx, TOP - bowl.depth + 0.05, bz]} m={m.black} seg={24} cast={false} />
      {/* thin water film for a clean, wet look */}
      <Box s={[bw - 0.1, 0.004, bd - 0.1]} p={[bx, TOP - bowl.depth + 0.04, bz]} m={m.water} cast={false} />

      {/* back-splash with a rolled top lip */}
      <Box s={[W, 0.55, 0.045]} p={[0, TOP + 0.275, -D / 2 + 0.025]} m={m.stainless} radius={0.01} />
      <Cyl rad={0.03} h={W} p={[0, TOP + 0.56, -D / 2 + 0.05]} r={[0, 0, PI / 2]} m={m.stainless} seg={10} />

      {/* gooseneck mixer tap */}
      <group position={[bx, TOP, -D / 2 + 0.34]}>
        <Cyl rad={0.1} rb={0.12} h={0.06} p={[0, 0.03, 0]} m={m.chrome} seg={24} />
        <Cyl rad={0.065} h={0.45} p={[0, 0.27, 0]} m={m.chrome} seg={20} />
        <mesh geometry={faucet} position={[0, 0.0, 0]} castShadow material={m.chrome} />
        <Cyl rad={0.045} h={0.08} p={[0, 0.0 + 0.5, 0.55]} m={m.stainless} seg={14} />
        {/* two lever handles (hot/cold) */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.22, 0.0, -0.08]}>
            <Cyl rad={0.04} h={0.12} p={[0, 0.06, 0]} m={m.chrome} seg={12} />
            <Cyl rad={0.032} h={0.2} p={[0, 0.2, 0]} r={[0, 0, s * 0.5]} m={m.chrome} seg={10} />
            <Cyl rad={0.034} h={0.025} p={[0, 0.22, 0]} m={s < 0 ? m.ledRed : m.teal} seg={10} cast={false} />
          </group>
        ))}
      </group>

      {/* ── drainage: strainer → tail → P-trap → wall waste ── */}
      <mesh geometry={trap} castShadow material={m.chrome} />
      {/* wall escutcheon where the waste goes in */}
      <Cyl rad={0.1} h={0.03} p={[bx + 0.6, 1.6, -D / 2 + 0.02]} r={[PI / 2, 0, 0]} m={m.chrome} seg={18} />
      {/* hot/cold supply with angle stops */}
      {[-0.4, 0.4].map((dx, i) => (
        <group key={i} position={[bx + dx, 1.9, -D / 2 + 0.03]}>
          <Cyl rad={0.03} h={0.8} p={[0, 0.0, 0.0]} m={m.chrome} seg={10} />
          <Cyl rad={0.05} h={0.12} p={[0, -0.2, 0.0]} m={m.chrome} seg={14} />
          <Cyl rad={0.03} h={0.08} p={[0, -0.2, 0.08]} r={[PI / 2, 0, 0]} m={i === 0 ? m.ledRed : m.teal} seg={10} cast={false} />
        </group>
      ))}

      {/* floor drain in front of the sink */}
      <group position={[bx, 0.005, 1.55]}>
        <Cyl rad={0.28} h={0.012} m={m.stainlessDark} seg={32} cast={false} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} s={[0.4, 0.014, 0.02]} p={[0, 0.002, -0.14 + i * 0.07]} m={m.black} cast={false} />
        ))}
      </group>

      {/* on the drain board: soap, brush */}
      <group position={[bowl.x1 + 0.35, TOP, bz + 0.2]}>
        <Cyl rad={0.07} h={0.26} p={[0, 0.13, 0]} m={m.teal} seg={16} />
        <Cyl rad={0.025} h={0.09} p={[0, 0.3, 0.0]} m={m.chrome} seg={10} />
        <Box s={[0.14, 0.06, 0.24]} p={[0.45, 0.03, 0.05]} m={m.mango} radius={0.02} />
        <Box s={[0.07, 0.04, 0.34]} p={[0.75, 0.02, -0.1]} m={m.woodLight} radius={0.015} />
      </group>
    </group>
  );
}
