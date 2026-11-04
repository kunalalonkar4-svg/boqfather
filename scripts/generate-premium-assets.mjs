import { createRequire } from "node:module";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const { build } = require("esbuild");
const root = process.cwd();
const output = path.join(root, "public/assets");
const temp = path.join(os.tmpdir(), `boqfather-assets-${process.pid}`);

const sources = {
  residence: {
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=88",
    filename: "residence.jpg",
  },
  measurement: {
    url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2400&q=88",
    filename: "measurement.jpg",
  },
  siteMeasurement: {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/U.S._Soldiers_with_the_160th_Engineer_Company_measure_and_stake_out_the_high_point_of_the_foundation_a_new_schoolhouse_April_3%2C_2013%2C_at_a_construction_site_in_El_Tamarindo%2C_El_Salvador%2C_during_exercise_Beyond_130403-A-XZ241-016.jpg/1920px-thumbnail.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:U.S._Soldiers_with_the_160th_Engineer_Company_measure_and_stake_out_the_high_point_of_the_foundation_a_new_schoolhouse_April_3,_2013,_at_a_construction_site_in_El_Tamarindo,_El_Salvador,_during_exercise_Beyond_130403-A-XZ241-016.jpg",
    filename: "site-measurement.jpg",
  },
  concrete: {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Concrete_workers_J1.jpg/1920px-Concrete_workers_J1.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Concrete_workers_J1.jpg",
    filename: "concrete-workers.jpg",
  },
  cement: {
    url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Portland_Cement_Bags.jpg",
    filename: "cement.jpg",
  },
  sand: {
    url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Heap_of_Fine_Construction_Sand.jpg",
    filename: "sand.jpg",
  },
  aggregate: {
    url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Agregakinak_Aggregate.JPG",
    filename: "aggregate.jpg",
  },
};

const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[char]);
const rgb = (color) => {
  if (!color) return "none";
  const cadColors = new Map([
    ["22,24,26", "#E2EAF4"],
    ["38,38,38", "#71869F"],
    ["120,115,106", "#8EA3BC"],
    ["74,71,64", "#A9BDD4"],
    ["255,255,255", "#0B1423"],
    ["250,250,250", "#16283D"],
    ["246,243,238", "#1C2D40"],
    ["244,241,235", "#1D3044"],
    ["236,236,236", "#1A2B40"],
    ["236,233,226", "#263348"],
    ["253,246,228", "#182B40"],
    ["252,241,220", "#1B2D42"],
    ["253,233,222", "#302B35"],
    ["234,240,247", "#192C43"],
    ["226,242,234", "#182F39"],
    ["246,244,240", "#1B2C40"],
    ["240,247,228", "#1D342F"],
    ["251,236,243", "#2B243B"],
    ["238,236,230", "#282A35"],
    ["237,234,247", "#282742"],
    ["238,238,238", "#1A2939"],
    ["244,244,244", "#1C2D40"],
    ["236,245,236", "#19352F"],
    ["255,244,204", "#342F22"],
    ["232,228,220", "#273148"],
    ["240,236,248", "#2B2840"],
    ["150,144,134", "#8298B2"],
  ]);
  return cadColors.get(color.join(",")) ?? `rgb(${color.join(" ")})`;
};
const money = (value) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const number = (value, digits = 2) =>
  Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
const text = (x, y, value, options = {}) => {
  const {
    size = 22,
    color = "#18263B",
    weight = 400,
    anchor = "start",
    family = "Inter, Arial, sans-serif",
    spacing = 0,
  } = options;
  return `<text x="${x}" y="${y}" fill="${color}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${spacing}">${escapeXml(value)}</text>`;
};
const line = (x1, y1, x2, y2, color = "#D9E1EC", width = 1) =>
  `<path d="M${x1} ${y1}H${x2}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
const shell = (width, height, body, background = "#F5F7FA") =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="BOQ Father engineering workflow preview"><rect width="${width}" height="${height}" fill="${background}"/>${body}</svg>`;

function premiumSvg(markup) {
  const colors = new Map([
    ["#F5F7FA", "#08192F"],
    ["#EDF1F6", "#0B1D33"],
    ["#F2F6FB", "#142B49"],
    ["#F1F5F9", "#142B49"],
    ["#F5F8FC", "#0D223D"],
    ["#F8FAFC", "#102540"],
    ["#EDF2F8", "#142B49"],
    ["#F7F9FC", "#122843"],
    ["#E4EAF1", "#263F5F"],
    ["#DCE3ED", "#2A4362"],
    ["#D6DEE9", "#2A4362"],
    ["#E8EEF6", "#253D5D"],
    ["#D9E1EC", "#2A4362"],
    ["#10223A", "#EDF5FF"],
    ["#1E293B", "#D4DFEF"],
    ["#162943", "#F0F6FF"],
    ["#18263B", "#F0F6FF"],
    ["#26364C", "#D4DFEF"],
    ["#29384C", "#D4DFEF"],
    ["#334155", "#C5D3E5"],
    ["#64748B", "#9EB0CB"],
    ["#475569", "#9EB0CB"],
    ["#94A3B8", "#8B9EB9"],
  ]);
  let themed = markup
    .replace(/(<rect\b[^>]*\bfill=)"#fff"/g, '$1"#102540"')
    .replace(/(<rect\b[^>]*\bfill=)"#FFFFFF"/g, '$1"#102540"');
  for (const [source, replacement] of colors) {
    themed = themed.replaceAll(source, replacement);
  }
  return themed
    .replaceAll("rgb(38 38 38)", "rgb(119 141 167)")
    .replaceAll("rgb(0 0 0)", "rgb(79 163 255)");
}

