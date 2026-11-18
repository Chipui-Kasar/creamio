/**
 * Re-generates the static renders in public/images/renders from the live 3D scene.
 *
 *   npm run build && npm start          # in one terminal (a production build has no dev overlay)
 *   npm run capture                     # in another
 *
 * Needs Chrome/Chromium: set CHROME_PATH, or have Google Chrome installed (channel "chrome").
 * Env: BASE_URL (default http://localhost:3000), SHOTS="overview,front" to render a subset.
 */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("public/images/renders");

// route shot name → output file
const SHOTS = {
  overview: "overview",
  front: "front",
  seating: "seating",
  "seating-table": "seating-table",
  equipment: "equipment",
  plan: "plan",
  juicer: "prep-juice",
  scoop: "prep-scoop",
  softy: "prep-softy",
  coffee: "prep-coffee",
  selfserve: "selfserve",
};
const only = process.env.SHOTS?.split(",").map((s) => s.trim());

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });

for (const [shot, file] of Object.entries(SHOTS)) {
  if (only && !only.includes(shot)) continue;
  await page.goto(`${BASE}/render?shot=${shot}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__shopReady === true, undefined, { timeout: 60000 });
  await page.waitForTimeout(3500); // lid / door animations + texture loads settle
  await page.screenshot({ path: path.join(OUT, `${file}.jpg`), type: "jpeg", quality: 88 });
  console.log("✓", file);
}
await browser.close();
