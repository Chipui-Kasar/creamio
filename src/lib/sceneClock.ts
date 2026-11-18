/**
 * Render-on-demand helpers.
 *
 * The canvas runs with frameloop="demand": it only draws when asked. Anything that moves
 * a mesh over time (lids, doors, shutter, fades, camera flights, walkthrough) must keep asking
 * with `invalidate()` until it settles, and — if it moves a shadow caster — call
 * `markShadowsDirty()` so the frozen shadow map is re-baked.
 */
let dirty = 0;
let wake: (() => void) | null = null;

export function registerWake(fn: (() => void) | null) {
  wake = fn;
}

/** Ask for a redraw from outside the canvas (UI buttons, input handlers). */
export function wakeScene() {
  wake?.();
}

/** Re-bake the frozen shadow map for the next few frames. */
export function markShadowsDirty(frames = 4) {
  dirty = Math.max(dirty, frames);
  wake?.();
}

/** Called once per frame by <RenderOnDemand>; true while a shadow re-bake is pending. */
export function consumeShadowDirty() {
  if (dirty > 0) {
    dirty -= 1;
    return true;
  }
  return false;
}

export function shadowsPending() {
  return dirty > 0;
}
