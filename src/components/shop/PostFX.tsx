"use client";

import { Bloom, EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";

/** "Best" quality only: ambient occlusion, bloom on the LEDs/lamps, SMAA edge smoothing. */
export default function PostFX() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO aoRadius={1.6} intensity={2.2} distanceFalloff={1.2} quality="medium" />
      <Bloom intensity={0.5} luminanceThreshold={1.15} luminanceSmoothing={0.12} mipmapBlur />
      <SMAA />
    </EffectComposer>
  );
}
