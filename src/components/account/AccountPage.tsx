"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PLANS } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import { langPath, type Lang } from "@/lib/site";
import { alertBox, useAccount } from "./Account";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
type Row = {
  id: string;
  name: string;
  pro: boolean;
  updated_at: string;
  kind: string;
};
type Order = {
  id: string;
  status: string;
  created_at: string;
  details: Record<string, string>;
};

export function AccountView({ lang }: { lang: Lang }) {
  const a = useAccount();
  const sb = supabase();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [brand, setBrand] = useState("");

  useEffect(() => {
    if (!sb || !a.user) return;
    sb.from("projects")
      .select("id,name,pro,updated_at,kind")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setRows((data as Row[]) ?? []));
    sb.from("custom_orders")
      .select("id,status,created_at,details")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as Order[]) ?? []));
  }, [sb, a.user]);
  useEffect(() => setBrand(a.profile?.brand_name ?? ""), [a.profile]);

  if (!a.enabled)
    return (
      <p className="text-[15px]">
        {L(lang, "Accounts open very soon.", "अकाउंट बहुत जल्द शुरू होंगे।")}
      </p>
    );
  if (!a.ready) return <p className="text-[15px] text-muted">…</p>;
  if (!a.user)
    return (
      <div className="flex max-w-md flex-col gap-3 rounded-2xl border border-line bg-white p-5">
        <p className="text-[15px]">
          {L(
            lang,
            "Log in to see your projects and Pro plan.",
            "अपने प्रोजेक्ट और प्रो प्लान देखने के लिए लॉगिन करें।",
          )}
        </p>
        <button
          type="button"
          onClick={() => a.openLogin()}
          className="w-fit rounded-xl bg-ink px-5 py-3 text-[15px] font-semibold text-white"
        >
          {L(lang, "Log in", "लॉगिन")}
        </button>
      </div>
    );

  const until = a.profile?.pro_until ? new Date(a.profile.pro_until) : null;
  const card =
    "flex flex-col gap-3 rounded-2xl border border-line bg-white p-5";
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-[20px] font-bold">
            {L(lang, "My projects", "मेरे प्रोजेक्ट")}
          </h2>
          <Link
            href={langPath(lang, "house-boq-estimate")}
            className="text-[14px] font-semibold text-steel"
          >
            + {L(lang, "New estimate", "नया एस्टिमेट")}
          </Link>
        </div>
        {rows === null ? (
          <p className="text-muted">…</p>
        ) : rows.length === 0 ? (
          <p className="text-[14px] text-muted">
            {L(
              lang,
              "No saved projects yet. Make an estimate and press Save project.",
              "अभी कोई सेव प्रोजेक्ट नहीं। एस्टिमेट बनाकर 'प्रोजेक्ट सेव करें' दबाएं।",
            )}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <Link
                  href={`${langPath(lang, "house-boq-estimate")}?project=${r.id}`}
                  className="min-w-0 font-semibold hover:underline"
                >
                  {r.name}
                  {r.pro && (
                    <span className="ml-2 rounded bg-amber px-1.5 text-[11px] font-extrabold">
                      PRO
                    </span>
                  )}
                </Link>
                <span className="flex items-center gap-3 text-[13px] text-muted">
                  {new Date(r.updated_at).toLocaleDateString("en-IN")}
                  <button
                    type="button"
                    className="text-[#a8321f]"
                    onClick={async () => {
                      if (!sb) return;
                      const { error } = await sb
                        .from("projects")
                        .delete()
                        .eq("id", r.id);
                      if (error) alertBox(error.message);
                      else
                        setRows((x) => (x ?? []).filter((y) => y.id !== r.id));
                    }}
                  >
                    {L(lang, "Delete", "हटाएं")}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="flex flex-col gap-5">
        <section className={card}>
          <h2 className="font-display text-[20px] font-bold">
            {L(lang, "Plan", "प्लान")}
          </h2>
          {a.pro && until ? (
            <p className="text-[15px]">
              <span className="mr-2 rounded bg-amber px-1.5 text-[12px] font-extrabold">
                PRO
              </span>
              {L(
                lang,
                `active till ${until.toLocaleDateString("en-IN")}`,
                `${until.toLocaleDateString("en-IN")} तक चालू`,
              )}
            </p>
          ) : (
            <p className="text-[15px] text-body">
              {L(lang, "Free plan", "फ़्री प्लान")}
            </p>
          )}
          <button
            type="button"
            onClick={async () => {
              const ok = await a.buy("month").catch((e) => {
                alertBox(e instanceof Error ? e.message : "Payment failed");
                return false;
              });
              if (ok)
                alertBox(
                  L(
                    lang,
                    "Pro is on. Thank you!",
                    "प्रो चालू हो गया। धन्यवाद!",
                  ),
                );
            }}
            className="w-fit rounded-xl bg-ink px-4 py-2.5 text-[14px] font-semibold text-white"
          >
            {a.pro
              ? L(
                  lang,
                  `Extend 30 days · ₹${PLANS.month.inr}`,
                  `30 दिन बढ़ाएं · ₹${PLANS.month.inr}`,
                )
              : L(
                  lang,
                  `Get Pro · ₹${PLANS.month.inr}/month`,
                  `प्रो लें · ₹${PLANS.month.inr}/महीना`,
                )}
          </button>
          <Link
            href={langPath(lang, "pro")}
            className="text-[13px] font-semibold text-steel"
          >
            {L(lang, "What Pro includes →", "प्रो में क्या मिलता है →")}
          </Link>
        </section>
        <section className={card}>
          <h2 className="font-display text-[20px] font-bold">
            {L(lang, "Name on Pro reports", "प्रो रिपोर्ट पर नाम")}
          </h2>
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!sb || !a.user) return;
              const { error } = await sb
                .from("profiles")
                .update({ brand_name: brand.trim() })
                .eq("id", a.user.id);
              if (error) alertBox(error.message);
              else {
                await a.refresh();
                alertBox(L(lang, "Saved", "सेव हो गया"));
              }
            }}
          >
            <input
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-[15px]"
              placeholder={L(
                lang,
                "e.g. Sharma Construction, Indore",
                "जैसे शर्मा कंस्ट्रक्शन, इंदौर",
              )}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              maxLength={60}
            />
            <button className="rounded-lg bg-ink px-4 py-2 text-[14px] font-semibold text-white">
              {L(lang, "Save", "सेव")}
            </button>
          </form>
        </section>
        {orders.length > 0 && (
          <section className={card}>
            <h2 className="font-display text-[20px] font-bold">
              {L(lang, "Custom naksha orders", "कस्टम नक्शा ऑर्डर")}
            </h2>
            <ul className="flex flex-col gap-2 text-[14px]">
              {orders.map((o) => (
                <li key={o.id} className="flex justify-between gap-2">
                  <span>
                    {o.details?.size ?? ""} {o.details?.facing ?? ""}
                  </span>
                  <span className="font-semibold">
                    {o.status === "delivered"
                      ? L(lang, "Delivered", "भेज दिया")
                      : o.status === "in_progress"
                        ? L(lang, "In progress", "बन रहा है")
                        : L(lang, "Received", "मिल गया")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <button
          type="button"
          onClick={() => void a.signOut()}
          className="w-fit text-[14px] font-semibold text-muted underline"
        >
          {L(lang, "Log out", "लॉगआउट")}
        </button>
      </div>
    </div>
  );
}
