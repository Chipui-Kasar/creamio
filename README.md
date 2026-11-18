# Creamio — Ice Cream, Fresh Juice & Coffee

A premium boutique website built around an **interactive, true-to-scale 3D model of the shop** — a
10 ft × 12 ft rectangle by default (narrower side-to-side, longer front-to-back) whose **size you can change**.
Visitors orbit the interior, click any of the nine pieces of equipment for its specification, open the glass-top freezers,
switch the seating layout, hide the optional visi cooler, resize the room and drop to a to-scale floor plan.

* **`/`** — the marketing site, with the 3D shop embedded.
* **`/shop`** — the **dedicated full-page 3D view** (full-screen canvas, slide-in equipment/room panel). Deep-link a size with `/shop?w=12&d=14`.

Brand (logo, palette, typography) comes from `assets/Creamio_ fresh, fun ice cream branding.png`:
navy `#14304F` · teal `#4DB6AC` · pink `#F96B97` · cream `#FFF6E9` · gold `#E6B56A`, Playfair Display + Montserrat.

**Stack:** Next.js 16 (App Router) · TypeScript · React Three Fiber · three.js · @react-three/drei ·
Tailwind CSS v4 · Framer Motion · Lucide React.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # production build
npm start            # serve it
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run validate     # layout stress test (500 random room sizes / seating options)
```

Requires Node 20+.

## Configure

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production URL, used for Open Graph metadata. |
| `NEXT_PUBLIC_MAPS_EMBED_URL` | Google Maps → Share → *Embed a map* → copy the iframe `src`. Replaces the placeholder map in the Contact section. |

Edit content in one place each:

| What | File |
| --- | --- |
| Address, hours, phone, socials | `src/data/site.ts` |
| Menu items, tiers, **prices**, currency | `src/data/menu.ts` (add a photo: drop it in `public/images/menu/` and set `photo`) |
| Equipment names, specs, power, capacity | `src/data/equipment.ts` |
| Default room size, size limits, equipment positions, seating options | `src/data/shopLayout.ts` |

> Equipment specifications are indicative figures for each class of machine. Confirm every
> value (especially power, dimensions and the exact Agaro model) against the datasheet of
> what you actually buy.

## The shop plan (feet, origin at room centre, +z → shop front)

The default room is **12 ft wide × 13 ft deep** (minimum 12 × 12). `computeLayout()` in `src/data/shopLayout.ts` derives every position from
the width/depth sliders (width 12–18 ft, depth 12–18 ft), so the 3D scene, hotspots, floor-plan SVG and stats always agree, and it
warns when something gets tight (customer lane, queue strip, seating vs. the freezer, stabilizer clearance).

```
          BACK WALL
 ┌─────────────────────────────────────────────┐
 │ 400 L  │ Stab. │ SINK │ Juicer · Coffee · Toppings │  back run (staff)
 │ self-  │       │ bay  │   prep counter             │
 │ serve  │ lane  │        STAFF AISLE 2.6 ft         │
 │ Visi   │       │ Softy · POS · cones │ 350 L glass │  service counter
 │ cooler │       └─────────────────────┴─────────────┘
 │ Seating        queue lane       [door]  │
 └─────────────────────────────────────────────┘
          SHOP FRONT (glass + door)
```

* **400 L freezer — customer self-serve.** Sliding glass top, west wall, facing the customer lane: visitors look in, slide the glass and choose their own packed ice cream.
* **350 L freezer — the scooping counter.** Sliding glass top; it is the east half of the service counter. Customers see every flavour through the glass from the queue lane, staff scoop from the 2.6 ft aisle behind it.
* **Visi cooler** stands on the west wall between the self-serve freezer and the seating, glass door facing the lane with 2 ft clear in front so it opens freely — nowhere near the sink, the aisle or the 350 L counter. It can be toggled off.
* **Wash bay at the opposite end from the scooping counter.** The sink is at the back-left end of the staff run (the "dirty" end), behind a glass splash guard, with the open 350 L freezer at the far east end of the front counter. Between them: the softy machine (a closed system), the pay-and-collect point and the prep counter. The validator enforces ≥ 2.5 ft between sink and scooping counter.
* The softy machine, card terminal and cone rack share the west part of the service counter; juicer, coffee and toppings share the prep counter; the 7 KVA stabilizer is wall-mounted high on the back wall.
* Seating — **B: wall-mounted fold-down table + 4 stools** is the default and recommended (≈ 35% less floor than **A: table + 4 chairs**, and it folds flat).

## Interactive features (from `FEATURES.md`, adapted to the ice-cream shop)

| Feature | Where |
| --- | --- |
| **Roller shutter** over the shopfront (rolls up into the fascia / down to the threshold; rails, slatted curtain, lockable bottom bar) | Toggles in the top bar, **Room → Shopfront**, and the walk-through HUD |
| Glass-top freezers that slide open on selection | 400 L self-serve · 350 L scooping counter · visi cooler door |
| **Camera views**: Overview, Front counter, Seating, Equipment line, **Left / Right section cut-aways**, Floor plan, **Walk-through** | View chips; orbit / pan / zoom incl. touch |
| **First-person walk-through** — WASD/arrows, Shift to run, drag / pointer-lock to look, **collision** against every fixture and the walls, **E / click to interact**, on-screen D-pad for tablets | `Walk-through` chip |
| **Cutaway & wall visibility** — per-wall Auto / Show / Ghost / Hide, one-click Full cutaway | Room → Walls & cutaway, or the Cutaway chip |
| **Fixture selection** — click or list; properties panel (overall size in feet-inches, position from the walls, base height, finish + colour), 3D wire-box with labelled **dimension lines** | Equipment tab → select an item → *Show dimension lines* |
| **Parametric layout engine** — `computeLayout()` re-flows everything for any room size; **live validation panel** and `npm run validate` (500-case stress test: no overlaps, nothing outside the walls, entrance clear) | Room tab · `scripts/validate.ts` |
| **Lighting** — brightness, colour temperature 2700–6500 K, downlights / pendants / cove / counter-glow toggles | Look tab |
| **Materials** — floor (oak / terrazzo / mint check), counter-front colour, freezer trim colour | Look tab |
| Dimensions in **feet and inches** throughout | slider labels, plan, properties, dimension lines |

Not adopted from the pharmacy spec: Zustand (a small React context carries the state), a see-through partition (this room has none), and an inch-based scene unit (the scene is in feet).

## How it is built

```
src/
  app/                 page.tsx (site), shop/ (full-page 3D), layout.tsx, globals.css (brand tokens), render/ (headless capture route)
  components/
    layout/            Navbar, Footer
    hero/              HeroSection, HeroScene (3D cone + juice + fruit)
    shop/              Shop3DScene (lazy stage + UI), ShopCanvas, ShopInterior, ShopShell,
                       Equipment (hover/click/highlight/hotspots), EquipmentPanel, FloorPlan (SVG),
                       SeatingSelector, RoomSizeControls, FullShopExperience (/shop), CameraRig, FadingGroup, PinLayer/PinProjector,
                       models/ (procedural appliances)
    menu/              MenuSection, MenuCard, MenuArt
    sections/          FreshPreparation, ShopGallery, ContactSection
    ui/                Reveal, SectionHeading
  data/                equipment.ts, menu.ts, shopLayout.ts, site.ts, renderShots.ts
  hooks/               useShop (shared state), useDevice, useReducedMotion
  lib/                 textures.ts (procedural canvas textures), materials.ts, swirl.ts, cameraPoses.ts
