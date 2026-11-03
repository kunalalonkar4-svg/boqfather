/**
 * Shapes shared by the plan readers (DXF on the device, photo / PDF via AI) and the review screen.
 * Sizes are in feet.
 */
import { ROOM_DEFS, type RoomType } from "@/engine";

export interface ReadRoom {
  type: RoomType;
  name: string;
  L: number;
  B: number;
}
export interface ReadPlan {
  floors: ReadRoom[][];
  plot?: { width: number; depth: number };
  facing?: "N" | "E" | "S" | "W";
  notes?: string;
}

const WORDS: [RegExp, RoomType][] = [
  [/master|bed|b\.?r\b|शयन|बेड/i, "bedroom"],
  [/kitchen|kit\b|किचन|रसोई/i, "kitchen"],
  [/dining|डाइनिंग/i, "dining"],
  [/toilet|bath|w\.?c\b|wash ?room|टॉयलेट|बाथ|शौचालय/i, "toilet"],
  [/living|drawing|hall|lounge|family|हॉल|ड्रॉइंग/i, "hall"],
  [/pooja|puja|mandir|पूजा/i, "pooja"],
  [/store|स्टोर/i, "store"],
  [/utility|wash\b|यूटिलिटी/i, "utility"],
  [/study|office|स्टडी/i, "study"],
  [/parking|car|garage|पार्किंग/i, "parking"],
  [/balcony|बालकनी/i, "balcony"],
  [/passage|lobby|corridor|पैसेज|लॉबी/i, "passage"],
  [/shop|दुकान/i, "shop"],
];

/** Room type from a label or from a type word the reader gave; null when it is not a room we estimate. */
export function roomTypeOf(label: string): RoomType | null {
  const s = String(label || "");
  if (s in ROOM_DEFS) return s as RoomType;
  for (const [re, t] of WORDS) if (re.test(s)) return t;
  return null;
}

/** Keeps sane rooms only (1.5–60 ft a side), drops empty floors, max 4 floors. */
export function cleanPlan(p: ReadPlan): ReadPlan {
  const ok = (x: number) => Number.isFinite(x) && x >= 1.5 && x <= 60;
  const floors = (p.floors ?? [])
    .map((f) =>
      (f ?? [])
        .map((r) => ({
          ...r,
          L: Math.round(Number(r.L) * 10) / 10,
          B: Math.round(Number(r.B) * 10) / 10,
        }))
        .filter((r) => r.type in ROOM_DEFS && ok(r.L) && ok(r.B)),
    )
    .filter((f) => f.length)
    .slice(0, 4);
  return { ...p, floors };
}
