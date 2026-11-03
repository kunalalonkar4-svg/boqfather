/**
 * Download the drawn floor plans (the SVGs on the page) as one sheet: PNG image or A4/A3 PDF.
 * Runs in the browser only; nothing is uploaded.
 */
import { SITE_URL } from "./site";

const FONT = "Arial, Helvetica, sans-serif";

/** One SVG element → image of the given width (height keeps the drawing's proportions). */
async function svgToImage(svg: SVGSVGElement, width: number) {
  const vb = svg.viewBox.baseVal;
  const height = Math.round((width * vb.height) / vb.width);
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copy.setAttribute("width", String(width));
  copy.setAttribute("height", String(height));
  copy.setAttribute("font-family", FONT);
  copy.removeAttribute("class");
  const xml = new XMLSerializer().serializeToString(copy);
  const url = URL.createObjectURL(
    new Blob([xml], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((ok, bad) => {
      img.onload = () => ok();
      img.onerror = () => bad(new Error("Could not draw the plan"));
      img.src = url;
    });
    return { img, width, height };
  } finally {
    // keep the URL alive until drawn by the caller
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export interface SheetText {
  title: string;
  subtitle?: string;
  /** Captions under each floor, same order as the SVGs. */
  captions: string[];
  footer: string;
}

/** All floors side by side (two per row) on a white sheet with a title and footer. */
export async function planSheet(
  svgs: SVGSVGElement[],
  t: SheetText,
): Promise<HTMLCanvasElement> {
  const cols = Math.min(2, svgs.length);
  const cellW = 1100;
  const pad = 70;
  const imgs = await Promise.all(svgs.map((s) => svgToImage(s, cellW)));
  const rows = Math.ceil(imgs.length / cols);
  const rowH = Array.from({ length: rows }, (_, r) =>
    Math.max(...imgs.slice(r * cols, r * cols + cols).map((x) => x.height)),
  );
  const head = t.subtitle ? 170 : 130;
  const capH = 56;
  const W = pad * 2 + cols * cellW + (cols - 1) * pad;
  const H =
    head + rowH.reduce((a, b) => a + b + capH + 30, 0) + 110 /* footer */;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#16181a";
  g.font = `700 46px ${FONT}`;
  g.fillText(t.title, pad, 80);
  if (t.subtitle) {
    g.fillStyle = "#5b5850";
    g.font = `400 28px ${FONT}`;
    g.fillText(t.subtitle, pad, 128);
  }
  g.strokeStyle = "#e3ddd0";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(pad, head - 20);
  g.lineTo(W - pad, head - 20);
  g.stroke();
  let y = head;
  imgs.forEach((im, i) => {
    const col = i % cols;
    const r = Math.floor(i / cols);
    if (col === 0 && r > 0) y += rowH[r - 1] + capH + 30;
    const x = pad + col * (cellW + pad);
    g.fillStyle = "#16181a";
    g.font = `700 30px ${FONT}`;
    g.fillText(t.captions[i] ?? "", x, y + 34);
    g.drawImage(im.img, x, y + capH, im.width, im.height);
  });
  g.fillStyle = "#8a857c";
  g.font = `400 24px ${FONT}`;
  g.fillText(t.footer, pad, H - 60);
  g.fillStyle = "#b07a12";
  g.font = `700 26px ${FONT}`;
  const site = `BOQFather · ${SITE_URL.replace("https://", "")}`;
  g.fillText(site, W - pad - g.measureText(site).width, H - 60);
  return c;
}

function save(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

export async function downloadPlanPng(
  svgs: SVGSVGElement[],
  t: SheetText,
  name: string,
) {
  const c = await planSheet(svgs, t);
  const blob = await new Promise<Blob | null>((ok) =>
    c.toBlob(ok, "image/png"),
  );
  if (!blob) throw new Error("Could not make the image");
  save(blob, `${name}.png`);
}

export async function downloadPlanPdf(
  svgs: SVGSVGElement[],
  t: SheetText,
  name: string,
) {
  const c = await planSheet(svgs, t);
  const { jsPDF } = await import("jspdf");
  const landscape = c.width > c.height;
  // A3 keeps a G+1 sheet readable when printed; fits the sheet inside the page margins
  const pdf = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a3",
  });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const m = 10;
  const k = Math.min((pw - 2 * m) / c.width, (ph - 2 * m) / c.height);
  const w = c.width * k,
    h = c.height * k;
  pdf.addImage(
    c.toDataURL("image/jpeg", 0.92),
    "JPEG",
    (pw - w) / 2,
    (ph - h) / 2,
    w,
    h,
  );
  pdf.save(`${name}.pdf`);
}
