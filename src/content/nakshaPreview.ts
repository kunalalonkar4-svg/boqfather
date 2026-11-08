import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { type Naksha } from "./naksha";
import { elevationForDesign, elevationImage } from "./elevations";
import { plotSlug } from "./plots";

/**
 * The front-elevation picture of a design. A file dropped into public/elevations/ as `<plot>.webp|jpg|png`
 * (e.g. 30x40.webp, 25x50-shop.jpg) wins; then the matched gallery render; then the generated illustration.
 */
export function nakshaPreview(n: Naksha): { src: string; w: number; h: number; own: boolean } {
  const key = `${plotSlug(n.plot)}${n.kind === "shop" ? "-shop" : ""}`;
  for (const ext of ["webp", "jpg", "jpeg", "png"]) {
    const rel = `/elevations/${key}.${ext}`;
    if (existsSync(join(process.cwd(), "public", rel))) return { src: rel, w: 1200, h: 720, own: true };
  }
  const el = elevationForDesign(n);
  if (el) return { src: elevationImage(el), w: 1600, h: 900, own: true };
  return { src: `/naksha/elev/${n.slug}.webp`, w: 1200, h: 720, own: false };
}
