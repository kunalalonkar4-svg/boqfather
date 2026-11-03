import {
  errorResponse,
  HttpError,
  isPro,
  requireUser,
} from "@/lib/server/admin";
import { askClaudeJson, checkUpload, countRead } from "@/lib/server/claude";
import {
  cleanPlan,
  roomTypeOf,
  type ReadPlan,
  type ReadRoom,
} from "@/lib/planRead";

export const maxDuration = 60;

const PROMPT = `This is an Indian house floor plan (drawing, photo or PDF). Read every room on every floor.
Return ONLY JSON, no other text:
{"floors":[[{"name":"Bedroom 1","type":"bedroom","length_ft":12,"width_ft":11}]],"plot":{"width_ft":30,"depth_ft":50},"facing":"E","notes":""}
Rules:
- One array per floor, ground floor first. Floor titles like "GROUND FLOOR", "FIRST FLOOR" separate floors.
- type is one of: bedroom, hall, kitchen, dining, toilet, pooja, store, utility, study, parking, balcony, passage, shop.
  Living / drawing room = hall. Bath / WC = toilet. Car porch = parking.
- Sizes in feet as decimal numbers. Convert 12'6" to 12.5. If written in metres, convert to feet. Read the size written inside the room; if none, estimate from the drawing scale.
- Leave out staircase, lift, shafts, setbacks and outside areas.
- plot and facing only if written on the drawing; facing is the road side: N, E, S or W.
- notes: anything unclear, in one short sentence.`;

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = (await req.json()) as {
      file?: { mime?: string; base64?: string };
      projectId?: string;
    };
    if (!(await isPro(user.id, body.projectId, user.email)))
      throw new HttpError(402, "Reading plan photos is a Pro feature");
    const file = checkUpload(body.file);
    await countRead(user.id);
    const raw = (await askClaudeJson(file, PROMPT)) as {
      floors?: {
        name?: string;
        type?: string;
        length_ft?: number;
        width_ft?: number;
      }[][];
      plot?: { width_ft?: number; depth_ft?: number };
      facing?: string;
      notes?: string;
    };
    const plan: ReadPlan = cleanPlan({
      floors: (raw.floors ?? []).map((f) =>
        (f ?? [])
          .map((r): ReadRoom | null => {
            const type = roomTypeOf(r.type ?? "") ?? roomTypeOf(r.name ?? "");
            return type
              ? {
                  type,
                  name: r.name ?? type,
                  L: Number(r.length_ft),
                  B: Number(r.width_ft),
                }
              : null;
          })
          .filter((x): x is ReadRoom => !!x),
      ),
      plot:
        raw.plot?.width_ft && raw.plot?.depth_ft
          ? {
              width: Number(raw.plot.width_ft),
              depth: Number(raw.plot.depth_ft),
            }
          : undefined,
      facing: ["N", "E", "S", "W"].includes(String(raw.facing))
        ? (raw.facing as ReadPlan["facing"])
        : undefined,
      notes:
        typeof raw.notes === "string" ? raw.notes.slice(0, 300) : undefined,
    });
    if (!plan.floors.length)
      throw new HttpError(
        422,
        "No rooms found — try a clearer photo or the DXF file",
      );
    return Response.json(plan);
  } catch (e) {
    return errorResponse(e);
  }
}