async function downloadSources() {
  await mkdir(temp, { recursive: true });
  const existingSources = {
    residence: "hero-modern-residence-1920.webp",
    measurement: "engineer-plan-review-1920.webp",
    cement: "cement-bags-1920.webp",
    sand: "construction-sand-1920.webp",
    aggregate: "coarse-aggregate-1920.webp",
  };
  for (const [key, source] of Object.entries(sources)) {
    const localAsset = existingSources[key];
    if (localAsset) {
      await copyFile(
        path.join(output, localAsset),
        path.join(temp, source.filename),
      );
      continue;
    }
    const response = await fetch(source.url, {
      headers: { "User-Agent": "BOQFatherAssetBuilder/1.0 (local asset generation)" },
    });
    if (!response.ok) throw new Error(`Could not download ${key} source: ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 10_000) throw new Error(`${key} source is unexpectedly small`);
    await writeFile(path.join(temp, source.filename), bytes);
  }
}

async function optimizePhoto(key, filename, widths = [960, 1920]) {
  const source = path.join(temp, sources[key].filename);
  const meta = await sharp(source).metadata();
  for (const width of widths) {
    const outputWidth = Math.min(width, meta.width ?? width);
    await sharp(source)
      .resize({ width: outputWidth, withoutEnlargement: true })
      .webp({ quality: 84, effort: 5 })
      .toFile(path.join(output, filename.replace("{width}", String(width))));
  }
}

async function compileEngine() {
  const plotsOut = path.join(temp, "plots.mjs");
  const drawingOut = path.join(temp, "plan-draw.mjs");
  await build({
    entryPoints: [path.join(root, "src/content/plots.ts")],
    outfile: plotsOut,
    bundle: true,
    format: "esm",
    platform: "node",
    alias: { "@": path.join(root, "src") },
  });
  await build({
    entryPoints: [path.join(root, "src/lib/planDraw.ts")],
    outfile: drawingOut,
    bundle: true,
    format: "esm",
    platform: "node",
    alias: { "@": path.join(root, "src") },
  });
  return {
    plots: await import(pathToFileURL(plotsOut).href),
    drawing: await import(pathToFileURL(drawingOut).href),
  };
}

function planMarkup(drawing, sketch, title, facing) {
  const direction = sketch.facing ?? facing;
  const primitives = drawing.planPrimitives(
    sketch.L,
    sketch.B,
    sketch.rects,
    (room) => room.replaceAll("_", " "),
    { facing: direction, road: "ROAD", title, upper: sketch.floor > 0 },
  );
  const body = [];
  const { x, y, w, h } = primitives.bounds;
  const gridId = `plan-grid-${sketch.floor}`;
  body.push(
    `<defs><pattern id="${gridId}" width="0.5" height="0.5" patternUnits="userSpaceOnUse"><path d="M0 0.5H0.5M0.5 0V0.5" fill="none" stroke="#14283F" stroke-width="0.012"/></pattern></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0B1423"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gridId})"/>`,
  );
  for (const rect of primitives.rects) {
    body.push(
      `<rect x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" fill="${rgb(rect.fill)}"${rect.stroke ? ` stroke="${rgb(rect.stroke)}" stroke-width="${rect.sw ?? 0.02}"` : ""}/>`,
    );
  }
  for (const item of primitives.lines) {
    body.push(
      `<path d="M${item.x1} ${item.y1}L${item.x2} ${item.y2}" fill="none" stroke="${rgb(item.color)}" stroke-width="${item.sw}"${item.dash ? ' stroke-dasharray="0.08 0.06"' : ""}/>`,
    );
  }
  for (const item of primitives.curves) {
    body.push(
      `<path d="M${item.p0[0]} ${item.p0[1]}C${item.c1[0]} ${item.c1[1]} ${item.c2[0]} ${item.c2[1]} ${item.p1[0]} ${item.p1[1]}" fill="none" stroke="${rgb(item.color)}" stroke-width="${item.sw}"/>`,
    );
  }
  for (const item of primitives.furniture) {
    body.push(
      `<rect x="${item.x}" y="${item.y}" width="${item.w}" height="${item.h}" rx="0.025" fill="none" stroke="#8298B2" stroke-width="0.018"/>`,
    );
  }
  for (const item of primitives.texts) {
    const transform = item.rotate
      ? ` transform="rotate(${item.rotate} ${item.x} ${item.y})"`
      : "";
    body.push(
      `<text x="${item.x}" y="${item.y}" fill="${rgb(item.color)}" font-family="Inter, Arial, sans-serif" font-size="${item.size}" font-weight="${item.bold ? 600 : 400}" text-anchor="${item.anchor}"${transform}>${escapeXml(item.text)}</text>`,
    );
  }
  return `<svg x="0" y="0" width="100%" height="100%" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMid meet">${body.join("")}</svg>`;
}

