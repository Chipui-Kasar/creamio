"use client";

import { RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import type * as THREE from "three";

type V3 = [number, number, number];
type Mat = THREE.Material;

interface CommonProps {
  p?: V3;
  r?: V3;
  m: Mat;
  cast?: boolean;
  receive?: boolean;
  name?: string;
}

/** Box (optionally rounded). Size is [w, h, d]. */
export function Box({
  s,
  radius,
  p = [0, 0, 0],
  r,
  m,
  cast = true,
  receive = true,
  smooth = 3,
  ...rest
}: CommonProps & { s: V3; radius?: number; smooth?: number } & Omit<ThreeElements["mesh"], "args">) {
  if (radius && radius > 0) {
    return (
      <RoundedBox
        args={s}
        radius={Math.min(radius, Math.min(...s) / 2 - 0.001)}
        smoothness={smooth}
        position={p}
        rotation={r}
        castShadow={cast}
        receiveShadow={receive}
        material={m}
        {...(rest as object)}
      />
    );
  }
  return (
    <mesh position={p} rotation={r} castShadow={cast} receiveShadow={receive} material={m} {...rest}>
      <boxGeometry args={s} />
    </mesh>
  );
}

/** Cylinder; `r` is the radius at the top, `rb` at the bottom (defaults to r). */
export function Cyl({
  rad,
  rb,
  h,
  p = [0, 0, 0],
  r,
  m,
  seg = 28,
  cast = true,
  receive = true,
  open = false,
  ...rest
}: CommonProps & { rad: number; rb?: number; h: number; seg?: number; open?: boolean } & Omit<
    ThreeElements["mesh"],
    "args"
  >) {
  return (
    <mesh position={p} rotation={r} castShadow={cast} receiveShadow={receive} material={m} {...rest}>
      <cylinderGeometry args={[rad, rb ?? rad, h, seg, 1, open]} />
    </mesh>
  );
}

export function Sph({
  rad,
  p = [0, 0, 0],
  scale,
  m,
  seg = 20,
  cast = true,
  receive = true,
  ...rest
}: Omit<CommonProps, "r"> & { rad: number; seg?: number; scale?: V3 } & Omit<ThreeElements["mesh"], "args">) {
  return (
    <mesh position={p} scale={scale} castShadow={cast} receiveShadow={receive} material={m} {...rest}>
      <sphereGeometry args={[rad, seg, Math.max(8, Math.floor(seg * 0.7))]} />
    </mesh>
  );
}

/** Flat label / panel plane that faces +z. */
export function Plane({
  s,
  p = [0, 0, 0],
  r,
  m,
  ...rest
}: Omit<CommonProps, "cast" | "receive"> & { s: [number, number] } & Omit<ThreeElements["mesh"], "args">) {
  return (
    <mesh position={p} rotation={r} material={m} {...rest}>
      <planeGeometry args={s} />
    </mesh>
  );
}

export const PI = Math.PI;
