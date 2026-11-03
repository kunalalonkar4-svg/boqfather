// Renders the 3D view of every naksha to a WebP for the naksha cards and the home page.
// Usage: npm run build && node scripts/naksha-3d-images.mjs && npm run build
import { spawn } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
const { chromium } = req("playwright");
const sharp = req("sharp");

const DEST = new URL("../public/naksha/img3d/", import.meta.url).pathname;
await mkdir(DEST, { recursive: true });
const PORT = 4124;
const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: new URL("..", import.meta.url).pathname,
  stdio: "ignore",
  detached: true, // own process group, so the whole server stops at the end
});
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`http://localhost:${PORT}/naksha/`)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}
const html = await (await fetch(`http://localhost:${PORT}/naksha/`)).text();
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const slugs = [
  ...new Set(
    [...html.matchAll(/href="\/naksha\/([0-9]+x[0-9]+-[a-z-]+)\/"/g)].map((m) => m[1]),
  ),
].filter((s) => !only.length || only.includes(s));
// software WebGL so it runs on a server without a GPU
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({
  viewport: { width: 1180, height: 1000 },
  deviceScaleFactor: 1.5,
});
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const fresh = process.argv.includes("--all");
for (const slug of slugs) {
  // skip pictures already made (pass --all to redo them)
  if (!fresh && !only.length) {
    try {
      await access(join(DEST, `${slug}.webp`));
      continue;
    } catch {}
  }
  await page.goto(`http://localhost:${PORT}/naksha/${slug}/?still3d=1`);
  await page.waitForFunction(() => window.__plan3dReady === true, null, { timeout: 60000 });
  const el = page.locator("[data-plan3d]").first();
  const png = await el.screenshot({ type: "png" });
  await writeFile(
    join(DEST, `${slug}.webp`),
    await sharp(png).resize({ width: 1200 }).webp({ quality: 80, effort: 5 }).toBuffer(),
  );
  process.stdout.write(".");
}
console.log(`\n${slugs.length} 3D images`);
await browser.close();
process.kill(-server.pid);
