"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/site";
import { CountUp } from "./Motion";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

/**
 * The hero's live preview: plot size is typed, the naksha appears, the cost counts up — on a loop.
 * Pure presentation; the numbers are the real ones for this naksha.
 */
export function HeroDemo({
  lang,
  img,
  w,
  d,
  bhk,
  facing,
  total,
  vastu,
  steelT,
  cement,
}: {
  lang: Lang;
  img: string;
  w: number;
  d: number;
  bhk: number;
  facing: string;
  total: number;
  vastu: number;
  steelT: number;
  cement: number;
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
    const next = setTimeout(() => setLoop((x) => x + 1), 9000);
    return () => {
      clearInterval(id);
      clearTimeout(next);
    };
  }, [loop, typed.length]);
  const done = n >= typed.length;
  const lakh = (x: number) =>
    `₹${(x / 1e5).toLocaleString("en-IN", { maximumFractionDigits: 1 })} ${L(lang, "lakh", "लाख")}`;

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div
        aria-hidden="true"
        className="absolute -right-6 -top-8 h-64 w-64 rounded-full bg-amber/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-10 -left-8 h-56 w-56 rounded-full bg-steel/15 blur-3xl"
      />
      <div className="hero-float relative overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_30px_80px_-20px_rgba(22,24,26,0.35)]">
        {/* input bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-[#faf8f4] px-4 py-3 text-[13px]">
          <span className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 font-semibold">
            <span className="text-muted">{L(lang, "Plot", "प्लॉट")}</span>
            <span className="font-display min-w-[56px] text-[15px] font-extrabold">
              {typed.slice(0, n)}
              {!done && <span className="caret">|</span>}
            </span>
            <span className="text-muted">ft</span>
          </span>
          <span className="rounded-lg border border-line bg-white px-2.5 py-1.5 font-semibold">
            {facing}
          </span>
          <span className="rounded-lg border border-line bg-white px-2.5 py-1.5 font-semibold">
            {bhk} BHK · G+1
          </span>
          <span
            className={`ml-auto rounded-lg px-3 py-1.5 font-bold transition-colors duration-500 ${done ? "bg-amber text-ink" : "bg-[#ece8df] text-muted"}`}
          >
            {L(lang, "Make plan →", "नक्शा बनाएं →")}
          </span>
        </div>
        {/* plan: ground floor half of the sheet */}
        <div className="relative aspect-[527/860] max-h-[460px] w-full overflow-hidden bg-white">
          <img
            key={loop}
            src={img}
            alt={L(
              lang,
              `${w}×${d} ${facing} ground floor naksha`,
              `${w}×${d} ${facing} ग्राउंड फ़्लोर नक्शा`,
            )}
            width={1054}
            height={911}
            className={`plan-in absolute left-0 top-0 h-full w-[200%] max-w-none object-cover object-left-top ${done ? "plan-show" : "opacity-0"}`}
          />
        </div>
      </div>
      {/* floating result chips */}
      {done && (
        <div key={`c${loop}`} className="pointer-events-none">
          <div className="chip-in absolute -left-3 top-24 rounded-2xl bg-ink px-4 py-3 text-white shadow-xl sm:-left-10">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-amber">
              {L(lang, "Full cost", "पूरा खर्च")}
            </div>
            <div className="font-display text-[22px] font-extrabold">
              <CountUp to={total} format={lakh} ms={1200} />
            </div>
          </div>
          <div
            className="chip-in absolute -right-3 top-44 rounded-2xl border border-line bg-white px-4 py-3 shadow-xl sm:-right-8"
            style={{ animationDelay: "350ms" }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {L(lang, "Vastu", "वास्तु")}
            </div>
            <div className="font-display text-[20px] font-extrabold text-[#1d7a46]">
              {vastu}% ✓
            </div>
          </div>
          <div
            className="chip-in absolute -left-2 bottom-16 rounded-2xl border border-line bg-white px-4 py-3 shadow-xl sm:-left-8"
            style={{ animationDelay: "700ms" }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {L(lang, "Steel · Cement", "सरिया · सीमेंट")}
            </div>
            <div className="font-display text-[17px] font-extrabold">
              {steelT.toLocaleString("en-IN", { maximumFractionDigits: 1 })}{" "}
              {L(lang, "t", "टन")} · {cement.toLocaleString("en-IN")}{" "}
              {L(lang, "bags", "बैग")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
