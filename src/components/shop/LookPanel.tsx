"use client";

import { Gauge, Lightbulb, Palette } from "lucide-react";
import { DEFAULT_LIGHTING, useShop } from "@/hooks/useShop";
import { kelvinToColor } from "@/lib/kelvin";
import type { Quality, ThemeState } from "@/types";

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onChange} className="flex items-center justify-between gap-3 py-1 text-left text-[12px] font-medium">
      {label}
      <span className={`relative h-5 w-9 flex-none rounded-full transition-colors ${on ? "bg-teal" : "bg-navy/25"}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-cream shadow transition-[left] duration-200 ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function Range({ label, value, min, max, step, onChange, suffix }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-[0.14em]">
        {label}
        <span className="text-[12px] normal-case tracking-normal text-navy/70">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-1.5 w-full cursor-pointer appearance-none bg-navy/15 accent-pink [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-navy"
      />
    </label>
  );
}

function Swatches<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; name: string; color: string }[]; onChange: (v: T) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
        {label} <span className="ml-1 font-medium normal-case tracking-normal text-navy/55">{options.find((o) => o.id === value)?.name}</span>
      </p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            aria-label={o.name}
            title={o.name}
            onClick={() => onChange(o.id)}
            className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${value === o.id ? "border-navy ring-2 ring-pink ring-offset-1" : "border-navy/20"}`}
            style={{ background: o.color }}
          />
        ))}
      </div>
    </div>
  );
}

const QUALITIES: { id: Quality; name: string; hint: string }[] = [
  { id: "fast", name: "Fast", hint: "1× pixels, light shadows — for phones and older laptops" },
  { id: "balanced", name: "Balanced", hint: "≤ 1.25× pixels, soft shadows — the default" },
  { id: "best", name: "Best", hint: "Adds ambient occlusion, bloom and SMAA (heavier)" },
];

/** Lighting, materials and render-quality controls. */
export function LookPanel() {
  const { lighting, setLighting, theme, setTheme, quality, setQuality } = useShop();
  const kc = kelvinToColor(lighting.kelvin);
  return (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <Lightbulb size={14} /> Lighting
          <button type="button" className="ml-auto text-[11px] font-semibold normal-case tracking-normal underline underline-offset-4 hover:text-pink" onClick={() => setLighting(DEFAULT_LIGHTING)}>
            Reset
          </button>
        </h3>
        <div className="space-y-4">
          <Range label="Brightness" value={Math.round(lighting.intensity * 100)} min={40} max={160} step={5} suffix="%" onChange={(v) => setLighting({ intensity: v / 100 })} />
          <div>
            <Range label="Colour temperature" value={lighting.kelvin} min={2700} max={6500} step={100} suffix=" K" onChange={(v) => setLighting({ kelvin: v })} />
            <div className="mt-1.5 h-1.5 w-full" style={{ background: "linear-gradient(90deg,#ffa63f,#ffd9a8,#fff,#cfe1ff)" }}>
              <span className="block h-full w-1 -translate-x-1/2 bg-navy" style={{ marginLeft: `${((lighting.kelvin - 2700) / 3800) * 100}%`, boxShadow: `0 0 0 2px #${kc.getHexString()}` }} />
            </div>
          </div>
          <div className="divide-y divide-navy/10">
            <Toggle on={lighting.downlights} label="Ceiling downlights" onChange={() => setLighting({ downlights: !lighting.downlights })} />
            <Toggle on={lighting.pendants} label="Pendant lamps" onChange={() => setLighting({ pendants: !lighting.pendants })} />
            <Toggle on={lighting.cove} label="Cove light (back wall)" onChange={() => setLighting({ cove: !lighting.cove })} />
            <Toggle on={lighting.counterGlow} label="Counter LED glow" onChange={() => setLighting({ counterGlow: !lighting.counterGlow })} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <Palette size={14} /> Materials &amp; colour
        </h3>
        <div className="space-y-4">
          <Swatches<ThemeState["floor"]>
            label="Floor"
            value={theme.floor}
            onChange={(floor) => setTheme({ floor })}
            options={[
              { id: "oak", name: "Oak boards + tile", color: "linear-gradient(135deg,#dcb88a 50%,#bfe6df 50%)" },
              { id: "terrazzo", name: "Terrazzo + tile", color: "radial-gradient(circle at 30% 30%,#f9a8c0 12%,transparent 13%),radial-gradient(circle at 70% 65%,#8fd3c9 12%,transparent 13%),#f6ece0" },
              { id: "checker", name: "Mint check tile", color: "conic-gradient(#bfe6df 25%,#fbf0dd 0 50%,#bfe6df 0 75%,#fbf0dd 0)" },
            ]}
          />
          <Swatches<ThemeState["counter"]>
            label="Counter fronts"
            value={theme.counter}
            onChange={(counter) => setTheme({ counter })}
            options={[
              { id: "oak", name: "Natural oak", color: "#c9996a" },
              { id: "pink", name: "Blush", color: "#f2a4bd" },
              { id: "mint", name: "Mint", color: "#a6e0d6" },
              { id: "navy", name: "Navy", color: "#6f89a8" },
            ]}
          />
          <Swatches<ThemeState["trim"]>
            label="Freezer trim"
            value={theme.trim}
            onChange={(trim) => setTheme({ trim })}
            options={[
              { id: "auto", name: "Brand (teal + pink)", color: "linear-gradient(135deg,#4db6ac 50%,#f9729b 50%)" },
              { id: "pink", name: "Pink", color: "#f9729b" },
              { id: "teal", name: "Teal", color: "#4db6ac" },
              { id: "navy", name: "Navy", color: "#14304f" },
              { id: "gold", name: "Gold", color: "#e6b56a" },
            ]}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <Gauge size={14} /> Render quality
        </h3>
        <div role="radiogroup" aria-label="Render quality" className="grid grid-cols-3">
          {QUALITIES.map((q) => (
            <button
              key={q.id}
              type="button"
              role="radio"
              aria-checked={quality === q.id}
              onClick={() => setQuality(q.id)}
              className={`border border-navy/25 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors [&:not(:first-child)]:-ml-px ${quality === q.id ? "z-10 border-navy bg-navy text-cream" : "hover:bg-navy/5"}`}
            >
              {q.name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11.5px] leading-snug text-navy/60">{QUALITIES.find((q) => q.id === quality)?.hint}. The scene only redraws when something changes, so an idle view costs ~0% GPU.</p>
      </div>
    </div>
  );
}
