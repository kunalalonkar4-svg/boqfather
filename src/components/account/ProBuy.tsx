"use client";

import { PLANS } from "@/lib/pricing";
import Link from "next/link";
import { langPath, type Lang } from "@/lib/site";
import { alertBox, useAccount } from "./Account";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

/** Where each Pro tool lives on the site. */
function TryLinks({ lang }: { lang: Lang }) {
  const c =
    "rounded-lg border border-ink bg-white px-4 py-2.5 text-[14px] font-semibold hover:bg-ink hover:text-white";
  return (
    <div className="flex flex-wrap gap-2">
      <Link className={c} href={langPath(lang, "plan-to-estimate")}>
        📄 {L(lang, "Upload plan → estimate", "नक्शा अपलोड → एस्टिमेट")}
      </Link>
      <Link className={c} href={`${langPath(lang, "contractor-quote-checker")}#bill-check`}>
        🧾 {L(lang, "Check a contractor bill", "ठेकेदार का बिल जांचें")}
      </Link>
      <Link className={c} href={langPath(lang, "naksha")}>
        📐 {L(lang, "Custom naksha", "कस्टम नक्शा")}
      </Link>
    </div>
  );
}

export function ProBuy({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-4">
      <TryLinks lang={lang} />
      <ProBuyInner lang={lang} />
    </div>
  );
}

function ProBuyInner({ lang }: { lang: Lang }) {
  const a = useAccount();
  if (!a.payReady)
    return (
      <p className="text-[14px] font-semibold text-amber-dark">
        {L(
          lang,
          "Payments open very soon. Until then a DXF (AutoCAD) plan can be uploaded free; photo / PDF reading and the bill checker start with Pro.",
          "पेमेंट बहुत जल्द शुरू होगा। तब तक DXF (AutoCAD) नक्शा फ़्री अपलोड कर सकते हैं; फ़ोटो / PDF पढ़ना और बिल चेकर प्रो के साथ शुरू होंगे।",
        )}
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
