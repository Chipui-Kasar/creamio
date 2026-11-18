"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { getMaterials } from "@/lib/materials";
import { labelTexture } from "@/lib/textures";
import { Box, Cyl, PI, Plane } from "./parts";

/**
 * 7 KVA wall-mounted voltage stabilizer.
 * Local origin: bottom-centre of the housing, back plane at z = -0.35. Front is +z.
 * Body 1.25 × 1.5 × 0.7 ft.
 */
export function Stabilizer() {
  const m = getMaterials();
  const W = 1.25;
  const H = 1.5;
  const D = 0.7;

  const display = useMemo(() => {
    const t = labelTexture(
      [
        { text: "230", size: 150, color: "#ffb347", weight: "700", y: 98, family: "ui-monospace, Menlo, monospace", spacing: 8 },
        { text: "IN 218 V  ·  OUT 230 V", size: 28, color: "#ffb347", weight: "500", y: 205, family: "ui-monospace, Menlo, monospace" },
      ],
      512,
      256,
      "#0a0705",
    );
    return new THREE.MeshBasicMaterial({ map: t, toneMapped: false });
  }, []);
  const label = useMemo(() => {
    const t = labelTexture(
      [
        { text: "7 KVA", size: 130, color: "#14304f", weight: "800", y: 95, spacing: 8 },
        { text: "VOLTAGE STABILIZER", size: 38, color: "#f9729b", weight: "700", y: 188, spacing: 6 },
      ],
      512,
      256,
      "#fff4e4",
    );
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 });
  }, []);

  return (
    <group>
      {/* housing */}
      <Box s={[W, H, D]} p={[0, H / 2, 0]} m={m.navy} radius={0.06} />
      {/* top & bottom lips */}
      <Box s={[W + 0.04, 0.05, D + 0.04]} p={[0, H - 0.01, 0]} m={m.charcoal} radius={0.02} />
      <Box s={[W + 0.04, 0.05, D + 0.04]} p={[0, 0.03, 0]} m={m.charcoal} radius={0.02} />
      {/* front panel */}
      <Box s={[W - 0.16, H - 0.24, 0.03]} p={[0, H / 2, D / 2 + 0.01]} m={m.charcoal} radius={0.03} />
      {/* label plate */}
      <Plane s={[0.78, 0.39]} p={[0, H - 0.28, D / 2 + 0.03]} m={label} />
      {/* analogue voltmeter */}
      <group position={[-0.32, 0.72, D / 2 + 0.03]}>
        <Cyl rad={0.2} h={0.05} r={[PI / 2, 0, 0]} m={m.chrome} seg={36} />
        <Cyl rad={0.175} h={0.055} p={[0, 0, 0.004]} r={[PI / 2, 0, 0]} m={m.ceramic} seg={36} />
        {Array.from({ length: 9 }).map((_, i) => {
          const a = -0.9 + (i / 8) * 1.8;
          return (
            <Box key={i} s={[0.01, 0.025, 0.004]} p={[Math.sin(a) * 0.14, Math.cos(a) * 0.14, 0.034]} r={[0, 0, -a]} m={m.black} cast={false} />
          );
        })}
        <Box s={[0.01, 0.15, 0.006]} p={[0.035, 0.065, 0.04]} r={[0, 0, -0.45]} m={m.ledRed} cast={false} />
        <Cyl rad={0.015} h={0.02} p={[0, 0, 0.04]} r={[PI / 2, 0, 0]} m={m.black} seg={10} />
      </group>
      {/* digital display */}
      <Box s={[0.5, 0.32, 0.02]} p={[0.27, 0.78, D / 2 + 0.035]} m={m.black} radius={0.01} />
      <Plane s={[0.44, 0.22]} p={[0.27, 0.78, D / 2 + 0.047]} m={display} />
      {/* indicator LEDs */}
      {[m.ledGreen, m.ledAmber, m.ledRed].map((mat, i) => (
        <Cyl key={i} rad={0.025} h={0.02} p={[-0.38 + i * 0.1, 0.42, D / 2 + 0.035]} r={[PI / 2, 0, 0]} m={mat} seg={12} cast={false} />
      ))}
      {/* MCB switch + selector knob */}
      <Box s={[0.2, 0.2, 0.05]} p={[0.2, 0.42, D / 2 + 0.04]} m={m.black} radius={0.02} />
      <Box s={[0.07, 0.11, 0.06]} p={[0.2, 0.45, D / 2 + 0.075]} m={m.pink} radius={0.015} />
      <Cyl rad={0.065} h={0.05} p={[0.48, 0.42, D / 2 + 0.05]} r={[PI / 2, 0, 0]} m={m.stainless} seg={20} />
      <Cyl rad={0.045} h={0.055} p={[0.48, 0.42, D / 2 + 0.055]} r={[PI / 2, 0, 0]} m={m.black} seg={20} />

      {/* ventilation louvres: both sides + top */}
      {[-1, 1].map((sx) =>
        Array.from({ length: 12 }).map((_, i) => (
          <Box key={`${sx}${i}`} s={[0.02, 0.025, D - 0.3]} p={[sx * (W / 2 + 0.005), 0.28 + i * 0.1, 0]} m={m.black} cast={false} />
        )),
      )}
      {Array.from({ length: 9 }).map((_, i) => (
        <Box key={i} s={[W - 0.4, 0.015, 0.025]} p={[0, H + 0.012, -0.22 + i * 0.055]} m={m.black} cast={false} />
      ))}

      {/* wall bracket tabs */}
      {[-1, 1].map((sx) => (
        <Box key={sx} s={[0.12, 0.28, 0.04]} p={[sx * (W / 2 - 0.15), H - 0.25, -D / 2 - 0.02]} m={m.stainlessDark} />
      ))}
      {[-1, 1].map((sx) => (
        <Box key={sx} s={[0.12, 0.28, 0.04]} p={[sx * (W / 2 - 0.15), 0.25, -D / 2 - 0.02]} m={m.stainlessDark} />
      ))}

      {/* cable conduit running down the wall to the supply point */}
      <Cyl rad={0.06} h={3.55} p={[-0.38, -1.78, -D / 2 + 0.06]} m={m.plastic} seg={12} />
      <Cyl rad={0.075} h={0.1} p={[-0.38, -0.05, -D / 2 + 0.06]} m={m.plastic} seg={12} />
      {[-0.6, -1.5, -2.5].map((y) => (
        <Cyl key={y} rad={0.075} h={0.04} p={[-0.38, y, -D / 2 + 0.06]} m={m.stainless} seg={12} />
      ))}
    </group>
  );
}