function makeFloorPlan(drawing, estimate, plot, facing = "E") {
  const plans = estimate.res.sketch.map((floor) => ({ ...floor, facing }));
  const width = 2200;
  const height = 1500;
  const panelWidth = 1030;
  const panelHeight = 1140;
  const panels = plans.map((floor, index) => {
    const x = 52 + index * 1096;
    const floorName = floor.floor === 0 ? "GROUND FLOOR" : "FIRST FLOOR";
    return `<rect x="${x}" y="218" width="${panelWidth}" height="${panelHeight}" rx="14" fill="#0B1729" stroke="#29415F"/><rect x="${x + 24}" y="240" width="${panelWidth - 48}" height="56" rx="8" fill="#142741"/><text x="${x + 44}" y="277" fill="#E5EDF8" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="700" letter-spacing="1">${floorName}</text><text x="${x + panelWidth - 42}" y="277" fill="#8DBBFF" font-family="JetBrains Mono, monospace" font-size="17" text-anchor="end">${plot.w} × ${plot.d} FT</text><svg x="${x + 55}" y="322" width="${panelWidth - 110}" height="${panelHeight - 170}" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">${planMarkup(drawing, floor, floorName, "E")}</svg><text x="${x + 44}" y="${218 + panelHeight - 28}" fill="#9EB0CB" font-family="JetBrains Mono, monospace" font-size="15">EAST FACING · DIMENSIONS IN FEET · DRAWING NOT TO SCALE</text>`;
  });
  const body = `${text(54, 72, `${plot.w} × ${plot.d} FT  /  EAST-FACING  /  G+1`, { size: 15, weight: 700, color: "#0075FF", spacing: 2 })}${text(54, 130, "2D HOUSE PLAN", { size: 44, weight: 600, color: "#10223A" })}${text(width - 54, 128, "BOQ FATHER  /  PLAN STUDIO", { size: 14, weight: 600, color: "#64748B", anchor: "end", spacing: 1.5 })}${panels.join("")}`;
  return shell(width, height, body);
}

function makeTakeoff(drawing, estimate, plot) {
  const width = 1800;
  const height = 1120;
  const items = estimate.res.sections.map((section) => section.items[0]).filter(Boolean);
  const selected = [items[0], items[1], items[2], items[3], items[4], items.at(-1)].filter(Boolean);
  const rowY = 373;
  const rows = selected.map((item, index) => {
    const y = rowY + index * 104;
    const description = item.desc.length > 38 ? `${item.desc.slice(0, 37)}…` : item.desc;
    return `<rect x="936" y="${y - 36}" width="804" height="81" rx="8" fill="${index % 2 ? "#F7F9FC" : "#FFFFFF"}"/>${text(960, y, item.code, { size: 16, weight: 700, color: "#0075FF", family: "JetBrains Mono, monospace" })}${text(1030, y, description, { size: 15, color: "#26364C" })}${text(1500, y, `${number(item.qty, item.dec ?? 2)} ${item.unit}`, { size: 16, weight: 600, color: "#10223A", anchor: "end", family: "JetBrains Mono, monospace" })}${line(950, y + 28, 1718, "#E4EAF1")}`;
  });
  const body = `${text(62, 72, "QUANTITY TAKEOFF  /  LIVE ENGINE OUTPUT", { size: 15, weight: 700, color: "#0075FF", spacing: 1.5 })}${text(62, 134, "From measured plan to item quantities.", { size: 39, weight: 500, color: "#10223A" })}${text(64, 183, `${plot.w} × ${plot.d} FT  ·  EAST-FACING  ·  G+1`, { size: 15, color: "#64748B", family: "JetBrains Mono, monospace" })}<rect x="60" y="226" width="824" height="820" rx="12" fill="#fff" stroke="#DCE3ED"/><rect x="84" y="250" width="776" height="53" rx="7" fill="#F1F5F9"/>${text(108, 284, "ITEM", { size: 12, weight: 700, color: "#64748B", spacing: 1 })}${text(406, 284, "MEASUREMENT BASIS", { size: 12, weight: 700, color: "#64748B", spacing: 1 })}${text(810, 284, "QTY", { size: 12, weight: 700, color: "#64748B", anchor: "end", spacing: 1 })}${rows.map((row, i) => { const item = selected[i]; const y = 357 + i * 95; return `<rect x="84" y="${y - 30}" width="776" height="75" rx="6" fill="${i % 2 ? "#F8FAFC" : "#fff"}"/>${text(107, y, item.code, { size: 15, weight: 700, color: "#0075FF", family: "JetBrains Mono, monospace" })}${text(406, y, item.desc.length > 37 ? `${item.desc.slice(0, 36)}…` : item.desc, { size: 13, color: "#26364C" })}${text(835, y, `${number(item.qty, item.dec ?? 2)} ${item.unit}`, { size: 14, weight: 600, color: "#10223A", anchor: "end", family: "JetBrains Mono, monospace" })}`; }).join("")}<rect x="914" y="226" width="826" height="820" rx="12" fill="#fff" stroke="#DCE3ED"/><rect x="936" y="250" width="782" height="52" rx="7" fill="#F1F5F9"/>${text(960, 284, "REFERENCE ITEMS", { size: 12, weight: 700, color: "#64748B", spacing: 1 })}${text(1694, 284, "CALCULATED QTY", { size: 12, weight: 700, color: "#64748B", anchor: "end", spacing: 1 })}${rows.join("")}${text(64, 1080, "Sample plan output · quantities use the existing BOQ Father estimate engine.", { size: 13, color: "#64748B" })}`;
  const firstPanel = body.indexOf('<rect x="60" y="226"');
  const secondPanel = body.indexOf('<rect x="914" y="226"', firstPanel);
  const groundFloor = estimate.res.sketch.find((floor) => floor.floor === 0);
  if (firstPanel < 0 || secondPanel < 0 || !groundFloor) {
    throw new Error("The measured plan panel could not be generated");
  }
  const planPanel = `<rect x="60" y="226" width="824" height="820" rx="12" fill="#fff" stroke="#DCE3ED"/><rect x="84" y="250" width="776" height="53" rx="7" fill="#F1F5F9"/>${text(108, 284, "GROUND FLOOR / DIMENSIONED PLAN", { size: 12, weight: 700, color: "#64748B", spacing: 1 })}<svg x="96" y="313" width="480" height="650" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">${planMarkup(drawing, groundFloor, "GROUND FLOOR", "E")}</svg><path d="M142 961H532M142 951v20m390-20v20" fill="none" stroke="#0075FF" stroke-width="2"/>${text(337, 994, `${plot.w} FT PLOT WIDTH`, { size: 12, weight: 600, color: "#0075FF", anchor: "middle", family: "JetBrains Mono, monospace" })}<rect x="610" y="367" width="236" height="155" rx="9" fill="#F5F8FC"/>${text(630, 408, "PLOT", { size: 11, weight: 700, color: "#64748B", spacing: 1 })}${text(630, 448, `${plot.w} × ${plot.d} FT`, { size: 17, weight: 600, color: "#10223A", family: "JetBrains Mono, monospace" })}${text(630, 481, "EAST-FACING", { size: 11, weight: 600, color: "#0075FF" })}<rect x="610" y="543" width="236" height="155" rx="9" fill="#F5F8FC"/>${text(630, 584, "BUILT-UP AREA", { size: 11, weight: 700, color: "#64748B", spacing: 1 })}${text(630, 626, `${number(estimate.res.geometry.builtUpSqft, 0)} SQ FT`, { size: 17, weight: 600, color: "#10223A", family: "JetBrains Mono, monospace" })}${text(630, 659, "G+1 · TWO FLOORS", { size: 11, weight: 600, color: "#0075FF" })}${text(610, 763, "MEASURED INPUT", { size: 11, weight: 700, color: "#64748B", spacing: 1 })}${text(610, 802, "Floor layouts and", { size: 14, color: "#334155" })}${text(610, 828, "building dimensions", { size: 14, color: "#334155" })}${text(610, 854, "feed the quantity", { size: 14, color: "#334155" })}${text(610, 880, "working at right.", { size: 14, color: "#334155" })}`;
  const updatedBody = `${body.slice(0, firstPanel)}${planPanel}${body.slice(secondPanel)}`;
  return shell(width, height, updatedBody);
}

