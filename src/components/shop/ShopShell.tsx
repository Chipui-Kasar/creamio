"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { MENU, CURRENCY } from "@/data/menu";
import type { ShopLayout } from "@/data/shopLayout";
import { useWake } from "@/hooks/useWake";
import { markShadowsDirty } from "@/lib/sceneClock";
import type { LightingState, WallId, WallMode } from "@/types";
import { getMaterials, tiled } from "@/lib/materials";
import { awningTexture, labelTexture, loadImageTexture, menuBoardTexture } from "@/lib/textures";
import { FadingGroup } from "./FadingGroup";
import { Box, Cyl, PI, Plane } from "./models/parts";

type V3 = [number, number, number];

/** Flat decorative surface applied to a wall's interior face. */
function Surface({ size, pos, rotY = 0, mat }: { size: [number, number]; pos: V3; rotY?: number; mat: THREE.Material }) {
  return (
    <mesh position={pos} rotation={[0, rotY, 0]} receiveShadow material={mat}>
      <planeGeometry args={size} />
    </mesh>
  );
}

function Framed({ w, h, pos, rotY, children }: { w: number; h: number; pos: V3; rotY: number; children: ReactNode }) {
  const m = getMaterials();
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Box s={[w + 0.16, h + 0.16, 0.08]} m={m.gold} radius={0.02} />
      {children}
    </group>
  );
}

/* ─────────────────────────  BACK WALL  ───────────────────────── */
function BackWall({ L, cut, mode }: { L: ShopLayout; cut: boolean; mode: WallMode }) {
  const m = getMaterials();
  const { width: W, depth: D, height: H, wall: WT, hx, hz } = L.room;
  const tile = useMemo(() => tiled(m.tileMint, W / 2, 2.4), [m, W]);
  const board = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: menuBoardTexture(MENU.map((i) => ({ name: i.name.replace("Ice-Cream ", "").replace("Fresh ", ""), price: `${CURRENCY}${i.prices[0].price}+` }))),
        toneMapped: false,
      }),
    [],
  );
  void D;
  const z = -hz + 0.005;
  const bxc = hx - 1.25; // menu board over the east end of the prep counter
  return (
    <FadingGroup normal={[0, 0, -1]} dist={hz} cut={cut} mode={mode}>
      <Box s={[W + WT * 2, H, WT]} p={[0, H / 2, -hz - WT / 2]} m={m.wallCream} cast={false} />
      <Surface size={[W, H - 4.6]} pos={[0, 4.6 + (H - 4.6) / 2, z]} mat={m.wallCream} />
      <Surface size={[W, 4.6]} pos={[0, 2.3, z]} mat={tile} />
      <Box s={[W, 0.1, 0.09]} p={[0, 4.62, z + 0.03]} m={m.woodDark} cast={false} />
      <Box s={[W, 0.06, 0.02]} p={[0, 0.03, z + 0.01]} m={m.charcoal} cast={false} />

      {/* menu board above the cooler, back-right */}
      <Framed w={2.9} h={1.36} pos={[bxc, 6.75, z + 0.05]} rotY={0}>
        <Plane s={[2.9, 1.36]} p={[0, 0, 0.045]} m={board} />
      </Framed>
      <Box s={[1.5, 0.05, 0.25]} p={[bxc, 7.62, z + 0.16]} m={m.brass} cast={false} />
      <Box s={[1.4, 0.02, 0.18]} p={[bxc, 7.59, z + 0.16]} m={m.ledWarm} cast={false} />
    </FadingGroup>
  );
}

