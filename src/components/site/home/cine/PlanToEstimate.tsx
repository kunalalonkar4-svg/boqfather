"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/site";
import { loadGsap, prefersReduced } from "./gsap";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

/**
 * Section 4: a 2D floor plan lifts into a 3D house, then breaks into quantities and a BOQ — scrubbed by the scroll.
 * Uses the real plan sheet and 3D render of one naksha.
 */
export function PlanToEstimate({
  lang,
  img2d,
  img3d,
  chips,
  rows,
  href,
}: {
  lang: Lang;
  img2d: string;
  img3d: string;
  chips: { k: string; v: string }[];
  rows: { k: string; v: string }[];
  href: string;
}) {
  const section = useRef<HTMLElement>(null);
  const [p, setP] = useState(0); // 0..1
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (prefersReduced() || window.innerWidth < 900) return;
    setPinned(true);
    let stop = false;
    let kill = () => {};
    loadGsap().then(({ ScrollTrigger }) => {
      if (stop || !section.current) return;
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (s) => setP(s.progress),
      });
      kill = () => st.kill();
    });
    return () => {
      stop = true;
      kill();
    };
  }, []);

  const steps = [
    [L(lang, "Your 2D plan", "आपका 2D नक्शा"), L(lang, "DXF from AutoCAD, a photo of the printed plan, or a PDF.", "AutoCAD की DXF, छपे नक्शे की फ़ोटो, या PDF।")],
    [L(lang, "Becomes a 3D house", "बनता है 3D घर"), L(lang, "Rooms, walls, doors and the stair are read and raised floor by floor.", "कमरे, दीवारें, दरवाज़े और सीढ़ी पढ़कर मंज़िल-दर-मंज़िल खड़े होते हैं।")],
    [L(lang, "Then quantities", "फिर मात्राएं"), L(lang, "Concrete, steel, bricks, plaster and tiles — measured, not guessed.", "कंक्रीट, सरिया, ईंट, प्लास्टर, टाइल — नापकर, अंदाज़े से नहीं।")],
    [L(lang, "Then the BOQ", "फिर BOQ"), L(lang, "Item-wise, priced at your city's rate, ready as PDF and Excel.", "आइटम-वार, आपके शहर के रेट पर, PDF और Excel में तैयार।")],
  ];
  const k = (a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
  const tilt = k(0.12, 0.4);
  const to3d = k(0.3, 0.5);
  const chipsIn = k(0.5, 0.68);
  const boqIn = k(0.7, 0.88);
  const step = !pinned ? -1 : p < 0.28 ? 0 : p < 0.5 ? 1 : p < 0.7 ? 2 : 3;

  const visual = (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[680px] [perspective:1800px]">
      <div
        className="absolute inset-0 rounded-[22px] border border-white/10 bg-white p-3 shadow-[0_50px_120px_-40px_rgba(61,139,255,0.55)] [transform-style:preserve-3d]"
        style={{
          transform: pinned ? `rotateX(${tilt * 58}deg) rotateZ(${-tilt * 18}deg) scale(${1 - tilt * 0.1})` : undefined,
          opacity: pinned ? 1 - to3d : 1,
        }}
      >
        <img src={img2d} alt={L(lang, "2D floor plan", "2D फ़्लोर प्लान")} className="h-full w-full object-contain" loading="lazy" />
      </div>
      <div
        className="absolute inset-0 overflow-hidden rounded-[22px] border border-white/10 shadow-[0_50px_120px_-40px_rgba(198,244,50,0.35)]"
        style={{ opacity: pinned ? to3d : 1, transform: pinned ? `scale(${0.9 + to3d * 0.1})` : undefined }}
        hidden={!pinned}
      >
        <img src={img3d} alt={L(lang, "The same plan in 3D", "वही नक्शा 3D में")} className="h-full w-full scale-[1.3] object-cover" loading="lazy" />
      </div>
      {pinned &&
        chips.map((c, i) => (
          <div
            key={c.k}
            className="absolute rounded-2xl border border-white/15 bg-night/80 px-4 py-2.5 text-white shadow-xl backdrop-blur-md"
            style={{
              left: `${[2, 64, 6, 60][i % 4]}%`,
              top: `${[8, 14, 68, 74][i % 4]}%`,
              opacity: Math.min(1, chipsIn * 4 - i),
              transform: `translateY(${(1 - Math.min(1, Math.max(0, chipsIn * 4 - i))) * 20}px)`,
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">{c.k}</p>
            <p className="font-display text-[18px] font-extrabold text-amber">{c.v}</p>
          </div>
        ))}
      {pinned && (
        <div
          className="absolute -bottom-6 right-[-4%] w-[58%] rounded-2xl border border-white/15 bg-night-2/95 p-4 shadow-2xl backdrop-blur"
          style={{ opacity: boqIn, transform: `translateY(${(1 - boqIn) * 40}px)` }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber">BOQ</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-[12px]">
            {rows.map((r) => (
              <li key={r.k} className="flex justify-between gap-3 border-b border-white/5 pb-1.5 last:border-0">
                <span className="truncate text-white/70">{r.k}</span>
                <span className="font-semibold tabular-nums text-white">{r.v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <section ref={section} className="relative bg-[#0b0e14] text-white" style={pinned ? { height: "320vh" } : undefined}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(61,139,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(61,139,255,0.07)_1px,transparent_1px)] [background-size:44px_44px]"
      />
      <div className={pinned ? "sticky top-0 flex h-[100svh] items-center" : "py-24"}>
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-amber">
              {L(lang, "04 — Plan to estimate · Pro", "04 — नक्शे से एस्टिमेट · प्रो")}
            </p>
            <h2 className="font-display mt-3 text-[38px] font-black uppercase leading-[0.95] tracking-tight [font-stretch:115%] sm:text-[58px]">
              {L(lang, "Your plan in. The estimate out.", "नक्शा डालिए। एस्टिमेट पाइए।")}
            </h2>
            <ol className="mt-8 flex flex-col gap-1">
              {steps.map(([t, d], i) => (
                <li
                  key={t}
                  className={`rounded-2xl border px-4 py-3 transition duration-500 ${
                    step === i ? "border-amber/50 bg-amber/[0.07]" : step === -1 ? "border-white/10" : "border-transparent opacity-45"
                  }`}
                >
                  <p className="flex items-center gap-3 text-[16px] font-bold">
                    <span className="font-mono text-[12px] text-amber">0{i + 1}</span>
                    {t}
                  </p>
                  <p className="mt-1 pl-8 text-[14px] leading-relaxed text-white/60">{d}</p>
                </li>
              ))}
            </ol>
            <Link
              href={href}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-amber px-6 text-[15px] font-bold text-night hover:brightness-110"
            >
              {L(lang, "Upload a plan →", "नक्शा अपलोड करें →")}
            </Link>
          </div>
          {pinned ? (
            visual
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <img src={img2d} alt={L(lang, "2D floor plan", "2D फ़्लोर प्लान")} className="aspect-square w-full rounded-2xl bg-white object-contain p-2" loading="lazy" />
                <img src={img3d} alt={L(lang, "The same plan in 3D", "वही नक्शा 3D में")} className="aspect-square w-full rounded-2xl object-cover" loading="lazy" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {chips.map((c) => (
                  <div key={c.k} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">{c.k}</p>
                    <p className="font-display text-[17px] font-extrabold text-amber">{c.v}</p>
                  </div>
                ))}
              </div>
              <ul className="rounded-2xl border border-white/10 bg-night-2 p-4 text-[13px]">
                {rows.map((r) => (
                  <li key={r.k} className="flex justify-between gap-3 border-b border-white/5 py-1.5 last:border-0">
                    <span className="truncate text-white/70">{r.k}</span>
                    <span className="font-semibold tabular-nums">{r.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
