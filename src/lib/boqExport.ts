import type { BoqResult } from "@/engine";
import { BOQ_RATES, buildPlan, inr, RateKey, ROOM_DEFS, round } from "@/engine";
import { planPrimitives, Primitives } from "./planDraw";

type Pdf = InstanceType<typeof import("jspdf").jsPDF>;
/** Draw plan primitives on a jsPDF page; (ox, oy) is the page position of the plan origin, sc mm per metre. */
function drawPlan(doc: Pdf, P: Primitives, ox: number, oy: number, sc: number) {
  const X = (x: number) => ox + x * sc,
    Y = (y: number) => oy + y * sc;
  for (const r of P.rects) {
    if (r.fill) doc.setFillColor(...r.fill);
    if (r.stroke)
      doc.setDrawColor(...r.stroke).setLineWidth((r.sw ?? 0.1) * sc);
    doc.rect(
      X(r.x),
      Y(r.y),
      r.w * sc,
      r.h * sc,
      r.fill && r.stroke ? "FD" : r.fill ? "F" : "S",
    );
  }
  for (const l of P.lines) {
    doc.setDrawColor(...l.color).setLineWidth(l.sw * sc);
    if (l.dash) doc.setLineDashPattern([1.2, 0.8], 0);
    doc.line(X(l.x1), Y(l.y1), X(l.x2), Y(l.y2));
    if (l.dash) doc.setLineDashPattern([], 0);
  }
  for (const c of P.curves) {
    doc.setDrawColor(...c.color).setLineWidth(c.sw * sc);
    const [x0, y0] = c.p0;
    doc.lines(
      [
        [
          (c.c1[0] - x0) * sc,
          (c.c1[1] - y0) * sc,
          (c.c2[0] - x0) * sc,
          (c.c2[1] - y0) * sc,
          (c.p1[0] - x0) * sc,
          (c.p1[1] - y0) * sc,
        ],
      ],
      X(x0),
      Y(y0),
      [1, 1],
      "S",
      false,
    );
  }
  for (const t of P.texts) {
    doc
      .setFont("helvetica", t.bold ? "bold" : "normal")
      .setFontSize(Math.max(4.5, t.size * sc * 2.83))
      .setTextColor(...t.color);
    const txt = t.text.replace(/×/g, "x");
    if (t.rotate) {
      // jsPDF rotates about the start of the baseline: shift so the text is centred like the SVG
      const tw = doc.getTextWidth(txt);
      doc.text(txt, X(t.x), Y(t.y) + (t.anchor === "middle" ? tw / 2 : 0), {
        angle: -t.rotate,
      });
    } else
      doc.text(txt, X(t.x), Y(t.y), {
        align:
          t.anchor === "start"
            ? "left"
            : t.anchor === "end"
              ? "right"
              : "center",
      });
  }
}

const fmt = (n: number | undefined, d = 3) =>
  n === undefined ? "" : round(n, d);
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
    [
      "BOQFather rate sheet – fill column D with your SOR / DSR / contractor rates (Rs.), keep column A unchanged, then upload",
    ],
    [],
    ["Key", "Description", "Unit", "Rate (Rs.)", "Market rate (Rs.)"],
    ...(Object.keys(BOQ_RATES) as RateKey[]).map((k) => [
      k,
      RATE_INFO[k]?.[0] ?? k,
      RATE_INFO[k]?.[1] ?? "",
      current[k] ?? BOQ_RATES[k],
      BOQ_RATES[k],
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 11 },
    { wch: 52 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rates");
  XLSX.writeFile(wb, "BOQFather_rate_sheet.xlsx");
}

/** Read a filled rate sheet (xlsx / csv): first column key, a numeric rate in column D (or the first number after the key). */
export async function readRateSheet(
  file: File,
): Promise<Partial<Record<RateKey, number>>> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1 });
  const out: Partial<Record<RateKey, number>> = {};
  for (const r of data) {
    const key = String(r?.[0] ?? "").trim() as RateKey;
    if (!(key in BOQ_RATES)) continue;
    const v = Number(r[3] ?? NaN);
    const val = Number.isFinite(v)
      ? v
      : Number(
          r
            .slice(1)
            .find((x) => Number.isFinite(Number(x)) && String(x).trim() !== ""),
        );
    if (Number.isFinite(val) && val >= 0) out[key] = val;
  }
  return out;
}

