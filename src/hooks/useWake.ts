"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/**
 * Render-on-demand: React state that only changes how a `useFrame` animation behaves (a lid's `open`,
 * a wall's `mode`…) does not touch any mesh prop, so react-three-fiber would not draw a frame.
 * Call this with the values that matter and the loop wakes whenever they change.
 */
export function useWake(deps: readonly unknown[]) {
  const invalidate = useThree((s) => s.invalidate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => invalidate(), [invalidate, ...deps]);
}