function makeCostSummary(estimate, plot) {
  const width = 1800;
  const height = 1200;
  const sections = estimate.res.sections.map((section) => ({
    name: section.title.en,
    amount: section.items.reduce((sum, item) => sum + item.amount, 0),
  }));
  const maximum = Math.max(...sections.map((section) => section.amount));
  const bars = sections.map((section, index) => {
    const y = 340 + index * 77;
    const barWidth = (section.amount / maximum) * 584;
    const label = section.name.length > 33 ? `${section.name.slice(0, 32)}…` : section.name;
    return `${text(76, y + 4, label, { size: 15, color: "#334155" })}<rect x="490" y="${y - 14}" width="590" height="12" rx="6" fill="#E8EEF6"/><rect x="490" y="${y - 14}" width="${Math.max(4, barWidth)}" height="12" rx="6" fill="${index === 0 ? "#0075FF" : "#70AFFF"}"/>${text(1110, y + 4, money(section.amount), { size: 14, weight: 600, color: "#1E293B", anchor: "end", family: "JetBrains Mono, monospace" })}`;
  });
  const body = `${text(68, 74, "COST SUMMARY  /  STANDARD FINISH", { size: 15, weight: 700, color: "#0075FF", spacing: 1.5 })}${text(68, 139, "An estimate you can inspect.", { size: 39, weight: 500, color: "#10223A" })}${text(68, 190, `${plot.w} × ${plot.d} FT  ·  G+1  ·  BUILT-UP ${number(estimate.res.geometry.builtUpSqft, 0)} SQ FT`, { size: 14, color: "#64748B", family: "JetBrains Mono, monospace" })}<rect x="68" y="228" width="1080" height="872" rx="12" fill="#fff" stroke="#DCE3ED"/>${text(82, 291, "WORK SECTION", { size: 12, weight: 700, color: "#64748B", spacing: 1 })}${text(1110, 291, "AMOUNT", { size: 12, weight: 700, color: "#64748B", anchor: "end", spacing: 1 })}${line(82, 310, 1110, "#E4EAF1")}${bars.join("")}<rect x="1190" y="228" width="542" height="872" rx="12" fill="#0B1E35"/><rect x="1220" y="258" width="482" height="47" rx="23" fill="#183B63"/>${text(1461, 287, "EXAMPLE ESTIMATE", { size: 12, weight: 700, color: "#B9D7FF", anchor: "middle", spacing: 1.5 })}${text(1240, 379, "ESTIMATED PROJECT TOTAL", { size: 13, weight: 600, color: "#A7BABE", spacing: 1 })}${text(1240, 451, money(estimate.res.grandTotal), { size: 47, weight: 600, color: "#FFFFFF" })}${line(1240, 488, 1680, "#ffffff30")}${text(1240, 548, "RATE / SQ FT", { size: 13, color: "#A7BABE" })}${text(1680, 548, `${money(estimate.res.perSqft)} / sq ft`, { size: 15, weight: 600, color: "#FFFFFF", anchor: "end", family: "JetBrains Mono, monospace" })}${text(1240, 604, "BUILT-UP AREA", { size: 13, color: "#A7BABE" })}${text(1680, 604, `${number(estimate.res.geometry.builtUpSqft, 0)} sq ft`, { size: 15, weight: 600, color: "#FFFFFF", anchor: "end", family: "JetBrains Mono, monospace" })}${text(1240, 700, "ITEM-WISE ESTIMATE", { size: 12, weight: 700, color: "#68ADFF", spacing: 1 })}${text(1240, 742, "Amounts remain visible by work section", { size: 13, color: "#D6E4F6" })}${text(1240, 768, "for review against project inputs.", { size: 13, color: "#D6E4F6" })}${text(68, 1150, "Demonstration values from the current estimate engine; confirm scope, rates and site conditions before use.", { size: 13, color: "#64748B" })}`;
  return shell(width, height, body);
}

