import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EquipmentPanel } from "./EquipmentPanel";
import { Shop3DScene } from "./Shop3DScene";

const PRINCIPLES = [
  { n: "01", t: "Self-serve glass top", d: "The 400 L freezer sits in the customer lane with a sliding glass top — look in, slide, and choose your packed ice cream." },
  { n: "02", t: "The scooping counter", d: "The 350 L glass-top freezer is the east half of the service counter: customers see every flavour, staff scoop from the aisle behind." },
  { n: "03", t: "Cooler with room to open", d: "The visi cooler stands on the west wall between the freezer and the seating, door to the lane — clear of the sink, the aisle and the counter." },
  { n: "04", t: "A room that resizes", d: "Drag width and depth from 9 to 16 ft: counters, lanes, seating and the plan re-flow, and warn you when something gets tight." },
];

/** Section 2 — the interactive 3D shop with panel, controls and layout rationale. */
export function ShopSection() {
  return (
    <section id="shop" className="section-pad bg-cream-deep/60">
      <div className="wrap">
        <SectionHeading eyebrow="Our shop · interactive 3D" title={<>Step inside, <em className="whitespace-nowrap font-normal italic text-pink">resize it.</em></>}>
          A true-to-scale model of the shop. Orbit it, click any machine for its specification, open the glass-top freezers, switch the seating — and change the room size. Want more space? Open it full page.
        </SectionHeading>

        <Reveal delay={0.05} className="mt-10 sm:mt-14">
          <div className="grid overflow-hidden border-[1.5px] border-navy bg-cream shadow-[8px_8px_0_var(--color-navy)] lg:grid-cols-[minmax(0,1fr)_23.5rem] lg:h-[min(880px,calc(100vh-6rem))] lg:min-h-[680px]">
            <Shop3DScene />
            <div className="border-t-[1.5px] border-navy lg:border-l-[1.5px] lg:border-t-0 lg:overflow-hidden">
              <EquipmentPanel />
            </div>
          </div>
        </Reveal>

        <ol className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p, i) => (
            <Reveal as="li" key={p.n} delay={i * 0.06}>
              <span className="display text-3xl text-teal">{p.n}</span>
              <h3 className="mt-2 text-[13px] font-semibold uppercase tracking-[0.14em]">{p.t}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-navy/70">{p.d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
