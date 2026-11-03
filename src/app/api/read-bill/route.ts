import { BOQ_RATES, type RateKey } from "@/engine";
import { RATE_INFO } from "@/lib/boqExport";
import {
  errorResponse,
  HttpError,
  isPro,
  requireUser,
} from "@/lib/server/admin";
import { askClaudeJson, checkUpload, countRead } from "@/lib/server/claude";

export const maxDuration = 60;

const KEYS = (Object.keys(BOQ_RATES) as RateKey[])
  .map((k) => `${k}: ${RATE_INFO[k][0]} (per ${RATE_INFO[k][1]})`)
  .join("\n");

const PROMPT = `This is a contractor's bill, quotation or running bill for house construction in India.
Read every line item. Return ONLY JSON, no other text:
{"items":[{"desc":"PCC 1:4:8 in foundation","qty":3.2,"unit":"m3","rate":5200,"amount":16640,"key":"pcc"}],"total":0}
Rules:
- qty, rate and amount as numbers (no commas). Leave a field null if it is not written.
- unit as written (m3, cum, m2, sqm, sqft, rmt, kg, nos, ls...).
- key: the closest item from this list, or null if none fits:
${KEYS}
- total: the bill total if written, else null.`;

export interface BillLine {
  desc: string;
  qty: number | null;
  unit: string;
  rate: number | null;
  amount: number | null;
  key: RateKey | null;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = (await req.json()) as {
      file?: { mime?: string; base64?: string };
    };
    if (!(await isPro(user.id, undefined, user.email)))
      throw new HttpError(402, "Reading bills is a Pro feature");
    const file = checkUpload(body.file);
    await countRead(user.id);
    const raw = (await askClaudeJson(file, PROMPT)) as {
      items?: Partial<BillLine>[];
      total?: number | null;
    };
    const num = (x: unknown) =>
      x === null || x === undefined || x === "" || !Number.isFinite(Number(x))
        ? null
        : Number(x);
    const items: BillLine[] = (raw.items ?? []).slice(0, 200).map((r) => ({
      desc: String(r.desc ?? "").slice(0, 200),
      qty: num(r.qty),
      unit: String(r.unit ?? "").slice(0, 12),
      rate: num(r.rate),
      amount: num(r.amount),
      key: r.key && r.key in BOQ_RATES ? (r.key as RateKey) : null,
    }));
    if (!items.length)
      throw new HttpError(422, "No items found — try a clearer photo");
    return Response.json({ items, total: num(raw.total) });
  } catch (e) {
    return errorResponse(e);
  }
}
