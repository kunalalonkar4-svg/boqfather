import { PLANS, type PlanKey } from "@/lib/pricing";
import {
  adminDb,
  errorResponse,
  HttpError,
  requireUser,
} from "@/lib/server/admin";
import { validSignature } from "@/lib/server/razorpay";

/** Confirm a finished Razorpay checkout and switch on what was bought. */
export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const b = (await req.json()) as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      details?: Record<string, unknown>;
    };
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new HttpError(503, "Payments are not set up yet");
    if (
      !validSignature(
        b.razorpay_order_id,
        b.razorpay_payment_id,
        b.razorpay_signature,
        secret,
      )
    )
      throw new HttpError(400, "Payment could not be verified");
    const db = adminDb();
    const { data: pay } = await db
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", b.razorpay_order_id)
      .eq("user_id", user.id)
      .single();
    if (!pay) throw new HttpError(404, "Payment not found");
    if (pay.status !== "paid") {
      await db
        .from("payments")
        .update({ status: "paid", razorpay_payment_id: b.razorpay_payment_id })
        .eq("id", pay.id);
      const plan = pay.plan as PlanKey;
      if (plan === "month") {
        const { data: prof } = await db
          .from("profiles")
          .select("pro_until")
          .eq("id", user.id)
          .single();
        const from =
          prof?.pro_until && new Date(prof.pro_until) > new Date()
            ? new Date(prof.pro_until)
            : new Date();
        from.setDate(from.getDate() + PLANS.month.days);
        await db
          .from("profiles")
          .update({ pro_until: from.toISOString() })
          .eq("id", user.id);
      } else if (plan === "project" && pay.project_id) {
        await db
          .from("projects")
          .update({ pro: true })
          .eq("id", pay.project_id)
          .eq("user_id", user.id);
      } else if (plan === "custom") {
        await db.from("custom_orders").insert({
          user_id: user.id,
          details: b.details ?? {},
          payment_id: pay.id,
        });
      }
    }
    return Response.json({ ok: true, plan: pay.plan });
  } catch (e) {
    return errorResponse(e);
  }
}
