"use client";

import { ArrowLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShopProvider, useShop } from "@/hooks/useShop";
import { EquipmentPanel } from "./EquipmentPanel";
import { Shop3DScene } from "./Shop3DScene";

/** Reads `?w=` `?d=` once so a link from the landing page keeps the visitor's room size. */
function UrlRoom() {
  const { setRoom } = useShop();
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const w = Number(q.get("w"));
    const d = Number(q.get("d"));
    if (w || d) setRoom({ ...(w ? { width: w } : {}), ...(d ? { depth: d } : {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function Shell() {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    // start with the panel closed on small screens so the 3D view leads
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.innerWidth < 1024) setOpen(false);
  }, []);
  return (
    <div className="fixed inset-0 flex flex-col bg-cream">
      <header className="relative z-30 flex h-14 flex-none items-center justify-between border-b border-navy/15 bg-cream px-3 sm:px-5">
        <div className="awning absolute inset-x-0 top-0 !h-[5px]" aria-hidden />
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2" aria-label="Creamio — back to the website">
            <Image src="/images/brand/mascot.png" alt="" width={30} height={37} className="h-8 w-auto" />
            <Image src="/images/brand/wordmark.png" alt="Creamio" width={100} height={24} className="hidden h-6 w-auto sm:block" />
          </Link>
          <span className="hidden h-5 w-px bg-navy/20 sm:block" />
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] sm:block">Shop in 3D · full page</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/#shop" className="btn btn-ghost !px-3 !py-2 !text-[10.5px]">
            <ArrowLeft size={13} /> <span className="max-sm:hidden">Back to site</span>
          </Link>
          <button type="button" className="btn btn-primary !px-3 !py-2 !text-[10.5px]" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
            <span className="max-sm:hidden">{open ? "Hide panel" : "Equipment & room"}</span>
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <Shop3DScene fill />
        <div
          className={`absolute inset-x-0 bottom-0 z-30 border-t-[1.5px] border-navy bg-cream shadow-2xl transition-transform duration-300 ease-out max-lg:max-h-[62%] lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[24.5rem] lg:border-l-[1.5px] lg:border-t-0 ${
            open ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-x-full lg:translate-y-0"
          }`}
          aria-hidden={!open}
          inert={!open}
        >
          <EquipmentPanel full />
        </div>
      </div>
    </div>
  );
}

export function FullShopExperience() {
  return (
    <ShopProvider>
      <UrlRoom />
      <Shell />
    </ShopProvider>
  );
}
