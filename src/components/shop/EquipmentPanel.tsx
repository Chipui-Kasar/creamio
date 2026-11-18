"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Zap } from "lucide-react";
import { EQUIPMENT, EQUIPMENT_BY_ID, LIGHTING_KW, POWER_FACTOR, STABILIZER_KVA, connectedLoad } from "@/data/equipment";
import { useState } from "react";
import { floorStats } from "@/data/shopLayout";
import { ftIn } from "@/lib/units";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useShop } from "@/hooks/useShop";
import { LookPanel } from "./LookPanel";
import { RoomSizeControls } from "./RoomSizeControls";
import { ValidationPanel } from "./ValidationPanel";
import { WallControls } from "./WallControls";
import { SeatingSelector } from "./SeatingSelector";

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 flex-none rounded-full transition-colors ${on ? "bg-teal" : "bg-navy/25"}`}
    >
      <span className={`absolute top-0.5 size-5 rounded-full bg-cream shadow transition-[left] duration-200 ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function PowerMeter() {
  const { visiCooler } = useShop();
  const { kw, capacityKw, pct } = connectedLoad(visiCooler);
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
        <Zap size={14} /> Connected load (indicative)
      </h3>
      <div className="flex justify-between text-[11.5px]">
        <span>
          {kw.toFixed(1)} kW <span className="text-navy/55">incl. {LIGHTING_KW} kW lighting</span>
        </span>
        <span className="text-navy/65">
          of {capacityKw.toFixed(1)} kW · {STABILIZER_KVA} KVA × {POWER_FACTOR}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full bg-navy/10">
        <div className={`h-full transition-[width] duration-500 ${pct > 90 ? "bg-pink" : "bg-gold"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-navy/55">
        If every appliance ran at once. Real draw is lower because compressors cycle — confirm with your electrician.
      </p>
    </div>
  );
}

function PropertyRows({ id }: { id: import("@/types").EquipmentId }) {
  const { layout: L } = useShop();
  const spec = EQUIPMENT_BY_ID[id];
  const bs = L.boxes.filter((b) => b.id === id);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const b of bs)
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], b.min[i]);
      max[i] = Math.max(max[i], b.max[i]);
    }
  const rows: [string, string][] = [
    ["Overall size", `${ftIn(max[0] - min[0])} W × ${ftIn(max[2] - min[2])} D × ${ftIn(max[1] - min[1])} H`],
    ["From west wall", ftIn(min[0] + L.room.hx)],
    ["From back wall", ftIn(min[2] + L.room.hz)],
    ["Base height", ftIn(min[1])],
    ["Finish", spec.finish],
  ];
  return (
    <dl className="divide-y divide-navy/10 border-y border-navy/15 text-[12.5px]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3 py-2">
          <dt className="pt-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-navy/55">{k}</dt>
          <dd className="flex items-center gap-2 leading-snug">
            {k === "Finish" && <span className="size-3 flex-none rounded-full ring-1 ring-navy/20" style={{ background: spec.accent }} />}
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Detail() {
  const { selected, select, visiCooler, dims, toggleDims } = useShop();
  const reduced = useReducedMotion();
  if (!selected) return null;
  const spec = EQUIPMENT_BY_ID[selected];
  const list = EQUIPMENT.filter((e) => e.id !== "visi-cooler" || visiCooler);
  const i = list.findIndex((e) => e.id === selected);
  const step = (d: number) => select(list[(i + d + list.length) % list.length].id);

  return (
    <motion.div
      key={selected}
      initial={reduced ? false : { opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? undefined : { opacity: 0, x: -14 }}
      transition={{ duration: 0.28, ease: [0.22, 0.8, 0.24, 1] }}
    >
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => select(null)} className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] hover:text-pink">
          <ArrowLeft size={14} /> All equipment
        </button>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous item" className="icon-btn !size-8" onClick={() => step(-1)}>
            <ChevronLeft size={15} />
          </button>
          <button type="button" aria-label="Next item" className="icon-btn !size-8" onClick={() => step(1)}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3">
        <span className="grid size-8 flex-none place-items-center rounded-full bg-pink text-sm font-bold text-white">{spec.number}</span>
        <div>
          <p className="eyebrow !text-[10px]">{spec.category}</p>
          <h3 className="display mt-1 text-[1.65rem] leading-[1.05]">{spec.name}</h3>
          <p className="mt-1 text-[13px] font-medium text-navy/70">{spec.role}</p>
        </div>
      </div>

      <p className="mt-4 text-[13.5px] leading-relaxed text-navy/85">{spec.description}</p>

      <dl className="mt-5 divide-y divide-navy/10 border-y border-navy/15 text-[12.5px]">
        {spec.specs.map((s) => (
          <div key={s.label} className="grid grid-cols-[7.5rem_1fr] gap-3 py-2">
            <dt className="font-semibold uppercase tracking-wider text-navy/55 text-[10.5px] pt-0.5">{s.label}</dt>
            <dd className="leading-snug">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-navy/55">Properties</h4>
        <PropertyRows id={selected} />
        <button type="button" onClick={toggleDims} aria-pressed={dims} className={`mt-3 w-full border py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${dims ? "border-pink bg-pink text-white" : "border-navy/30 hover:border-navy"}`}>
          {dims ? "Hide dimension lines" : "Show dimension lines in 3D"}
        </button>
      </div>

      <div className="mt-4 flex items-start gap-2 text-[12.5px] leading-snug">
        <MapPin size={15} className="mt-0.5 flex-none text-pink" />
        <p>
          <span className="font-semibold">Placement. </span>
          {spec.placement}
        </p>
      </div>
      {spec.powerKw > 0 && (
        <p className="mt-2 flex items-center gap-2 text-[12.5px]">
          <Zap size={15} className="flex-none text-gold" />
          <span>
            <span className="font-semibold">Indicative load: </span>≈ {spec.powerKw} kW
          </span>
        </p>
      )}
      <p className="mt-4 text-[10.5px] leading-snug text-navy/50">
        Specifications are typical for this class of equipment — confirm against the datasheet of the model you buy.
      </p>
    </motion.div>
  );
}

type Tab = "equipment" | "room" | "look";
const TABS: { id: Tab; label: string }[] = [
  { id: "equipment", label: "Equipment" },
  { id: "room", label: "Room" },
  { id: "look", label: "Look" },
];

/** Right-hand panel: Equipment (list → detail), Room (size, walls, validation), Look (light, materials, quality). */
export function EquipmentPanel({ full = false }: { full?: boolean }) {
  const { selected, select, hover, hovered, visiCooler, toggleVisi, layout, tableFolded, shutterOpen, toggleShutter } = useShop();
  const [tab, setTab] = useState<Tab>("equipment");
  const stats = floorStats(layout, visiCooler, tableFolded);

  return (
    <aside aria-label="Shop controls" className={`flex flex-col bg-cream ${full ? "h-full max-h-full" : "lg:max-h-[min(880px,calc(100vh-7rem))] lg:overflow-hidden"}`}>
      <div role="tablist" aria-label="Panel sections" className="grid flex-none grid-cols-3 border-b border-navy/15">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${tab === t.id ? "text-navy" : "text-navy/50 hover:text-navy"}`}
          >
            {t.label}
            {tab === t.id && <span className="absolute inset-x-3 bottom-0 h-[2px] bg-pink" />}
          </button>
        ))}
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto p-5 sm:p-6">
        {tab === "equipment" && (
          <>
            <AnimatePresence mode="wait" initial={false}>
              {selected ? (
                <Detail key="detail" />
              ) : (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  <p className="eyebrow">The equipment</p>
                  <h3 className="display mt-2 text-[1.7rem]">Nine pieces, one room you can resize</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-navy/75">Pick an item here — or click it in the 3D shop — to fly to it and see its specification and properties.</p>
                  <ul className="mt-4 divide-y divide-navy/10 border-y border-navy/15">
                    {EQUIPMENT.map((e) => {
                      const off = e.id === "visi-cooler" && !visiCooler;
                      return (
                        <li key={e.id}>
                          <button
                            type="button"
                            onClick={() => !off && select(e.id)}
                            onMouseEnter={() => !off && hover(e.id)}
                            onMouseLeave={() => hover(null)}
                            disabled={off}
                            className={`group flex w-full items-center gap-3 py-2.5 text-left transition-colors disabled:opacity-40 ${hovered === e.id ? "bg-pink-soft/60" : ""}`}
                          >
                            <span className="grid size-6 flex-none place-items-center rounded-full bg-navy text-[11px] font-bold text-cream transition-colors group-hover:bg-pink">{e.number}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-semibold">{e.shortName}</span>
                              <span className="block truncate text-[11.5px] text-navy/60">{e.role}</span>
                            </span>
                            {e.tag && <span className="flex-none text-[10px] font-bold uppercase tracking-wider text-navy/50">{e.tag}</span>}
                            <ChevronRight size={14} className="flex-none opacity-0 transition-opacity group-hover:opacity-70" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-7 space-y-7 border-t border-navy/15 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em]">Visi cooler · optional</h3>
                  <p className="mt-1 text-[11.5px] text-navy/60">{visiCooler ? "West wall, beside the self-serve freezer" : "Hidden — more aisle room"}</p>
                </div>
                <Switch on={visiCooler} onChange={toggleVisi} label="Show visi cooler" />
              </div>
              <SeatingSelector />
              <PowerMeter />
            </div>
          </>
        )}

        {tab === "room" && (
          <div className="space-y-7">
            <div>
              <p className="eyebrow">Room</p>
              <h3 className="display mt-2 text-[1.7rem]">
                {ftIn(layout.room.width)} × {ftIn(layout.room.depth)}
              </h3>
              <p className="mt-1 text-[12px] text-navy/60">
                {stats.room} ft² · {stats.free.toFixed(0)} ft² free ({stats.freePct}%) · ceiling {ftIn(layout.room.height)}
              </p>
            </div>
            <RoomSizeControls />
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]">Shopfront</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[12.5px] font-medium">Roller shutter <span className="text-navy/55">· {shutterOpen ? "open" : "closed"}</span></span>
                  <Switch on={shutterOpen} onChange={toggleShutter} label="Roller shutter open" />
                </div>
              </div>
            </div>
            <WallControls />
            <ValidationPanel />
          </div>
        )}

        {tab === "look" && <LookPanel />}
      </div>
    </aside>
  );
}
