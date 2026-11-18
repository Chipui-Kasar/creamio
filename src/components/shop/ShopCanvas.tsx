"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { focusPose, viewPose } from "@/lib/cameraPoses";
import { useShop } from "@/hooks/useShop";
import type { Quality } from "@/types";
import { CameraRig } from "./CameraRig";
import { DimensionLines } from "./DimensionLines";
import { PinProjector } from "./PinProjector";
import { RenderOnDemand } from "./RenderOnDemand";
import { ShopInterior } from "./ShopInterior";
import { Walkthrough } from "./Walkthrough";

// post-processing (AO + bloom + SMAA) is only downloaded when the "Best" preset is chosen
const PostFX = dynamic(() => import("./PostFX"), { ssr: false });

interface Props {
  active: boolean;
  lowPower: boolean;
  reducedMotion: boolean;
  interactive: boolean;
  /** Let a vertical one-finger drag scroll the page (embedded view on touch screens). */
  touchScroll?: boolean;
  wheelZoom: boolean;
  /** Fired after the first frame has really been drawn. */
  onReady: () => void;
  /** Used by the headless capture route to draw a fixed pose with no hotspots. */
  overridePose?: ReturnType<typeof viewPose>;
  /** Capture mode: hide the DOM hotspot pins. */
  hidePins?: boolean;
  /** Capture mode: no highlight glow / floor rings. */
  quiet?: boolean;
}

/** Pixel-ratio cap per quality preset (the doc's rule: never above 1.25 by default). */
const DPR: Record<Quality, number> = { fast: 1, balanced: 1.25, best: 1.75 };

function ReadySignal({ onReady, active }: { onReady: () => void; active: boolean }) {
  const gl = useThree((s) => s.gl);
  const three = useThree();
  const n = useRef(0);
  useFrame((state) => {
    n.current += 1;
    // on-demand loop: keep asking for the first dozen frames so textures / shaders settle
    if (n.current < 12) state.invalidate();
    if (n.current === 3) {
      onReady();
      (window as unknown as { __shopReady?: boolean }).__shopReady = true;
      if (process.env.NODE_ENV !== "production") (window as unknown as { __three?: unknown }).__three = three;
    }
  });
  useEffect(() => {
    gl.setClearColor(0x000000, 0);
  }, [gl]);
  useEffect(() => {
    if (active) three.invalidate();
  }, [active, three]);
  return null;
}

export default function ShopCanvas({ active, lowPower, reducedMotion, interactive, touchScroll, wheelZoom, onReady, overridePose, hidePins, quiet }: Props) {
  const shop = useShop();
  const planMode = shop.view === "plan";
  const walk = shop.view === "walk" && !overridePose;
  const L = shop.layout;
  const quality: Quality = lowPower && shop.quality === "best" ? "balanced" : shop.quality;

  const pose = useMemo(() => {
    if (overridePose) return overridePose;
    if (shop.selected && !planMode && !walk) return focusPose(shop.selected, L);
    return viewPose(shop.view, L);
  }, [overridePose, shop.selected, shop.view, L, planMode, walk]);

  // anything that changes what the shadow map should contain
  const version = [
    L.room.width, L.room.depth, L.seating, shop.visiCooler, shop.tableFolded, shop.theme.counter, shop.theme.floor, shop.theme.trim,
    shop.lighting.intensity, shop.lighting.kelvin, shop.lighting.pendants, shop.lighting.downlights, shop.lighting.cove,
    shop.shutterOpen, quality, planMode, Object.values(shop.walls).join(""),
  ].join("|");

  return (
    <Canvas
      shadows="soft"
      dpr={[1, DPR[quality]]}
      frameloop={active ? "demand" : "never"}
      camera={{ fov: 36, near: 0.3, far: 200, position: [2.6, 17.4, 16.6] }}
      gl={{ antialias: quality !== "best", alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: !!overridePose, stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      style={{ touchAction: "pan-y" }}
      aria-label="Interactive 3D model of the Creamio shop interior"
    >
      <RenderOnDemand version={version} />
      <Suspense fallback={null}>
        <ShopInterior
          layout={L}
          walls={shop.walls}
          lighting={shop.lighting}
          theme={shop.theme}
          quality={quality}
          shutterOpen={shop.shutterOpen}
          selected={shop.selected}
          hovered={shop.hovered}
          visiCooler={shop.visiCooler}
          tableFolded={shop.tableFolded}
          planMode={planMode}
          quiet={quiet}
          onSelect={shop.select}
          onHover={shop.hover}
        />
        {shop.dims && !walk && <DimensionLines layout={L} selected={shop.selected} />}
        <ReadySignal onReady={onReady} active={active} />
        {quality === "best" && !overridePose && <PostFX />}
      </Suspense>
      <CameraRig
        pose={pose}
        nonce={shop.cameraNonce}
        planMode={planMode}
        walk={walk}
        room={L.room}
        interactive={interactive}
        touchScroll={touchScroll}
        wheelZoom={wheelZoom}
        reducedMotion={reducedMotion}
      />
      {walk && <Walkthrough layout={L} onInteract={shop.select} />}
      {!hidePins && !walk && <PinProjector layout={L} visiCooler={shop.visiCooler} plan={planMode} dimsFor={shop.dims ? shop.selected : null} />}
    </Canvas>
  );
}
