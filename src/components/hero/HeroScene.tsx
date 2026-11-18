"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createSwirlGeometry } from "@/lib/swirl";
import { citrusSliceTexture, citrusTexture, strawberryTexture, waffleTexture } from "@/lib/textures";

interface Props {
  active: boolean;
  reducedMotion: boolean;
  lowPower: boolean;
  onReady: () => void;
}

function Ready({ onReady }: { onReady: () => void }) {
  const n = useRef(0);
  useFrame(() => {
    if (++n.current === 3) onReady();
  });
  return null;
}

function Cone() {
  const wafflet = useMemo(() => waffleTexture(), []);
  const swirl = useMemo(() => createSwirlGeometry({ turns: 3.7, baseRadius: 0.6, height: 1.2, tubeRadius: 0.27, steps: 220, radial: 28 }), []);
  const sprinkles = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!sprinkles.current) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const cols = ["#ffffff", "#4db6ac", "#e6b56a", "#14304f", "#ffffff"];
    for (let i = 0; i < 46; i++) {
      const t = 0.08 + (i / 46) * 0.8;
      const ang = i * 2.399;
      const r = (0.6 * Math.pow(1 - t, 0.85) + 0.17) * 1.0;
      o.position.set(Math.cos(ang) * r, 1.2 * Math.pow(t, 0.92) + 0.18, Math.sin(ang) * r);
      o.rotation.set(ang, ang * 2, ang * 3);
      o.updateMatrix();
      sprinkles.current.setMatrixAt(i, o.matrix);
      sprinkles.current.setColorAt(i, c.set(cols[i % cols.length]));
    }
    sprinkles.current.instanceMatrix.needsUpdate = true;
    if (sprinkles.current.instanceColor) sprinkles.current.instanceColor.needsUpdate = true;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* brass dessert stand */}
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.7, 0.14, 48]} />
        <meshStandardMaterial color="#e9bd78" metalness={0.8} roughness={0.38} envMapIntensity={1.6} />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.7, 20]} />
        <meshStandardMaterial color="#e6b56a" metalness={1} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.2, 0.035, 14, 36]} />
        <meshStandardMaterial color="#e6b56a" metalness={1} roughness={0.28} />
      </mesh>
      {/* waffle cone (apex down, tip rests in the ring) */}
      <group position={[0, 0.8, 0]}>
        <mesh position={[0, 0.8, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.56, 1.6, 56, 1, true]} />
          <meshStandardMaterial map={wafflet} bumpMap={wafflet} bumpScale={2.2} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.56, 0.045, 14, 56]} />
          <meshStandardMaterial color="#d79a4a" roughness={0.6} />
        </mesh>
        {/* soft-serve swirl */}
        <group position={[0, 1.5, 0]}>
          <mesh position={[0, 0.02, 0]} scale={[1, 0.55, 1]} castShadow>
            <sphereGeometry args={[0.58, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial color="#ff93b6" roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.4} sheen={0.6} sheenColor="#ffd2e0" />
          </mesh>
          <mesh geometry={swirl} position={[0, 0.1, 0]} castShadow>
            <meshPhysicalMaterial color="#ff93b6" roughness={0.38} clearcoat={0.4} clearcoatRoughness={0.35} sheen={0.7} sheenColor="#ffd2e0" />
          </mesh>
          <instancedMesh ref={sprinkles} args={[undefined, undefined, 46]} castShadow>
            <capsuleGeometry args={[0.012, 0.06, 3, 6]} />
            <meshStandardMaterial roughness={0.5} />
          </instancedMesh>
        </group>
      </group>
    </group>
  );
}

function JuiceGlass() {
  const slice = useMemo(() => citrusSliceTexture(), []);
  return (
    <group position={[1.85, 0, 0.25]} rotation={[0, -0.4, 0]}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.35, 1.3, 40, 1, true]} />
        <meshPhysicalMaterial color="#f6fdff" transparent opacity={0.28} roughness={0.03} transmission={0} envMapIntensity={1.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.12, 36]} />
        <meshPhysicalMaterial color="#eaf7fb" transparent opacity={0.5} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.425, 0.352, 1.0, 36]} />
        <meshStandardMaterial color="#ff9d2e" roughness={0.18} transparent opacity={0.92} />
      </mesh>
      {[[-0.12, 1.02, 0.08], [0.14, 1.0, -0.06], [0.02, 1.06, 0.18]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[i, i * 2, 0.3]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.55} roughness={0.08} />
        </mesh>
      ))}
      {/* striped straw */}
      <mesh position={[0.12, 1.1, -0.04]} rotation={[0.1, 0, -0.22]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 1.55, 10]} />
        <meshStandardMaterial color="#f96b97" roughness={0.4} />
      </mesh>
      {/* orange slice on the rim */}
      <group position={[0.4, 1.28, 0.05]} rotation={[0.2, 0.4, -0.35]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.33, 0.33, 0.06, 40]} />
          <meshStandardMaterial map={slice} roughness={0.5} />
        </mesh>
        <mesh position={[0.05, -0.01, 0]} scale={[1, 1, 1]}>
          <boxGeometry args={[0.45, 0.07, 0.03]} />
          <meshStandardMaterial color="#14304f" transparent opacity={0} />
        </mesh>
      </group>
    </group>
  );
}

