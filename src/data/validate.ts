import type { Box3, ShopLayout } from "./shopLayout";

export interface Check {
  id: string;
  label: string;
  ok: boolean;
  /** error = hard failure (overlap, outside the room), warn = comfort guideline. */
  level: "error" | "warn";
  detail: string;
}

const EPS = 0.02;

function overlap(a: Box3, b: Box3) {
  for (let i = 0; i < 3; i++) if (a.max[i] - EPS <= b.min[i] || b.max[i] - EPS <= a.min[i]) return false;
  return true;
}

/**
 * Pure layout validation — used by the live panel and by `npm run validate`.
 * Hard errors: anything outside the room / ceiling, any two fixtures overlapping, a blocked door.
 * Warnings: comfort guidelines (lanes, clearances).
 */
export function validateLayout(L: ShopLayout): { checks: Check[]; errors: Check[]; warnings: Check[] } {
  const { hx, hz, height } = L.room;
  const checks: Check[] = [];
  const push = (c: Check) => checks.push(c);

  // inside the room, under the ceiling
  const out = L.boxes.filter(
    (b) => b.min[0] < -hx - 0.05 || b.max[0] > hx + 0.05 || b.min[2] < -hz - 0.05 || b.max[2] > hz + 0.05 || b.max[1] > height - 0.2,
  );
  push({ id: "bounds", label: "Everything fits inside the walls", level: "error", ok: out.length === 0, detail: out.length ? `${[...new Set(out.map((b) => b.id))].join(", ")} outside the room` : "All fixtures are within the walls and under the ceiling" });

  // no overlaps between different fixtures
  const hits: string[] = [];
  for (let i = 0; i < L.boxes.length; i++)
    for (let j = i + 1; j < L.boxes.length; j++) {
      const a = L.boxes[i];
      const b = L.boxes[j];
      if (a.id === b.id) continue;
      if (overlap(a, b)) hits.push(`${a.id} × ${b.id}`);
    }
  push({ id: "overlap", label: "No fixtures overlap", level: "error", ok: hits.length === 0, detail: hits.length ? [...new Set(hits)].join(", ") : "No two fixtures occupy the same space" });

  // entrance
  const front = { min: [L.door.x - L.door.width / 2, 0, hz - 3] as [number, number, number], max: [L.door.x + L.door.width / 2, 7, hz] as [number, number, number], id: "door" };
  const blockFront = L.boxes.filter((b) => overlap(b, front));
  push({ id: "door", label: "Entrance is clear", level: "error", ok: blockFront.length === 0, detail: blockFront.length ? `Blocked by ${blockFront[0].id}` : "3 ft clear inside the door" });

  // visi cooler: its door must be able to open into the lane
  const v = L.placements["visi-cooler"];
  const doorSwing = { id: "cooler-door", min: [v.x + 1, 0, v.z - 1] as [number, number, number], max: [v.x + 3, 5.6, v.z + 1] as [number, number, number] };
  const doorHits = L.boxes.filter((b) => b.id !== "visi-cooler" && overlap(b, doorSwing));
  push({ id: "cooler", label: "Visi cooler door can open", level: "error", ok: doorHits.length === 0, detail: doorHits.length ? `Door would hit ${doorHits[0].id}` : "2 ft clear in front of the glass door" });

  // comfort guidelines
  const sinkB = L.boxes.find((b) => b.id === "sink");
  const f350B = L.boxes.find((b) => b.id === "freezer-350");
  if (sinkB && f350B) {
    const dx = Math.max(0, f350B.min[0] - sinkB.max[0], sinkB.min[0] - f350B.max[0]);
    const dz = Math.max(0, f350B.min[2] - sinkB.max[2], sinkB.min[2] - f350B.max[2]);
    const dist = Math.hypot(dx, dz);
    push({ id: "wash", label: "Sink ≥ 2.5 ft from the scooping counter", level: "error", ok: dist >= 2.5, detail: `${dist.toFixed(1)} ft apart (plus a glass splash guard on the sink's counter side)` });
  }
  push({ id: "aisle", label: "Staff aisle ≥ 2.4 ft", level: "warn", ok: L.zCounter - L.zAisle >= 2.4, detail: `${(L.zCounter - L.zAisle).toFixed(1)} ft between back run and counter` });
  push({ id: "lane", label: "Customer lane ≥ 1.8 ft (beside the 400 L)", level: "warn", ok: L.lane >= 1.79, detail: `${L.lane.toFixed(1)} ft` });
  push({ id: "queue", label: "Queue lane ≥ 3 ft", level: "warn", ok: L.frontStrip >= 3, detail: `${L.frontStrip.toFixed(1)} ft in front of the counter` });
  const seat = L.placements.seating;
  const f400 = L.placements["freezer-400"];
  const gap = seat.z - seat.d / 2 - (f400.z + f400.w / 2);
  push({ id: "seat-gap", label: "Seating clear of the 400 L (≥ 0.6 ft)", level: "warn", ok: gap >= 0.6, detail: `${gap.toFixed(1)} ft gap` });
  const stab = L.placements.stabilizer;
  const vent = stab.x - stab.w / 2 - (-hx + 2.2);
  push({ id: "vent", label: "Stabilizer ventilation ≥ 3 in.", level: "warn", ok: vent >= 0.25, detail: `${(vent * 12).toFixed(0)} in. each side` });

  return { checks, errors: checks.filter((c) => !c.ok && c.level === "error"), warnings: checks.filter((c) => !c.ok && c.level === "warn") };
}