/* ─────────────────────────  WEST WALL  ───────────────────────── */
function WestWall({ L, cut, mode }: { L: ShopLayout; cut: boolean; mode: WallMode }) {
  const m = getMaterials();
  const { depth: D, height: H, wall: WT, hx } = L.room;
  const wood = useMemo(() => tiled(m.fluted, D / 1.8, 2), [m, D]);
  const logo = useMemo(() => loadImageTexture("/images/brand/logo-full.png"), []);
  const x = -hx + 0.005;
  const seatZ = L.placements.seating.z;
  return (
    <FadingGroup normal={[-1, 0, 0]} dist={hx} cut={cut} mode={mode}>
      <Box s={[WT, H, D + WT * 2]} p={[-hx - WT / 2, H / 2, 0]} m={m.wallCream} cast={false} />
      <Surface size={[D, H - 3.9]} pos={[x, 3.9 + (H - 3.9) / 2, 0]} rotY={PI / 2} mat={m.wallPink} />
      {/* fluted oak wainscot along the whole customer wall */}
      <Surface size={[D, 3.9]} pos={[x, 1.95, 0]} rotY={PI / 2} mat={wood} />
      <Box s={[0.09, 0.09, D]} p={[x + 0.03, 3.92, 0]} m={m.woodDark} cast={false} />
      <Box s={[0.05, 0.12, D]} p={[x + 0.02, 0.06, 0]} m={m.woodDark} cast={false} />

      {/* round lightbox with the Creamio mark — echoes the brand's blade sign */}
      <group position={[x + 0.14, 6.35, seatZ]} rotation={[0, PI / 2, 0]}>
        <Cyl rad={1.18} h={0.26} r={[PI / 2, 0, 0]} p={[0, 0, 0.1]} m={m.black} seg={56} />
        <mesh position={[0, 0, 0.235]}>
          <circleGeometry args={[1.08, 56]} />
          <meshBasicMaterial color="#fff6e9" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.24]}>
          <planeGeometry args={[1.9, 1.356]} />
          <meshBasicMaterial map={logo} transparent toneMapped={false} />
        </mesh>
        <Box s={[0.12, 0.3, 0.16]} p={[0, 0, -0.05]} m={m.black} cast={false} />
      </group>
    </FadingGroup>
  );
}

/* ─────────────────────────  EAST WALL  ───────────────────────── */
function EastWall({ L, cut, mode }: { L: ShopLayout; cut: boolean; mode: WallMode }) {
  const m = getMaterials();
  const { depth: D, height: H, wall: WT, hx, hz } = L.room;
  const zBack = -hz;
  const staffLen = L.zFront - zBack; // tiled staff stretch
  const frontLen = hz - L.zFront;
  const tileM = useMemo(() => tiled(m.tileMint, staffLen / 2, 2), [m, staffLen]);
  const wood = useMemo(() => tiled(m.fluted, Math.max(1, frontLen) / 1.8, 2), [m, frontLen]);
  const peach = useMemo(() => tiled(m.wallCream, 2, 2), [m]);
  const art1 = useMemo(() => loadImageTexture("/images/brand/mascot.png"), []);
  const x = hx - 0.005;
  return (
    <FadingGroup normal={[1, 0, 0]} dist={hx} cut={cut} mode={mode}>
      <Box s={[WT, H, D + WT * 2]} p={[hx + WT / 2, H / 2, 0]} m={m.wallCream} cast={false} />
      <Surface size={[D, H - 3.9]} pos={[x, 3.9 + (H - 3.9) / 2, 0]} rotY={-PI / 2} mat={peach} />
      <Surface size={[staffLen, 3.9]} pos={[x, 1.95, zBack + staffLen / 2]} rotY={-PI / 2} mat={tileM} />
      <Surface size={[frontLen, 3.9]} pos={[x, 1.95, L.zFront + frontLen / 2]} rotY={-PI / 2} mat={wood} />
      <Box s={[0.09, 0.09, D]} p={[x - 0.03, 3.92, 0]} m={m.woodDark} cast={false} />
      {/* framed brand prints on the customer-side stretch */}
      {[0.28, 0.72].map((f, i) => (
        <Framed key={f} w={1.3} h={1.7} pos={[x - 0.05, 6.1, L.zFront + frontLen * f]} rotY={-PI / 2}>
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[1.3, 1.7]} />
            <meshBasicMaterial color={i ? "#cdebe6" : "#ffd9e3"} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[0.9, 1.1]} />
            <meshBasicMaterial map={art1} transparent toneMapped={false} />
          </mesh>
        </Framed>
      ))}
    </FadingGroup>
  );
}

