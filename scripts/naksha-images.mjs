// Renders every naksha plan to a PNG for Google Images and social previews.
// Usage: npm run build && node scripts/naksha-images.mjs && npm run build
import { spawn } from "node:child_process";
import { writeFile, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
const { chromium } = req("playwright"); // pre-installed globally on the build machine
const sharp = req("sharp"); // comes with Next.js

const DEST = new URL("../public/naksha/img/", import.meta.url).pathname;
// serve the built site (npm run build first) and photograph every naksha page
const PORT = 4123;
const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: new URL("..", import.meta.url).pathname,
  stdio: "ignore",
});
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`http://localhost:${PORT}/naksha/`)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}
const port = PORT;
const html = await (await fetch(`http://localhost:${PORT}/naksha/`)).text();
const slugs = [...new Set([...html.matchAll(/href="\/naksha\/([0-9]+x[0-9]+-[a-z-]+)\/"/g)].map((m) => m[1]))];
// old PNGs are replaced by WebP
for (const f of await readdir(DEST)) if (f.endsWith(".png")) await rm(join(DEST, f));
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1180, height: 900 },
  deviceScaleFactor: 1,
});
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
for (const slug of slugs) {
  await page.goto(`http://localhost:${port}/naksha/${slug}/`);
  const el = page.locator("[data-plan-grid]").first();
  await el.evaluate((e) => {
    e.style.background = "#fff";
    e.style.padding = "16px";
  });
  // WebP: about a third of the PNG size, sharp line drawing kept
  const png = await el.screenshot({ type: "png" });
  await writeFile(
    join(DEST, `${slug}.webp`),
    await sharp(png).webp({ quality: 82, effort: 6 }).toBuffer(),
  );
  process.stdout.write(".");
}
console.log(`\n${slugs.length} images`);
await browser.close();
server.kill();
