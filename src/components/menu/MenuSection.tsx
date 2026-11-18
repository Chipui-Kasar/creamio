import { MENU } from "@/data/menu";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MenuCard } from "./MenuCard";

/** Section 3 — the menu. Items and prices live in data/menu.ts. */
export function MenuSection() {
  return (
    <section id="menu" className="section-pad bg-cream">
      <div className="wrap">
        <SectionHeading eyebrow="Our menu" title={<>Made while <em className="font-normal italic text-pink">you watch.</em></>}>
          Six things we do well. Everything is scooped, pressed or pulled to order in front of you — prices below are placeholders to edit.
        </SectionHeading>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          {MENU.map((item, i) => (
            <Reveal key={item.id} delay={(i % 3) * 0.08}>
              <MenuCard item={item} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