function makeBbs(estimate, plot) {
  const width = 1800;
  const height = 1200;
  const rows = estimate.res.bbs.rows.slice(0, 7);
  const tableRows = rows.map((row, index) => {
    const y = 381 + index * 76;
    return `<rect x="70" y="${y - 31}" width="1660" height="64" rx="6" fill="${index % 2 ? "#F7F9FC" : "#fff"}"/>${text(95, y + 2, row.mark, { size: 15, weight: 700, color: "#0075FF", family: "JetBrains Mono, monospace" })}${text(280, y + 2, row.member, { size: 14, color: "#334155" })}${text(720, y + 2, `${row.dia} mm`, { size: 14, color: "#334155", family: "JetBrains Mono, monospace" })}${text(970, y + 2, number(row.nos, 0), { size: 14, color: "#334155", family: "JetBrains Mono, monospace" })}${text(1250, y + 2, `${number(row.cutLen, 3)} m`, { size: 14, color: "#334155", family: "JetBrains Mono, monospace" })}${text(1688, y + 2, `${number(row.kg, 1)} kg`, { size: 14, weight: 600, color: "#10223A", anchor: "end", family: "JetBrains Mono, monospace" })}`;
  });
  const dia = estimate.res.bbs.byDia;
  const body = `${text(68, 74, "STEEL DETAIL  /  BAR BENDING SCHEDULE", { size: 15, weight: 700, color: "#0075FF", spacing: 1.5 })}${text(68, 137, "Bar-by-bar reinforcement quantities.", { size: 38, weight: 500, color: "#10223A" })}${text(68, 188, `${plot.w} × ${plot.d} FT  ·  EAST-FACING  ·  G+1  ·  ENGINE-GENERATED PREVIEW`, { size: 14, color: "#64748B", family: "JetBrains Mono, monospace" })}<rect x="68" y="226" width="1664" height="644" rx="12" fill="#fff" stroke="#DCE3ED"/><rect x="88" y="248" width="1624" height="55" rx="7" fill="#F1F5F9"/>${text(104, 283, "MARK", { size: 12, weight: 700, color: "#64748B" })}${text(280, 283, "MEMBER", { size: 12, weight: 700, color: "#64748B" })}${text(720, 283, "DIA", { size: 12, weight: 700, color: "#64748B" })}${text(970, 283, "NO.", { size: 12, weight: 700, color: "#64748B" })}${text(1250, 283, "CUT LENGTH", { size: 12, weight: 700, color: "#64748B" })}${text(1688, 283, "WEIGHT", { size: 12, weight: 700, color: "#64748B", anchor: "end" })}${tableRows.join("")}<rect x="68" y="900" width="1664" height="182" rx="12" fill="#0B1E35"/><text x="96" y="944" fill="#9DB6D5" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="1">BAR WEIGHT BY DIAMETER</text>${dia.map((bar, index) => { const x = 98 + index * 300; return `${text(x, 1000, `${bar.dia} mm`, { size: 13, color: "#D7E6F7", family: "JetBrains Mono, monospace" })}<rect x="${x}" y="1018" width="220" height="10" rx="5" fill="#213D5F"/><rect x="${x}" y="1018" width="${Math.max(8, (bar.kg / Math.max(...dia.map((entry) => entry.kg))) * 220)}" height="10" rx="5" fill="#4B9DFF"/>${text(x, 1060, `${number(bar.kg, 1)} kg`, { size: 13, weight: 600, color: "#fff", family: "JetBrains Mono, monospace" })}`; }).join("")}${text(1692, 944, `BBS TOTAL  ${number(estimate.res.bbs.total, 1)} kg`, { size: 14, weight: 600, color: "#fff", anchor: "end", family: "JetBrains Mono, monospace" })}${text(68, 1146, "Illustrative schedule preview · final reinforcement detailing must follow the approved structural drawings.", { size: 13, color: "#64748B" })}`;
  return shell(width, height, body);
}

