import { createHmac, timingSafeEqual } from "node:crypto";

/** Razorpay checkout signature: HMAC-SHA256 of "order_id|payment_id" with the key secret. */
export function validSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): boolean {
  const want = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(want),
    b = Buffer.from(signature || "");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createOrder(
  amountPaise: number,
  receipt: string,
  notes: Record<string, string>,
) {
  const id = process.env.RAZORPAY_KEY_ID,
    secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new Error("Payments are not set up yet");
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      authorization:
        "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes,
    }),
  });
  const j = await r.json();
  if (!r.ok)
    throw new Error(j?.error?.description || "Could not start the payment");
  return j as { id: string; amount: number; currency: string };
}
