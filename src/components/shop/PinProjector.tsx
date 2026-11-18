"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import type { ShopLayout } from "@/data/shopLayout";
import { useWake } from "@/hooks/useWake";
import { getPinItems } from "./pins";

/** Projects each pin's 3D anchor to screen space and moves the matching DOM element. */
export function PinProjector({ layout, visiCooler, plan, dimsFor }: { layout: ShopLayout; visiCooler: boolean; plan: boolean; dimsFor: import("@/types").EquipmentId | null }) {
  const items = useMemo(() => getPinItems(layout, visiCooler, plan, dimsFor), [layout, visiCooler, plan, dimsFor]);
  const v = useMemo(() => new THREE.Vector3(), []);
  const size = useThree((s) => s.size);
  useWake([items]);

  useFrame(({ camera }) => {
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (!el) continue;
      v.set(...it.pos);
      const dist = camera.position.distanceTo(v);
      v.project(camera);
      const hidden = v.z > 1 || Math.abs(v.x) > 1.15 || Math.abs(v.y) > 1.15;
      if (hidden) {
        el.style.visibility = "hidden";
        continue;
      }
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      const s = it.kind === "tag" ? 1 : THREE.MathUtils.clamp(12 / dist, 0.62, 1.3);
      el.style.visibility = "visible";
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%) scale(${s.toFixed(3)})`;
      el.style.zIndex = String(Math.round(2000 - dist * 20));
    }
  });
  return null;
}
