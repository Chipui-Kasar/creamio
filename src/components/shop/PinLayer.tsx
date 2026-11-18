"use client";

import { EQUIPMENT_BY_ID } from "@/data/equipment";
import { useShop } from "@/hooks/useShop";
import { getPinItems } from "./pins";

/**
 * DOM hotspots drawn over the canvas. Their screen positions are written imperatively every frame
 * by <PinProjector> (inside the canvas) — one overlay instead of a React root per pin.
 */
export function PinLayer() {
  const { layout, visiCooler, view, selected, hovered, select, hover, dims } = useShop();
  const items = getPinItems(layout, visiCooler, view === "plan", dims ? selected : null);
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-label="Equipment hotspots">
      {items.map((it) => {
        if (it.kind === "tag") {
          return (
            <span key={it.id} id={it.id} className={`plan-tag absolute left-0 top-0 ${it.dim ? "plan-tag--dim" : ""} ${it.id.startsWith("dim-") ? "plan-tag--dimension" : ""}`} style={{ visibility: "hidden" }}>
              {it.text}
            </span>
          );
        }
        const spec = EQUIPMENT_BY_ID[it.equip!];
        const on = selected === spec.id;
        const hov = hovered === spec.id;
        return (
          <button
            key={it.id}
            id={it.id}
            type="button"
            aria-label={`${spec.name} — view details`}
            data-active={on || hov}
            data-hover={hov && !on}
            onClick={() => select(spec.id)}
            onMouseEnter={() => hover(spec.id)}
            onMouseLeave={() => hover(null)}
            onFocus={() => hover(spec.id)}
            onBlur={() => hover(null)}
            className="hotspot pointer-events-auto absolute left-0 top-0"
            style={{ visibility: "hidden" }}
          >
            <span className="hotspot__num">{spec.number}</span>
            {spec.tag && <span className="hotspot__tag">{spec.tag}</span>}
            <span className="hotspot__label">
              <strong>{spec.shortName}</strong>
              <em>{spec.role}</em>
            </span>
          </button>
        );
      })}
    </div>
  );
}
