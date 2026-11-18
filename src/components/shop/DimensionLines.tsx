"use client";

import { Line } from "@react-three/drei";
import { useMemo } from "react";
import type { ShopLayout } from "@/data/shopLayout";
import type { EquipmentId } from "@/types";

type V3 = [number, number, number];

/** Wire box + extension ticks around the selected item (labels are drawn by <PinLayer>). */
export function DimensionLines({ layout, selected }: { layout: ShopLayout; selected: EquipmentId | null }) {
  const box = useMemo(() => {
    if (!selected) return null;
    const bs = layout.boxes.filter((b) => b.id === selected);
    if (!bs.length) return null;
    const min: V3 = [Infinity, Infinity, Infinity];
    const max: V3 = [-Infinity, -Infinity, -Infinity];
    for (const b of bs)
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], b.min[i]);
        max[i] = Math.max(max[i], b.max[i]);
      }
    return { min, max };
  }, [layout, selected]);

  if (!box) return null;
  const { min, max } = box;
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;
  const c = "#f9729b";
  const edge = (a: V3, b: V3) => <Line key={`${a}${b}`} points={[a, b]} color={c} lineWidth={1.4} depthTest={false} transparent opacity={0.9} />;
  const corners: V3[] = [
    [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
    [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
  ];
  const pairs: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return <group renderOrder={20}>{pairs.map(([a, b]) => edge(corners[a], corners[b]))}</group>;
}

/** Axis-aligned extents of an equipment item, for label placement. */
export function itemExtents(layout: ShopLayout, id: EquipmentId) {
  const bs = layout.boxes.filter((b) => b.id === id);
  if (!bs.length) return null;
  const min: V3 = [Infinity, Infinity, Infinity];
  const max: V3 = [-Infinity, -Infinity, -Infinity];
  for (const b of bs)
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], b.min[i]);
      max[i] = Math.max(max[i], b.max[i]);
    }
  return { min, max };
}
