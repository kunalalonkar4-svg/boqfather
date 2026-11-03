import { PLANS, type PlanKey } from "@/lib/pricing";
import {
  adminDb,
  errorResponse,
  HttpError,
  requireUser,
} from "@/lib/server/admin";
import { createOrder } from "@/lib/server/razorpay";

/** Start a Razorpay payment for a plan: { plan, projectId? } → order for the checkout. */
export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const { plan, projectId } = (await req.json()) as {
      plan: PlanKey;
      projectId?: string;
    };
    const p = PLANS[plan];
    if (!p) throw new HttpError(400, "Unknown plan");
    if (plan === "project" && !projectId)
      throw new HttpError(400, "Save the project first");
    const db = adminDb();
    if (projectId) {
      const { data } = await db
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();
      if (!data) throw new HttpError(404, "Project not found");
    }
    const amount = p.inr * 100;
    const order = await createOrder(amount, `${plan}-${Date.now()}`, {
      user: user.id,
      plan,
      project: projectId ?? "",
    });
    await db.from("payments").insert({
      user_id: user.id,
      plan,
      amount,
      razorpay_order_id: order.id,
      project_id: projectId ?? null,
    });
    return Response.json({
      orderId: order.id,
      amount,
      key:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
      name: p.en,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
