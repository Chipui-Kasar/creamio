"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { CameraPose } from "@/types";

interface RoomDims {
  width: number;
  depth: number;
}

interface Props {
  pose: CameraPose;
  /** Bumps to trigger a (re)fly to `pose`. */
  nonce: number;
  planMode: boolean;
  /** First-person mode: orbit controls are off and the walkthrough drives the camera. */
  walk: boolean;
  room: RoomDims;
  /** When false the canvas lets touches scroll the page. */
  interactive: boolean;
  /** Wheel zoom only once the visitor has engaged with the canvas (no scroll-trapping). */
  wheelZoom: boolean;
  reducedMotion: boolean;
}


/**
 * OrbitControls + smooth camera transitions.
 * - Flies to `pose` whenever `nonce` changes (damped, so it eases in and out).
 * - Any user input cancels the flight.
 * - Rotation / distance / pan are clamped so you can never end up under the floor or lost in space.
 */
export function CameraRig({ pose, nonce, planMode, walk, room, interactive, wheelZoom, reducedMotion }: Props) {
  const span = Math.max(room.width, room.depth) / 10;
  const PAN_LIMIT = { x: room.width / 2 + 1, zMin: -room.depth / 2 - 1, zMax: room.depth / 2 + 1, yMin: 0.5, yMax: 6.5 };
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, gl, invalidate } = useThree();
  const goal = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 36 });
  const flying = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    goal.current.pos.set(...pose.position);
    goal.current.target.set(...pose.target);
    goal.current.fov = pose.fov ?? 36;
    const c = controls.current;
    if (first.current || reducedMotion) {
      camera.position.copy(goal.current.pos);
      (camera as THREE.PerspectiveCamera).fov = goal.current.fov;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      c?.target.copy(goal.current.target);
      c?.update();
      first.current = false;
      flying.current = false;
    } else {
      flying.current = true;
    }
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walk, nonce, pose.position[0], pose.position[1], pose.position[2], pose.target[0], pose.target[1], pose.target[2]]);

  // on-screen zoom buttons dispatch `shop-zoom` with a distance factor
  useEffect(() => {
    const onZoom = (e: Event) => {
      const c = controls.current;
      if (!c) return;
      const f = (e as CustomEvent<number>).detail;
      const dir = camera.position.clone().sub(c.target);
      const len = THREE.MathUtils.clamp(dir.length() * f, c.minDistance, c.maxDistance);
      dir.setLength(len);
      goal.current.pos.copy(c.target).add(dir);
      goal.current.target.copy(c.target);
      goal.current.fov = (camera as THREE.PerspectiveCamera).fov;
      flying.current = true;
    };
    window.addEventListener("shop-zoom", onZoom);
    return () => window.removeEventListener("shop-zoom", onZoom);
  }, [camera]);

  // touch behaviour: let the page scroll unless the visitor opted in to interact
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = interactive ? "none" : "pan-y";
  }, [gl, interactive, planMode]);

  useFrame((state, dt) => {
    const c = controls.current;
    if (!c || walk) return;
    const cam = camera as THREE.PerspectiveCamera;
    if (flying.current) {
      const k = 3.4;
      const g = goal.current;
      cam.position.x = THREE.MathUtils.damp(cam.position.x, g.pos.x, k, dt);
      cam.position.y = THREE.MathUtils.damp(cam.position.y, g.pos.y, k, dt);
      cam.position.z = THREE.MathUtils.damp(cam.position.z, g.pos.z, k, dt);
      c.target.x = THREE.MathUtils.damp(c.target.x, g.target.x, k, dt);
      c.target.y = THREE.MathUtils.damp(c.target.y, g.target.y, k, dt);
      c.target.z = THREE.MathUtils.damp(c.target.z, g.target.z, k, dt);
      cam.fov = THREE.MathUtils.damp(cam.fov, g.fov, k, dt);
      cam.updateProjectionMatrix();
      if (cam.position.distanceTo(g.pos) < 0.02 && c.target.distanceTo(g.target) < 0.02) flying.current = false;
      state.invalidate();
    }
    // keep the orbit target inside the shop footprint
    const t = c.target;
    t.x = THREE.MathUtils.clamp(t.x, -PAN_LIMIT.x, PAN_LIMIT.x);
    t.z = THREE.MathUtils.clamp(t.z, PAN_LIMIT.zMin, PAN_LIMIT.zMax);
    t.y = THREE.MathUtils.clamp(t.y, PAN_LIMIT.yMin - 0.5, PAN_LIMIT.yMax);
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={interactive && !walk}
      enableDamping
      dampingFactor={0.09}
      rotateSpeed={0.6}
      zoomSpeed={0.7}
      panSpeed={0.7}
      screenSpacePanning
      enableZoom={wheelZoom}
      enableRotate={!planMode}
      minDistance={planMode ? 10 * span : 2.4}
      maxDistance={(planMode ? 36 : 26) * span}
      minPolarAngle={planMode ? 0 : 0.18}
      maxPolarAngle={Math.PI / 2 - 0.03}
      onStart={() => {
        flying.current = false;
      }}
    />
  );
}
