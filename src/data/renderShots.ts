import type { ShopLayout } from "@/data/shopLayout";
import { viewPose } from "@/lib/cameraPoses";
import type { CameraPose, EquipmentId, SeatingConfig } from "@/types";

/**
 * Camera set-ups used by the /render route to produce the static images in
 * /public/images/renders (gallery, preparation section, no-WebGL fallback).
 * They are drawn at the default room size. Re-generate with:  npm run capture
 */
export interface RenderShot {
  pose: (L: ShopLayout) => CameraPose;
  seating?: SeatingConfig;
  /** Open this equipment's glass top / door without highlighting it. */
  open?: EquipmentId;
  plan?: boolean;
}

/** Close-up camera placed relative to an item, so shots stay right if the layout changes. */
function near(L: ShopLayout, id: EquipmentId, off: [number, number, number], ty: number, tOff: [number, number], fov: number): CameraPose {
  const p = L.placements[id];
  return { position: [p.x + off[0], off[1], p.z + off[2]], target: [p.x + tOff[0], ty, p.z + tOff[1]], fov };
}

export const RENDER_SHOTS: Record<string, RenderShot> = {
  overview: { pose: (L) => viewPose("overview", L) },
  front: { pose: (L) => viewPose("front", L) },
  seating: { pose: (L) => viewPose("seating", L), seating: "foldable" },
  "seating-table": { pose: (L) => viewPose("seating", L), seating: "table" },
  equipment: { pose: (L) => viewPose("equipment", L) },
  plan: { pose: (L) => ({ ...viewPose("plan", L), position: [0, 2.35 * Math.max(L.room.width, L.room.depth), 0.02] }), plan: true },
  juicer: { pose: (L) => near(L, "juicer", [2.1, 4.9, 3.3], 3.8, [0, 0], 40) },
  coffee: { pose: (L) => near(L, "coffee", [2.1, 5.0, 3.3], 3.7, [0.2, 0], 38) },
  softy: { pose: (L) => near(L, "softy", [2.5, 5.3, 3.9], 3.9, [0, 0.1], 36) },
  scoop: { pose: (L) => near(L, "freezer-350", [0.5, 5.4, 4.0], 2.5, [0, -0.3], 40), open: "freezer-350" },
  selfserve: { pose: (L) => near(L, "freezer-400", [3.4, 5.2, 2.6], 2.4, [0, 0], 44), open: "freezer-400" },
};
