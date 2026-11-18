import { EQUIPMENT } from "@/data/equipment";
import type { ShopLayout } from "@/data/shopLayout";
import { ftIn } from "@/lib/units";
import type { EquipmentId } from "@/types";

/** Where each hotspot floats, in feet above the item's base. */
const PIN_Y: Record<EquipmentId, number> = {
  "freezer-400": 3.7,
  "freezer-350": 3.7,
  stabilizer: 1.95,
  softy: 3.4,
  juicer: 2.5,
  coffee: 1.85,
  "visi-cooler": 6.4,
  sink: 4.5,
  seating: 4.0,
};

export interface PinItem {
  id: string;
  kind: "equip" | "tag";
  equip?: EquipmentId;
  pos: [number, number, number];
  text?: string;
  dim?: boolean;
}

/** Everything that should be pinned over the 3D scene right now. */
export function getPinItems(L: ShopLayout, visiCooler: boolean, plan: boolean, dimsFor: EquipmentId | null = null): PinItem[] {
  const items: PinItem[] = EQUIPMENT.filter((e) => e.id !== "visi-cooler" || visiCooler).map((e) => {
    const p = L.placements[e.id];
    return { id: `pin-${e.id}`, kind: "equip", equip: e.id, pos: [p.x, p.y + PIN_Y[e.id], p.z] };
  });
  if (dimsFor) {
    const bs = L.boxes.filter((b) => b.id === dimsFor);
    if (bs.length) {
      const min = [Infinity, Infinity, Infinity];
      const max = [-Infinity, -Infinity, -Infinity];
      for (const b of bs)
        for (let i = 0; i < 3; i++) {
          min[i] = Math.min(min[i], b.min[i]);
          max[i] = Math.max(max[i], b.max[i]);
        }
      const cx = (min[0] + max[0]) / 2;
      const cz = (min[2] + max[2]) / 2;
      const t = (id: string, text: string, pos: [number, number, number]): PinItem => ({ id: `dim-${id}`, kind: "tag", text, pos });
      items.push(
        t("w", ftIn(max[0] - min[0]), [cx, max[1] + 0.15, max[2]]),
        t("d", ftIn(max[2] - min[2]), [max[0], max[1] + 0.15, cz]),
        t("h", ftIn(max[1] - min[1]), [max[0], (min[1] + max[1]) / 2, max[2]]),
      );
    }
  }
  if (plan) {
    const { hx, hz } = L.room;
    const tag = (id: string, text: string, x: number, z: number, dim = false): PinItem => ({ id: `tag-${id}`, kind: "tag", text, pos: [x, 0.1, z], dim });
    items.push(
      tag("w", `${L.room.width} ft`, 0, hz + 1.3, true),
      tag("d", `${L.room.depth} ft`, -hx - 1.4, 0, true),
      tag("aisle", "STAFF AISLE · 2.6 ft", L.bx + 2.4, L.zAisle + 1.3),
      tag("cust", "CUSTOMER ZONE", L.bx - L.lane / 2 - 0.2, hz - 5.2),
      tag("door", "DOOR", L.door.x, hz - 0.55),
      tag("back", "BACK RUN", L.bx + 2, -hz - 0.7, true),
    );
  }
  return items;
}
