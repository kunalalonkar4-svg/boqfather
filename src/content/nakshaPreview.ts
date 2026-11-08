import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { type Naksha, nakshaImage, nakshaImage3d } from "./naksha";

/** The 3D preview if it has been made (scripts/naksha-3d-images.mjs), else the 2D plan image. */
export function nakshaPreview(n: Naksha): { src: string; w: number; h: number; is3d: boolean } {
  const p = nakshaImage3d(n);
  return existsSync(join(process.cwd(), "public", p))
    ? { src: p, w: 1200, h: 761, is3d: true }
    : { src: nakshaImage(n), w: 1054, h: 911, is3d: false };
}
