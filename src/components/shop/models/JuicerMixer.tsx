"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getMaterials } from "@/lib/materials";
import { citrusTexture } from "@/lib/textures";
import { Box, Cyl, PI } from "./parts";

/**
 * Commercial juicer-mixer on its prep counter, with fruit basket, glasses and straws.
 * Local origin: counter surface under the machine. Front is +z.
 */
export function JuicerMixer() {
  const m = getMaterials();
  const orangeMat = useMemo(() => new THREE.MeshStandardMaterial({ map: citrusTexture(), roughness: 0.55, bumpMap: citrusTexture(), bumpScale: 0.6 }), []);

  const baseH = 0.78;
  const jarH = 1.0;
  const jarY = baseH + 0.06;

  // basket oranges (instanced)
  const oranges = useRef<THREE.InstancedMesh>(null);
  const spots: [number, number, number][] = [
    [-0.09, 0.27, 0.02], [0.1, 0.27, -0.04], [0.0, 0.27, 0.12], [-0.1, 0.27, -0.1],
    [0.0, 0.39, 0.0], [0.11, 0.38, 0.07], [-0.1, 0.38, 0.06],
  ];
  useLayoutEffect(() => {
    if (!oranges.current) return;
    const o = new THREE.Object3D();
    spots.forEach((p, i) => {
      o.position.set(...p);
      o.scale.setScalar(1);
      o.rotation.set(i, i * 2, 0);
      o.updateMatrix();
      oranges.current!.setMatrixAt(i, o.matrix);
    });
    oranges.current.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group>
      {/* motor base */}
      <Box s={[1.0, 0.1, 0.9]} p={[0, 0.05, 0]} m={m.rubber} radius={0.03} />
      <Box s={[0.96, baseH - 0.1, 0.86]} p={[0, 0.1 + (baseH - 0.1) / 2, 0]} m={m.stainless} radius={0.11} />
      <Box s={[0.9, 0.34, 0.03]} p={[0, 0.36, 0.435]} m={m.navy} radius={0.02} />
      {/* speed dial + switches + LEDs */}
      <Cyl rad={0.1} h={0.07} p={[-0.2, 0.37, 0.475]} r={[PI / 2, 0, 0]} m={m.black} seg={24} />
      <Cyl rad={0.075} h={0.075} p={[-0.2, 0.37, 0.48]} r={[PI / 2, 0, 0]} m={m.chrome} seg={24} />
      <Box s={[0.012, 0.07, 0.01]} p={[-0.2, 0.41, 0.525]} m={m.pink} cast={false} />
      {[0.12, 0.27].map((x, i) => (
        <Box key={x} s={[0.1, 0.1, 0.04]} p={[x, 0.37, 0.465]} m={i === 0 ? m.plastic : m.pink} radius={0.02} />
      ))}
      <Box s={[0.05, 0.025, 0.01]} p={[0.2, 0.5, 0.455]} m={m.ledGreen} cast={false} />
      {/* collar */}
      <Cyl rad={0.38} rb={0.4} h={0.08} p={[0, baseH + 0.02, 0]} m={m.stainlessDark} seg={32} />

      {/* jar */}
      <group position={[0, jarY, 0]}>
        <Cyl rad={0.4} rb={0.3} h={jarH} p={[0, jarH / 2 + 0.02, 0]} m={m.polycarb} seg={36} open />
        <Cyl rad={0.3} h={0.08} p={[0, 0.06, 0]} m={m.stainless} seg={24} />
        {/* blades */}
        <Box s={[0.5, 0.012, 0.07]} p={[0, 0.14, 0]} r={[0, 0.4, 0.1]} m={m.chrome} cast={false} />
        <Box s={[0.5, 0.012, 0.07]} p={[0, 0.17, 0]} r={[0, -0.9, -0.1]} m={m.chrome} cast={false} />
        {/* juice */}
        <Cyl rad={0.358} rb={0.298} h={0.62} p={[0, 0.33, 0]} m={m.juice} seg={32} cast={false} />
        <Cyl rad={0.36} h={0.03} p={[0, 0.65, 0]} m={m.mango} seg={32} cast={false} />
        {/* lid */}
        <Cyl rad={0.415} h={0.07} p={[0, jarH + 0.04, 0]} m={m.black} seg={36} />
        <Cyl rad={0.12} h={0.07} p={[0, jarH + 0.1, 0]} m={m.pink} seg={20} />
        <Cyl rad={0.09} h={0.04} p={[0, jarH + 0.15, 0]} m={m.charcoal} seg={20} />
        {/* handle */}
        <mesh position={[0.37, 0.55, 0]} rotation={[0, 0, -PI / 2]} castShadow material={m.black}>
          <torusGeometry args={[0.24, 0.034, 10, 24, PI]} />
        </mesh>
        {/* pour spout */}
        <Box s={[0.18, 0.05, 0.14]} p={[-0.02, jarH + 0.02, 0.42]} r={[0.2, 0, 0]} m={m.polycarb} cast={false} />
      </group>

      {/* fruit basket with oranges */}
      <group position={[-0.34, 0, 0.7]}>
        <Cyl rad={0.28} rb={0.2} h={0.28} p={[0, 0.14, 0]} m={m.woodLight} seg={22} />
        <Cyl rad={0.285} h={0.03} p={[0, 0.28, 0]} m={m.wood} seg={22} />
        <instancedMesh ref={oranges} args={[undefined, undefined, spots.length]} castShadow>
          <sphereGeometry args={[0.13, 18, 14]} />
          <primitive object={orangeMat} attach="material" />
        </instancedMesh>
      </group>
      {/* lemons */}
      {[[0.14, 0.05, 0.84], [0.0, 0.05, 0.92]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} scale={[1, 0.8, 1.2]} rotation={[0, i, 0]} castShadow material={m.lemon}>
          <sphereGeometry args={[0.09, 14, 10]} />
        </mesh>
      ))}

      {/* tall glasses with juice + straws */}
      {[0.4, 0.78].map((x, i) => (
        <group key={x} position={[x, 0, 0.78]}>
          <Cyl rad={0.115} rb={0.09} h={0.5} p={[0, 0.25, 0]} m={m.polycarb} seg={22} open />
          <Cyl rad={0.1} rb={0.082} h={0.4} p={[0, 0.21, 0]} m={i === 0 ? m.juice : m.strawberry} seg={20} cast={false} />
          <Cyl rad={0.014} h={0.62} p={[0.03, 0.34, 0]} r={[0, 0, 0.12]} m={i === 0 ? m.pink : m.teal} seg={6} />
        </group>
      ))}
      {/* orange slice on the glass rim */}
      <mesh position={[0.5, 0.48, 0.78]} rotation={[0.2, 0, 0.5]} material={m.orange}>
        <cylinderGeometry args={[0.07, 0.07, 0.015, 14]} />
      </mesh>
    </group>
  );
}
