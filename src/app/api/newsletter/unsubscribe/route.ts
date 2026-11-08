import { adminDb } from "@/lib/server/admin";

export const dynamic = "force-dynamic";

const page = (msg: string, status = 200) =>
  new Response(`<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width"><title>BOQFather</title><body style="font-family:system-ui;max-width:32rem;margin:15vh auto;padding:0 1rem"><h1 style="font-size:1.4rem">${msg}</h1><p><a href="/">Back to BOQFather</a></p>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });

/** Link placed in every newsletter email: /api/newsletter/unsubscribe/?t=<token>. */
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(t)) return page("This unsubscribe link is not valid.", 400);
  if (process.env.NEXT_PUBLIC_NEWSLETTER_READY !== "1") return page("Newsletter is not active.", 503);
  try {
    const { data, error } = await adminDb()
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("token", t)
      .select("id");
    if (error) throw error;
    if (!data?.length) return page("This unsubscribe link is not valid.", 404);
    return page("You are unsubscribed. You will not get more emails.");
  } catch {
    return page("Something went wrong. Please try again.", 500);
  }
}
