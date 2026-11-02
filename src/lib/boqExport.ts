import type { BoqResult } from "@/engine";
import { BOQ_RATES, buildPlan, inr, RateKey, ROOM_DEFS, round } from "@/engine";

const fmt = (n: number | undefined, d = 3) => (n === undefined ? "" : round(n, d));
const materialName: Record<string, string> = {
  cement: "Cement",
  steel: "Steel Fe500D",
  sand: "Sand",
  aggregate: "Aggregate 20 mm",
  bricks: "Bricks",
  tiles: "Tiles (floor + wall + stair)",
  rcc: "RCC M20 concrete",
};

/** What each rate key means — the rate sheet people fill with SOR / DSR / their own rates. */
export const RATE_INFO: Record<RateKey, [string, string]> = {
  exc: ["Excavation in ordinary soil", "m³"],
  pcc: ["PCC 1:4:8", "m³"],
  back: ["Backfilling with excavated soil", "m³"],
  termite: ["Anti-termite treatment", "m²"],
  murum: ["Plinth filling with murum / sand", "m³"],
  rcc: ["RCC M20 (concrete only, excl. steel and shuttering)", "m³"],
  steel: ["Reinforcement steel Fe500D, cut, bent, tied", "kg"],
  sh_col: ["Shuttering – columns", "m²"],
  sh_beam: ["Shuttering – beams", "m²"],
  sh_slab: ["Shuttering / centering – slabs, stairs", "m²"],
  sh_foot: ["Shuttering – footings", "m²"],
  brick: ["Brickwork in CM 1:6", "m³"],
  aac: ["AAC block masonry with adhesive", "m³"],
  lintel: ["RCC lintels incl. steel and shuttering", "m³"],
  pl_int: ["Internal plaster 12 mm CM 1:5", "m²"],
  pl_ext: ["External plaster 20 mm CM 1:4", "m²"],
  pl_ceil: ["Ceiling plaster 12 mm", "m²"],
  pl_para: ["Parapet plaster + coping", "m²"],
  vit: ["Vitrified floor tiles laid", "m²"],
  skirt: ["Tile skirting 100 mm", "rm"],
  anti: ["Anti-skid floor tiles laid", "m²"],
  wtile: ["Wall tiles laid", "m²"],
  toi_wp: ["Toilet waterproofing", "m²"],
  ter_wp: ["Terrace waterproofing with screed", "m²"],
  granite: ["Kitchen platform granite", "rm"],
  mdoor: ["Main door with frame and hardware", "nos"],
  bdoor: ["Balcony door UPVC / aluminium", "nos"],
  fdoor: ["Flush door with frame and hardware", "nos"],
  pvc: ["PVC / UPVC toilet door", "nos"],
  alwin: ["Aluminium sliding window with glass", "m²"],
  vent: ["Ventilator 0.6 × 0.45", "nos"],
  ewc: ["Western WC with cistern", "nos"],
  iwc: ["Indian WC with cistern", "nos"],
  basin: ["Wash basin with tap", "nos"],
  shower: ["Shower with mixer", "nos"],
  taps: ["Tap set", "set"],
  fdrain: ["Floor drain / trap", "nos"],
  sink: ["Kitchen sink with tap", "nos"],
  cpvc: ["CPVC 20 mm pipe concealed", "rm"],
  swr110: ["SWR 110 mm pipe", "rm"],
  swr75: ["SWR 75 / 40 mm pipe", "rm"],
  riser: ["Main riser + chamber connection", "LS"],
  elec: ["Concealed electrical wiring", "m² built-up"],
  p_int: ["Internal paint", "m²"],
  p_ext: ["External paint", "m²"],
  st_tile: ["Stair tread + riser tiles", "m²"],
  st_soffit: ["Stair soffit plaster + paint", "m²"],
  rail: ["Stair railing", "rm"],
  shutter: ["Rolling shutter", "m²"],
  ff_ceiling: ["Gypsum false ceiling", "m²"],
  gate: ["MS main gate", "m²"],
  septic: ["Septic tank with soak pit", "nos"],
  oht: ["Overhead PVC tank", "per 1000 L"],
  sump: ["RCC underground sump", "per 1000 L"],
  bore: ["Borewell drilling with casing", "rft"],
  pump: ["Submersible pump set", "nos"],
  elev: ["Front elevation features", "m²"],
  rwh: ["Rainwater harvesting pit", "LS"],
  conn: ["Electricity and water connection", "LS"],
};

