"use client";

import { AlertTriangle, Maximize2, RotateCcw } from "lucide-react";
import { DEFAULT_ROOM, ROOM_LIMITS } from "@/data/shopLayout";
import { useShop } from "@/hooks/useShop";
import { ftIn } from "@/lib/units";

function Slider({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-[0.14em]">
        {label}
        <span className="display text-xl normal-case tracking-normal">{ftIn(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={ROOM_LIMITS.max}
        step={ROOM_LIMITS.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-1.5 w-full cursor-pointer appearance-none bg-navy/15 accent-pink [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-navy"
      />
      <span className="mt-0.5 flex justify-between text-[10px] text-navy/45">
        <span>{ftIn(min)}</span>
        <span>{ftIn(ROOM_LIMITS.max)}</span>
      </span>
    </label>
  );
}

/** Adjustable room size: width × depth. The whole layout, 3D scene and plan re-flow from it. */
export function RoomSizeControls() {
  const { room, layout, setRoom, resetRoom } = useShop();
  const isDefault = room.width === DEFAULT_ROOM.width && room.depth === DEFAULT_ROOM.depth;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <Maximize2 size={14} /> Room size
        </h3>
        <button
          type="button"
          onClick={resetRoom}
          disabled={isDefault}
          className="flex items-center gap-1 text-[11px] font-semibold underline underline-offset-4 hover:text-pink disabled:no-underline disabled:opacity-35"
        >
          <RotateCcw size={11} /> {DEFAULT_ROOM.width} × {DEFAULT_ROOM.depth}
        </button>
      </div>
      <div className="space-y-4">
        <Slider label="Width" value={room.width} min={ROOM_LIMITS.min} onChange={(v) => setRoom({ width: v })} />
        <Slider label="Depth" value={room.depth} min={ROOM_LIMITS.minDepth} onChange={(v) => setRoom({ depth: v })} />
      </div>
      <p className="mt-3 text-[11.5px] leading-snug text-navy/60">
        {room.width * room.depth} ft² · customer lane {ftIn(layout.lane)} · queue strip {ftIn(layout.frontStrip)}
      </p>
      {layout.warnings.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {layout.warnings.map((w) => (
            <li key={w} className="flex gap-2 bg-pink-soft/70 p-2 text-[11.5px] leading-snug text-navy">
              <AlertTriangle size={14} className="mt-0.5 flex-none text-pink" /> {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
