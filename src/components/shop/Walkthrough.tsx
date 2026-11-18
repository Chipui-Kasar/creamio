"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ShopLayout } from "@/data/shopLayout";
import { walkInput } from "@/lib/walkInput";
import type { EquipmentId } from "@/types";

const EYE = 5.4;
const RADIUS = 0.8;
const WALK = 3.2; // ft/s
const RUN = 6.4;

/**
 * First-person walkthrough: WASD / arrows (Shift runs), drag or pointer-lock to look,
 * on-screen D-pad for touch, collision against every fixture and the walls.
 * E (or click while locked) interacts with whatever the crosshair is on.
 */
export function Walkthrough({ layout, onInteract }: { layout: ShopLayout; onInteract: (id: EquipmentId | null) => void }) {
  const { camera, gl, scene, invalidate } = useThree();
  const st = useRef({ x: 0, z: 0, yaw: 0, pitch: -0.04, keys: new Set<string>(), drag: false, lx: 0, ly: 0 });
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const blockers = useMemo(
    () => layout.boxes.filter((b) => b.min[1] < EYE - 0.6 && b.max[1] > 0.6),
    [layout],
  );
  const { hx, hz } = layout.room;

  const interact = () => {
    ray.setFromCamera(new THREE.Vector2(0, 0), camera);
    ray.far = 9;
    const hits = ray.intersectObjects(scene.children, true);
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      while (o) {
        const id = (o.userData as { equipId?: EquipmentId }).equipId;
        if (id) return onInteract(id);
        o = o.parent;
      }
    }
    onInteract(null);
  };
  const interactRef = useRef(interact);
  interactRef.current = interact;

  // enter: place the camera at the door, facing in
  useEffect(() => {
    const s = st.current;
    s.x = layout.door.x;
    s.z = hz - 1.4;
    s.yaw = 0;
    s.pitch = -0.04;
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = 70;
    cam.updateProjectionMatrix();
    cam.rotation.order = "YXZ";
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const s = st.current;
    const el = gl.domElement;
    const typing = (e: Event) => /input|textarea|select/i.test((e.target as HTMLElement)?.tagName ?? "");
    const down = (e: KeyboardEvent) => {
      if (typing(e)) return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k)) {
        s.keys.add(k);
        e.preventDefault();
        invalidate();
      }
      if (k === "e") interactRef.current();
    };
    const up = (e: KeyboardEvent) => {
      s.keys.delete(e.key.toLowerCase());
    };
    const move = (e: MouseEvent) => {
      if (document.pointerLockElement === el) {
        s.yaw -= e.movementX * 0.0022;
        s.pitch = THREE.MathUtils.clamp(s.pitch - e.movementY * 0.0022, -1.2, 1.2);
        invalidate();
      }
    };
    const pdown = (e: PointerEvent) => {
      s.drag = true;
      s.lx = e.clientX;
      s.ly = e.clientY;
      if (e.pointerType === "mouse" && document.pointerLockElement !== el) el.requestPointerLock?.();
      else if (e.pointerType === "mouse") interactRef.current();
    };
    const pmove = (e: PointerEvent) => {
      if (!s.drag || e.pointerType === "mouse") return;
      s.yaw -= (e.clientX - s.lx) * 0.005;
      s.pitch = THREE.MathUtils.clamp(s.pitch - (e.clientY - s.ly) * 0.005, -1.2, 1.2);
      s.lx = e.clientX;
      s.ly = e.clientY;
      invalidate();
    };
    const pup = () => {
      s.drag = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    document.addEventListener("mousemove", move);
    el.addEventListener("pointerdown", pdown);
    el.addEventListener("pointermove", pmove);
    window.addEventListener("pointerup", pup);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      document.removeEventListener("mousemove", move);
      el.removeEventListener("pointerdown", pdown);
      el.removeEventListener("pointermove", pmove);
      window.removeEventListener("pointerup", pup);
      if (document.pointerLockElement === el) document.exitPointerLock();
      walkInput.forward = walkInput.strafe = walkInput.turn = 0;
    };
  }, [gl, invalidate]);

  const blocked = (x: number, z: number) => {
    if (Math.abs(x) > hx - RADIUS * 0.75 || Math.abs(z) > hz - RADIUS * 0.75) return true;
    return blockers.some((b) => x > b.min[0] - RADIUS && x < b.max[0] + RADIUS && z > b.min[2] - RADIUS && z < b.max[2] + RADIUS);
  };

  useFrame((state, dt) => {
    const s = st.current;
    const k = s.keys;
    const fwd = (k.has("w") || k.has("arrowup") ? 1 : 0) - (k.has("s") || k.has("arrowdown") ? 1 : 0) + walkInput.forward;
    const strafe = (k.has("d") ? 1 : 0) - (k.has("a") ? 1 : 0) + walkInput.strafe;
    const turn = (k.has("arrowleft") ? 1 : 0) - (k.has("arrowright") ? 1 : 0) + walkInput.turn;
    const run = k.has("shift") || walkInput.run;
    const step = Math.min(dt, 0.05);
    let active = false;
    if (turn) {
      s.yaw += turn * 1.7 * step;
      active = true;
    }
    if (fwd || strafe) {
      const sp = (run ? RUN : WALK) * step;
      const sin = Math.sin(s.yaw);
      const cos = Math.cos(s.yaw);
      // forward is -z at yaw 0
      const dx = (-sin * fwd + cos * strafe) * sp;
      const dz = (-cos * fwd - sin * strafe) * sp;
      if (!blocked(s.x + dx, s.z)) s.x += dx;
      if (!blocked(s.x, s.z + dz)) s.z += dz;
      active = true;
    }
    camera.position.set(s.x, EYE, s.z);
    camera.rotation.set(s.pitch, s.yaw, 0, "YXZ");
    if (active || k.size || walkInput.forward || walkInput.strafe || walkInput.turn) state.invalidate();
  });

  return null;
}
