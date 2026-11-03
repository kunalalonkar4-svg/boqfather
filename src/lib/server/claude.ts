import "server-only";
import { AI_DAILY_LIMIT } from "@/lib/pricing";
import { adminDb, HttpError } from "./admin";

/** Reads an uploaded image / PDF with Claude and returns the JSON it was asked for. */
export async function askClaudeJson(
  file: { mime: string; base64: string },
  prompt: string,
): Promise<unknown> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new HttpError(503, "Reading uploads is not set up yet");
  const media =
    file.mime === "application/pdf"
      ? {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: file.base64,
          },
        }
      : {
          type: "image",
          source: { type: "base64", media_type: file.mime, data: file.base64 },
        };
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
      max_tokens: 4000,
      messages: [
        { role: "user", content: [media, { type: "text", text: prompt }] },
      ],
    }),
  });
  const j = await r.json();
  if (!r.ok)
    throw new HttpError(502, j?.error?.message || "Could not read the file");
  const text: string = (j.content ?? [])
    .map((c: { text?: string }) => c.text ?? "")
    .join("");
  return extractJson(text);
}

/** The first JSON object in a reply (the model may wrap it in a code fence). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{"),
    end = body.lastIndexOf("}");
  if (start < 0 || end < start)
    throw new HttpError(
      422,
      "Could not understand the file — try a clearer photo",
    );
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    throw new HttpError(
      422,
      "Could not understand the file — try a clearer photo",
    );
  }
}

const OK_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
/** Checks an upload sent as { mime, base64 } (max 8 MB). */
export function checkUpload(f: { mime?: string; base64?: string } | undefined) {
  if (!f?.mime || !f.base64) throw new HttpError(400, "No file");
  if (!OK_TYPES.includes(f.mime))
    throw new HttpError(400, "Upload a photo (JPG / PNG) or a PDF");
  if (f.base64.length > 8 * 1024 * 1024 * 1.37)
    throw new HttpError(413, "File is too big (max 8 MB)");
  return f as { mime: string; base64: string };
}

/** Counts one AI read for the user today; refuses past the daily limit. */
export async function countRead(userId: string) {
  const db = adminDb();
  const day = new Date().toISOString().slice(0, 10);
  const { data } = await db
    .from("ai_usage")
    .select("reads")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();
  const n = data?.reads ?? 0;
  if (n >= AI_DAILY_LIMIT)
    throw new HttpError(
      429,
      `Daily limit of ${AI_DAILY_LIMIT} reads reached — try tomorrow`,
    );
  await db.from("ai_usage").upsert({ user_id: userId, day, reads: n + 1 });
}
