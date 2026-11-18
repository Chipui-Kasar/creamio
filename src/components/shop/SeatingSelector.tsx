"use client";

import { Armchair, FoldVertical } from "lucide-react";
import { SEATING_INFO, floorStats } from "@/data/shopLayout";
import { useShop } from "@/hooks/useShop";
import type { SeatingConfig } from "@/types";

function Mini({ kind, folded }: { kind: SeatingConfig; folded: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className="size-14 flex-none" aria-hidden>
      <rect x="1" y="1" width="78" height="78" fill="#fff6e9" stroke="#14304F" strokeWidth="2" />
      {kind === "table" ? (
        <g fill="#E6B56A" stroke="#14304F" strokeWidth="1.4">
          <rect x="26" y="26" width="28" height="28" />
          {[
            [32, 12],
            [32, 56],
            [12, 32],
            [56, 32],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="16" height="12" rx="2" fill="#F96B97" />
          ))}
        </g>
      ) : (
        <g fill="#E6B56A" stroke="#14304F" strokeWidth="1.4">
          <rect x="2" y="10" width={folded ? 3 : 18} height="60" />
          {[18, 34, 50, 66].map((y) => (
            <circle key={y} cx={folded ? 10 : 30} cy={y - 4} r="6.2" fill="#4DB6AC" />
          ))}
        </g>
      )}
    </svg>
  );
}

/** Switch between the two seating arrangements (and fold the wall table). */
export function SeatingSelector() {
  const { layout, setSeating, tableFolded, toggleFold, visiCooler, select } = useShop();
  const seating = layout.seating;
  const opts = Object.values(SEATING_INFO);
  const stats = floorStats(layout, visiCooler, tableFolded);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <Armchair size={14} /> Seating · four customers
        </h3>
        <button type="button" onClick={() => select("seating")} className="text-[11px] font-semibold underline underline-offset-4 hover:text-pink">
          Details
        </button>
      </div>

      <div role="radiogroup" aria-label="Seating arrangement" className="grid gap-2">
        {opts.map((o) => {
          const on = o.id === seating;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSeating(o.id)}
              className={`flex items-start gap-3 border p-3 text-left transition-colors ${
                on ? "border-navy bg-navy text-cream" : "border-navy/20 hover:border-navy"
              }`}
            >
              <Mini kind={o.id} folded={on && o.id === "foldable" && tableFolded} />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-x-2 text-[13px] font-semibold leading-tight">
                  {o.id === "table" ? "A · " : "B · "}
                  {o.name}
                  {o.id === "foldable" && (
                    <span className={`rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${on ? "bg-pink text-white" : "bg-pink-soft text-pink"}`}>
                      Recommended
                    </span>
                  )}
                </span>
                <span className={`mt-1 block text-[11.5px] leading-snug ${on ? "text-cream/75" : "text-navy/65"}`}>
                  {o.footprint} ft² in use{o.id === "foldable" ? ` · ${o.stowed} ft² folded` : ""}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {seating === "foldable" && (
        <button
          type="button"
          onClick={toggleFold}
          aria-pressed={tableFolded}
          className="mt-2 flex w-full items-center justify-center gap-2 border border-dashed border-navy/40 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-navy hover:bg-navy/5"
        >
          <FoldVertical size={14} />
          {tableFolded ? "Unfold the table" : "Fold the table away"}
        </button>
      )}

      <div className="mt-3">
        <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.14em]">
          <span>Free floor</span>
          <span>
            {stats.free.toFixed(0)} of {stats.room} ft² · {stats.freePct}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full bg-navy/10">
          <div className="h-full bg-teal transition-[width] duration-500" style={{ width: `${stats.freePct}%` }} />
        </div>
        <p className="mt-2 text-[11.5px] leading-snug text-navy/65">{SEATING_INFO[seating].summary}</p>
      </div>
    </div>
  );
}
