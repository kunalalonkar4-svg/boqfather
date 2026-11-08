import type { HouseInput, HouseValues } from "@/engine";
import { inr, round } from "@/engine";
import { floorName, name } from "@/i18n/ui";

/** Builds the Quick Estimate PDF (Guniyo branding) in the browser and downloads it. */
export async function downloadHousePdf(input: HouseInput, v: HouseValues) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const INK: [number, number, number] = [22, 24, 26];
  const AMBER: [number, number, number] = [23, 105, 210];
  const GROUND: [number, number, number] = [245, 243, 239];
  const rs = (n: number) => `Rs. ${inr(n)}`;
  const today = new Date();
  const date = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
  const estNo = `GN-QE-${today.getFullYear()}-${String(Math.floor(today.getTime() / 1000) % 100000).padStart(5, "0")}`;

  const header = () => {
    doc.setFillColor(...AMBER);
    doc.roundedRect(M, 10, 10, 10, 1.5, 1.5, "F");
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("G", M + 5, 16.6, { align: "center" });
    doc.setFontSize(15);
    doc.text("Guniyo", M + 13, 15.2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(92, 90, 85);
    doc.text(
      "Construction Estimates  |  BOQ  |  Measurement Book",
      M + 13,
      19.2,
    );
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.setFontSize(8);
    doc.text("QUICK HOUSE ESTIMATE", W - M, 13.5, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(92, 90, 85);
    doc.text(`Estimate No. ${estNo}   |   Date: ${date}`, W - M, 17.5, {
      align: "right",
    });
    doc.setFillColor(...AMBER);
    doc.rect(M, 23, W - 2 * M, 0.6, "F");
  };
  const footer = () => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 196, 188);
      doc.line(M, H - 13, W - M, H - 13);
      doc.setFontSize(7);
      doc.setTextColor(92, 90, 85);
      doc.setFont("helvetica", "bold");
      doc.text("Guniyo", M, H - 8.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        "|  guniyo.com  |  Preliminary estimate (thumb rules) - not a structural design",
        M + 15,
        H - 8.5,
      );
      doc.text(`Page ${i} of ${pages}`, W - M, H - 8.5, { align: "right" });
    }
  };

  const tableStyle = {
    theme: "grid" as const,
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2,
      lineColor: [210, 205, 196] as [number, number, number],
      lineWidth: 0.2,
      textColor: INK,
    },
    headStyles: {
      fillColor: INK,
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: "bold" as const,
    },
    alternateRowStyles: { fillColor: GROUND },
    margin: { left: M, right: M, top: 30 },
    didDrawPage: header,
  };

  header();
  let y = 34;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("House Construction Cost Estimate", M, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(92, 90, 85);
  const quality = input.quality[0].toUpperCase() + input.quality.slice(1);
  doc.text(
    `${inr(input.areaPerFloorSqft)} sqft per floor  x  ${input.floors} floor(s)  =  ${inr(v.totalSqft)} sqft built-up   |   ${quality} quality   |   RCC framed`,
    M,
    y,
  );

  // Headline box
  y += 6;
  doc.setFillColor(...INK);
  doc.roundedRect(M, y, W - 2 * M, 28, 2, 2, "F");
  doc.setTextColor(207, 203, 194);
  doc.setFontSize(8.5);
  doc.text("Total estimated cost", M + 6, y + 8);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(rs(v.total), M + 6, y + 19);
  doc.setFontSize(11);
  doc.setTextColor(...AMBER);
  doc.text(`${rs(v.ratePerSqft)} per sqft`, W - M - 6, y + 12, {
    align: "right",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(207, 203, 194);
  doc.text(`Likely range: ${rs(v.low)} - ${rs(v.high)}`, W - M - 6, y + 19, {
    align: "right",
  });
  doc.text(`Approx. time: ${v.months} months`, W - M - 6, y + 24, {
    align: "right",
  });
  y += 34;

  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["Material", "Thumb rule (per sqft)", "Quantity", "Rate", "Amount"]],
    body: v.materials.map((m) => [
      name(m.key, "en"),
      `${m.perSqft} ${m.unit}`,
      `${inr(round(m.qty))} ${m.unit}`,
      `Rs. ${inr(m.rate)}`,
      rs(m.amount),
    ]),
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });
  // @ts-expect-error lastAutoTable is added by the plugin
  y = doc.lastAutoTable.finalY + 6;

  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["#", "Stage", "Share", "Amount"]],
    body: v.phases.map((p, i) => [
      String(i + 1),
      name(p.key, "en"),
      `${p.pct}%`,
      rs(p.amount),
    ]),
    foot: [["", "Total", "100%", rs(v.total)]],
    footStyles: {
      fillColor: [252, 231, 178],
      textColor: INK,
      fontStyle: "bold",
    },
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" } },
  });
  // @ts-expect-error lastAutoTable is added by the plugin
  y = doc.lastAutoTable.finalY + 6;

  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["Cost split", "Share", "Amount"]],
    body: v.split.map((s) => [name(s.key, "en"), `${s.pct}%`, rs(s.amount)]),
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
  });
  // @ts-expect-error lastAutoTable is added by the plugin
  y = doc.lastAutoTable.finalY + 6;

  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["#", "Payment milestone", "Share", "Amount", "Cumulative"]],
    body: v.payments.map((p, i) => [
      String(i + 1),
      p.key === "slab"
        ? `${floorName(p.floor ?? 0, "en")} roof slab cast`
        : name(p.key, "en"),
      `${round(p.pct, 1)}%`,
      rs(p.amount),
      rs(p.cumulative),
    ]),
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });
  // @ts-expect-error lastAutoTable is added by the plugin
  y = doc.lastAutoTable.finalY + 8;

  if (y > H - 60) {
    doc.addPage();
    header();
    y = 34;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Assumptions and exclusions", M, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const notes = [
    "Area based (thumb rule) estimate for an RCC framed house; expected accuracy about +/-10%.",
    "Includes structure, masonry, plaster, flooring, doors and windows, electrical, plumbing, painting and waterproofing.",
    "Excludes land, approvals and fees, interiors, furniture, modular kitchen, compound wall, borewell and water tank.",
    "Material quantities by thumb rule per sqft of built-up area; actual quantities come from drawings and a detailed BOQ.",
    "Structural sizes and reinforcement must be designed and checked by a qualified structural engineer.",
  ];
  notes.forEach((n) => {
    const lines = doc.splitTextToSize(`-  ${n}`, W - 2 * M);
    doc.text(lines, M, y);
    y += lines.length * 4.2;
  });

  footer();
  doc.save(
    `Guniyo_House_Estimate_${inr(v.totalSqft).replace(/,/g, "")}sqft.pdf`,
  );
}
