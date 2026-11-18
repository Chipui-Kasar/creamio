import * as THREE from "three";

interface SwirlOpts {
  turns?: number;
  baseRadius?: number;
  height?: number;
  tubeRadius?: number;
  steps?: number;
  radial?: number;
}

/**
 * Soft-serve swirl: a tube that spirals inwards while rising, with a radius that
 * tapers to a point and a little flick at the tip. Built as one indexed mesh.
 */
export function createSwirlGeometry({
  turns = 3.2,
  baseRadius = 0.55,
  height = 1,
  tubeRadius = 0.2,
  steps = 160,
  radial = 18,
}: SwirlOpts = {}) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ang = t * turns * Math.PI * 2;
    const r = baseRadius * Math.pow(1 - t, 0.85);
    const y = height * Math.pow(t, 0.92);
    pts.push(new THREE.Vector3(Math.cos(ang) * r, y, Math.sin(ang) * r));
  }
  // tip flick
  const last = pts[pts.length - 1];
  pts.push(new THREE.Vector3(last.x + 0.01, last.y + height * 0.06, last.z + 0.01));
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4);
  const n = steps;
  const frames = curve.computeFrenetFrames(n, false);

  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const P = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    curve.getPointAt(t, P);
    const rad = tubeRadius * Math.max(0.04, 1 - 0.92 * Math.pow(t, 1.15));
    const N = frames.normals[i];
    const B = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      pos.push(P.x + rad * (c * N.x + s * B.x), P.y + rad * (c * N.y + s * B.y), P.z + rad * (c * N.z + s * B.z));
      uv.push(j / radial, t);
    }
  }
  for (let i = 0; i < n; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = (i + 1) * (radial + 1) + j;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
