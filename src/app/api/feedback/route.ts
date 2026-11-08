import { adminDb, errorResponse, HttpError } from "@/lib/server/admin";

export const dynamic = "force-dynamic";

const KINDS = ["feedback", "error", "review", "idea"] as const;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Feedback and reviews. Stored for the owner to read; never shown on the site. Replies "ok" only after the row is saved. */
export async function POST(req: Request) {
  try {
    const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!b || str(b.website, 50) !== "") throw new HttpError(400, "Invalid request");
    const message = str(b.message, 2000);
    if (message.length < 5) throw new HttpError(400, "Please write a few words");
    const kind = KINDS.find((k) => k === b.kind) ?? "feedback";
    const rating = typeof b.rating === "number" && Number.isInteger(b.rating) && b.rating >= 1 && b.rating <= 5 ? b.rating : null;
    const page = str(b.page, 300);
    const row = {
      kind,
      rating,
      message,
      name: str(b.name, 100) || null,
      contact: str(b.contact, 200) || null,
      page: page || null,
      lang: b.lang === "hi" ? "hi" : "en",
    };
    const { data, error } = await adminDb().from("site_feedback").insert(row).select("id").single();
    if (error || !data) throw error ?? new Error("Not saved");
    return Response.json({ status: "ok" });
  } catch (e) {
    return errorResponse(e);
  }
}
