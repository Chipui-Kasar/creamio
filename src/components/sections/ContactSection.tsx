import Image from "next/image";
import { Clock, MapPin, Phone } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITE } from "@/data/site";

/* lucide v1 dropped brand logos — small inline marks instead */
const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M4 20l1.2-4.2A8 8 0 1 1 8.3 19z" strokeLinejoin="round" />
      <path d="M9.2 8.8c.2 2.4 2.7 5.2 5.5 5.6l1.1-1.2-1.9-1-.8.7c-.9-.4-1.9-1.4-2.3-2.3l.7-.8-1-1.9z" fill="currentColor" stroke="none" />
    </svg>
  ),
};

/** Section 6 — location, hours, phone, socials and a Google Maps slot. */
export function ContactSection() {
  return (
    <section id="contact" className="section-pad bg-cream">
      <div className="wrap">
        <SectionHeading eyebrow="Visit us" title={<>Come say <em className="font-normal italic text-pink">hello.</em></>}>
          Pop in for a scoop, a juice or a flat white. Details below are placeholders — swap them in <code className="rounded-sm bg-navy/10 px-1 text-[13px]">data/site.ts</code>.
        </SectionHeading>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <dl className="divide-y divide-navy/15 border-y border-navy/20">
              <div className="grid grid-cols-[2.5rem_1fr] gap-3 py-6">
                <MapPin className="mt-1 text-pink" size={20} />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/55">Location</dt>
                  <dd className="mt-2 text-[17px] leading-snug">
                    {SITE.address.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                    <a href={SITE.mapsLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[12px] font-semibold uppercase tracking-[0.14em] text-pink underline underline-offset-4">
                      Get directions
                    </a>
                  </dd>
                </div>
              </div>

              <div className="grid grid-cols-[2.5rem_1fr] gap-3 py-6">
                <Clock className="mt-1 text-pink" size={20} />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/55">Opening hours</dt>
                  <dd className="mt-3">
                    <ul className="text-[14.5px]">
                      {SITE.hours.map((h) => (
                        <li key={h.days} className="flex flex-col gap-0.5 border-b border-dashed border-navy/20 py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                          <span className="font-medium">{h.days}</span>
                          <span className="tabular-nums text-navy/80">{h.time}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </div>

              <div className="grid grid-cols-[2.5rem_1fr] gap-3 py-6">
                <Phone className="mt-1 text-pink" size={20} />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/55">Phone</dt>
                  <dd className="mt-2">
                    <a href={SITE.phoneHref} className="display text-[1.9rem] hover:text-pink">
                      {SITE.phone}
                    </a>
                    <p className="mt-1 text-[13px] text-navy/60">{SITE.email}</p>
                  </dd>
                </div>
              </div>
            </dl>

            <ul className="mt-6 flex flex-wrap gap-3">
              {SITE.socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 border-[1.5px] border-navy px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-navy hover:text-cream"
                    aria-label={`${s.label} — ${s.handle}`}
                  >
                    {ICONS[s.id]} {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="relative aspect-[4/3] w-full overflow-hidden border-[1.5px] border-navy bg-teal-soft shadow-[8px_8px_0_var(--color-navy)] lg:aspect-auto lg:h-full lg:min-h-[28rem]">
              {SITE.mapsEmbedUrl ? (
                <iframe
                  title="Creamio on Google Maps"
                  src={SITE.mapsEmbedUrl}
                  className="absolute inset-0 size-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <>
                  {/* stylised street grid placeholder */}
                  <svg className="absolute inset-0 size-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
                    <rect width="400" height="300" fill="#e9f5f2" />
                    <g stroke="#fff6e9" strokeWidth="12" fill="none" strokeLinecap="round">
                      <path d="M-10 90 H410" />
                      <path d="M-10 210 H410" />
                      <path d="M110 -10 V310" />
                      <path d="M290 -10 V310" />
                      <path d="M-10 270 L410 40" strokeWidth="7" />
                    </g>
                    <g fill="#cfe8e1">
                      <rect x="20" y="20" width="76" height="56" />
                      <rect x="124" y="20" width="150" height="56" />
                      <rect x="304" y="20" width="80" height="56" />
                      <rect x="20" y="108" width="76" height="86" />
                      <rect x="304" y="108" width="80" height="86" />
                      <rect x="124" y="228" width="150" height="56" />
                    </g>
                    <rect x="124" y="108" width="150" height="86" fill="#c4e8bf" opacity="0.8" />
                  </svg>
                  <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="relative mx-auto grid size-16 place-items-center rounded-full bg-cream ring-[3px] ring-pink">
                      <Image src="/images/brand/mascot.png" alt="" width={40} height={49} className="h-10 w-auto" />
                      <span className="absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 bg-pink" />
                    </div>
                  </div>
                  <p className="absolute inset-x-4 bottom-4 bg-cream/95 px-4 py-3 text-center text-[12px] leading-snug">
                    <strong className="font-semibold">Google Maps placeholder.</strong> Paste your embed URL into <code>NEXT_PUBLIC_MAPS_EMBED_URL</code> and the live map appears here.
                  </p>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
