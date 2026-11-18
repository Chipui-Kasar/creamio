"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useShop } from "@/hooks/useShop";
import type { EquipmentId } from "@/types";

const STEPS: {
  n: string;
  title: string;
  lead: string;
  body: string;
  image: string;
  alt: string;
  equip: EquipmentId;
  chips: string[];
}[] = [
  {
    n: "01",
    title: "Fresh juice",
    lead: "Whole fruit in, tall glass out.",
    body: "Oranges and lemons come out of the basket, into the commercial juicer mixer, and straight over ice — pressed in front of you, never poured from a carton.",
    image: "/images/renders/prep-juice.jpg",
    alt: "Close-up render of the juicer mixer with a jar of orange juice, a basket of oranges and glasses",
    equip: "juicer",
    chips: ["Juicer mixer", "Prep counter", "Sink within one pace"],
  },
  {
    n: "02",
    title: "Hand-scooped",
    lead: "Today's flavours, one lid-lift away.",
    body: "The 350 L scooping freezer sits in the counter line with a clear aisle behind it, so the lid swings open without a collision. The 400 L stock freezer at the back keeps it topped up.",
    image: "/images/renders/prep-scoop.jpg",
    alt: "Render of the open 350 litre scooping freezer filled with tubs of ice cream",
    equip: "freezer-350",
    chips: ["350 L scooping freezer", "400 L stock freezer", "2.4 ft aisle"],
  },
  {
    n: "03",
    title: "Softy, swirled",
    lead: "Two flavours, or both at once.",
    body: "A double-compressor machine holds each hopper at its own temperature. Three nozzles give vanilla, strawberry, or the twist — dispensed over a stainless drip tray into a cone or cup.",
    image: "/images/renders/prep-softy.jpg",
    alt: "Render of the stainless softy ice cream machine dispensing a pink swirl into a cup",
    equip: "softy",
    chips: ["2 compressors", "2 + 1 twist", "Stainless finish"],
  },
  {
    n: "04",
    title: "Real espresso",
    lead: "Grind, tamp, pull, pour.",
    body: "A proper portafilter espresso machine with a steam wand — not an instant dispenser. Cups, tamper, knock box and beans live within arm's reach in their own coffee corner.",
    image: "/images/renders/prep-coffee.jpg",
    alt: "Render of the Agaro espresso machine with cups, a bean jar and accessories",
    equip: "coffee",
    chips: ["Agaro espresso", "Steam wand", "Coffee corner"],
  },
];

const INTERVAL = 7000;

/** Section 4 — the four preparation stations, with large renders and a gentle auto-advance. */
export function FreshPreparation() {
  const reduced = useReducedMotion();
  const { showInShop } = useShop();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [inView, setInView] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [22, -22]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const auto = playing && inView && !hover && !reduced;
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setI((v) => (v + 1) % STEPS.length), INTERVAL);
    return () => clearTimeout(t);
  }, [auto, i]);

  const step = STEPS[i];

  return (
    <section id="preparation" className="section-pad bg-navy text-cream">
      <div className="wrap">
        <SectionHeading eyebrow="Fresh preparation" title={<>Four stations, <em className="font-normal italic text-pink">all in view.</em></>} light>
          Every drink and scoop is made where you can see it. Step through the stations — each image is a render of the actual shop model.
        </SectionHeading>

        <div ref={stage} className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-14" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          {/* steps */}
          <div>
            <ol className="divide-y divide-cream/15 border-y border-cream/15" role="tablist" aria-label="Preparation stations">
              {STEPS.map((s, idx) => {
                const on = idx === i;
                return (
                  <li key={s.n}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setI(idx)}
                      className="group relative block w-full py-5 text-left"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className={`display text-2xl transition-colors ${on ? "text-pink" : "text-cream/40"}`}>{s.n}</span>
                        <span className={`display text-[1.9rem] transition-colors ${on ? "text-cream" : "text-cream/55 group-hover:text-cream/85"}`}>{s.title}</span>
                      </span>
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.span
                            key="body"
                            initial={reduced ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={reduced ? undefined : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 0.8, 0.24, 1] }}
                            className="block overflow-hidden pl-[3.1rem]"
                          >
                            <span className="mt-2 block text-[15px] font-semibold text-gold">{s.lead}</span>
                            <span className="mt-2 block text-[14px] leading-relaxed text-cream/75">{s.body}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {/* progress */}
                      {on && auto && !reduced && (
                        <motion.span
                          key={`p${i}`}
                          className="absolute bottom-0 left-0 h-[2px] bg-pink"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-5 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause automatic slideshow" : "Play automatic slideshow"}
                className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/70 hover:text-cream"
              >
                {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={() => showInShop({ select: step.equip })}
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pink underline underline-offset-[6px] hover:text-cream"
              >
                See it in the 3D shop →
              </button>
            </div>
          </div>

          {/* image */}
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden bg-navy-deep ring-1 ring-cream/20 lg:aspect-[5/4]">
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={step.image}
                  className="absolute inset-0"
                  style={{ y }}
                  initial={reduced ? false : { opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1.1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 0.8, 0.24, 1] }}
                >
                  <Image src={step.image} alt={step.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-navy-deep/90 to-transparent p-4 pt-14">
                {step.chips.map((c) => (
                  <span key={c} className="bg-cream px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-navy">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
