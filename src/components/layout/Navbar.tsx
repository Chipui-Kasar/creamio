"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#shop", label: "Our Shop" },
  { href: "#menu", label: "Menu" },
  { href: "#preparation", label: "Fresh Preparation" },
  { href: "#interior", label: "Interior" },
  { href: "#contact", label: "Visit" },
];

/** Sticky brand bar: mascot + wordmark, anchored section links, mobile sheet. */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled || open ? "bg-cream/92 shadow-[0_1px_0_rgb(20_48_79/0.12)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="awning" aria-hidden />
      <nav className="wrap flex h-[4.1rem] items-center justify-between" aria-label="Main">
        <a href="#top" className="flex items-center gap-2.5" aria-label="Creamio — home" onClick={() => setOpen(false)}>
          <Image src="/images/brand/mascot.png" alt="" width={34} height={42} className="h-[2.35rem] w-auto" priority />
          <Image src="/images/brand/wordmark.png" alt="Creamio" width={118} height={28} className="h-7 w-auto" priority />
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="group relative py-2 text-[11.5px] font-semibold uppercase tracking-[0.17em]">
                {l.label}
                <span className="absolute inset-x-0 bottom-0.5 h-[2px] origin-left scale-x-0 bg-pink transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link href="/shop" className="btn btn-primary !px-4 !py-2.5 !text-[10.5px] max-sm:hidden">
            3D shop · full page
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden"
          >
            <ul className="wrap flex flex-col border-t border-navy/10 pb-8 pt-4">
              <li className="border-b border-navy/10">
                <Link href="/shop" onClick={() => setOpen(false)} className="display flex items-baseline justify-between py-4 text-3xl text-pink">
                  3D shop, full page
                  <span className="text-xs font-semibold tracking-[0.2em]">↗</span>
                </Link>
              </li>
              {LINKS.map((l, i) => (
                <li key={l.href} className="border-b border-navy/10">
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="display flex items-baseline justify-between py-4 text-3xl"
                  >
                    {l.label}
                    <span className="text-xs font-semibold tracking-[0.2em] text-pink">0{i + 1}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
