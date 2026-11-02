import type { BoqResult } from "@/engine";
import { inr, ROOM_DEFS, round } from "@/engine";

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

/** Excel workbook: Abstract, Measurement Book, Materials, Rooms. */
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
  abs.push(["", "", `Cost per sqft on ${round(r.geometry.builtUpSqft)} sqft built-up`, "", "", "", Math.round(r.perSqft)]);
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

  const rooms: (string | number)[][] = [["Floor", "Code", "Room", "L (m)", "B (m)", "Area (m²)", "Perimeter (m)"], ...r.rooms.map((x) => [x.floor === 0 ? "GF" : `Floor ${x.floor}`, x.code, ROOM_DEFS[x.type].name.en, x.L, x.B, round(x.area, 2), round(x.per, 2)])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rooms), "Rooms");

  XLSX.writeFile(wb, `BOQFather_BOQ_${Math.round(r.geometry.builtUpSqft)}sqft.xlsx`);
}

/** PDF: abstract of cost + measurement book, BOQFather branding. */
export async function downloadBoqPdf(r: BoqResult, title: string) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 14;
  const INK: [number, number, number] = [22, 24, 26], AMBER: [number, number, number] = [232, 163, 23];
  const today = new Date();
  const date = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
  const estNo = `BF-BQ-${today.getFullYear()}-${String(Math.floor(today.getTime() / 1000) % 100000).padStart(5, "0")}`;
  const header = () => {
    doc.setFillColor(...AMBER);
    doc.roundedRect(M, 10, 10, 10, 1.5, 1.5, "F");
    doc.setTextColor(...INK).setFont("helvetica", "bold").setFontSize(10).text("BF", M + 5, 16.6, { align: "center" });
    doc.setFontSize(15).text("BOQFather", M + 13, 15.2);
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(92, 90, 85).text("Construction Estimates  |  BOQ  |  Measurement Book", M + 13, 19.2);
    doc.setFont("helvetica", "bold").setTextColor(...INK).setFontSize(8).text("ITEM-WISE BOQ ESTIMATE", W - M, 13.5, { align: "right" });
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(92, 90, 85).text(`Estimate No. ${estNo}   |   Date: ${date}`, W - M, 17.5, { align: "right" });
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
  doc.setTextColor(...INK).setFont("helvetica", "bold").setFontSize(14).text(title.toUpperCase(), M, 33);
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(70, 68, 62);
  const fl = r.geometry.perFloor.map((p) => `${p.floor === 0 ? "GF" : r.geometry.floors > 2 ? `F${p.floor}` : "FF"} ${inr(p.builtUpSqft)}`).join(" + ");
  doc.text(`Built-up ${fl} = ${inr(r.geometry.builtUpSqft)} sqft  |  Columns 300x300, beams 230x400, slab 125 mm  |  M20, Fe500D  |  Composite rates`, M, 38.5, { maxWidth: W - 2 * M });

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
  body.push(["", "", `Cost per sqft (${inr(r.geometry.builtUpSqft)} sqft)`, "", "", "", inr(r.perSqft)]);
  autoTable(doc, {
    ...base,
    startY: 43,
    head: [["Sr", "MB item", "Description of work", "Unit", "Qty", "Rate (Rs.)", "Amount (Rs.)"]],
    body,
    columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 12 }, 3: { cellWidth: 11 }, 4: { halign: "right", cellWidth: 18 }, 5: { halign: "right", cellWidth: 18 }, 6: { halign: "right", cellWidth: 24 } },
  });

  doc.addPage();
  header();
  doc.setTextColor(...INK).setFont("helvetica", "bold").setFontSize(13).text("MEASUREMENT BOOK", M, 33);
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
        columnStyles: { 0: { cellWidth: 8 }, 2: { halign: "right", cellWidth: 10 }, 3: { halign: "right", cellWidth: 15 }, 4: { halign: "right", cellWidth: 15 }, 5: { halign: "right", cellWidth: 14 }, 6: { halign: "right", cellWidth: 18 }, 7: { cellWidth: 26 } },
      });
      // @ts-expect-error added by the autotable plugin
      y = doc.lastAutoTable.finalY + 4;
    }

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(200, 196, 188).line(M, H - 13, W - M, H - 13);
    doc.setFontSize(7).setTextColor(92, 90, 85).setFont("helvetica", "bold").text("BOQFather", M, H - 8.5);
    doc.setFont("helvetica", "normal").text("|  boqfather.in  |  Preliminary estimate from an assumed layout - verify with drawings and structural design", M + 15, H - 8.5);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 8.5, { align: "right" });
  }
  doc.save(`BOQFather_BOQ_${Math.round(r.geometry.builtUpSqft)}sqft.pdf`);
}
