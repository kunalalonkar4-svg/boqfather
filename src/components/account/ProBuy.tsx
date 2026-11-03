"use client";

import { PLANS } from "@/lib/pricing";
import type { Lang } from "@/lib/site";
import { alertBox, useAccount } from "./Account";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

export function ProBuy({ lang }: { lang: Lang }) {
  const a = useAccount();
  if (!a.payReady)
    return (
      <p className="text-[14px] font-semibold text-amber-dark">
        {L(lang, "Pro opens very soon.", "प्रो बहुत जल्द शुरू होगा।")}
      </p>
    );
  if (a.pro)
    return (
      <p className="text-[15px] font-semibold text-[#1d7a46]">
        ✓ {L(lang, "You are on Pro.", "आप प्रो पर हैं।")}
      </p>
    );
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await a.buy("month").catch((e) => {
          alertBox(e instanceof Error ? e.message : "Payment failed");
          return false;
        });
        if (ok)
          alertBox(
            L(lang, "Pro is on. Thank you!", "प्रो चालू हो गया। धन्यवाद!"),
          );
      }}
      className="w-fit rounded-xl bg-ink px-5 py-3 text-[15px] font-semibold text-white"
    >
      {L(
        lang,
        `Get Pro · ₹${PLANS.month.inr}/month`,
        `प्रो लें · ₹${PLANS.month.inr}/महीना`,
      )}
    </button>
  );
}
