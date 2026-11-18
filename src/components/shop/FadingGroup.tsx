"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useWake } from "@/hooks/useWake";
import type { WallMode } from "@/types";
import * as THREE from "three";

interface Entry {
  m: THREE.Material;
  base: number;
  wasTransparent: boolean;
  depthWrite: boolean;
}

/**
 * A group that fades out when the camera is on its *outer* side — this is what
 * turns the walls into a cut-away dolls-house as you orbit, and lets you look straight
 * down in the floor-plan view.
 *
 *  normal / dist describe the plane: a wall at x = +5 has normal [1,0,0], dist 5.
 */
export function FadingGroup({
  normal,
  dist,
  children,
  hidden = false,
  cut = false,
  mode = "auto",
}: {
  normal: [number, number, number];
  dist: number;
  children: ReactNode;
  /** Force hidden (e.g. ceiling in plan mode). */
  hidden?: boolean;
  /** Squash the group towards the floor (low cut-wall look for the floor plan). */
  cut?: boolean;
  /** Manual override: show / ghost (see-through) / hide. `auto` fades by camera side. */
  mode?: WallMode;
}) {
  const ref = useRef<THREE.Group>(null);
  const entries = useRef<Entry[]>([]);
  const fade = useRef(1);
  const last = useRef(-1);
  useWake([mode, cut, hidden]);

  useLayoutEffect(() => {
    const list: Entry[] = [];
    ref.current?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const src = mesh.material as THREE.Material | THREE.Material[];
      if (Array.isArray(src)) return;
      const m = src.clone();
      mesh.material = m;
      list.push({ m, base: m.opacity, wasTransparent: m.transparent, depthWrite: m.depthWrite });
    });
    entries.current = list;
    last.current = -1;
    return () => list.forEach((e) => e.m.dispose());
  }, []);

  useFrame((state, dt) => {
    const { camera } = state;
    const sd = camera.position.x * normal[0] + camera.position.y * normal[1] + camera.position.z * normal[2] - dist;
    const target = mode === "show" ? 1 : mode === "hide" ? 0 : mode === "ghost" ? 0.16 : hidden || sd > -0.35 ? 0 : 1;
    const sTarget = cut ? 0.16 : 1;
    const g = ref.current;
    if (!g) return;
    let moving = false;
    if (fade.current !== target) {
      fade.current = THREE.MathUtils.damp(fade.current, target, 9, dt);
      if (Math.abs(fade.current - target) < 0.004) fade.current = target;
      moving = true;
    }
    if (g.scale.y !== sTarget) {
      g.scale.y = THREE.MathUtils.damp(g.scale.y, sTarget, 7, dt);
      if (Math.abs(g.scale.y - sTarget) < 0.003) g.scale.y = sTarget;
      moving = true;
    }
    const f = fade.current;
    g.visible = f > 0.01;
    if (f !== last.current) {
      last.current = f;
      for (const e of entries.current) {
        const solid = f >= 0.999;
        e.m.opacity = e.base * f;
        const tr = e.wasTransparent || !solid;
        if (e.m.transparent !== tr) {
          e.m.transparent = tr;
          e.m.needsUpdate = true;
        }
        e.m.depthWrite = solid ? e.depthWrite : false;
      }
    }
    if (moving) state.invalidate();
  });

  return <group ref={ref}>{children}</group>;
}
