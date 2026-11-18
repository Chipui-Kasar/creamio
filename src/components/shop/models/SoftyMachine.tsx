"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { getMaterials } from "@/lib/materials";
import { createSwirlGeometry } from "@/lib/swirl";
import { labelTexture } from "@/lib/textures";
import { Box, Cyl, PI, Plane } from "./parts";

/**
 * Commercial countertop softy machine — two compressors, two hoppers,
 * three nozzles (flavour A, twist, flavour B).
 * Local origin: base of the machine on the counter. Front is +z.
 * Body is 1.55 ft deep, the drip tray carries it to 2.05 ft overall.
 */
export function SoftyMachine() {
  const m = getMaterials();
  const W = 1.75;
  const bd = 1.55;
  const zc = -0.25; // body centre z
  const zf = zc + bd / 2; // front face z

  const swirl = useMemo(() => createSwirlGeometry({ turns: 3, baseRadius: 0.185, height: 0.2, tubeRadius: 0.07, steps: 100, radial: 14 }), []);
  const panelTex = useMemo(
    () =>
      labelTexture(
        [
          { text: "DOUBLE COMPRESSOR", size: 30, color: "#7fe4d6", weight: "600", y: 54, spacing: 3 },
          { text: "FLAVOUR A  ·  TWIST  ·  B", size: 28, color: "#ffffff", weight: "500", y: 118, spacing: 2 },
          { text: "−18 °C   −18 °C", size: 40, color: "#ffb7cc", weight: "700", y: 190 },
        ],
        512,
        256,
        "#0b1620",
      ),
    [],
  );
  const panelMat = useMemo(() => new THREE.MeshBasicMaterial({ map: panelTex, toneMapped: false }), [panelTex]);
  const plateTex = useMemo(
    () =>
      labelTexture(
        [
          { text: "SOFTY", size: 120, color: "#14304f", weight: "800", y: 100, spacing: 8 },
          { text: "2 + 1 TWIST", size: 64, color: "#f9729b", weight: "700", y: 200, spacing: 6 },
        ],
        512,
        256,
        "#fff4e4",
      ),
    [],
  );
  const plateMat = useMemo(() => new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.4, metalness: 0.2 }), [plateTex]);

  return (
    <group>
      {/* feet */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Cyl key={`${sx}${sz}`} rad={0.07} h={0.1} p={[sx * (W / 2 - 0.18), 0.05, zc + sz * (bd / 2 - 0.2)]} m={m.rubber} seg={12} />
        )),
      )}

      {/* lower compressor cabinet */}
      <Box s={[W, 0.92, bd]} p={[0, 0.1 + 0.46, zc]} m={m.stainless} radius={0.05} />
      {/* compressor louvres — twin vents (two compressors) */}
      {[-1, 1].map((sx) =>
        Array.from({ length: 6 }).map((_, i) => (
          <Box key={`${sx}${i}`} s={[0.52, 0.022, 0.02]} p={[sx * 0.46, 0.32 + i * 0.1, zf + 0.012]} m={m.black} cast={false} />
        )),
      )}
      <Plane s={[0.55, 0.275]} p={[0, 0.58, zf + 0.012]} m={plateMat} />

      {/* freezing-cylinder housing */}
      <Box s={[W - 0.04, 1.5, bd - 0.04]} p={[0, 1.02 + 0.75, zc]} m={m.stainless} radius={0.07} />
      {/* ventilated side slots */}
      {[-1, 1].map((sx) =>
        Array.from({ length: 9 }).map((_, i) => (
          <Box key={`${sx}${i}`} s={[0.02, 0.03, 0.9]} p={[sx * (W / 2 + 0.005), 1.28 + i * 0.075, zc]} m={m.black} cast={false} />
        )),
      )}

      {/* control panel (angled glass) */}
      <group position={[0, 1.42, zf + 0.0]} rotation={[-0.22, 0, 0]}>
        <Box s={[1.3, 0.62, 0.05]} p={[0, 0, 0.02]} m={m.black} radius={0.03} />
        <Plane s={[0.78, 0.39]} p={[-0.18, 0.06, 0.05]} m={panelMat} />
        {[-0.5, -0.25, 0].map((x, i) => (
          <Cyl key={i} rad={0.05} h={0.03} p={[0.3 + x * 0.95 + 0.24, -0.16, 0.05]} r={[PI / 2, 0, 0]} m={i === 1 ? m.pink : m.chrome} seg={16} />
        ))}
        <Box s={[0.05, 0.03, 0.01]} p={[0.5, 0.2, 0.05]} m={m.ledGreen} cast={false} />
        <Box s={[0.05, 0.03, 0.01]} p={[0.38, 0.2, 0.05]} m={m.ledAmber} cast={false} />
      </group>

      {/* dispensing door */}
      <Box s={[1.48, 0.62, 0.14]} p={[0, 2.12, zf + 0.06]} m={m.stainlessDark} radius={0.04} />
      <Box s={[1.4, 0.06, 0.1]} p={[0, 1.83, zf + 0.12]} m={m.stainless} radius={0.02} />
      {[-0.6, 0.6].map((x) => (
        <Cyl key={x} rad={0.06} h={0.1} p={[x, 2.12, zf + 0.17]} r={[PI / 2, 0, 0]} m={m.chrome} seg={16} />
      ))}

      {/* nozzles + handles  (flavour A, twist, flavour B) */}
      {[-0.5, 0, 0.5].map((x, i) => (
        <group key={x} position={[x, 0, zf]}>
          {/* arm from the door to the nozzle head */}
          <Cyl rad={0.075} h={0.5} p={[0, 1.86, 0.3]} r={[PI / 2, 0, 0]} m={m.stainless} seg={18} />
          <Cyl rad={0.1} h={0.2} p={[0, 1.76, 0.46]} m={m.stainless} seg={20} />
          <Cyl rad={0.075} rb={0.11} h={0.14} p={[0, 1.62, 0.46]} m={i === 1 ? m.pink : m.plastic} seg={20} />
          <Cyl rad={0.07} h={0.05} p={[0, 1.54, 0.46]} m={m.plastic} seg={8} />
          {/* lever */}
          <group position={[0, 2.3, 0.2]} rotation={[-0.5, 0, 0]}>
            <Cyl rad={0.035} h={0.48} p={[0, 0.2, 0]} m={m.chrome} seg={10} />
            <mesh position={[0, 0.46, 0]} castShadow material={i === 1 ? m.pink : m.black}>
              <sphereGeometry args={[0.07, 14, 12]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* hoppers — one per compressor, with clear domed lids */}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * 0.42, 2.52, zc - 0.05]}>
          <Box s={[0.68, 0.22, 0.9]} p={[0, 0.0, 0]} m={m.stainless} radius={0.04} />
          <Box s={[0.74, 0.04, 0.96]} p={[0, 0.12, 0]} m={m.stainless} radius={0.02} />
          <mesh position={[0, 0.2, 0]} castShadow material={m.polycarb}>
            <sphereGeometry args={[0.36, 24, 14, 0, PI * 2, 0, PI / 2]} />
          </mesh>
          <mesh position={[0, 0.23, 0]} scale={[1, 0.5, 1.1]} material={m.vanilla}>
            <cylinderGeometry args={[0.28, 0.28, 0.1, 20]} />
          </mesh>
          <Cyl rad={0.04} h={0.06} p={[0, 0.55, 0]} m={m.chrome} seg={10} />
        </group>
      ))}

      {/* drip tray (stainless, slotted) */}
      <Box s={[1.3, 0.07, 0.78]} p={[0, 0.98, zf + 0.37]} m={m.stainless} radius={0.02} />
      <Box s={[1.3, 0.05, 0.04]} p={[0, 1.02, zf + 0.76]} m={m.stainless} />
      {Array.from({ length: 9 }).map((_, i) => (
        <Box key={i} s={[1.1, 0.012, 0.025]} p={[0, 1.025, zf + 0.12 + i * 0.07]} m={m.black} cast={false} />
      ))}

      {/* cup + swirl being dispensed */}
      <group position={[0, 1.02, zf + 0.46]}>
        <Cyl rad={0.2} rb={0.14} h={0.42} p={[0, 0.21, 0]} m={m.navy} seg={28} />
        <Cyl rad={0.205} h={0.04} p={[0, 0.43, 0]} m={m.cream} seg={28} />
        <mesh geometry={swirl} position={[0, 0.43, 0]} castShadow material={m.strawberry} />
        <Cyl rad={0.205} rb={0.205} h={0.012} p={[0, 0.2, 0]} m={m.pink} seg={28} cast={false} />
      </group>
    </group>
  );
}
