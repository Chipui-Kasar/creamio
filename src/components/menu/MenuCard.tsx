"use client";

import Image from "next/image";
import { CURRENCY } from "@/data/menu";
import type { MenuItem } from "@/types";
import { MenuArt } from "./MenuArt";

/** One menu category: image panel (photo or illustration) + tiered prices. */
export function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  return (
    <article className="group flex h-full flex-col border-[1.5px] border-navy bg-cream transition-[transform,box-shadow] duration-500 [transition-timing-function:var(--ease)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-navy)]">
      <div className="relative aspect-[5/4] overflow-hidden" style={{ background: item.tint }}>
        {/* arch window behind the product, echoing the awning / hero arch */}
        {item.photo ? (
          <Image
            src={item.photo}
            alt={`${item.name} — Creamio`}
            fill
            sizes="(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-[900ms] [transition-timing-function:var(--ease)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="absolute bottom-0 left-1/2 h-[88%] w-[56%] -translate-x-1/2 rounded-t-[999px] opacity-60" style={{ background: item.accent }} />
            <div className="relative h-[92%] w-[78%] transition-transform duration-[900ms] [transition-timing-function:var(--ease)] group-hover:-translate-y-2 group-hover:scale-[1.04]">
              <MenuArt kind={item.art} title={item.name} />
            </div>
          </div>
        )}
        <span className="absolute left-3 top-3 grid size-8 place-items-center bg-cream text-xs font-bold ring-1 ring-navy">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="display text-[1.7rem]">{item.name}</h3>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: item.accent === "#F5A04A" ? "#c4701a" : item.accent }}>
          {item.tagline}
        </p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-navy/75">{item.description}</p>

        <ul className="mt-5 divide-y divide-dashed divide-navy/25 border-t border-navy/25 text-[13px]">
          {item.prices.map((p) => (
            <li key={p.label} className="flex items-baseline justify-between gap-4 py-2">
              <span className="font-medium">{p.label}</span>
              <span className="display text-[1.25rem] text-navy">
                {CURRENCY}
                {p.price}
              </span>
            </li>
          ))}
        </ul>

        {item.notes && (
          <p className="mt-auto pt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-navy/50">{item.notes.join("  ·  ")}</p>
        )}
      </div>
    </article>
  );
}
