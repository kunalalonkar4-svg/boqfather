// Renders the construction scene for the home page: hero stills and one still per stage
// (used on phones, without WebGL and with reduced motion). Usage: npm run build && node scripts/home-renders.mjs
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
const { chromium } = req("playwright");
const sharp = req("sharp");

const DEST = new URL("../public/home/", import.meta.url).pathname;
await mkdir(DEST, { recursive: true });
const PORT = 4125;
const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: new URL("..", import.meta.url).pathname,
  stdio: "ignore",
  detached: true,
});
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`http://localhost:${PORT}/build-render/`)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
async function shot(stage, w, h, name, outW, q = 78, frame = "build") {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/build-render/?s=${stage}&frame=${frame}`);
  await page.waitForFunction(() => window.__buildReady === true, null, { timeout: 90000 });
  const png = await page.locator("canvas").screenshot({ type: "png" });
  await writeFile(join(DEST, name), await sharp(png).resize({ width: outW }).webp({ quality: q, effort: 5 }).toBuffer());
  await page.close();
  process.stdout.write(`${name} `);
}
await shot(7, 1920, 1080, "hero-house.webp", 1920, 80, "hero");
await shot(7, 720, 1280, "hero-house-m.webp", 720, 78, "hero");
// each still shows its stage finished (stage k is built while the scroll runs from k to k+1)
for (let s = 0; s <= 7; s++) {
  const at = s < 7 ? s + 0.92 : 7;
  await shot(at, 1280, 720, `stage-${s}.webp`, 1280);
  await shot(at, 720, 1280, `stage-${s}-m.webp`, 720);
}
console.log("\ndone");
await browser.close();
process.kill(-server.pid);
