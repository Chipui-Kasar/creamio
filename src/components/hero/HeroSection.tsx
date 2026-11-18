"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowDown, Citrus, Heart, IceCreamCone, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDevice } from "@/hooks/useDevice";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const VALUES = [
  { icon: IceCreamCone, label: "Premium ice cream" },
  { icon: Citrus, label: "Fresh ingredients" },
  { icon: Smile, label: "Happy vibes" },
  { icon: Heart, label: "Made with love" },
];

/** Section 1 — full-screen editorial hero with the 3D cone + fruit visual. */
export function HeroSection() {
  const device = useDevice();
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="top" className="relative flex min-h-dvh flex-col overflow-hidden bg-cream pt-[4.6rem]">
      {/* large teal ring echoing the mascot's halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[18vw] top-[8vh] size-[62vw] max-w-[860px] max-h-[860px] rounded-full border-[clamp(18px,3vw,44px)] border-teal/25 max-lg:right-[-40vw] max-lg:top-[34vh]"
      />

      <div className="wrap relative grid flex-1 items-center gap-8 pb-8 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">
        <div className="relative z-10 max-w-[44rem]">
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-10 bg-pink" /> Ice cream &amp; more
          </p>
          <h1 className="display mt-6 text-[clamp(3.3rem,8.6vw,8rem)] text-navy">
            A Little Scoop of{" "}
            <em className="font-normal italic text-pink">Happiness.</em>
          </h1>
          <p className="mt-7 text-[clamp(1.05rem,1.7vw,1.35rem)] font-medium tracking-wide text-navy/80">
            Ice Cream, Fresh Juice &amp; Coffee.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#shop" className="btn btn-primary">
              Explore Our Shop
            </a>
            <a href="#menu" className="btn btn-ghost">
              Discover Our Menu
            </a>
          </div>
        </div>

        {/* arch with the 3D scene */}
        <div ref={box} className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[999px] bg-pink-soft shadow-[10px_10px_0_var(--color-navy)] ring-[1.5px] ring-navy lg:aspect-[5/6]">
            <div className={`absolute inset-0 grid place-items-center transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`} aria-hidden={ready}>
              <Image src="/images/brand/mascot.png" alt="Creamio mascot — a smiling ice cream cone" width={176} height={216} className="h-[46%] w-auto" priority />
            </div>
            {device.ready && device.webgl && (
              <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
                <HeroScene active={visible} reducedMotion={reduced} lowPower={device.lowPower} onReady={() => setReady(true)} />
              </div>
            )}
          </div>
          <p className="mt-6 hidden items-center justify-end gap-3 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-navy/55 lg:flex">
            Soft-serve · fresh orange · strawberries
          </p>
        </div>
      </div>

      {/* brand values (from the brand sheet) */}
      <div className="border-t border-navy/15">
        <ul className="wrap grid grid-cols-2 gap-y-4 py-5 sm:grid-cols-4">
          {VALUES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.16em]">
              <span className="grid size-9 flex-none place-items-center rounded-full border border-pink text-pink">
                <Icon size={17} strokeWidth={1.6} />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <a
        href="#shop"
        aria-label="Scroll to the shop"
        className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 text-navy/50 transition-colors hover:text-pink lg:block"
      >
        <ArrowDown size={20} className="animate-bounce" />
      </a>
    </section>
  );
}
