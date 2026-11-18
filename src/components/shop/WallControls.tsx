"use client";

import { Scissors } from "lucide-react";
import { useShop } from "@/hooks/useShop";
import type { WallId, WallMode } from "@/types";

const WALLS: { id: WallId; label: string }[] = [
  { id: "back", label: "Back wall" },
  { id: "left", label: "Left wall" },
  { id: "right", label: "Right wall" },
  { id: "front", label: "Shopfront" },
  { id: "ceiling", label: "Ceiling" },
];
const MODES: { id: WallMode; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "show", label: "Show" },
  { id: "ghost", label: "Ghost" },
  { id: "hide", label: "Hide" },
];

/** Per-wall Auto / Show / Ghost / Hide, plus a one-click full cutaway. */
export function WallControls() {
  const { walls, setWall, cutaway, resetWalls } = useShop();
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <Scissors size={14} /> Walls &amp; cutaway
        </h3>
        <div className="flex gap-3 text-[11px] font-semibold">
          <button type="button" onClick={cutaway} className="underline underline-offset-4 hover:text-pink">
            Full cutaway
          </button>
          <button type="button" onClick={resetWalls} className="underline underline-offset-4 hover:text-pink">
            Reset
          </button>
        </div>
      </div>
      <ul className="space-y-1.5">
        {WALLS.map((w) => (
          <li key={w.id} className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium">{w.label}</span>
            <div role="radiogroup" aria-label={`${w.label} visibility`} className="flex">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={walls[w.id] === m.id}
                  onClick={() => setWall(w.id, m.id)}
                  className={`border border-navy/25 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors first:rounded-l-sm last:rounded-r-sm [&:not(:first-child)]:-ml-px ${
                    walls[w.id] === m.id ? "z-10 border-navy bg-navy text-cream" : "hover:bg-navy/5"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-navy/55">Auto fades whichever walls are between you and the room.</p>
    </div>
  );
}