/** Rate sheet: one row per rate key — fill with SOR / DSR / contractor rates and upload back. */
export async function downloadRateSheet(current: Record<string, number>) {
  const XLSX = await import("xlsx");
  const rows: (string | number)[][] = [
    ["BOQFather rate sheet – fill column D with your SOR / DSR / contractor rates (Rs.), keep column A unchanged, then upload"],
    [],
    ["Key", "Description", "Unit", "Rate (Rs.)", "Market rate (Rs.)"],
    ...(Object.keys(BOQ_RATES) as RateKey[]).map((k) => [k, RATE_INFO[k]?.[0] ?? k, RATE_INFO[k]?.[1] ?? "", current[k] ?? BOQ_RATES[k], BOQ_RATES[k]]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 11 }, { wch: 52 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rates");
  XLSX.writeFile(wb, "BOQFather_rate_sheet.xlsx");
}

/** Read a filled rate sheet (xlsx / csv): first column key, a numeric rate in column D (or the first number after the key). */
export async function readRateSheet(file: File): Promise<Partial<Record<RateKey, number>>> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1 });
  const out: Partial<Record<RateKey, number>> = {};
  for (const r of data) {
    const key = String(r?.[0] ?? "").trim() as RateKey;
    if (!(key in BOQ_RATES)) continue;
    const v = Number(r[3] ?? NaN);
    const val = Number.isFinite(v) ? v : Number(r.slice(1).find((x) => Number.isFinite(Number(x)) && String(x).trim() !== ""));
    if (Number.isFinite(val) && val >= 0) out[key] = val;
  }
  return out;
}