function makeReport(estimate, plot) {
  const width = 1600;
  const height = 1800;
  const sections = estimate.res.sections.filter((section) => section.items.length);
  const items = sections.map((section) => section.items[0]).filter(Boolean);
  const rows = items.slice(0, 9);
  const yStart = 665;
  const tableRows = rows.map((item, index) => {
    const y = yStart + index * 85;
    const desc = item.desc.length > 55 ? `${item.desc.slice(0, 54)}…` : item.desc;
    return `<rect x="100" y="${y - 39}" width="1400" height="76" rx="5" fill="${index % 2 ? "#F7F9FC" : "#fff"}"/>${text(124, y + 3, item.code, { size: 14, weight: 700, color: "#0075FF", family: "JetBrains Mono, monospace" })}${text(226, y + 3, desc, { size: 14, color: "#29384C" })}${text(1012, y + 3, item.unit, { size: 14, color: "#475569", anchor: "middle", family: "JetBrains Mono, monospace" })}${text(1140, y + 3, number(item.qty, item.dec ?? 2), { size: 14, color: "#334155", anchor: "end", family: "JetBrains Mono, monospace" })}${text(1286, y + 3, money(item.rate), { size: 13, color: "#475569", anchor: "end", family: "JetBrains Mono, monospace" })}${text(1476, y + 3, money(item.amount), { size: 13, weight: 600, color: "#10223A", anchor: "end", family: "JetBrains Mono, monospace" })}`;
  });
  const body = `<rect x="40" y="40" width="1520" height="1720" rx="14" fill="#fff" stroke="#DCE3ED"/><rect x="40" y="40" width="1520" height="20" rx="10" fill="#0075FF"/>${text(100, 134, "BOQ FATHER  /  PROJECT ESTIMATE", { size: 14, weight: 700, color: "#0075FF", spacing: 1.5 })}${text(100, 216, "Bill of Quantities", { size: 48, weight: 500, color: "#10223A" })}${text(100, 270, "ENGINEERING ESTIMATE · G+1 RESIDENTIAL", { size: 13, weight: 600, color: "#64748B", spacing: 1.2 })}<rect x="100" y="318" width="1400" height="177" rx="9" fill="#F5F8FC"/>${text(132, 368, "PROJECT", { size: 11, weight: 700, color: "#64748B", spacing: 1 })}${text(132, 406, `${plot.w} × ${plot.d} FT HOUSE`, { size: 18, weight: 600, color: "#10223A" })}${text(132, 452, "EAST-FACING  ·  G+1  ·  STANDARD FINISH", { size: 12, color: "#64748B" })}${text(810, 368, "BUILT-UP AREA", { size: 11, weight: 700, color: "#64748B", spacing: 1 })}${text(810, 414, `${number(estimate.res.geometry.builtUpSqft, 0)} SQ FT`, { size: 20, weight: 600, color: "#10223A", family: "JetBrains Mono, monospace" })}${text(1260, 368, "ESTIMATE TOTAL", { size: 11, weight: 700, color: "#64748B", spacing: 1 })}${text(1260, 414, money(estimate.res.grandTotal), { size: 22, weight: 700, color: "#10223A", family: "JetBrains Mono, monospace" })}${text(100, 554, "ITEM-WISE SUMMARY", { size: 13, weight: 700, color: "#10223A", spacing: 1 })}<rect x="100" y="570" width="1400" height="49" rx="6" fill="#EDF2F8"/>${text(124, 601, "CODE", { size: 11, weight: 700, color: "#64748B" })}${text(226, 601, "DESCRIPTION", { size: 11, weight: 700, color: "#64748B" })}${text(1012, 601, "UNIT", { size: 11, weight: 700, color: "#64748B", anchor: "middle" })}${text(1140, 601, "QTY", { size: 11, weight: 700, color: "#64748B", anchor: "end" })}${text(1286, 601, "RATE", { size: 11, weight: 700, color: "#64748B", anchor: "end" })}${text(1476, 601, "AMOUNT", { size: 11, weight: 700, color: "#64748B", anchor: "end" })}${tableRows.join("")}<rect x="980" y="1438" width="520" height="128" rx="9" fill="#0B1E35"/>${text(1010, 1486, "ESTIMATED PROJECT TOTAL", { size: 12, weight: 600, color: "#A7BABE", spacing: 1 })}${text(1010, 1532, money(estimate.res.grandTotal), { size: 30, weight: 600, color: "#fff", family: "JetBrains Mono, monospace" })}${text(100, 1640, "ILLUSTRATIVE PREVIEW · Generated from the existing BOQ Father estimate engine.", { size: 12, weight: 600, color: "#64748B", spacing: 0.5 })}${text(100, 1680, "Review project inputs, quantities and local rates before using for procurement or construction.", { size: 12, color: "#64748B" })}${text(1500, 1710, "BOQ FATHER  ·  01 / 01", { size: 11, weight: 600, color: "#94A3B8", anchor: "end", family: "JetBrains Mono, monospace" })}`;
  return shell(width, height, body, "#EDF1F6");
}

async function makeMaterialsBoard() {
  const width = 1800;
  const height = 1120;
  const photoPaths = [
    { name: "CEMENT", path: path.join(temp, sources.cement.filename), x: 32, y: 126 },
    { name: "REINFORCEMENT STEEL", path: path.join(output, "rebar-installation-1920.webp"), x: 918, y: 126 },
    { name: "CONSTRUCTION SAND", path: path.join(temp, sources.sand.filename), x: 32, y: 616 },
    { name: "COARSE AGGREGATE", path: path.join(temp, sources.aggregate.filename), x: 918, y: 616 },
  ];
  const overlays = [];
  for (const photo of photoPaths) {
    const bytes = await sharp(photo.path)
      .resize(850, 466, { fit: "cover", position: "attention" })
      .webp({ quality: 84 })
      .toBuffer();
    overlays.push({ input: bytes, left: photo.x, top: photo.y });
    const caption = `<svg xmlns="http://www.w3.org/2000/svg" width="850" height="466"><defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="60%" stop-color="#08172a" stop-opacity="0"/><stop offset="100%" stop-color="#08172a" stop-opacity=".85"/></linearGradient></defs><rect width="850" height="466" fill="url(#fade)"/><text x="28" y="424" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="600" letter-spacing="1.2">${escapeXml(photo.name)}</text></svg>`;
    overlays.push({ input: Buffer.from(caption), left: photo.x, top: photo.y });
  }
  const heading = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="#0B1E35"/><text x="34" y="53" fill="#66AAFF" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.7">MATERIALS  /  SITE PHOTOGRAPHY</text><text x="34" y="101" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="500">Real materials. Quantities from the estimate engine.</text></svg>`);
  await sharp({ create: { width, height, channels: 3, background: "#0B1E35" } })
    .composite([{ input: heading, left: 0, top: 0 }, ...overlays])
    .webp({ quality: 86, effort: 6 })
    .toFile(path.join(output, "construction-materials-board.webp"));
}

