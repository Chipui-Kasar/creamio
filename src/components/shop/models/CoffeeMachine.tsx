"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getMaterials } from "@/lib/materials";
import { labelTexture } from "@/lib/textures";
import { Box, Cyl, PI, Plane } from "./parts";

/**
 * Semi-automatic espresso machine (portafilter, group head, pressure gauge, steam wand)
 * with cups, bean jar, tamper, knock box and milk jug.
 * Local origin: counter surface under the machine centre. Front is +z.
 * The machine body is ~1.25 × 1.1 × 1.35 ft; accessories extend to the right (+x).
 */
export function CoffeeMachine() {
  const m = getMaterials();

  const steam = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.0, -0.18, 0.04),
      new THREE.Vector3(-0.02, -0.34, 0.22),
      new THREE.Vector3(-0.02, -0.5, 0.28),
    ]);
    return new THREE.TubeGeometry(c, 24, 0.018, 8, false);
  }, []);

  const labelMat = useMemo(() => {
    const t = labelTexture(
      [
        { text: "AGARO", size: 104, color: "#ffffff", weight: "800", y: 100, spacing: 10 },
        { text: "ESPRESSO · 15 BAR", size: 36, color: "#f9a7c0", weight: "600", y: 200, spacing: 5 },
      ],
      512,
      256,
      "transparent",
    );
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false });
  }, []);

  const beans = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!beans.current) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < 90; i++) {
      const a = i * 2.4;
      const r = Math.sqrt(i / 90) * 0.17;
      o.position.set(Math.cos(a) * r, 0.05 + (i % 9) * 0.058, Math.sin(a) * r);
      o.rotation.set(i * 0.7, i * 1.3, i * 0.4);
      o.scale.set(1, 0.65, 0.5);
      o.updateMatrix();
      beans.current.setMatrixAt(i, o.matrix);
    }
    beans.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      {/* ───── machine ───── */}
      <Box s={[1.25, 0.07, 0.8]} p={[0, 0.035, 0.05]} m={m.stainless} radius={0.02} />
      {/* main body */}
      <Box s={[1.15, 0.98, 0.72]} p={[0, 0.07 + 0.49, -0.12]} m={m.black} radius={0.1} />
      {/* stainless front band */}
      <Box s={[1.12, 0.62, 0.04]} p={[0, 0.62, 0.255]} m={m.stainless} radius={0.03} />
      <Box s={[1.16, 0.045, 0.74]} p={[0, 1.03, -0.12]} m={m.stainless} radius={0.02} />
      {/* cup-warmer rail */}
      {[-0.5, 0.5].map((x) => (
        <Box key={x} s={[0.03, 0.1, 0.5]} p={[x, 1.105, -0.12]} m={m.chrome} cast={false} />
      ))}
      <Cyl rad={0.014} h={1.0} r={[0, 0, PI / 2]} p={[0, 1.14, -0.36]} m={m.chrome} seg={8} />
      <Cyl rad={0.014} h={1.0} r={[0, 0, PI / 2]} p={[0, 1.14, 0.1]} m={m.chrome} seg={8} />
      {/* back water tank */}
      <Box s={[0.42, 0.78, 0.22]} p={[0.35, 0.6, -0.55]} m={m.polycarb} cast={false} />
      <Box s={[0.38, 0.5, 0.2]} p={[0.35, 0.48, -0.55]} m={m.water} cast={false} />
      <Box s={[0.44, 0.05, 0.24]} p={[0.35, 1.0, -0.55]} m={m.black} />

      {/* brand plate */}
      <Plane s={[0.5, 0.25]} p={[-0.28, 0.9, 0.282]} m={labelMat} />

      {/* pressure gauge */}
      <group position={[0.36, 0.9, 0.275]}>
        <Cyl rad={0.12} h={0.04} r={[PI / 2, 0, 0]} m={m.chrome} seg={32} />
        <Cyl rad={0.1} h={0.045} p={[0, 0, 0.003]} r={[PI / 2, 0, 0]} m={m.ceramic} seg={32} />
        <Box s={[0.008, 0.075, 0.01]} p={[0.01, 0.025, 0.03]} r={[0, 0, -0.7]} m={m.ledRed} cast={false} />
        <Box s={[0.07, 0.008, 0.005]} p={[0.0, -0.05, 0.026]} m={m.black} cast={false} />
      </group>
      {/* knobs + buttons */}
      {/* control column on the right: three buttons + a steam knob, stacked (reads as a machine, not a face) */}
      {[0.72, 0.62, 0.52].map((y, i) => (
        <Cyl key={y} rad={0.034} h={0.04} p={[0.45, y, 0.283]} r={[PI / 2, 0, 0]} m={i === 0 ? m.pink : m.chrome} seg={16} />
      ))}
      <Cyl rad={0.055} h={0.07} p={[0.45, 0.4, 0.3]} r={[PI / 2, 0, 0]} m={m.black} seg={20} />
      <Box s={[0.05, 0.02, 0.01]} p={[0.45, 0.8, 0.28]} m={m.ledGreen} cast={false} />
      {/* group head + portafilter */}
      <Cyl rad={0.13} h={0.12} p={[0, 0.5, 0.27]} m={m.stainlessDark} seg={28} />
      <group position={[0, 0.43, 0.3]} rotation={[0, 0.35, 0]}>
        <Cyl rad={0.12} rb={0.1} h={0.08} p={[0, 0, 0]} m={m.stainless} seg={28} />
        <Cyl rad={0.03} h={0.5} p={[0, 0.0, 0.34]} r={[PI / 2 - 0.04, 0, 0]} m={m.black} seg={14} />
        <Cyl rad={0.045} h={0.16} p={[0, -0.01, 0.62]} r={[PI / 2 - 0.04, 0, 0]} m={m.black} seg={14} />
      </group>
      {/* two spouts */}
      {[-0.045, 0.045].map((x) => (
        <Cyl key={x} rad={0.012} h={0.1} p={[x, 0.36, 0.31]} m={m.chrome} seg={8} />
      ))}

      {/* drip tray grille + cups with crema */}
      <Box s={[1.0, 0.04, 0.45]} p={[0, 0.095, 0.5]} m={m.stainless} radius={0.015} />
      {Array.from({ length: 8 }).map((_, i) => (
        <Box key={i} s={[0.9, 0.012, 0.02]} p={[0, 0.12, 0.34 + i * 0.045]} m={m.black} cast={false} />
      ))}
      {[-0.16, 0.16].map((x) => (
        <group key={x} position={[x, 0.12, 0.45]}>
          <Cyl rad={0.075} rb={0.052} h={0.1} p={[0, 0.05, 0]} m={m.ceramic} seg={20} />
          <Cyl rad={0.062} h={0.012} p={[0, 0.095, 0]} m={m.crema} seg={20} cast={false} />
          <mesh position={[0.075, 0.06, 0]} rotation={[0, 0, 0]} material={m.ceramic}>
            <torusGeometry args={[0.03, 0.009, 8, 12, PI]} />
          </mesh>
        </group>
      ))}

      {/* steam wand */}
      <group position={[0.6, 0.62, 0.12]}>
        <Cyl rad={0.03} h={0.08} r={[0, 0, PI / 2]} p={[-0.02, 0, 0]} m={m.chrome} seg={10} />
        <mesh geometry={steam} castShadow material={m.chrome} />
        <Cyl rad={0.03} h={0.05} p={[0, 0.03, 0]} m={m.black} seg={10} />
      </group>
      {/* cups warming on top */}
      {[-0.25, -0.1, 0.05].map((x) => (
        <group key={x} position={[x, 1.07, -0.12]}>
          <Cyl rad={0.075} rb={0.055} h={0.1} p={[0, 0.05, 0]} m={m.ceramic} seg={20} />
        </group>
      ))}

      {/* feet */}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Cyl key={`${sx}${sz}`} rad={0.05} h={0.02} p={[sx * 0.52, 0.01, sz * 0.3 + 0.05]} m={m.rubber} seg={10} />))}

      {/* ───── accessories (right of the machine) ───── */}
      <group position={[0.95, 0, 0.2]}>
        {/* bean jar */}
        <Cyl rad={0.2} h={0.62} p={[0, 0.31, 0]} m={m.polycarb} seg={26} />
        <instancedMesh ref={beans} args={[undefined, undefined, 90]} castShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <primitive object={m.coffee} attach="material" />
        </instancedMesh>
        <Cyl rad={0.21} h={0.07} p={[0, 0.65, 0]} m={m.woodDark} seg={26} />
      </group>
      {/* stack of takeaway-style ceramic cups */}
      <group position={[0.92, 0, 0.78]}>
        {[0, 1, 2].map((i) => (
          <Cyl key={i} rad={0.1} rb={0.07} h={0.12} p={[0, 0.06 + i * 0.075, 0]} m={m.ceramic} seg={20} />
        ))}
      </group>
      {/* knock box + tamper + milk jug */}
      <Box s={[0.28, 0.13, 0.22]} p={[1.3, 0.065, 0.78]} m={m.charcoal} radius={0.025} />
      <Cyl rad={0.075} rb={0.06} h={0.3} p={[1.2, 0.15, 0.44]} m={m.stainless} seg={20} />
      <Cyl rad={0.018} h={0.17} p={[1.2, 0.38, 0.44]} r={[0, 0, 0.0]} m={m.stainless} seg={8} />
      <Cyl rad={0.04} h={0.05} p={[1.2, 0.48, 0.44]} m={m.woodDark} seg={14} />
      <Cyl rad={0.035} h={0.09} p={[1.55, 0.045, 0.48]} m={m.black} seg={14} />
    </group>
  );
}
