// Screenshots of the real BOQ tool for the home page "Engineering reports" section.
// Usage: npm run build && node scripts/home-shots.mjs
import { spawn, execFileSync } from "node:child_process";
import { mkdir, writeFile, readFile, mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
const { chromium } = req("playwright");
const sharp = req("sharp");

const DEST = new URL("../public/home/shots/", import.meta.url).pathname;
await mkdir(DEST, { recursive: true });
const PORT = 4126;
const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: new URL("..", import.meta.url).pathname,
  stdio: "ignore",
  detached: true,
});
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`http://localhost:${PORT}/`)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}
const tmp = await mkdtemp(join(tmpdir(), "shots-"));
const browser = await chromium.launch();
const save = async (png, name) =>
  writeFile(join(DEST, name), await sharp(png).resize({ width: 1440 }).webp({ quality: 80 }).toBuffer());

for (const lang of ["en", "hi"]) {
  const sfx = lang === "hi" ? "-hi" : "";
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.goto(`http://localhost:${PORT}${lang === "hi" ? "/hi" : ""}/house-boq-estimate/`);
  await page.waitForTimeout(2500);
  // the tool alone, without the site header and floating buttons
  await page.addStyleTag({ content: "header{display:none!important} .fixed{display:none!important}" });
  const tab = (re) => page.locator("nav button").filter({ hasText: re }).first();
  const shotAt = async (loc, name) => {
    await loc.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -90));
    await page.waitForTimeout(500);
    await save(await page.screenshot({ type: "png" }), name);
    process.stdout.write(name + " ");
  };
  // BOQ abstract
  await tab(/BOQ/).click();
  await page.waitForTimeout(800);
  await shotAt(page.locator("section").filter({ hasText: /Abstract of cost|एब्स्ट्रैक्ट/ }).first(), `boq${sfx}.webp`);
  // measurement book: the first item's Nos × L × B × H table
  const toggle = page.getByText(/Show measurement|मेज़रमेंट देखें/).nth(2);
  await toggle.click();
  await page.waitForTimeout(500);
  // the item line at the top, its opened measurement table below it
  await toggle.evaluate((e) => e.scrollIntoView({ block: "start" }));
  await page.evaluate(() => window.scrollBy(0, -150));
  await page.waitForTimeout(500);
  await save(await page.screenshot({ type: "png" }), `mb${sfx}.webp`);
  process.stdout.write(`mb${sfx}.webp `);
  // BBS
  await tab(/BBS/).click();
  await page.waitForTimeout(800);
  await shotAt(page.locator("table").first(), `bbs${sfx}.webp`);
  // materials / purchase plan
  await tab(/purchase|ख़रीद/).click();
  await page.waitForTimeout(800);
  await shotAt(page.getByText(/Stage plan and what to buy|चरण प्लान और कब क्या ख़रीदें/).first(), `materials${sfx}.webp`);
  // PDF and Excel: download the real files and render their first page
  for (const [re, kind] of [
    [/PDF/, "pdf"],
    [/Excel/, "excel"],
  ]) {
    const [dl] = await Promise.all([
      page.waitForEvent("download", { timeout: 30000 }),
      page.getByRole("button", { name: re }).first().click(),
    ]);
    const file = join(tmp, `${kind}${sfx}${kind === "pdf" ? ".pdf" : ".xlsx"}`);
    await dl.saveAs(file);
    if (kind === "excel") {
      // the downloaded workbook, shown the way a spreadsheet app would
      const html = file.replace(/\.xlsx$/, ".html");
      execFileSync("python3", [new URL("./xlsx-preview.py", import.meta.url).pathname, file, html]);
      const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await p2.goto("file://" + html);
      await save(await p2.screenshot({ type: "png" }), `excel${sfx}.webp`);
      await p2.close();
      process.stdout.write(`excel${sfx}.webp `);
      continue;
    }
    const pdf = file;
    execFileSync("pdftoppm", ["-r", "110", "-f", "1", "-l", "1", "-png", pdf, join(tmp, `${kind}${sfx}`)]);
    const png = await readFile(join(tmp, `${kind}${sfx}-1.png`)).catch(async () => readFile(join(tmp, `${kind}${sfx}-01.png`)));
    // crop to a 16:10 window from the top of the page
    const meta = await sharp(png).metadata();
    const h = Math.min(meta.height, Math.round((meta.width * 10) / 16));
    await save(await sharp(png).extract({ left: 0, top: 0, width: meta.width, height: h }).png().toBuffer(), `${kind}${sfx}.webp`);
    process.stdout.write(`${kind}${sfx}.webp `);
  }
  await page.close();
}
console.log("\ndone");
await browser.close();
process.kill(-server.pid);