/* ─────────────────────────  ROLLER SHUTTER  ───────────────────────── */
/** Slatted shutter over the whole shopfront. Rolls up into the fascia (open) / down to the threshold (closed). */
function RollerShutter({ L, open }: { L: ShopLayout; open: boolean }) {
  const m = getMaterials();
  const { width: W, wall: WT, hz } = L.room;
  const top = 7.3;
  const slatH = 0.2;
  const N = Math.ceil(top / slatH);
  const slats = useRef<THREE.InstancedMesh>(null);
  const bar = useRef<THREE.Group>(null);
  const p = useRef(0); // 0 = rolled up, 1 = fully down
  const first = useRef(true);
  const z = hz + WT + 0.1;
  useWake([open]);

  useLayoutEffect(() => {
    if (!slats.current) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      o.position.set(0, top - (i + 0.5) * slatH, 0);
      o.updateMatrix();
      slats.current.setMatrixAt(i, o.matrix);
    }
    slats.current.instanceMatrix.needsUpdate = true;
  }, [N, top, slatH]);

  useFrame((state, dt) => {
    const target = open ? 0 : 1;
    if (p.current === target && !first.current) return;
    first.current = false;
    p.current = THREE.MathUtils.damp(p.current, target, 3.2, dt);
    if (Math.abs(p.current - target) < 0.003) p.current = target;
    if (slats.current) slats.current.count = Math.max(0, Math.round(p.current * N));
    if (bar.current) {
      bar.current.position.y = top - p.current * top;
      bar.current.visible = p.current > 0.02;
    }
    markShadowsDirty(2);
    state.invalidate();
  });

  return (
    <group position={[0, 0, z]}>
      {/* roller housing hidden in the fascia + guide rails */}
      <Box s={[W + 0.2, 0.4, 0.34]} p={[0, top + 0.12, 0.05]} m={m.charcoal} radius={0.04} cast={false} />
      {[-1, 1].map((s) => (
        <Box key={s} s={[0.16, top, 0.16]} p={[s * (W / 2 + 0.02), top / 2, 0]} m={m.charcoal} cast={false} />
      ))}
      {/* curtain */}
      <instancedMesh ref={slats} args={[undefined, undefined, N]} count={0} castShadow>
        <boxGeometry args={[W - 0.1, slatH * 0.86, 0.05]} />
        <primitive object={m.stainlessDark} attach="material" />
      </instancedMesh>
      {/* lockable bottom bar */}
      <group ref={bar} position={[0, top, 0]} visible={false}>
        <Box s={[W - 0.1, 0.18, 0.12]} p={[0, -0.07, 0.03]} m={m.charcoal} radius={0.03} cast={false} />
        {[-1.2, 1.2].map((x) => (
          <Cyl key={x} rad={0.06} h={0.08} p={[x, -0.07, 0.11]} r={[PI / 2, 0, 0]} m={m.brass} seg={12} cast={false} />
        ))}
      </group>
    </group>
  );
}

