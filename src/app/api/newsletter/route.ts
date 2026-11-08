import { adminDb, errorResponse, HttpError } from "@/lib/server/admin";
import { cleanEmail } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

/**
 * Newsletter sign-up. Off until NEXT_PUBLIC_NEWSLETTER_READY=1 (and the table in supabase/schema.sql exists).
 * Replies "subscribed" or "already" only after the row is confirmed saved.
 */
export async function POST(req: Request) {
  try {
    if (process.env.NEXT_PUBLIC_NEWSLETTER_READY !== "1") throw new HttpError(503, "Sign-up is not open yet");
    const body = (await req.json().catch(() => null)) as { email?: unknown; consent?: unknown; website?: unknown } | null;
    if (!body || (typeof body.website === "string" && body.website.trim() !== "")) throw new HttpError(400, "Invalid request");
    const email = cleanEmail(body.email);
    if (!email) throw new HttpError(400, "Enter a valid email address");
    if (body.consent !== true) throw new HttpError(400, "Please tick the consent box");

    const db = adminDb();
    const { data: found, error: e1 } = await db.from("newsletter_subscribers").select("id,status").eq("email", email).maybeSingle();
    if (e1) throw e1;
    if (found?.status === "active") return Response.json({ status: "already" });
    if (found) {
      const { data, error } = await db
        .from("newsletter_subscribers")
        .update({ status: "active", consent_at: new Date().toISOString(), unsubscribed_at: null })
        .eq("id", found.id)
        .select("id")
        .single();
      if (error || !data) throw error ?? new Error("Not saved");
      return Response.json({ status: "subscribed" });
    }
    const { data, error } = await db
      .from("newsletter_subscribers")
      .insert({ email, source: "home", consent_at: new Date().toISOString() })
      .select("id")
      .single();
    if (error?.code === "23505") return Response.json({ status: "already" });
    if (error || !data) throw error ?? new Error("Not saved");
    return Response.json({ status: "subscribed" });
  } catch (e) {
    return errorResponse(e);
  }
}
