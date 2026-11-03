"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lang } from "@/lib/site";
import { Reveal } from "../Motion";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

export interface PlanCard {
  slug: string;
  href: string;
  size: string;
  facing: "E" | "N" | "W" | "S";
  facingLabel: string;
  bhk: number;
  shop: boolean;
  cost: string;
  img2d: string;
  img3d: string;
  title: string;
}

/** Section 7: the naksha library as a filterable, swipeable gallery with 3D and 2D previews. */
export function PlansGallery({
  lang,
  plans,
  allHref,
  boqHref,
}: {
  lang: Lang;
  plans: PlanCard[];
  allHref: string;
  boqHref: string;
}) {
  const [facing, setFacing] = useState<"" | PlanCard["facing"]>("");
  const [bhk, setBhk] = useState(0);
  const [flat, setFlat] = useState<Record<string, boolean>>({});
  const shown = plans.filter((p) => (!facing || p.facing === facing) && (!bhk || p.bhk === bhk)).slice(0, 18);
  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-[14px] font-bold transition ${on ? "border-amber bg-amber text-white" : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"}`;
  const bhks = [...new Set(plans.map((p) => p.bhk))].sort();

  return (
    <section className="relative overflow-hidden bg-[#0b0e14] py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-amber">
                {L(lang, "07 — House plans", "07 — घर के नक्शे")}
              </p>
              <h2 className="font-display mt-3 max-w-3xl text-[28px] font-black uppercase leading-[0.95] tracking-tight sm:text-[40px]">
                {L(lang, `${plans.length} plans. Every one priced.`, `${plans.length} नक्शे। हर एक का खर्च।`)}
              </h2>
            </div>
            <Link href={allHref} className="text-[15px] font-bold text-white/80 underline decoration-amber decoration-2 underline-offset-4 hover:text-white">
              {L(lang, "All house plans →", "सभी नक्शे →")}
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 flex flex-wrap gap-2">
          {(["", "E", "N", "W", "S"] as const).map((f) => (
            <button key={f || "all"} type="button" className={chip(facing === f)} onClick={() => setFacing(f)}>
              {f === ""
                ? L(lang, "All facings", "सभी दिशा")
                : { E: L(lang, "East", "पूर्व"), N: L(lang, "North", "उत्तर"), W: L(lang, "West", "पश्चिम"), S: L(lang, "South", "दक्षिण") }[f]}
            </button>
          ))}
          <span className="mx-1 hidden w-px bg-white/15 sm:block" />
          {[0, ...bhks].map((b) => (
            <button key={b} type="button" className={chip(bhk === b)} onClick={() => setBhk(b)}>
              {b ? `${b} BHK` : L(lang, "Any BHK", "कोई भी BHK")}
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 sm:px-8 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {shown.map((p) => {
          const two = !!flat[p.slug];
          return (
            <li key={p.slug} className="w-[82vw] max-w-[400px] shrink-0 snap-start">
              <div className="group overflow-hidden rounded-3xl border border-night-line bg-night-2 transition hover:border-white/25">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#eef0ec]">
                  <img
                    src={p.img3d}
                    alt={p.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full scale-[1.3] object-cover transition duration-700 group-hover:scale-[1.38]"
                    style={{ opacity: two ? 0 : 1 }}
                  />
                  <img
                    src={p.img2d}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full bg-white object-contain p-2 transition-opacity duration-500"
                    style={{ opacity: two ? 1 : 0 }}
                  />
                  <div className="absolute left-3 top-3 flex rounded-full bg-night/80 p-1 text-[12px] font-bold backdrop-blur">
                    {(["3D", "2D"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFlat((x) => ({ ...x, [p.slug]: m === "2D" }))}
                        className={`rounded-full px-3 py-1 ${(m === "2D") === two ? "bg-amber text-white" : "text-white/70"}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  {p.shop && (
                    <span className="absolute right-3 top-3 rounded-full bg-night/80 px-2.5 py-1 text-[11px] font-bold text-amber">
                      {L(lang, "with shop", "दुकान सहित")}
                    </span>
                  )}
                </div>
                <Link href={p.href} className="flex items-end justify-between gap-3 p-5">
                  <span>
                    <span className="font-display block text-[26px] font-black leading-none">
                      {p.size}
                    </span>
                    <span className="mt-1.5 block text-[13px] text-white/55">
                      {p.facingLabel} · {p.bhk} BHK · G+1
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-white/45">{L(lang, "Cost", "खर्च")}</span>
                    <span className="font-display block text-[18px] font-extrabold text-amber">{p.cost}</span>
                  </span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mx-auto mt-4 max-w-7xl px-5 text-[13px] text-white/45 sm:px-8">
        {L(lang, "Ready plans are G+1. For G+2 or G+3, set the floors in the ", "तैयार नक्शे G+1 हैं। G+2 या G+3 के लिए मंज़िलें ")}
        <Link href={boqHref} className="font-semibold text-white/80 underline decoration-amber underline-offset-2">
          {L(lang, "BOQ tool", "BOQ टूल")}
        </Link>
        {L(lang, " — the plan and estimate are made for you.", " में चुनें — नक्शा और एस्टिमेट आपके लिए बन जाएगा।")}
      </p>
    </section>
  );
}
