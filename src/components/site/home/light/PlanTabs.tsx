"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lang } from "@/lib/site";

export interface TabPlan {
  href: string;
  title: string;
  sub: string;
  cost: string;
  img3d: string;
  img2d: string;
}

/** "See plans by type": tabs (2 BHK, 3 BHK, East facing…) with one large picture and a strip of more. */
export function PlanTabs({
  lang,
  tabs,
  allHref,
}: {
  lang: Lang;
  tabs: { key: string; label: string; plans: TabPlan[] }[];
  allHref: string;
}) {
  const [t, setT] = useState(0);
  const [i, setI] = useState(0);
  const [two, setTwo] = useState(false);
  const plans = tabs[t]?.plans ?? [];
  const p = plans[Math.min(i, plans.length - 1)];
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);
  if (!p) return null;
  return (
    <div className="flex flex-col gap-6">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0" role="tablist">
        {tabs.map((x, k) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            aria-selected={k === t}
            onClick={() => {
              setT(k);
              setI(0);
            }}
            className={`shrink-0 rounded-full border px-4 py-2 text-[15px] font-semibold transition ${
              k === t ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="relative min-w-0 overflow-hidden rounded-[28px] border border-line bg-[#eef3f9]">
          <img
            key={p.href + (two ? "2" : "3")}
            src={two ? p.img2d : p.img3d}
            alt={p.title}
            className={`stage-in aspect-[16/10] w-full ${two ? "bg-white object-contain p-3" : "object-cover"}`}
            loading="lazy"
          />
          <div className="absolute left-4 top-4 flex rounded-full bg-white/95 p-1 text-[13px] font-bold shadow">
            {(["Front", "Plan"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTwo(m === "Plan")}
                className={`rounded-full px-3.5 py-1 ${(m === "Plan") === two ? "bg-ink text-white" : "text-ink"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-[24px] border border-line bg-white p-6">
            <h3 className="font-display text-[24px] font-extrabold leading-tight">{p.title}</h3>
            <p className="mt-2 text-[15px] text-body">{p.sub}</p>
            <p className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-muted">
              {L("Full construction cost", "बनाने का पूरा खर्च")}
            </p>
            <p className="font-display text-[30px] font-extrabold">{p.cost}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={p.href} className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-[14px] font-bold text-white">
                {L("Open plan & BOQ →", "नक्शा और BOQ खोलें →")}
              </Link>
              <Link href={allHref} className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[14px] font-bold hover:border-ink">
                {L("All plans", "सभी नक्शे")}
              </Link>
            </div>
          </div>
          <ul className="grid grid-cols-3 gap-2">
            {plans.slice(0, 6).map((x, k) => (
              <li key={x.href}>
                <button
                  type="button"
                  onClick={() => setI(k)}
                  className={`w-full overflow-hidden rounded-xl border-2 transition ${k === i ? "border-ink" : "border-transparent hover:border-line"}`}
                >
                  <img src={x.img3d} alt={x.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
