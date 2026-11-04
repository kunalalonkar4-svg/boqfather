import "server-only";
import { type Naksha, nakshaImage } from "./naksha";

/** Image metadata for the 2D plan used in the Naksha catalogue. */
export function nakshaPreview(n: Naksha): { src: string; w: number; h: number } {
  return { src: nakshaImage(n), w: 2200, h: 1500 };
}
