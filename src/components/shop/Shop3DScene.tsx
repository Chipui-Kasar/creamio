"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Expand, Footprints, Hand, Minus, Plus, RotateCcw, Scissors } from "lucide-react";
import Link from "next/link";
import { VIEWS, VIEW_ORDER } from "@/data/shopLayout";
import { useDevice } from "@/hooks/useDevice";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useShop } from "@/hooks/useShop";
import { setWalk } from "@/lib/walkInput";
import { PinLayer } from "./PinLayer";

const ShopCanvas = dynamic(() => import("./ShopCanvas"), { ssr: false });

class CanvasBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.error("3D scene failed", err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Poster({ note }: { note?: string }) {
  return (
    <div className="absolute inset-0">
      <Image
        src="/images/renders/overview.jpg"
        alt="Render of the Creamio shop interior — cut-away three-quarter view"
        fill
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="object-cover"
        priority={false}
      />
      {note && (
        <p className="absolute inset-x-4 bottom-4 rounded-sm bg-cream/90 px-3 py-2 text-center text-xs text-navy">{note}</p>
      )}
    </div>
  );
}

/**
 * The 3D stage: lazy mounts the heavy canvas only when scrolled near, pauses rendering
 * off-screen, shows a static render until the first frame, and falls back gracefully.
 */
export function Shop3DScene({ fill = false }: { fill?: boolean }) {
  const shop = useShop();
  const device = useDevice();
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [touchActive, setTouchActive] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const a = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "700px 0px" });
    const b = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    a.observe(el);
    b.observe(el);
    return () => {
      a.disconnect();
      b.disconnect();
    };
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  const walking = shop.view === "walk";
  const interactive = !device.coarse || touchActive || walking;
  const wheelZoom = device.coarse ? touchActive : engaged;
  const planMode = shop.view === "plan";
  const fullHref = `/shop?w=${shop.room.width}&d=${shop.room.depth}`;
  const zoom = (f: number) => window.dispatchEvent(new CustomEvent("shop-zoom", { detail: f }));

  return (
    <div
      ref={box}
      className={`overflow-hidden bg-[radial-gradient(120%_90%_at_50%_30%,#fff8ee_0%,#ffe9dc_55%,#f7d9d2_100%)] ${
        fill ? "absolute inset-0" : "relative aspect-[4/5] w-full sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[640px]"
      }`}
      onPointerDown={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
    >
      {/* static render — always in the DOM so there is never a layout jump or blank frame */}
      <div className={`transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`} aria-hidden={ready}>
        <Poster note={device.ready && !device.webgl ? "3D view needs WebGL — showing a static render." : undefined} />
      </div>

      {near && device.ready && device.webgl && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <CanvasBoundary fallback={<Poster note="The 3D view could not start — showing a static render." />}>
            <ShopCanvas
              active={visible}
              lowPower={device.lowPower}
              reducedMotion={reduced}
              interactive={interactive}
              wheelZoom={wheelZoom}
              onReady={onReady}
            />
          </CanvasBoundary>
        </div>
      )}

      {near && device.webgl && !ready && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="flex items-center gap-3 rounded-sm bg-cream/90 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-navy">
            <span className="size-3 animate-spin rounded-full border-2 border-teal border-t-transparent" />
            Building the shop…
          </span>
        </div>
      )}

      {ready && !walking && <PinLayer />}

      {/* ── view presets ── */}
      <div className="absolute left-3 right-3 top-3 z-20 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:left-4 sm:top-4">
        {VIEW_ORDER.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => shop.setView(v)}
            aria-pressed={shop.view === v && !shop.selected}
            title={VIEWS[v].hint}
            className="chip"
            data-on={shop.view === v && !shop.selected}
          >
            {VIEWS[v].label}
          </button>
        ))}
      </div>

      {/* ── openings + helpers ── */}
      <div className="absolute left-3 top-[3.6rem] z-20 flex flex-wrap gap-1.5 sm:left-4 sm:top-[3.9rem]">
        <button type="button" className="chip" data-on={shop.shutterOpen} aria-pressed={shop.shutterOpen} onClick={shop.toggleShutter}>
          Shutter · {shop.shutterOpen ? "open" : "closed"}
        </button>
        <button type="button" className="chip" data-on={shop.dims} aria-pressed={shop.dims} onClick={shop.toggleDims}>
          Dimensions
        </button>
        <button type="button" className="chip inline-flex items-center gap-1.5" onClick={shop.cutaway} title="Hide every wall except the back wall">
          <Scissors size={12} /> Cutaway
        </button>
      </div>

      {/* ── zoom / reset ── */}
      <div className={`absolute bottom-3 right-3 z-20 flex-col gap-1.5 sm:bottom-4 sm:right-4 ${walking ? "hidden" : "flex"}`}>
        <button type="button" aria-label="Zoom in" className="icon-btn" onClick={() => zoom(0.75)}>
          <Plus size={16} />
        </button>
        <button type="button" aria-label="Zoom out" className="icon-btn" onClick={() => zoom(1.3)}>
          <Minus size={16} />
        </button>
        <button type="button" aria-label="Reset camera" className="icon-btn" onClick={() => shop.setView(shop.view)}>
          <RotateCcw size={15} />
        </button>
      </div>

      {/* ── walk-through HUD ── */}
      {walking && ready && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 size-4 -translate-x-1/2 -translate-y-1/2" aria-hidden>
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-navy/70" />
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-navy/70" />
          </div>
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-4">
            <p className="bg-navy/90 px-3 py-2 text-center text-[10.5px] font-medium uppercase leading-relaxed tracking-[0.12em] text-cream">
              <Footprints size={12} className="mr-1.5 inline -translate-y-px" />
              W A S D / arrows move · Shift run · click &amp; drag to look · E interact
            </p>
            <button type="button" className="chip" onClick={() => shop.setView("overview")}>
              Exit walk-through
            </button>
          </div>
          <div className="absolute bottom-3 left-3 z-20 grid select-none grid-cols-3 gap-1 sm:bottom-4 sm:left-4" aria-label="On-screen walk controls">
            {[
              { k: "tl", i: null },
              { k: "fwd", i: <ArrowUp size={16} />, d: { forward: 1 } },
              { k: "tr", i: null },
              { k: "left", i: <ArrowLeft size={16} />, d: { turn: 1 } },
              { k: "back", i: <ArrowDown size={16} />, d: { forward: -1 } },
              { k: "right", i: <ArrowRight size={16} />, d: { turn: -1 } },
            ].map((b) =>
              b.i ? (
                <button
                  key={b.k}
                  type="button"
                  className="icon-btn touch-none"
                  aria-label={`Walk ${b.k}`}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setWalk(b.d as { forward?: number; turn?: number });
                  }}
                  onPointerUp={() => setWalk({ forward: 0, turn: 0 })}
                  onPointerCancel={() => setWalk({ forward: 0, turn: 0 })}
                >
                  {b.i}
                </button>
              ) : (
                <span key={b.k} />
              ),
            )}
            <button type="button" className="chip col-span-3 !py-1.5" onPointerDown={() => setWalk({ run: true })} onPointerUp={() => setWalk({ run: false })} onPointerLeave={() => setWalk({ run: false })}>
              Hold to run
            </button>
          </div>
        </>
      )}

      {/* ── hint / touch gate ── */}
      {device.coarse && !touchActive && ready && !walking && (
        <button
          type="button"
          onClick={() => setTouchActive(true)}
          className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-navy px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-cream shadow-lg"
        >
          <Hand size={14} /> Tap to explore in 3D
        </button>
      )}
      {device.coarse && touchActive && !walking && (
        <button
          type="button"
          onClick={() => setTouchActive(false)}
          className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-cream px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-navy shadow-lg"
        >
          Done · back to scrolling
        </button>
      )}
      {!fill && !walking && (
        <Link
          href={fullHref}
          className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-navy px-3.5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cream shadow-lg transition-colors hover:bg-pink sm:bottom-4 sm:left-4"
        >
          <Expand size={13} /> Open full-page 3D
        </Link>
      )}
      {!device.coarse && ready && !walking && (
        <p className={`pointer-events-none absolute left-4 z-10 hidden max-w-[16rem] text-[11px] leading-relaxed tracking-wide text-navy/70 sm:block ${fill ? "bottom-4" : "bottom-16"}`}>
          Drag to orbit · click the scene, then scroll to zoom · {planMode ? `scale plan, ${shop.room.width} × ${shop.room.depth} ft` : "click any equipment"}
        </p>
      )}
    </div>
  );
}
