import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { type Naksha } from "./naksha";
import { plotSlug } from "./plots";

/**
 * The front-elevation picture of a design. A real photo or render dropped into public/elevations/ as
 * `<plot>.webp|jpg|png` (e.g. 30x40.webp, 25x50-shop.jpg) wins; otherwise the generated illustration is used.
 */
export function nakshaPreview(n: Naksha): { src: string; w: number; h: number; own: boolean } {
  const key = `${plotSlug(n.plot)}${n.kind === "shop" ? "-shop" : ""}`;
  for (const ext of ["webp", "jpg", "jpeg", "png"]) {
    const rel = `/elevations/${key}.${ext}`;
    if (existsSync(join(process.cwd(), "public", rel))) return { src: rel, w: 1200, h: 720, own: true };
  }
  return { src: `/naksha/elev/${n.slug}.webp`, w: 1200, h: 720, own: false };
}