public/images/         brand/ (logo + photos cut from the brand sheet), renders/ (captured from the 3D scene)
```

* **No GLB files are needed.** Every appliance is a detailed procedural model (rounded bodies, hinged lids, glass doors,
  knobs, displays, tap + P-trap, etc.) built from three.js geometry and canvas-generated textures, so the whole 3D scene
  adds no model/texture downloads. To use sculpted models later, export compressed GLB (Draco/Meshopt + KTX2) into
  `public/models/` and swap the component in `components/shop/Equipment.tsx` for `useGLTF`.
* `shopLayout.ts` is the single source of truth: it turns a room size into placements, and the 3D scene, hotspot pins, floor plan SVG and stats all read from that layout. Camera angles (including the per-item focus views) are computed from it too — `lib/cameraPoses.ts` picks a spot with a clear line of sight to the item.
* Walls fade automatically when the camera is outside them (a dolls-house cut-away), and drop to a low cut-wall in plan view.

### Performance (render on demand)

The 3D canvas follows the rules from `FEATURES.md`:

* **`frameloop="demand"`** — a frame is drawn only when something asks for one. An idle scene draws **0 frames** (measured: 0 over 3 s). Every animated part (lids, shutter, door, fades, camera flights, walk-through) calls `invalidate()` until it settles; `src/lib/sceneClock.ts` and `src/hooks/useWake.ts` are the helpers, and `RenderOnDemand.tsx` owns the loop.
* **Frozen shadow maps** — `gl.shadowMap.autoUpdate = false`; the map is re-baked only when the scene description changes (room size, theme, lighting, doors, walls…) or an animated shadow caster calls `markShadowsDirty()`. Orbiting never re-renders shadows.
* **Pixel ratio capped at 1.25** by default, with **Fast / Balanced / Best** quality presets (Look tab): 1× / ≤ 1.25× / ≤ 1.75×. **Best** lazily loads post-processing: N8AO ambient occlusion, bloom on the LED lights and SMAA.
* **Instancing** for tubs, bottles, fruit, beans, cups and the roller-shutter slats; one shadow-casting light; no network HDRI (reflections use in-scene light panels).
* **Lazy 3D** (`next/dynamic`), pauses off-screen, static render fallback, **WebGL error boundary**, no layout shift.
* Touch: a "Tap to explore" gate so the page still scrolls; reduced-motion snaps camera moves and disables auto-advance.

**Rule for new code:** anything that changes the scene inside `useFrame` or an event handler must call `invalidate()` (or `useWake([...])` for React-state-driven animation); if it moves a shadow caster, also `markShadowsDirty()`.

### Regenerating the renders

The gallery / preparation images are real captures of the 3D model. After changing the scene:

```bash
npm run build && npm start            # terminal 1
npm run capture                       # terminal 2 — writes public/images/renders/*.jpg
```

Needs Google Chrome (or set `CHROME_PATH`). Camera angles live in `src/data/renderShots.ts`.

## Deploy

**Vercel (recommended)**

1. Push the repo to GitHub/GitLab.
2. Import it in Vercel — framework is detected automatically (no build settings needed).
3. Add `NEXT_PUBLIC_SITE_URL` (and `NEXT_PUBLIC_MAPS_EMBED_URL`) under Project → Settings → Environment Variables.
4. Deploy. Every push redeploys.

**Any Node host / Docker**

```bash
npm ci && npm run build
PORT=3000 npm start
```

**Static hosting:** add `output: "export"` to `next.config.ts` — the site has no server features (the `/render`
route is a plain client page), but remove `cacheComponents`/`partialPrefetching` first if your host needs a pure export.

## Replace the placeholders before launch

* Photography: the Scoops and Coffee cards use crops from the brand sheet; the other menu cards use illustrated art until you add photos (`photo` in `src/data/menu.ts`).
* Address, phone, opening hours, social links, Maps embed, menu prices.
# creamio
