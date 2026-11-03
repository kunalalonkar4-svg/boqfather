// Renders every naksha plan to a PNG for Google Images and social previews.
// Usage: npm run build && node scripts/naksha-images.mjs && npm run build
import { createServer } from "node:http";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // pre-installed globally on the build machine

const OUT = new URL("../out/", import.meta.url).pathname;
const DEST = new URL("../public/naksha/img/", import.meta.url).pathname;
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  try {
    const body = await readFile(join(OUT, p));
    res.writeHead(200, {
      "content-type": types[extname(p)] ?? "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(0);
const port = server.address().port;
const slugs = (await readdir(join(OUT, "naksha"), { withFileTypes: true }))
  .filter((d) => d.isDirectory() && d.name !== "gaj" && d.name !== "img")
  .map((d) => d.name);
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
  await writeFile(
    join(DEST, `${slug}.png`),
    await el.screenshot({ type: "png" }),
  );
  process.stdout.write(".");
}
console.log(`\n${slugs.length} images`);
await browser.close();
server.close();