/* ─────────────────────────  SHOP FRONT  ───────────────────────── */
function FrontWall({ L, cut, mode, shutterOpen }: { L: ShopLayout; cut: boolean; mode: WallMode; shutterOpen: boolean }) {
  const { width: W, height: H, wall: WT, hx, hz } = L.room;
  const DOOR = L.door;
  const m = getMaterials();
  const awning = useMemo(() => new THREE.MeshStandardMaterial({ map: awningTexture(), roughness: 0.8, side: THREE.DoubleSide }), []);
  const word = useMemo(() => loadImageTexture("/images/brand/wordmark-light.png"), []);
  const mascot = useMemo(() => loadImageTexture("/images/brand/mascot.png"), []);
  const tagline = useMemo(
    () => labelTexture([{ text: "ICE CREAM & MORE", size: 54, color: "#f9729b", weight: "700", y: 40, spacing: 14 }], 1024, 80),
    [],
  );
  const z = hz;
  const dx0 = DOOR.x - DOOR.width / 2;
  const dx1 = DOOR.x + DOOR.width / 2;
  const riserH = 2.4;
  const glassTop = 7.3;
  const leftW = dx0 + hx;
  const rightW = hx - dx1;

  return (
    <FadingGroup normal={[0, 0, 1]} dist={hz} cut={cut} mode={mode}>
      {/* lower riser, in two halves around the door */}
      <Box s={[leftW, riserH, WT]} p={[-hx + leftW / 2, riserH / 2, z + WT / 2]} m={m.navy} cast={false} />
      <Box s={[rightW, riserH, WT]} p={[hx - rightW / 2, riserH / 2, z + WT / 2]} m={m.navy} cast={false} />
      {/* header + fascia */}
      <Box s={[W + WT * 2, H - glassTop, WT]} p={[0, glassTop + (H - glassTop) / 2, z + WT / 2]} m={m.navy} cast={false} />
      {/* glass panes */}
      <Box s={[leftW, glassTop - riserH, 0.05]} p={[-hx + leftW / 2, riserH + (glassTop - riserH) / 2, z + WT / 2]} m={m.glass} cast={false} />
      <Box s={[rightW, glassTop - riserH, 0.05]} p={[hx - rightW / 2, riserH + (glassTop - riserH) / 2, z + WT / 2]} m={m.glass} cast={false} />
      {/* mullions */}
      {[-hx, -hx + leftW / 2, dx0, dx1, hx].map((x, i) => (
        <Box key={i} s={[0.1, glassTop - riserH, 0.14]} p={[x, riserH + (glassTop - riserH) / 2, z + WT / 2]} m={m.navy} cast={false} />
      ))}
      <Box s={[leftW, 0.08, 0.14]} p={[-hx + leftW / 2, 4.9, z + WT / 2]} m={m.navy} cast={false} />
      <Box s={[rightW, 0.08, 0.14]} p={[hx - rightW / 2, 4.9, z + WT / 2]} m={m.navy} cast={false} />
      {/* transom above the door */}
      <Box s={[DOOR.width, 0.1, 0.14]} p={[DOOR.x, DOOR.height, z + WT / 2]} m={m.navy} cast={false} />
      <Box s={[DOOR.width, glassTop - DOOR.height, 0.05]} p={[DOOR.x, DOOR.height + (glassTop - DOOR.height) / 2, z + WT / 2]} m={m.glass} cast={false} />

      {/* door leaf, ajar */}
      <group position={[dx1 - 0.05, 0, z + WT / 2]} rotation={[0, 0.95, 0]} visible={shutterOpen}>
        <Box s={[DOOR.width - 0.12, DOOR.height - 0.1, 0.06]} p={[-(DOOR.width - 0.12) / 2, DOOR.height / 2 - 0.05, 0]} m={m.glass} cast={false} />
        <Box s={[DOOR.width - 0.12, 0.28, 0.1]} p={[-(DOOR.width - 0.12) / 2, 0.2, 0]} m={m.navy} cast={false} />
        <Box s={[0.12, DOOR.height - 0.1, 0.1]} p={[0, DOOR.height / 2 - 0.05, 0]} m={m.navy} cast={false} />
        <Box s={[0.12, DOOR.height - 0.1, 0.1]} p={[-(DOOR.width - 0.12), DOOR.height / 2 - 0.05, 0]} m={m.navy} cast={false} />
        <Box s={[DOOR.width - 0.12, 0.12, 0.1]} p={[-(DOOR.width - 0.12) / 2, DOOR.height - 0.1, 0]} m={m.navy} cast={false} />
        <Cyl rad={0.03} h={1.6} p={[-(DOOR.width - 0.35), 3.6, 0.14]} m={m.brass} seg={12} />
      </group>

      {/* fascia sign: mascot + wordmark + tagline */}
      <group position={[0, 8.2, z + WT + 0.01]}>
        <mesh position={[-2.1, 0.02, 0]}>
          <planeGeometry args={[0.95, 1.166]} />
          <meshBasicMaterial map={mascot} transparent toneMapped={false} />
        </mesh>
        <mesh position={[0.35, 0.18, 0]}>
          <planeGeometry args={[3.6, 0.842]} />
          <meshBasicMaterial map={word} transparent toneMapped={false} />
        </mesh>
        <mesh position={[0.35, -0.42, 0]}>
          <planeGeometry args={[3.2, 0.25]} />
          <meshBasicMaterial map={tagline} transparent toneMapped={false} />
        </mesh>
      </group>

      {/* striped awning + valance */}
      <mesh position={[0, 6.95, z + WT + 0.7]} rotation={[-0.88, 0, 0]} castShadow material={awning}>
        <planeGeometry args={[W + 0.6, 1.9]} />
      </mesh>
      <mesh position={[0, 6.2, z + WT + 1.27]} material={awning}>
        <planeGeometry args={[W + 0.6, 0.4]} />
      </mesh>
      <Box s={[W + 0.6, 0.04, 0.04]} p={[0, 7.9, z + WT + 0.04]} m={m.brass} cast={false} />
      <RollerShutter L={L} open={shutterOpen} />
    </FadingGroup>
  );
}

