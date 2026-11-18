import Image from "next/image";
import { SITE } from "@/data/site";

export function Footer() {
  return (
    <footer className="bg-navy-deep text-cream">
      <div className="awning" aria-hidden />
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Image src="/images/brand/wordmark-light.png" alt="Creamio" width={170} height={40} className="h-10 w-auto" />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-pink">{SITE.tagline}</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/70">
            Premium ice cream, fresh juice and real espresso, from a small corner shop made with love.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/55">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ["/shop", "3D shop — full page"],
              ["#shop", "Our shop in 3D"],
              ["#menu", "Menu"],
              ["#preparation", "Fresh preparation"],
              ["#interior", "Shop interior"],
              ["#contact", "Visit us"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="transition-colors hover:text-pink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/55">Say hello</h2>
          <address className="mt-4 space-y-2.5 text-sm not-italic">
            {SITE.address.map((l) => (
              <p key={l}>{l}</p>
            ))}
            <p>
              <a href={SITE.phoneHref} className="hover:text-pink">
                {SITE.phone}
              </a>
            </p>
          </address>
        </div>
      </div>
      <div className="border-t border-cream/15">
        <p className="wrap flex flex-wrap items-center justify-between gap-2 py-5 text-[11px] tracking-wide text-cream/50">
          <span>© Creamio · Ice Cream &amp; More</span>
          <span>Made with love, scoop by scoop.</span>
        </p>
      </div>
    </footer>
  );
}
