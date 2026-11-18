# Pharmacy 3D Designer – Feature Summary

Reusable spec for building a similar interactive 3D shop designer (e.g. an ice cream shop).

## Tech stack
- Next.js (App Router), React, TypeScript, Tailwind CSS
- Three.js with `@react-three/fiber`, `drei` and `postprocessing`
- Zustand for state
- The 3D scene is loaded with `next/dynamic` (`ssr: false`), separate from the UI

## Core 3D features

### Real geometry, no external assets
- Everything is modelled in 3D: walls, floor, ceiling, shelves, counter, signage and every product pack.
- Wood, tile and label textures are generated procedurally on a canvas. No image or model downloads can fail.
- Scene units are 1 unit = 1 inch, so proportions are exact.
- Dimensions are shown in feet and inches.

### Interactive open/close parts
- **Roller shutter entrance.** It animates up into the fascia (open) and down to the threshold (closed). It has guide rails, a slatted curtain and a lockable bottom bar.
- **Hinged back door** to the stock room. The leaf swings 90° and rests flat against the wall when open.
- Both can be toggled from the top bar, the properties panel and the walkthrough HUD.
- *Ice cream equivalent:* a sliding or lifting serving-window shutter, a freezer lid or door that opens on click, and a back-of-house door.

### Camera views (bottom toolbar)
- 3D perspective, floor plan, front, left and right section-cut elevations, and first-person walkthrough.
- Each view applies its own wall visibility preset.
- Orbit, pan and zoom, including touch support.

### Walkthrough mode
- First-person camera with WASD/arrow keys, Shift to run, pointer-lock look, and collision detection.
- On-screen D-pad for tablets.

### Cutaway and wall visibility
- Per-wall Show / Ghost / Hide toggles.
- A one-click complete cutaway.
- A see-through partition so the room behind it stays visible.

### Fixture selection
- Click any fixture, or pick it from the list.
- The properties panel shows its dimensions, position, material and colour.
- The 3D view outlines the selection with its overall size.
- Optional dimension lines overlay.

### Parametric layout engine
- One normaliser (`lib/layout.ts`) re-flows the layout on every edit, so fixtures can never overlap, cross a wall or exceed the ceiling.
- Adjustable room size, ceiling height, shelving, counter design and stock-room depth.
- A live validation panel, plus a headless validate script with a 500-case stress test (`npm run validate`).

### Detailed fixtures
- Counter with an L-shaped fluted oak front, solid-surface top, drawers, a POS terminal, monitor, receipt printer and barcode scanner.
- Shelving with LED strips under every shelf, glass premium bays and category signage.
- Back-lit signboard in the fascia.
- Stock room with carton stacks and a rest bed.
- *Ice cream equivalent:* a display freezer or gelato case, a topping bar, a menu board, and a cone and cup rack.

### Products and decor
- About 1,175 products across 65 pack designs. These are tubes, pump bottles, jars, cans, perfume flacons and cartons, with legible procedural labels.
- *Ice cream equivalent:* tubs, cones, cups, sundae glasses and sprinkle jars.

### Materials and lighting controls
- Procedural PBR materials: oak, tile, laminate, aluminium and glass.
- Colour and material pickers.
- Light intensity, colour temperature (2700–6500 K), and toggles for downlights, shelf LEDs, cove and counter glow.

## Performance
- **Instanced meshes.** Each pack design is 1–3 `InstancedMesh`es, so about 1,175 products cost only a few dozen draw calls.
- **On-demand rendering.** `frameloop="demand"` with a custom `RenderOnDemand`. An idle scene uses about 0% GPU, and any code that changes the scene calls `invalidate()`.
- **Frozen shadow maps** that are re-baked only when the scene changes.
- **Pixel ratio capped** at 1.25.
- **Render quality presets:** Fast, Balanced and Best.
- **Post-processing:** N8AO ambient occlusion, bloom on LEDs, ACES tone mapping and SMAA.
- **Procedural environment** (light-former), so there is no HDRI download.
- **WebGL error boundary** with a friendly fallback message.

## How the lag and heat were fixed

**Problem.** The scene was laggy and the laptop got hot even when nothing was moving. React Three Fiber's default `frameloop="always"` redrew the whole scene about 60 times a second, forever. Each of those frames did the following:
- re-rendered the depth map for both shadow-casting spot lights,
- ran the full post-processing chain (N8AO ambient occlusion, bloom, SMAA),
- drew at up to 1.75× pixel ratio, with the heaviest "high" quality preset on by default.

**Fix (commit `b5c8da9`).**

1. **Render on demand.** The canvas uses `frameloop="demand"`, so it only draws a frame when something asks for one. An idle scene now costs about 0% GPU.
2. **Wake the loop wherever the scene changes.** Anything that changes the scene now calls `invalidate()`:
   - the camera FOV damping, until the FOV settles
   - the roller-shutter animation, until it lands on its target (it snaps to the target so it can stop)
   - walkthrough key presses, mouse-look and the on-screen D-pad (through `wakeWalk()` in `lib/walkInput.ts`)
   - the walkthrough's per-frame movement, plus one extra frame to settle the head-bob
   - the loading notifier, for its first 12 frames
3. **Frozen shadow maps.** `RenderOnDemand.tsx` sets `gl.shadowMap.autoUpdate = false`. Shadows are re-baked only when the Zustand store changes (config, view, selection, door and so on), for a few frames to cover React commit ordering, or while the shutter animates. Orbiting the camera no longer re-renders the shadows.
4. **Lower default cost.** The pixel ratio cap went from 1.75 to 1.25. The default render quality went from `high` to `medium` ("Balanced"), which halves the AO resolution. **Best** is still available.
5. **Already cheap geometry.** The products are instanced, so about 1,175 packs cost only a few dozen draw calls. That is why the per-frame GPU cost was dominated by shadows and post-processing, which are the parts that were fixed.

**Rule for new code.** Any new code that changes the scene inside `useFrame` or an event handler must call `invalidate()`, or the change will not appear until something else triggers a render. If the change affects shadows, it should also set `gl.shadowMap.needsUpdate = true`.

**For the ice cream project.** Use `frameloop="demand"` from day one and build the `RenderOnDemand` component first. It is much harder to retrofit once there are many animated parts.

## Prompt to paste into the ice cream project

> Build an interactive 3D ice cream shop designer (Next.js App Router, React Three Fiber, drei, Zustand, Tailwind). Use only procedural geometry and canvas-generated textures, with no external models. Scene unit = 1 inch. Include: an animated serving-window shutter and a hinged back door, both toggleable from the UI. Add a display freezer, a topping bar, a counter with a POS, a menu signboard and a cone/cup rack. Provide camera views (3D, floor plan, front, left, right, first-person walkthrough with collision), per-wall Show/Ghost/Hide and a cutaway mode. Add click-to-select fixtures with a properties panel, a parametric layout engine that prevents overlaps, and a lighting panel (intensity, colour temperature, LED glow). Use instanced meshes for all products (tubs, cones, cups) and render on demand (`frameloop="demand"` with `invalidate()`). Include quality presets and a WebGL error boundary. To avoid lag and heat, freeze the shadow maps (`gl.shadowMap.autoUpdate = false`) and re-bake them only when the scene changes, cap the pixel ratio at 1.25, default to a medium quality preset, and call `invalidate()` from every `useFrame` animation, input handler and store change.
