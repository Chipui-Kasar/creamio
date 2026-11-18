"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { FloorPlan } from "@/components/shop/FloorPlan";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DEFAULT_ROOM } from "@/data/shopLayout";
import { useShop } from "@/hooks/useShop";
import type { EquipmentId, SeatingConfig, ViewId } from "@/types";

type Tab = {
  id: string;
  label: string;
  view: ViewId;
  /** Also open this equipment when jumping to the 3D shop. */
  select?: EquipmentId;
  title: string;
  text: string;
  image?: string;
  alt?: string;
};

const TABS: Tab[] = [
  {
    id: "front",
    label: "Front counter",
    view: "front",
    title: "The view from the door",
    text: "Step in and the service counter faces you: the softy machine and the 350 L glass-top scooping freezer, with a clear queue lane from the door and nothing standing in front of the counter.",
    image: "/images/renders/front.jpg",
    alt: "Render from the shop entrance looking at the service counter, softy machine and freezer",
  },
  {
    id: "selfserve",
    label: "Self-serve freezer",
    view: "overview",
    select: "freezer-400",
    title: "Choose your own tub",
    text: "The 400 L freezer has a sliding glass top and sits in the customer lane. Look in, slide the glass, and pick the packed ice cream you like — no queue needed.",
    image: "/images/renders/selfserve.jpg",
    alt: "Render of the 400 litre glass-top self-serve freezer with its glass slid open, full of packed tubs",
  },
  {
    id: "seating",
    label: "Customer seating",
    view: "seating",
    title: "Four seats, zero clutter",
    text: "Two ways to seat four in a compact room. The wall-mounted fold-down table is our pick — it frees about a third more floor and folds away at close.",
  },
  {
    id: "equipment",
    label: "Equipment arrangement",
    view: "equipment",
    title: "The staff line, back to front",
    text: "Juice and coffee on the prep counter, the stabilizer high on the wall, a topping station at the east end, and the wash bay at the far west end, away from the scooping counter — staff work, customers browse.",
    image: "/images/renders/equipment.jpg",
    alt: "Render of the staff equipment line: prep counter with juicer and coffee machine, stabilizer, bin and sink",
  },
  {
    id: "plan",
    label: "Floor plan",
    view: "plan",
    title: "To scale, and resizable",
    text: `Every item on this plan is the same data that drives the 3D model — the default shop is ${DEFAULT_ROOM.width} ft wide by ${DEFAULT_ROOM.depth} ft deep. Click an item to open it in the shop.`,
  },
];

const SEAT_IMG: Record<SeatingConfig, { src: string; alt: string }> = {
  foldable: { src: "/images/renders/seating.jpg", alt: "Render of the wall-mounted fold-down table with four stools" },
  table: { src: "/images/renders/seating-table.jpg", alt: "Render of the small square table with four chairs" },
};

/** Section 5 — interior renders from several camera angles + the live floor plan. */
export function ShopGallery() {
  const reduced = useReducedMotion();
  const { showInShop, setSeating } = useShop();
  const [tab, setTab] = useState(0);
  const t = TABS[tab];
  const [seat, setSeat] = useState<SeatingConfig>("foldable");

  return (
    <section id="interior" className="section-pad bg-cream-deep/60">
      <div className="wrap">
        <SectionHeading eyebrow="Shop interior" title={<>Every angle, <em className="font-normal italic text-pink">planned.</em></>}>
          Renders of the shop from the places you will actually stand, plus the plan they were drawn from.
        </SectionHeading>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-6 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <Reveal>
            <div className={`relative w-full overflow-hidden border-[1.5px] border-navy bg-cream shadow-[5px_5px_0_var(--color-navy)] sm:shadow-[8px_8px_0_var(--color-navy)] ${t.id === "plan" ? "aspect-[4/5] sm:aspect-[16/11]" : "aspect-[4/3] sm:aspect-[16/11]"}`}>
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={t.id + (t.id === "seating" ? seat : "")}
                  className="absolute inset-0"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55 }}
                >
                  {t.id === "plan" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-cream p-3 sm:p-5">
                      <div className="h-full w-full min-w-0 max-w-[44rem]">
                        <FloorPlan fit />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={t.id === "seating" ? SEAT_IMG[seat].src : (t.image as string)}
                      alt={t.id === "seating" ? SEAT_IMG[seat].alt : (t.alt as string)}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              {t.id === "seating" && (
                <div className="absolute left-3 top-3 z-10 flex gap-1.5">
                  {(["foldable", "table"] as const).map((s) => (
                    <button key={s} type="button" className="chip" data-on={seat === s} onClick={() => setSeat(s)}>
                      {s === "foldable" ? "B · Wall table" : "A · Table + chairs"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <div className="flex min-w-0 flex-col">
            <div role="tablist" aria-label="Interior views" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:block lg:gap-0 lg:divide-y lg:divide-navy/15 lg:overflow-visible lg:border-y lg:border-navy/20 lg:px-0 lg:pb-0">
              {TABS.map((x, i) => (
                <button
                  key={x.id}
                  role="tab"
                  aria-selected={i === tab}
                  type="button"
                  onClick={() => setTab(i)}
                  className="group flex flex-none items-baseline gap-2 border border-navy/20 px-3 py-2.5 text-left aria-selected:border-navy aria-selected:bg-navy aria-selected:text-cream lg:w-full lg:gap-4 lg:border-0 lg:px-0 lg:py-3.5 lg:aria-selected:bg-transparent lg:aria-selected:text-navy"
                >
                  <span className={`display text-lg transition-colors lg:text-xl ${i === tab ? "text-pink" : "text-navy/35"}`}>0{i + 1}</span>
                  <span className={`whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors lg:text-[12.5px] lg:tracking-[0.14em] ${i === tab ? "text-inherit" : "text-navy/60 group-hover:text-navy"}`}>
                    {x.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="display text-[1.75rem]">{t.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-navy/75">{t.text}</p>
              <button
                type="button"
                onClick={() => {
                  if (t.id === "seating") setSeating(seat);
                  showInShop({ view: t.view, select: t.select });
                }}
                className="btn btn-ghost mt-6"
              >
                Open this view in 3D
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
