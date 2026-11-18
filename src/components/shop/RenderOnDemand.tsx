"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { consumeShadowDirty, markShadowsDirty, registerWake } from "@/lib/sceneClock";

/**
 * Makes the canvas cheap when nothing moves:
 *  • the frame loop is "demand" — a frame is drawn only when something asks for one;
 *  • the shadow map is frozen (`autoUpdate = false`) and re-baked only when the scene's
 *    `version` string changes or an animated part calls `markShadowsDirty()`.
 */
export function RenderOnDemand({ version }: { version: string }) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    registerWake(invalidate);
    return () => registerWake(null);
  }, [gl, invalidate]);

  // anything in the scene description changed → re-bake shadows for a few frames
  useEffect(() => {
    markShadowsDirty(4);
  }, [version]);

  useFrame(() => {
    if (consumeShadowDirty()) {
      gl.shadowMap.needsUpdate = true;
      invalidate();
    }
  });
  return null;
}