/** Excel workbook: Abstract, Measurement Book, Materials, Rooms, Spec, BBS, Plan. */
export async function downloadBoqExcel(r: BoqResult, title: string) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const abs: (string | number)[][] = [["BOQFather – " + title], [], ["Sr", "Item", "Description", "Unit", "Qty", "Rate (Rs.)", "Amount (Rs.)"]];
  let sr = 0;
  for (const s of r.sections) {
    abs.push(["", `${s.code}. ${s.title.en.toUpperCase()}`]);
    for (const i of s.items) abs.push([++sr, i.code, i.desc, i.unit, i.qty, i.rate, i.amount]);
    abs.push(["", "", "Sub-total", "", "", "", s.subtotal]);
  }
  abs.push([], ["", "", "Total of all items", "", "", "", r.itemsTotal]);
  abs.push(["", "", "Contingency / misc. 5%", "", "", "", r.contingency]);
  abs.push(["", "", "GRAND TOTAL", "", "", "", r.grandTotal]);
  if (r.externalTotal) abs.push(["", "", "of which external works (incl. 5%)", "", "", "", r.externalTotal]);
  abs.push(["", "", `House cost per sqft on ${round(r.geometry.builtUpSqft)} sqft built-up${r.externalTotal ? " (external works excluded)" : ""}`, "", "", "", Math.round(r.perSqft)]);
  const ws1 = XLSX.utils.aoa_to_sheet(abs);
  ws1["!cols"] = [{ wch: 5 }, { wch: 7 }, { wch: 62 }, { wch: 6 }, { wch: 11 }, { wch: 11 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Abstract");

  const mb: (string | number)[][] = [["Measurement book (Nos × L × B × H = Qty, metres)"], []];
  for (const s of r.sections)
    for (const i of s.items) {
      mb.push([`Item ${i.code}: ${i.desc}`], [`Basis: ${i.basis}`], ["Sr", "Description", "Nos", "L", "B", "H / D", "Qty", "Remarks"]);
      i.rows.forEach((x, k) => mb.push([k + 1, x.desc, x.n, fmt(x.L), fmt(x.B), fmt(x.H), round(x.q, i.dec || 0), x.rem ?? ""]));
      mb.push(["", "TOTAL", "", "", "", "", i.qty, i.unit], []);
    }
  const ws2 = XLSX.utils.aoa_to_sheet(mb);
  ws2["!cols"] = [{ wch: 5 }, { wch: 48 }, { wch: 6 }, { wch: 9 }, { wch: 9 }, { wch: 9 }, { wch: 11 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Measurement Book");

  const mat: (string | number)[][] = [["Material", "Unit", "Quantity", "Basis"], ...r.materials.map((m) => [materialName[m.key] ?? m.key, m.unit, round(m.qty, 1), m.basis])];
  mat.push([], ["Thumb-rule check", "Unit", "Per sqft", "Thumb qty", "This estimate", "Diff %"]);
  r.thumb.forEach((t) => mat.push([materialName[t.key] ?? t.key, t.unit, t.perSqft, Math.round(t.thumbQty), Math.round(t.qty), Math.round(t.diffPct)]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mat), "Materials");

  const rooms: (string | number)[][] = [
    ["Floor", "Code", "Room", "L (m)", "B (m)", "Area (m²)", "Perimeter (m)"],
    ...r.rooms.map((x) => [x.floor === 0 ? "GF" : `Floor ${x.floor}`, x.code, ROOM_DEFS[x.type].name.en, x.L, x.B, round(x.area, 2), round(x.per, 2)]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rooms), "Rooms");

  const spec: (string | number)[][] = [
    [`Specification – ${r.quality} finish, ${r.wall === "aac" ? "AAC" : "brick"} walls`],
    [],
    ["Item", "Specification"],
    ...r.specSheet.map((x) => [x.item.en, x.spec.en]),
  ];
  const wsSpec = XLSX.utils.aoa_to_sheet(spec);
  wsSpec["!cols"] = [{ wch: 26 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsSpec, "Spec sheet");

  const bbs: (string | number)[][] = [
    ["Bar bending schedule (typical detailing — structural drawing governs)"],
    [],
    ["Member", "Mark", "Description", "Dia (mm)", "Nos", "Cut length (m)", "Total length (m)", "Weight (kg)"],
  ];
  r.bbs.rows.forEach((x) => bbs.push([x.member, x.mark, x.desc, x.dia, x.nos, x.cutLen, x.totalLen, x.kg]));
  bbs.push([], ["", "", "Net", "", "", "", "", r.bbs.net], ["", "", "Wastage 3%", "", "", "", "", r.bbs.wastage], ["", "", "TOTAL", "", "", "", "", r.bbs.total], []);
  r.bbs.byDia.forEach((d) => bbs.push(["", "", `${d.dia} mm`, "", "", "", "", d.kg]));
  const wsB = XLSX.utils.aoa_to_sheet(bbs);
  wsB["!cols"] = [{ wch: 14 }, { wch: 8 }, { wch: 56 }, { wch: 8 }, { wch: 7 }, { wch: 13 }, { wch: 15 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsB, "BBS");

  const plan = buildPlan(r);
  const pl: (string | number)[][] = [
    ["Stage plan and purchase plan"],
    [],
    ["#", "Stage", "Start month", "Months", "Amount (Rs.)", "Cement (bags)", "Steel (kg)", "Sand (cft)", "Aggregate (cft)", "Bricks / blocks", "Tiles (sqft)"],
  ];
  plan.stages.forEach((st, i) =>
    pl.push([
      i + 1,
      st.name.en,
      round(st.start + 1, 1),
      st.months,
      st.amount,
      Math.round(st.mat.cement ?? 0),
      Math.round(st.mat.steel ?? 0),
      Math.round(st.mat.sand ?? 0),
      Math.round(st.mat.aggregate ?? 0),
      Math.round((st.mat.bricks ?? 0) + (st.mat.blocks ?? 0)),
      Math.round(st.mat.tiles ?? 0),
    ]),
  );
  pl.push([], ["Month", "Spend (Rs.)", "Cumulative (Rs.)"], ...plan.months.map((m) => [m.month, m.spend, m.cumulative]));
  const wsP = XLSX.utils.aoa_to_sheet(pl);
  wsP["!cols"] = [{ wch: 7 }, { wch: 44 }, { wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 13 }, { wch: 11 }, { wch: 11 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsP, "Plan");

  XLSX.writeFile(wb, `BOQFather_BOQ_${Math.round(r.geometry.builtUpSqft)}sqft.xlsx`);
}

/** PDF: abstract of cost + measurement book, BOQFather branding. */
export async function downloadBoqPdf(r0: BoqResult, title: string) {
  // Standard PDF fonts have no "−" (U+2212) or "≈" glyphs — swap them for plain characters.
  const r: BoqResult = JSON.parse(
    JSON.stringify(r0)
      .replace(/\u2212/g, "-")
      .replace(/\u2248/g, "~"),
  );
  title = title.replace(/\u2212/g, "-");
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth(),
    H = doc.internal.pageSize.getHeight(),
    M = 14;
  const INK: [number, number, number] = [22, 24, 26],
    AMBER: [number, number, number] = [232, 163, 23];
  const today = new Date();
  const date = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
  const estNo = `BF-BQ-${today.getFullYear()}-${String(Math.floor(today.getTime() / 1000) % 100000).padStart(5, "0")}`;
  const header = () => {
    doc.setFillColor(...AMBER);
    doc.roundedRect(M, 10, 10, 10, 1.5, 1.5, "F");
    doc
      .setTextColor(...INK)
      .setFont("helvetica", "bold")
      .setFontSize(10)
      .text("BF", M + 5, 16.6, { align: "center" });
    doc.setFontSize(15).text("BOQFather", M + 13, 15.2);
    doc
      .setFont("helvetica", "normal")
      .setFontSize(7.5)
      .setTextColor(92, 90, 85)
      .text("Construction Estimates  |  BOQ  |  Measurement Book", M + 13, 19.2);
    doc
      .setFont("helvetica", "bold")
      .setTextColor(...INK)
      .setFontSize(8)
      .text("ITEM-WISE BOQ ESTIMATE", W - M, 13.5, { align: "right" });
    doc
      .setFont("helvetica", "normal")
      .setFontSize(7.5)
      .setTextColor(92, 90, 85)
      .text(`Estimate No. ${estNo}   |   Date: ${date}`, W - M, 17.5, { align: "right" });
    doc.setFillColor(...AMBER).rect(M, 23, W - 2 * M, 0.6, "F");
  };
  const base = {
    theme: "grid" as const,
    styles: { font: "helvetica", fontSize: 7.6, cellPadding: 1.6, lineColor: [205, 200, 192] as [number, number, number], lineWidth: 0.2, textColor: INK },
    headStyles: { fillColor: [236, 233, 226] as [number, number, number], textColor: INK, fontStyle: "bold" as const },
    margin: { left: M, right: M, top: 30, bottom: 18 },
    didDrawPage: header,
  };
  header();
  doc
    .setTextColor(...INK)
    .setFont("helvetica", "bold")
    .setFontSize(14)
    .text(title.toUpperCase(), M, 33);
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(70, 68, 62);
  const fl = r.geometry.perFloor.map((p) => `${p.floor === 0 ? "GF" : r.geometry.floors > 2 ? `F${p.floor}` : "FF"} ${inr(p.builtUpSqft)}`).join(" + ");
  doc.text(
    `Built-up ${fl} = ${inr(r.geometry.builtUpSqft)} sqft  |  Columns 300x300, beams 230x400, slab 125 mm  |  M20, Fe500D  |  ${r.quality} finish, ${r.wall === "aac" ? "AAC" : "brick"} walls`,
    M,
    38.5,
    { maxWidth: W - 2 * M },
  );

  const body: (string | { content: string; colSpan?: number; styles?: object })[][] = [];
  let sr = 0;
  for (const s of r.sections) {
    body.push([{ content: `${s.code}. ${s.title.en.toUpperCase()}`, colSpan: 7, styles: { fillColor: [251, 243, 222], fontStyle: "bold" } }]);
    for (const i of s.items) body.push([String(++sr), i.code, i.desc, i.unit, String(i.qty), inr(i.rate), inr(i.amount)]);
    body.push(["", "", { content: "Sub-total", styles: { fontStyle: "bold" } }, "", "", "", { content: inr(s.subtotal), styles: { fontStyle: "bold" } }]);
  }
  body.push(["", "", { content: "Total of all items", styles: { fontStyle: "bold" } }, "", "", "", { content: inr(r.itemsTotal), styles: { fontStyle: "bold" } }]);
  body.push(["", "", "Contingency / misc. 5%", "", "", "", inr(r.contingency)]);
  body.push([
    { content: "", styles: { fillColor: [252, 231, 178] } },
    { content: "", styles: { fillColor: [252, 231, 178] } },
    { content: "GRAND TOTAL", styles: { fontStyle: "bold", fillColor: [252, 231, 178] } },
    { content: "", styles: { fillColor: [252, 231, 178] } },
    { content: "", styles: { fillColor: [252, 231, 178] } },
    { content: "", styles: { fillColor: [252, 231, 178] } },
    { content: inr(r.grandTotal), styles: { fontStyle: "bold", fillColor: [252, 231, 178] } },
  ]);
  if (r.externalTotal) body.push(["", "", "of which external works (incl. 5%)", "", "", "", inr(r.externalTotal)]);
  body.push(["", "", `House cost per sqft (${inr(r.geometry.builtUpSqft)} sqft${r.externalTotal ? ", external works excluded" : ""})`, "", "", "", inr(r.perSqft)]);
  autoTable(doc, {
    ...base,
    startY: 43,
    head: [["Sr", "MB item", "Description of work", "Unit", "Qty", "Rate (Rs.)", "Amount (Rs.)"]],
    body,
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 12 },
      3: { cellWidth: 11 },
      4: { halign: "right", cellWidth: 18 },
      5: { halign: "right", cellWidth: 18 },
      6: { halign: "right", cellWidth: 24 },
    },
  });

  // Specification + schematic sketch
  doc.addPage();
  header();
  doc
    .setTextColor(...INK)
    .setFont("helvetica", "bold")
    .setFontSize(13)
    .text(`SPECIFICATION – ${r.quality.toUpperCase()} FINISH`, M, 33);
  autoTable(doc, {
    ...base,
    startY: 37,
    head: [["Item", "Specification"]],
    body: r.specSheet.map((x) => [x.item.en, x.spec.en.replace(/₹/g, "Rs.")]),
    columnStyles: { 0: { cellWidth: 42, fontStyle: "bold" } },
  });
  // @ts-expect-error added by the autotable plugin
  let sy = doc.lastAutoTable.finalY + 8;
  doc
    .setFont("helvetica", "bold")
    .setFontSize(11)
    .setTextColor(...INK)
    .text("SCHEMATIC SKETCH (proportions only, not an architectural plan)", M, sy);
  sy += 4;
  const FILL: Record<string, [number, number, number]> = {
    hall: [253, 243, 220],
    dining: [251, 236, 205],
    kitchen: [253, 227, 214],
    bedroom: [230, 237, 245],
    toilet: [223, 241, 232],
    utility: [223, 241, 232],
    passage: [241, 238, 232],
    balcony: [238, 246, 220],
    pooja: [251, 231, 240],
    store: [236, 233, 226],
    study: [233, 230, 245],
    parking: [228, 228, 228],
    shop: [255, 240, 194],
    stair: [217, 212, 202],
  };
  const per = r.sketch.length > 1 ? 2 : 1;
  const boxW = (W - 2 * M - (per - 1) * 6) / per;
  let col = 0;
  for (const sk of r.sketch) {
    const scale = Math.min(boxW / sk.L, 70 / sk.B);
    const h = sk.B * scale + 8;
    if (sy + h > H - 20) {
      doc.addPage();
      header();
      sy = 32;
      col = 0;
    }
    const x0 = M + col * (boxW + 6),
      y0 = sy + 5;
    doc
      .setFont("helvetica", "bold")
      .setFontSize(8.5)
      .setTextColor(...INK)
      .text(`${["Ground floor", "First floor", "Second floor", "Third floor"][sk.floor] ?? `Floor ${sk.floor}`} – ${round(sk.L * 3.28084, 1)} x ${round(sk.B * 3.28084, 1)} ft`, x0, sy + 3);
    for (const rc of sk.rects) {
      doc
        .setFillColor(...(FILL[rc.type] ?? [238, 238, 238]))
        .setDrawColor(138, 133, 123)
        .setLineWidth(0.2);
      doc.rect(x0 + rc.x * scale + 0.4, y0 + rc.y * scale + 0.4, Math.max(0, rc.w * scale - 0.8), Math.max(0, rc.h * scale - 0.8), "FD");
      doc
        .setFont("helvetica", "bold")
        .setFontSize(6.8)
        .setTextColor(...INK);
      const cx = x0 + (rc.x + rc.w / 2) * scale,
        cy = y0 + (rc.y + rc.h / 2) * scale;
      doc.text(rc.type === "stair" ? "STAIR" : rc.key, cx, cy, { align: "center" });
      if (rc.L !== undefined && rc.B !== undefined && rc.h * scale > 9)
        doc
          .setFont("helvetica", "normal")
          .setFontSize(5.8)
          .text(`${round(rc.L * 3.28084, 1)}x${round(rc.B * 3.28084, 1)}`, cx, cy + 3, { align: "center" });
    }
    doc
      .setDrawColor(...INK)
      .setLineWidth(0.6)
      .rect(x0, y0, sk.L * scale, sk.B * scale);
    col++;
    if (col >= per) {
      col = 0;
      sy += h + 4;
    }
  }

  // Stage plan + purchase plan
  const plan = buildPlan(r);
  doc.addPage();
  header();
  doc
    .setTextColor(...INK)
    .setFont("helvetica", "bold")
    .setFontSize(13)
    .text(`STAGE PLAN AND PURCHASE PLAN – ${plan.totalMonths} MONTHS`, M, 33);
  autoTable(doc, {
    ...base,
    startY: 37,
    head: [["#", "Stage", "Month", "Amount (Rs.)", "Cement bags", "Steel kg", "Sand cft", "Agg. cft", "Bricks / blocks", "Tiles sqft"]],
    body: plan.stages.map((st, i) => [
      String(i + 1),
      st.name.en,
      `${round(st.start + 1, 1)}–${round(st.start + st.months + 1, 1)}`,
      inr(st.amount),
      inr(st.mat.cement ?? 0),
      inr(st.mat.steel ?? 0),
      inr(st.mat.sand ?? 0),
      inr(st.mat.aggregate ?? 0),
      inr((st.mat.bricks ?? 0) + (st.mat.blocks ?? 0)),
      inr(st.mat.tiles ?? 0),
    ]),
    columnStyles: {
      0: { cellWidth: 6 },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
      7: { halign: "right" },
      8: { halign: "right" },
      9: { halign: "right" },
    },
  });
  // @ts-expect-error added by the autotable plugin
  const py = doc.lastAutoTable.finalY + 6;
  autoTable(doc, {
    ...base,
    startY: py,
    head: [["Month", ...plan.months.map((m) => String(m.month))]],
    body: [["Spend (Rs. '000)", ...plan.months.map((m) => inr(m.spend / 1000))]],
    styles: { ...base.styles, fontSize: 7, halign: "center" },
  });

  // BBS
  doc.addPage();
  header();
  doc
    .setTextColor(...INK)
    .setFont("helvetica", "bold")
    .setFontSize(13)
    .text("BAR BENDING SCHEDULE (typical detailing)", M, 33);
  autoTable(doc, {
    ...base,
    startY: 37,
    head: [["Member", "Mark", "Description", "Dia", "Nos", "Cut L (m)", "Total L (m)", "kg"]],
    body: [
      ...r.bbs.rows.map((x) => [x.member, x.mark, x.desc, String(x.dia), String(x.nos), String(x.cutLen), inr(x.totalLen), inr(x.kg)]),
      [
        "",
        "",
        { content: `Net ${inr(r.bbs.net)} kg + 3% wastage ${inr(r.bbs.wastage)} kg = TOTAL`, styles: { fontStyle: "bold" } },
        "",
        "",
        "",
        "",
        { content: inr(r.bbs.total), styles: { fontStyle: "bold" } },
      ],
      ["", "", { content: r.bbs.byDia.map((d) => `${d.dia} mm: ${inr(d.kg)} kg`).join("   "), styles: { fontStyle: "bold" } }, "", "", "", "", ""],
    ],
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 14 },
      3: { halign: "right", cellWidth: 9 },
      4: { halign: "right", cellWidth: 10 },
      5: { halign: "right", cellWidth: 15 },
      6: { halign: "right", cellWidth: 17 },
      7: { halign: "right", cellWidth: 15 },
    },
  });

  doc.addPage();
  header();
  doc
    .setTextColor(...INK)
    .setFont("helvetica", "bold")
    .setFontSize(13)
    .text("MEASUREMENT BOOK", M, 33);
  let y = 37;
  for (const s of r.sections)
    for (const i of s.items) {
      autoTable(doc, {
        ...base,
        startY: y,
        head: [
          [{ content: `Item ${i.code}: ${i.desc}  (Basis: ${i.basis})`, colSpan: 8, styles: { fillColor: [251, 243, 222], halign: "left" } }],
          ["Sr", "Description / location", "Nos", "L", "B", "H / D", "Qty", "Remarks"],
        ],
        body: [
          ...i.rows.map((x, k) => [String(k + 1), x.desc, String(x.n), String(fmt(x.L)), String(fmt(x.B)), String(fmt(x.H)), String(round(x.q, i.dec || 0)), x.rem ?? ""]),
          ["", { content: "TOTAL", styles: { fontStyle: "bold" } }, "", "", "", "", { content: `${i.qty} ${i.unit}`, styles: { fontStyle: "bold" } }, ""],
        ],
        columnStyles: {
          0: { cellWidth: 8 },
          2: { halign: "right", cellWidth: 10 },
          3: { halign: "right", cellWidth: 15 },
          4: { halign: "right", cellWidth: 15 },
          5: { halign: "right", cellWidth: 14 },
          6: { halign: "right", cellWidth: 18 },
          7: { cellWidth: 26 },
        },
      });
      // @ts-expect-error added by the autotable plugin
      y = doc.lastAutoTable.finalY + 4;
    }

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(200, 196, 188).line(M, H - 13, W - M, H - 13);
    doc
      .setFontSize(7)
      .setTextColor(92, 90, 85)
      .setFont("helvetica", "bold")
      .text("BOQFather", M, H - 8.5);
    doc.setFont("helvetica", "normal").text("|  boqfather.in  |  Preliminary estimate from an assumed layout - verify with drawings and structural design", M + 15, H - 8.5);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 8.5, { align: "right" });
  }
  doc.save(`BOQFather_BOQ_${Math.round(r.geometry.builtUpSqft)}sqft.pdf`);
}