function Fruit() {
  const cit = useMemo(() => citrusTexture(), []);
  const slice = useMemo(() => citrusSliceTexture("#f39a2d", "#ffc15a"), []);
  const straw = useMemo(() => strawberryTexture(), []);
  const berries: { p: [number, number, number]; r: number; s: number }[] = [
    { p: [-1.5, 0.28, 0.55], r: 0.4, s: 0.34 },
    { p: [-1.05, 0.26, 1.05], r: -0.7, s: 0.3 },
    { p: [-1.9, 0.24, 1.0], r: 0.9, s: 0.28 },
  ];
  return (
    <group>
      {berries.map((b, i) => (
        <group key={i} position={b.p} rotation={[0.3, b.r, 0.4]} scale={b.s * 2.2}>
          <mesh scale={[1, 1.12, 1]} castShadow>
            <sphereGeometry args={[0.36, 28, 22]} />
            <meshStandardMaterial map={straw} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.34, 0]} castShadow>
            <coneGeometry args={[0.2, 0.12, 7]} />
            <meshStandardMaterial color="#4a9a52" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* whole orange + half */}
      <mesh position={[-1.7, 0.36, -0.55]} castShadow>
        <sphereGeometry args={[0.38, 36, 28]} />
        <meshStandardMaterial map={cit} bumpMap={cit} bumpScale={0.8} roughness={0.55} />
      </mesh>
      <group position={[-0.95, 0.32, -0.95]} rotation={[0, 0.5, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.36, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial map={cit} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.36, 36]} />
          <meshStandardMaterial map={slice} roughness={0.45} />
        </mesh>
      </group>
      {/* mint */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[1.15 + i * 0.12, 0.08 + i * 0.01, 1.2 - i * 0.1]} rotation={[-0.3, i * 1.2, 0.2]} scale={[1, 0.2, 1.7]} castShadow>
          <sphereGeometry args={[0.12, 14, 10]} />
          <meshStandardMaterial color="#58a864" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Stage({ reducedMotion }: { reducedMotion: boolean }) {
  const g = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((state, dt) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    const targetY = reducedMotion ? -0.35 : -0.35 + Math.sin(t * 0.35) * 0.22 + pointer.x * 0.35;
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, targetY, 3, dt);
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, reducedMotion ? 0 : -pointer.y * 0.05, 3, dt);
  });
  return (
    <group ref={g} position={[0, -0.78, 0]} scale={0.8}>
      {/* podium */}
      <mesh position={[0, -0.14, 0]} receiveShadow>
        <cylinderGeometry args={[2.75, 2.85, 0.28, 72]} />
        <meshStandardMaterial color="#4db6ac" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.005, 0]} receiveShadow>
        <cylinderGeometry args={[2.55, 2.55, 0.02, 72]} />
        <meshStandardMaterial color="#fff6e9" roughness={0.6} />
      </mesh>
      <Cone />
      <JuiceGlass />
      <Fruit />
    </group>
  );
}

export default function HeroScene({ active, reducedMotion, lowPower, onReady }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, lowPower ? 1 : 1.25]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 28, position: [0, 2.9, 11.4], near: 0.5, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        camera.lookAt(0, 0.95, 0);
      }}
      aria-label="3D soft-serve ice cream cone with a glass of fresh orange juice and fruit"
    >
      <hemisphereLight args={["#fff3e2", "#ffd1c4", 0.9]} />
      <directionalLight
        position={[4, 8, 6]}
        intensity={2.1}
        color="#fff0dc"
        castShadow
        shadow-mapSize={[lowPower ? 1024 : 2048, lowPower ? 1024 : 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
      />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#fff2e0" position={[0, 6, 4]} rotation-x={Math.PI / 2.4} scale={[10, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffd6e2" position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 5, 1]} />
        <Lightformer form="rect" intensity={1.3} color="#cfeee9" position={[6, 2, -1]} rotation-y={-Math.PI / 2} scale={[6, 5, 1]} />
      </Environment>
      <Stage reducedMotion={reducedMotion} />
      <ContactShadows position={[0, -0.78, 0]} opacity={0.35} scale={9} blur={2.6} far={3} resolution={512} color="#6b3b3b" />
      <Ready onReady={onReady} />
    </Canvas>
  );
}
