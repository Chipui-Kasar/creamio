import { EQUIPMENT_BY_ID } from "@/data/equipment";
import type { Box3, ShopLayout } from "@/data/shopLayout";
import type { CameraPose, EquipmentId, SeatingConfig, ViewId } from "@/types";

type V3 = [number, number, number];

/** The preset camera views, computed from the current room so they always frame the shop. */
export function viewPose(view: ViewId, L: ShopLayout): CameraPose {
  const { width: W, depth: D, hx, hz } = L.room;
  const k = Math.max(1, Math.max(W, D) / 10);
  const seat = L.placements.seating;
  switch (view) {
    case "overview":
      return { position: [0.24 * W, 14.6 * k, 13.8 * k], target: [0, 1.3, -0.05 * D], fov: 41 };
    case "front":
      return { position: [L.door.x - 3.0, 5.0, hz + 2.8], target: [L.bx + 3, 3.0, L.zCounter], fov: 50 };
    case "seating": {
      const tx = seat.x + (L.seating === "foldable" ? 0.85 : 0);
      return { position: [tx + 4.2, 5.6, hz - 0.45], target: [tx, 2.5, seat.z - 0.3], fov: 58 };
    }
    case "equipment":
      return { position: [-hx + 0.6, 6.3, hz - 1.7], target: [L.bx + 2.5, 2.7, -hz + 0.8], fov: 50 };
    case "left":
      return { position: [-hx - 17 * k, 4.6, 0], target: [0, 3.6, 0], fov: 30 };
    case "right":
      return { position: [hx + 17 * k, 4.6, 0], target: [0, 3.6, 0], fov: 30 };
    case "walk":
      return { position: [L.door.x, 5.4, hz - 1.2], target: [L.door.x, 5.2, hz - 4], fov: 70 };
    case "plan":
      return { position: [0, 3.15 * Math.max(W, D), 0.02], target: [0, 0, 0], fov: 32 };
  }
}

/** Direction (xz) the camera prefers to sit in relative to an item. */
function facing(id: EquipmentId, rotY: number, seating: SeatingConfig): [number, number] {
  if (id === "seating") return seating === "foldable" ? [1, 0] : [0.55, 0.83];
  return [Math.sin(rotY), Math.cos(rotY)];
}

/** Slab test: does the segment a→b pass through the box? */
function segmentHits(a: V3, b: V3, box: Box3, pad = 0.05): boolean {
  let t0 = 0;
  let t1 = 1;
  for (let i = 0; i < 3; i++) {
    const d = b[i] - a[i];
    const lo = box.min[i] + pad;
    const hi = box.max[i] - pad;
    if (Math.abs(d) < 1e-6) {
      if (a[i] < lo || a[i] > hi) return false;
    } else {
      let ta = (lo - a[i]) / d;
      let tb = (hi - a[i]) / d;
      if (ta > tb) [ta, tb] = [tb, ta];
      t0 = Math.max(t0, ta);
      t1 = Math.min(t1, tb);
      if (t0 > t1) return false;
    }
  }
  return true;
}

function inside(p: V3, box: Box3, margin: number) {
  return (
    p[0] > box.min[0] - margin && p[0] < box.max[0] + margin &&
    p[1] > box.min[1] - margin && p[1] < box.max[1] + margin &&
    p[2] > box.min[2] - margin && p[2] < box.max[2] + margin
  );
}

/**
 * Camera pose that frames a piece of equipment. Tries a fan of angles around the item (nearest the
 * item's front first) and raises the camera if needed, rejecting any spot that is inside another
 * object or whose line of sight to the item is blocked by one.
 */
export function focusPose(id: EquipmentId, L: ShopLayout): CameraPose {
  const spec = EQUIPMENT_BY_ID[id];
  const p = L.placements[id];
  const [fx, fz] = facing(id, p.rotY, L.seating);
  const base = Math.atan2(fx, fz);
  const target: V3 = [p.x, spec.focus.height, p.z];
  const d = spec.focus.distance;
  const lifts = [spec.focus.lift ?? d * 0.38, d * 0.62, d * 0.9];
  const deltas = [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4, 1.75, -1.75, 2.1, -2.1, 2.5, -2.5];
  const others = L.boxes.filter((b) => b.id !== id);
  const self = L.boxes.find((b) => b.id === id);
  const { hx, hz } = L.room;
  const inStaff = (x: number, z: number) => x > L.bx - 0.3 && z < L.zFront;
  const targetIsStaff = inStaff(target[0], target[2]);

  let best: { cost: number; pos: V3 } | null = null;
  lifts.forEach((lift, li) => {
    deltas.forEach((delta) => {
      const a = base + delta;
      const pos: V3 = [target[0] + Math.sin(a) * d, Math.min(8.4, Math.max(2.4, target[1] + lift)), target[2] + Math.cos(a) * d];
      if (others.some((b) => inside(pos, b, 0.35)) || (self && inside(pos, self, 0.35))) return;
      if (others.some((b) => segmentHits(pos, target, b))) return;
      const outside = Math.abs(pos[0]) > hx - 0.3 || Math.abs(pos[2]) > hz - 0.3;
      const behind = pos[2] < -hz + 0.2;
      // a customer-side item should be viewed from the customer side, not from inside the staff aisle
      const staffPenalty = !targetIsStaff && inStaff(pos[0], pos[2]) && !outside ? 1.0 : 0;
      const cost = Math.abs(delta) + li * 0.45 + (outside ? 0.3 : 0) + (behind ? 1.2 : 0) + staffPenalty;
      if (!best || cost < best.cost) best = { cost, pos };
    });
  });

  const fallback: V3 = [target[0] + fx * d, target[1] + lifts[1], target[2] + fz * d];
  return { position: (best as { pos: V3 } | null)?.pos ?? fallback, target, fov: 44 };
}
