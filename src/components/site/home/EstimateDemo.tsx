"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/site";
import { CountUp } from "./Motion";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

export interface DemoLine {
  label: string;
  value: string;
  share: number; // 0..1, bar length
}

/**
 * Hero preview of the estimate: the plot is typed, then the total counts up and the
 * cost heads and materials fill in — on a loop. Numbers are the real ones for this house.
 */
export function EstimateDemo({
  lang,
  w,
  d,
  floors,
  total,
  perSqft,
  builtUp,
  heads,
  materials,
  img3d,
}: {
  lang: Lang;
  w: number;
  d: number;
  floors: string;
  total: number;
  perSqft: number;
  builtUp: number;
  heads: DemoLine[];
  materials: { label: string; value: string }[];
  img3d: string;
}) {
  const typed = `${w} × ${d}`;
  const [n, setN] = useState(typed.length);
  const [loop, setLoop] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setN(i);
      if (i >= typed.length) clearInterval(id);
    }, 140);
    const next = setTimeout(() => setLoop((x) => x + 1), 10000);
    return () => {
      clearInterval(id);
      clearTimeout(next);
    };
  }, [loop, typed.length]);
  const done = n >= typed.length;

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div
        aria-hidden="true"
        className="absolute -right-6 -top-8 h-64 w-64 rounded-full bg-amber/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-10 -left-8 h-56 w-56 rounded-full bg-steel/15 blur-3xl"
      />
      <div className="hero-float relative overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_30px_80px_-20px_rgba(22,24,26,0.35)]">
        {/* inputs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-[#f7fafe] px-4 py-3 text-[13px]">
          <span className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 font-semibold">
            <span className="text-muted">{L(lang, "Plot", "प्लॉट")}</span>
            <span className="font-display min-w-[56px] text-[15px] font-extrabold">
              {typed.slice(0, n)}
              {!done && <span className="caret">|</span>}
            </span>
            <span className="text-muted">ft</span>
          </span>
          <span className="rounded-lg border border-line bg-white px-2.5 py-1.5 font-semibold">
            {floors}
          </span>
          <span className="rounded-lg border border-line bg-white px-2.5 py-1.5 font-semibold">
            {L(lang, "Standard", "स्टैंडर्ड")}
          </span>
          <span
            className={`ml-auto rounded-lg px-3 py-1.5 font-bold transition-colors duration-500 ${done ? "bg-amber text-white" : "bg-[#e3eaf2] text-muted"}`}
          >
            {L(lang, "Estimate →", "एस्टिमेट →")}
          </span>
        </div>
        {/* result */}
        <div key={loop} className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted">
                {L(lang, "Total cost · item-wise BOQ", "कुल खर्च · आइटम-वार BOQ")}
              </div>
              <div className="font-display text-[40px] font-extrabold leading-none tracking-tight sm:text-[46px]">
                {done ? (
                  <>
                    ₹<CountUp to={Math.round(total)} ms={1300} />
                  </>
                ) : (
                  <span className="text-[#d9d3c7]">₹ —</span>
                )}
              </div>
            </div>
            <div className="text-right text-[13px] font-semibold text-muted">
              <div>
                ₹{Math.round(perSqft).toLocaleString("en-IN")} / sq ft
              </div>
              <div>
                {Math.round(builtUp).toLocaleString("en-IN")} sq ft
              </div>
            </div>
          </div>
          <ul className="flex flex-col gap-2.5">
            {heads.map((h, i) => (
              <li key={h.label} className="flex flex-col gap-1">
                <span className="flex justify-between gap-3 text-[13px]">
                  <span className="truncate text-body">{h.label}</span>
                  <span className="font-semibold tabular-nums">{h.value}</span>
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-[#eaf3ff]">
                  <span
                    className="block h-full rounded-full bg-amber transition-[width] duration-1000 ease-out"
                    style={{
                      width: done ? `${h.share * 100}%` : "0%",
                      transitionDelay: `${300 + i * 150}ms`,
                    }}
                  />
                </span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-3 gap-2">
            {materials.map((m, i) => (
              <div
                key={m.label}
                className={`rounded-xl bg-[#f7fafe] px-3 py-2.5 transition duration-500 ${done ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                style={{ transitionDelay: `${900 + i * 120}ms` }}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {m.label}
                </div>
                <div className="font-display text-[16px] font-extrabold">
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* the plan comes with it, in 3D */}
      {done && (
        <div
          key={`p${loop}`}
          className="chip-in absolute -bottom-10 -left-4 w-[46%] overflow-hidden rounded-2xl border border-line bg-white shadow-xl sm:-left-12"
          style={{ animationDelay: "1400ms" }}
        >
          <img
            src={img3d}
            alt={L(lang, "3D naksha of this house", "इस घर का 3D नक्शा")}
            className="aspect-[2/1] w-full object-cover"
            width={1200}
            height={615}
          />
          <div className="px-3 py-2 text-[12px] font-bold">
            {L(lang, "+ naksha, in 3D", "+ नक्शा भी, 3D में")}
          </div>
        </div>
      )}
    </div>
  );
}
