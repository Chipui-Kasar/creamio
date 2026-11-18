import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Editorial section header: eyebrow + large serif title, optional aside copy on the right. */
export function SectionHeading({
  eyebrow,
  title,
  children,
  light = false,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  light?: boolean;
}) {
  return (
    <div className="grid items-end gap-6 md:grid-cols-[1.25fr_1fr] md:gap-16">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={`display mt-4 text-[clamp(2.4rem,5.4vw,4.6rem)] ${light ? "text-cream" : "text-navy"}`}>{title}</h2>
      </Reveal>
      {children && (
        <Reveal delay={0.1} className={`max-w-md text-[15px] leading-relaxed ${light ? "text-cream/75" : "text-navy/75"}`}>
          {children}
        </Reveal>
      )}
    </div>
  );
}
