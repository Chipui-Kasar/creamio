/**
 * Layout stress test:  npm run validate
 * Re-flows the shop for 500 random room sizes / seating options and fails if any fixture
 * overlaps another, leaves the room, blocks the entrance, or if the validator and layout disagree.
 */
import { computeLayout, ROOM_LIMITS, SEATING_INFO, type RoomSize } from "../src/data/shopLayout";
import { validateLayout } from "../src/data/validate";

let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
const range = (lo: number) => {
  const a: number[] = [];
  for (let v = lo; v <= ROOM_LIMITS.max + 1e-9; v += ROOM_LIMITS.step) a.push(v);
  return a;
};
const widths = range(ROOM_LIMITS.min);
const depths = range(ROOM_LIMITS.minDepth);

let failed = 0;
const failures = new Map<string, number>();
const comfort = new Map<string, number>();
const cases: { room: RoomSize; seating: "table" | "foldable" }[] = [
  { room: { width: 10, depth: 12 }, seating: "foldable" }, // the default
  { room: { width: ROOM_LIMITS.min, depth: ROOM_LIMITS.minDepth }, seating: "table" },
  { room: { width: ROOM_LIMITS.min, depth: ROOM_LIMITS.minDepth }, seating: "foldable" },
  { room: { width: ROOM_LIMITS.max, depth: ROOM_LIMITS.max }, seating: "foldable" },
];
for (let i = 0; i < 497; i++) cases.push({ room: { width: pick(widths), depth: pick(depths) }, seating: pick(Object.keys(SEATING_INFO)) as "table" | "foldable" });

for (const c of cases) {
  const L = computeLayout(c.room, c.seating);
  const { errors, warnings } = validateLayout(L);
  if (errors.length) {
    failed++;
    for (const e of errors) failures.set(`${e.label}: ${e.detail}`, (failures.get(`${e.label}: ${e.detail}`) ?? 0) + 1);
    if (failed <= 5) console.log("✗", c.room, c.seating, errors.map((e) => e.detail).join(" | "));
  }
  for (const w of warnings) comfort.set(w.label, (comfort.get(w.label) ?? 0) + 1);
}

console.log(`\n${cases.length} layouts checked — ${cases.length - failed} clean, ${failed} with hard errors.`);
if (comfort.size) {
  console.log("Comfort guidelines tripped (informational, shown to the user as warnings):");
  for (const [k, v] of comfort) console.log(`  · ${k}: ${v} layouts`);
}
if (failed) {
  console.log("\nHard errors:");
  for (const [k, v] of failures) console.log(`  ✗ ${k} (${v})`);
  process.exit(1);
}
console.log("✓ No fixture overlaps, no fixture outside the walls, entrance clear.");