/** Excel workbook: Abstract, Measurement Book, Materials, Rooms, Spec, BBS, Plan. */
export async function downloadBoqExcel(r: BoqResult, title: string) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const abs: (string | number)[][] = [
    ["BOQFather – " + title],
    ...r.warnings.map((w) => ["", "CHECK", w.en]),
    [],
    ["Sr", "Item", "Description", "Unit", "Qty", "Rate (Rs.)", "Amount (Rs.)"],
  ];
  let sr = 0;
  for (const s of r.sections) {
    abs.push(["", `${s.code}. ${s.title.en.toUpperCase()}`]);
    for (const i of s.items)
      abs.push([++sr, i.code, i.desc, i.unit, i.qty, i.rate, i.amount]);
    abs.push(["", "", "Sub-total", "", "", "", s.subtotal]);
  }
  abs.push([], ["", "", "Total of all items", "", "", "", r.itemsTotal]);
  abs.push(["", "", "Contingency / misc. 5%", "", "", "", r.contingency]);
  abs.push(["", "", "GRAND TOTAL", "", "", "", r.grandTotal]);
  if (r.externalTotal)
    abs.push([
      "",
      "",
      "of which external works (incl. 5%)",
      "",
      "",
      "",
      r.externalTotal,
    ]);
  abs.push([
    "",
    "",
    `House cost per sqft on ${round(r.geometry.builtUpSqft)} sqft built-up${r.externalTotal ? " (external works excluded)" : ""}`,
    "",
    "",
    "",
    Math.round(r.perSqft),
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet(abs);
  ws1["!cols"] = [
    { wch: 5 },
    { wch: 7 },
    { wch: 62 },
    { wch: 6 },
    { wch: 11 },
    { wch: 11 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Abstract");

  const mb: (string | number)[][] = [
    ["Measurement book (Nos × L × B × H = Qty, metres)"],
    [],
  ];
  for (const s of r.sections)
    for (const i of s.items) {
      mb.push(
        [`Item ${i.code}: ${i.desc}`],
        [`Basis: ${i.basis}`],
        ["Sr", "Description", "Nos", "L", "B", "H / D", "Qty", "Remarks"],
      );
      i.rows.forEach((x, k) =>
        mb.push([
          k + 1,
          x.desc,
          x.n,
          fmt(x.L),
          fmt(x.B),
          fmt(x.H),
          round(x.q, i.dec || 0),
          x.rem ?? "",
        ]),
      );
      mb.push(["", "TOTAL", "", "", "", "", i.qty, i.unit], []);
    }
  const ws2 = XLSX.utils.aoa_to_sheet(mb);
  ws2["!cols"] = [
    { wch: 5 },
    { wch: 48 },
    { wch: 6 },
    { wch: 9 },
    { wch: 9 },
    { wch: 9 },
    { wch: 11 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, "Measurement Book");

  const mat: (string | number)[][] = [
    ["Material", "Unit", "Quantity", "Basis"],
    ...r.materials.map((m) => [
      materialName[m.key] ?? m.key,
      m.unit,
      round(m.qty, 1),
      m.basis,
    ]),
  ];
  mat.push(
    [],
    [
      "Thumb-rule check",
      "Unit",
      "Per sqft",
      "Thumb qty",
      "This estimate",
      "Diff %",
    ],
  );
  r.thumb.forEach((t) =>
    mat.push([
      materialName[t.key] ?? t.key,
      t.unit,
      t.perSqft,
      Math.round(t.thumbQty),
      Math.round(t.qty),
      Math.round(t.diffPct),
    ]),
  );
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mat), "Materials");

  const rooms: (string | number)[][] = [
    ["Floor", "Code", "Room", "L (m)", "B (m)", "Area (m²)", "Perimeter (m)"],
    ...r.rooms.map((x) => [
      x.floor === 0 ? "GF" : `Floor ${x.floor}`,
      x.code,
      ROOM_DEFS[x.type].name.en,
      x.L,
      x.B,
      round(x.area, 2),
      round(x.per, 2),
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rooms), "Rooms");

  const spec: (string | number)[][] = [
    [
      `Specification – ${r.quality} finish, ${r.wall === "aac" ? "AAC" : "brick"} walls`,
    ],
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
    [
      "Member",
      "Mark",
      "Description",
      "Dia (mm)",
      "Nos",
      "Cut length (m)",
      "Total length (m)",
      "Weight (kg)",
    ],
  ];
  r.bbs.rows.forEach((x) =>
    bbs.push([
      x.member,
      x.mark,
      x.desc,
      x.dia,
      x.nos,
      x.cutLen,
      x.totalLen,
      x.kg,
    ]),
  );
  bbs.push(
    [],
    ["", "", "Net", "", "", "", "", r.bbs.net],
    ["", "", "Wastage 3%", "", "", "", "", r.bbs.wastage],
    ["", "", "TOTAL", "", "", "", "", r.bbs.total],
    [],
  );
  r.bbs.byDia.forEach((d) =>
    bbs.push(["", "", `${d.dia} mm`, "", "", "", "", d.kg]),
  );
  const wsB = XLSX.utils.aoa_to_sheet(bbs);
  wsB["!cols"] = [
    { wch: 14 },
    { wch: 8 },
    { wch: 56 },
    { wch: 8 },
    { wch: 7 },
    { wch: 13 },
    { wch: 15 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsB, "BBS");

  const plan = buildPlan(r);
  const pl: (string | number)[][] = [
    ["Stage plan and purchase plan"],
    [],
    [
      "#",
      "Stage",
      "Start month",
      "Months",
      "Amount (Rs.)",
      "Cement (bags)",
      "Steel (kg)",
      "Sand (cft)",
      "Aggregate (cft)",
      "Bricks / blocks",
      "Tiles (sqft)",
    ],
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
  pl.push(
    [],
    ["Month", "Spend (Rs.)", "Cumulative (Rs.)"],
    ...plan.months.map((m) => [m.month, m.spend, m.cumulative]),
  );
  const wsP = XLSX.utils.aoa_to_sheet(pl);
  wsP["!cols"] = [
    { wch: 7 },
    { wch: 44 },
    { wch: 12 },
    { wch: 8 },
    { wch: 14 },
    { wch: 13 },
    { wch: 11 },
    { wch: 11 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsP, "Plan");

  XLSX.writeFile(
    wb,
    `BOQFather_BOQ_${Math.round(r.geometry.builtUpSqft)}sqft.xlsx`,
  );
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
      .text(
        "Construction Estimates  |  BOQ  |  Measurement Book",
        M + 13,
        19.2,
      );
    doc
      .setFont("helvetica", "bold")
      .setTextColor(...INK)
      .setFontSize(8)
      .text("ITEM-WISE BOQ ESTIMATE", W - M, 13.5, { align: "right" });
    doc
      .setFont("helvetica", "normal")
      .setFontSize(7.5)
      .setTextColor(92, 90, 85)
      .text(`Estimate No. ${estNo}   |   Date: ${date}`, W - M, 17.5, {
        align: "right",
      });
    doc.setFillColor(...AMBER).rect(M, 23, W - 2 * M, 0.6, "F");
  };
  const base = {
    theme: "grid" as const,
    styles: {
      font: "helvetica",
      fontSize: 7.6,
      cellPadding: 1.6,
      lineColor: [205, 200, 192] as [number, number, number],
      lineWidth: 0.2,
      textColor: INK,
    },
    headStyles: {
      fillColor: [236, 233, 226] as [number, number, number],
      textColor: INK,
      fontStyle: "bold" as const,
    },
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
  const fl = r.geometry.perFloor
    .map(
      (p) =>
        `${p.floor === 0 ? "GF" : r.geometry.floors > 2 ? `F${p.floor}` : "FF"} ${inr(p.builtUpSqft)}`,
    )
    .join(" + ");
  doc.text(
    `Built-up ${fl} = ${inr(r.geometry.builtUpSqft)} sqft  |  Columns 300x300, beams 230x400, slab 125 mm  |  M20, Fe500D  |  ${r.quality} finish, ${r.wall === "aac" ? "AAC" : "brick"} walls`,
    M,
    38.5,
    { maxWidth: W - 2 * M },
  );

  let startAbs = 43;
  if (r.warnings.length) {
    const lines = doc.splitTextToSize(
      r.warnings.map((w) => `- ${w.en}`).join("\n"),
      W - 2 * M - 6,
    );
    const hBox = 7 + lines.length * 3.6;
    doc
      .setFillColor(255, 244, 214)
      .setDrawColor(229, 199, 122)
      .roundedRect(M, 41.5, W - 2 * M, hBox, 1.5, 1.5, "FD");
    doc
      .setFont("helvetica", "bold")
      .setFontSize(8.5)
      .setTextColor(180, 83, 9)
      .text(`PLEASE CHECK (${r.warnings.length})`, M + 3, 46);
    doc
      .setFont("helvetica", "normal")
      .setFontSize(7.8)
      .setTextColor(90, 60, 10)
      .text(lines, M + 3, 50);
    startAbs = 41.5 + hBox + 3;
  }
  const body: (
    string | { content: string; colSpan?: number; styles?: object }
  )[][] = [];
  let sr = 0;
  for (const s of r.sections) {
    body.push([
      {
        content: `${s.code}. ${s.title.en.toUpperCase()}`,
        colSpan: 7,
        styles: { fillColor: [251, 243, 222], fontStyle: "bold" },
      },
    ]);
    for (const i of s.items)
      body.push([
        String(++sr),
        i.code,
        i.desc,
        i.unit,
        String(i.qty),
        inr(i.rate),
        inr(i.amount),
      ]);
    body.push([
      "",
      "",
      { content: "Sub-total", styles: { fontStyle: "bold" } },
      "",
      "",
      "",
      { content: inr(s.subtotal), styles: { fontStyle: "bold" } },
    ]);
  }
  body.push([
    "",
    "",
    { content: "Total of all items", styles: { fontStyle: "bold" } },
    "",
    "",
    "",
    { content: inr(r.itemsTotal), styles: { fontStyle: "bold" } },
  ]);
  body.push(["", "", "Contingency / misc. 5%", "", "", "", inr(r.contingency)]);
  body.push([
    { content: "", styles: { fillColor: [252, 231, 178] } },
    { content: "", styles: { fillColor: [252, 231, 178] } },
    {
      content: "GRAND TOTAL",
      styles: { fontStyle: "bold", fillColor: [252, 231, 178] },
    },
    { content: "", styles: { fillColor: [252, 231, 178] } },
    { content: "", styles: { fillColor: [252, 231, 178] } },
    { content: "", styles: { fillColor: [252, 231, 178] } },
    {
      content: inr(r.grandTotal),
      styles: { fontStyle: "bold", fillColor: [252, 231, 178] },
    },
  ]);
  if (r.externalTotal)
    body.push([
      "",
      "",
      "of which external works (incl. 5%)",
      "",
      "",
      "",
      inr(r.externalTotal),
    ]);
  body.push([
    "",
    "",
    `House cost per sqft (${inr(r.geometry.builtUpSqft)} sqft${r.externalTotal ? ", external works excluded" : ""})`,
    "",
    "",
    "",
    inr(r.perSqft),
  ]);
  autoTable(doc, {
    ...base,
    startY: startAbs,
    head: [
      [
        "Sr",
        "MB item",
        "Description of work",
        "Unit",
        "Qty",
        "Rate (Rs.)",
        "Amount (Rs.)",
      ],
    ],
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
  // Floor plans (planning sketch), one floor per half page
  const EXTRA: Record<string, string> = {
    stair: "Stair",
    corridor: "Passage",
    lobby: "Lobby",
    porch: "Porch",
    open: "Open sit-out",
    dress: "Dress",
    wash: "Wash",
    terrace: "Open terrace",
  };
  const nm = (t: string) =>
    EXTRA[t] ??
    (ROOM_DEFS[t as keyof typeof ROOM_DEFS]?.name.en ?? t)
      .replace(" / living", "")
      .replace(" / bath", "")
      .replace(" / lobby", "");
  const floorNames = [
    "GROUND FLOOR PLAN",
    "FIRST FLOOR PLAN",
    "SECOND FLOOR PLAN",
    "THIRD FLOOR PLAN",
  ];
  r.sketch.forEach((sk, i) => {
    const top = i % 2 === 0;
    if (top) {
      doc.addPage();
      header();
    }
    const boxY = top ? 30 : 30 + (H - 30 - 18) / 2 + 2;
    const boxH = (H - 30 - 18) / 2 - 8;
    const face = r.facing
      ? { N: "NORTH", E: "EAST", S: "SOUTH", W: "WEST" }[r.facing]
      : "";
    const P = planPrimitives(sk.L, sk.B, sk.rects, nm, {
      wall: r.wall === "aac" ? 0.2 : 0.23,
      facing: r.facing,
      road: face ? `ROAD - ${face} FACING` : "ROAD / FRONT",
      upper: sk.floor > 0,
    });
    doc
      .setTextColor(...INK)
      .setFont("helvetica", "bold")
      .setFontSize(11)
      .text(
        `${floorNames[sk.floor] ?? `FLOOR ${sk.floor} PLAN`}  -  ${round(sk.L * 3.28084, 1)} x ${round(sk.B * 3.28084, 1)} ft`,
        M,
        boxY + 3,
      );
    if (top)
      doc
        .setFont("helvetica", "normal")
        .setFontSize(7)
        .setTextColor(92, 90, 85)
        .text(
          "Drawn to scale from the room list - finalise with your architect and local bye-laws",
          W - M,
          boxY + 3,
          { align: "right" },
        );
    const sc = Math.min((W - 2 * M) / P.bounds.w, (boxH - 6) / P.bounds.h);
    const ox = M + (W - 2 * M - P.bounds.w * sc) / 2 - P.bounds.x * sc;
    const oy = boxY + 6 - P.bounds.y * sc;
    drawPlan(doc, P, ox, oy, sc);
  });

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
    head: [
      [
        "#",
        "Stage",
        "Month",
        "Amount (Rs.)",
        "Cement bags",
        "Steel kg",
        "Sand cft",
        "Agg. cft",
        "Bricks / blocks",
        "Tiles sqft",
      ],
    ],
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
    body: [
      ["Spend (Rs. '000)", ...plan.months.map((m) => inr(m.spend / 1000))],
    ],
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
    head: [
      [
        "Member",
        "Mark",
        "Description",
        "Dia",
        "Nos",
        "Cut L (m)",
        "Total L (m)",
        "kg",
      ],
    ],
    body: [
      ...r.bbs.rows.map((x) => [
        x.member,
        x.mark,
        x.desc,
        String(x.dia),
        String(x.nos),
        String(x.cutLen),
        inr(x.totalLen),
        inr(x.kg),
      ]),
      [
        "",
        "",
        {
          content: `Net ${inr(r.bbs.net)} kg + 3% wastage ${inr(r.bbs.wastage)} kg = TOTAL`,
          styles: { fontStyle: "bold" },
        },
        "",
        "",
        "",
        "",
        { content: inr(r.bbs.total), styles: { fontStyle: "bold" } },
      ],
      [
        "",
        "",
        {
          content: r.bbs.byDia
            .map((d) => `${d.dia} mm: ${inr(d.kg)} kg`)
            .join("   "),
          styles: { fontStyle: "bold" },
        },
        "",
        "",
        "",
        "",
        "",
      ],
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
          [
            {
              content: `Item ${i.code}: ${i.desc}  (Basis: ${i.basis})`,
              colSpan: 8,
              styles: { fillColor: [251, 243, 222], halign: "left" },
            },
          ],
          [
            "Sr",
            "Description / location",
            "Nos",
            "L",
            "B",
            "H / D",
            "Qty",
            "Remarks",
          ],
        ],
        body: [
          ...i.rows.map((x, k) => [
            String(k + 1),
            x.desc,
            String(x.n),
            String(fmt(x.L)),
            String(fmt(x.B)),
            String(fmt(x.H)),
            String(round(x.q, i.dec || 0)),
            x.rem ?? "",
          ]),
          [
            "",
            { content: "TOTAL", styles: { fontStyle: "bold" } },
            "",
            "",
            "",
            "",
            { content: `${i.qty} ${i.unit}`, styles: { fontStyle: "bold" } },
            "",
          ],
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
    doc
      .setFont("helvetica", "normal")
      .text(
        "|  boqfather.vercel.app  |  Preliminary estimate from an assumed layout - verify with drawings and structural design",
        M + 15,
        H - 8.5,
      );
    doc.text(`Page ${p} of ${pages}`, W - M, H - 8.5, { align: "right" });
  }
  doc.save(`BOQFather_BOQ_${Math.round(r.geometry.builtUpSqft)}sqft.pdf`);
}