/* ─────────────────────────  CEILING  ───────────────────────── */
function Ceiling({ L, hidden, mode, lighting }: { L: ShopLayout; hidden: boolean; mode: WallMode; lighting: LightingState }) {
  const m = getMaterials();
  const { width: W, depth: D, height: H, wall: WT, hz } = L.room;
  const cols = Math.max(2, Math.round(W / 3.3));
  const rows = Math.max(2, Math.round(D / 3.3));
  const lights: [number, number][] = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) lights.push([-W / 2 + (W / cols) * (i + 0.5), -D / 2 + (D / rows) * (j + 0.5)]);
  return (
    <FadingGroup normal={[0, 1, 0]} dist={H} hidden={hidden} mode={mode}>
      <Box s={[W + WT * 2, 0.2, D + WT * 2]} p={[0, H + 0.1, 0]} m={m.ceiling} cast={false} />
      {lights.map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, H - 0.005, z]}>
          <Cyl rad={0.26} h={0.03} m={m.stainless} seg={24} cast={false} />
          <Cyl rad={0.2} h={0.035} p={[0, -0.01, 0]} m={lighting.downlights ? m.ledWarm : m.stainlessDark} seg={24} cast={false} />
        </group>
      ))}
      <Box s={[W - 0.4, 0.05, 0.1]} p={[0, H - 0.06, -hz + 0.18]} m={lighting.cove ? m.ledWarm : m.charcoal} cast={false} />
    </FadingGroup>
  );
}

export function ShopShell({
  layout,
  planMode,
  walls,
  lighting,
  shutterOpen,
}: {
  layout: ShopLayout;
  planMode: boolean;
  walls: Record<WallId, WallMode>;
  lighting: LightingState;
  shutterOpen: boolean;
}) {
  return (
    <>
      <BackWall L={layout} cut={planMode} mode={walls.back} />
      <WestWall L={layout} cut={planMode} mode={walls.left} />
      <EastWall L={layout} cut={planMode} mode={walls.right} />
      <FrontWall L={layout} cut={planMode} mode={!shutterOpen && walls.front === "auto" ? "show" : walls.front} shutterOpen={shutterOpen} />
      <Ceiling L={layout} hidden={planMode} mode={walls.ceiling} lighting={lighting} />
    </>
  );
}