async function main() {
  await mkdir(output, { recursive: true });
  await downloadSources();
  const { plots, drawing } = await compileEngine();
  const plan30 = plots.plotEstimate(plots.getPlot("30x40"), 2, "standard", { facing: "E" });
  const plan20 = plots.plotEstimate(plots.getPlot("20x40"), 2, "standard", { facing: "E" });

  const planDirectory = path.join(output, "plans");
  await mkdir(planDirectory, { recursive: true });
  const generatedPlans = [];
  const facingSlugs = { E: "east", N: "north", W: "west", S: "south" };
  const createPlanAsset = async (plot, facing, shop = false) => {
    const slug = `${plot.w}x${plot.d}-${facingSlugs[facing]}-facing${shop ? "-shop" : ""}`;
    const estimate = plots.plotEstimate(plot, 2, "standard", { facing, shop });
    await writeFile(
      path.join(planDirectory, `${slug}.svg`),
      premiumSvg(makeFloorPlan(drawing, estimate, plot, facing)),
    );
    generatedPlans.push({
      filename: `plans/${slug}.svg`,
      purpose: `High-resolution 2D G+1 ${shop ? "house with shop" : "house"} plan (${plot.w} × ${plot.d} ft, ${facing}-facing)`,
      source: "BOQ Father plotEstimate + planPrimitives in src/content/plots.ts and src/lib/planDraw.ts",
      license: "Original project-generated vector drawing",
      dimensions: "2200 × 1500",
      format: "SVG",
      modification: "Generated locally from existing plot and plan drawing engine output.",
    });
  };
  for (const plot of plots.PLOTS) {
    for (const facing of Object.keys(facingSlugs)) {
      await createPlanAsset(plot, facing);
    }
  }
  for (const size of ["25x50", "30x50", "30x60"]) {
    const plot = plots.getPlot(size);
    if (!plot) throw new Error(`The shop plan configuration is missing for ${size}`);
    for (const facing of Object.keys(facingSlugs)) {
      await createPlanAsset(plot, facing, true);
    }
  }

  await writeFile(path.join(output, "plan-30x40-east-g1.svg"), premiumSvg(makeFloorPlan(drawing, plan30, plots.getPlot("30x40"))));
  await writeFile(path.join(output, "plan-20x40-east-g1.svg"), premiumSvg(makeFloorPlan(drawing, plan20, plots.getPlot("20x40"))));
  await writeFile(path.join(output, "quantity-takeoff-30x40.svg"), premiumSvg(makeTakeoff(drawing, plan30, plots.getPlot("30x40"))));
  await writeFile(path.join(output, "estimate-cost-30x40.svg"), premiumSvg(makeCostSummary(plan30, plots.getPlot("30x40"))));
  await writeFile(path.join(output, "steel-bbs-30x40.svg"), premiumSvg(makeBbs(plan30, plots.getPlot("30x40"))));
  await writeFile(path.join(output, "boq-report-30x40.svg"), premiumSvg(makeReport(plan30, plots.getPlot("30x40"))));

  await optimizePhoto("residence", "hero-modern-residence-{width}.webp", [960, 1920]);
  await optimizePhoto("measurement", "engineer-plan-review-{width}.webp", [960, 1920]);
  await optimizePhoto("siteMeasurement", "site-measurement-{width}.webp", [960, 1920]);
  await optimizePhoto("concrete", "concrete-workers-{width}.webp", [960, 1920]);
  await optimizePhoto("cement", "cement-bags-{width}.webp", [960, 1920]);
  await optimizePhoto("sand", "construction-sand-{width}.webp", [960, 1920]);
  await optimizePhoto("aggregate", "coarse-aggregate-{width}.webp", [960, 1920]);
  await makeMaterialsBoard();

  const metadata = [
    ["hero-modern-residence-960.webp", "Hero architecture photograph, responsive", sources.residence.url, "Unsplash License", "960px wide", "WebP"],
    ["hero-modern-residence-1920.webp", "Hero architecture photograph, high resolution", sources.residence.url, "Unsplash License", "1920px wide", "WebP"],
    ["engineer-plan-review-960.webp", "Civil engineer reviewing architectural drawings, responsive", sources.measurement.url, "Unsplash License", "960px wide", "WebP"],
    ["engineer-plan-review-1920.webp", "Civil engineer reviewing architectural drawings", sources.measurement.url, "Unsplash License", "1920px wide", "WebP"],
    ["site-measurement-960.webp", "Construction engineers setting out a building foundation, responsive", sources.siteMeasurement.sourcePage, "Public domain · SFC Sean A. Foley / U.S. Army", "960px wide", "WebP"],
    ["site-measurement-1920.webp", "Construction engineers setting out a building foundation", sources.siteMeasurement.sourcePage, "Public domain · SFC Sean A. Foley / U.S. Army", "1920px wide", "WebP"],
    ["concrete-workers-960.webp", "Construction team placing concrete, responsive", sources.concrete.sourcePage, "CC BY-SA 3.0 · Jamain", "960px wide", "WebP"],
    ["concrete-workers-1920.webp", "Construction team placing concrete", sources.concrete.sourcePage, "CC BY-SA 3.0 · Jamain", "1920px wide", "WebP"],
    ["cement-bags-960.webp", "Cement material photograph, responsive", "https://commons.wikimedia.org/wiki/File:Portland_Cement_Bags.jpg", "Public domain", "Up to 1892px wide", "WebP"],
    ["cement-bags-1920.webp", "Cement material photograph", "https://commons.wikimedia.org/wiki/File:Portland_Cement_Bags.jpg", "Public domain", "Source width", "WebP"],
    ["construction-sand-960.webp", "Fine construction sand photograph, responsive", "https://commons.wikimedia.org/wiki/File:Heap_of_Fine_Construction_Sand.jpg", "CC0", "Up to 960px wide", "WebP"],
    ["construction-sand-1920.webp", "Fine construction sand photograph", "https://commons.wikimedia.org/wiki/File:Heap_of_Fine_Construction_Sand.jpg", "CC0", "Up to 1920px wide", "WebP"],
    ["coarse-aggregate-960.webp", "Coarse aggregate stockpiles, responsive", "https://commons.wikimedia.org/wiki/File:Agregakinak_Aggregate.JPG", "CC BY-SA 4.0 · Emadrazo", "960px wide", "WebP"],
    ["coarse-aggregate-1920.webp", "Coarse aggregate stockpiles", "https://commons.wikimedia.org/wiki/File:Agregakinak_Aggregate.JPG", "CC BY-SA 4.0 · Emadrazo", "1920px wide", "WebP"],
    ["plan-30x40-east-g1.svg", "Generated 2D G+1 house plan, 30 × 40 ft", "BOQ Father plotEstimate + planPrimitives in src/content/plots.ts and src/lib/planDraw.ts", "Original project-generated vector drawing", "2200 × 1500", "SVG"],
    ["plan-20x40-east-g1.svg", "Generated 2D G+1 house plan, 20 × 40 ft", "BOQ Father plotEstimate + planPrimitives in src/content/plots.ts and src/lib/planDraw.ts", "Original project-generated vector drawing", "2200 × 1500", "SVG"],
    ["quantity-takeoff-30x40.svg", "Quantity takeoff visualization populated from the 30 × 40 estimate output", "BOQ Father plotEstimate in src/content/plots.ts", "Original project-generated vector drawing; existing calculation output", "1800 × 1120", "SVG"],
    ["construction-materials-board.webp", "Editorial board of cement, reinforcement steel, sand and aggregate", "Locally composed from the sources listed above and rebar-installation-1920.webp", "Mixed: public domain, CC0 and CC BY-SA 4.0; see individual image entries", "1800 × 1120", "WebP"],
    ["estimate-cost-30x40.svg", "Cost summary populated from the 30 × 40 estimate output", "BOQ Father plotEstimate in src/content/plots.ts", "Original project-generated vector drawing; existing calculation output", "1800 × 1200", "SVG"],
    ["steel-bbs-30x40.svg", "Steel bar bending schedule populated from the existing BBS output", "BOQ Father plotEstimate in src/content/plots.ts", "Original project-generated vector drawing; existing calculation output", "1800 × 1200", "SVG"],
    ["boq-report-30x40.svg", "BOQ report preview populated from the existing estimate output", "BOQ Father plotEstimate in src/content/plots.ts", "Original project-generated vector drawing; existing calculation output", "1600 × 1800", "SVG"],
    ["rebar-installation-1920.webp", "Reinforcement steel construction photograph", "https://commons.wikimedia.org/wiki/File:A_worker_ties_together_reinforcing_bar,_or_rebar,_to_strengthen_concrete_floors_for_a_facility_that_will_house_372_students_as_part_of_the_Herat_University_Women%27s_Dormitory_Project_in_Herat_province_140311-A-DT641-242.jpg", "Public domain · Bill Dowell / U.S. Army Corps of Engineers", "1920 × 1277", "WebP"],
  ].map(([filename, purpose, source, license, dimensions, format]) => ({
    filename,
    purpose,
    source,
    license,
    dimensions,
    format,
    licenseUrl: license.includes("Unsplash")
      ? "https://unsplash.com/license"
      : license.includes("CC0")
        ? "https://creativecommons.org/publicdomain/zero/1.0/"
        : license.includes("CC BY-SA 4.0")
          ? "https://creativecommons.org/licenses/by-sa/4.0/"
          : license.includes("CC BY-SA 3.0")
            ? "https://creativecommons.org/licenses/by-sa/3.0/"
          : license.includes("Public domain")
            ? "https://commons.wikimedia.org/wiki/Commons:Licensing"
            : undefined,
    creator: license.includes("Emadrazo")
      ? "Emadrazo"
      : license.includes("Bill Dowell")
        ? "Bill Dowell / U.S. Army Corps of Engineers"
        : license.includes("Sean A. Foley")
          ? "SFC Sean A. Foley / U.S. Army"
          : license.includes("Jamain")
            ? "Jamain"
        : undefined,
    modification: format === "SVG"
      ? "Generated locally from existing BOQ Father plan / estimate engine output."
      : "Locally optimized and stored; no external runtime image requests.",
  }));
  const previous = JSON.parse(await readFile(path.join(output, "asset-manifest.json"), "utf8"));
  const currentFilenames = new Set(
    [...metadata, ...generatedPlans].map((entry) => entry.filename),
  );
  const allAssets = [
    ...metadata,
    ...generatedPlans,
    ...previous.assets.filter((entry) => !currentFilenames.has(entry.filename)),
  ];
  await writeFile(
    path.join(output, "asset-manifest.json"),
    `${JSON.stringify({ assets: allAssets }, null, 2)}\n`,
  );

  for (const entry of metadata) {
    const file = path.join(output, entry.filename);
    const info = await sharp(file).metadata().catch(() => null);
    if (info) console.log(`${entry.filename}: ${info.width}×${info.height}`);
    else console.log(`${entry.filename}: SVG generated`);
  }
}

main().catch((error) => {
  console.error("Premium asset generation failed:", error);
  process.exitCode = 1;
});
