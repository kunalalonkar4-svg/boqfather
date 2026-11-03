"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { calcConcrete } from "@/engine";
import type { Lang } from "@/lib/site";
import { loadGsap, prefersReduced } from "./gsap";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

export interface CalcCard {
  slug: string;
  href: string;
  name: string;
  short: string;
  intro: string;
}

/** Line drawings in the blueprint style, one per calculator. */
function Drawing({ slug }: { slug: string }) {
  const s = { stroke: "currentColor", strokeWidth: 1.4, fill: "none" } as const;
  const d: Record<string, React.ReactNode> = {
    "concrete-calculator": (
      <>
        <rect x="20" y="70" width="160" height="30" {...s} />
        {[...Array(9)].map((_, i) => <circle key={i} cx={34 + i * 17} cy={92} r="2.2" {...s} />)}
        <path d="M20 60h160M20 55v10M180 55v10" {...s} />
        <text x="100" y="52" textAnchor="middle" fontSize="9" fill="currentColor">L × B × D</text>
      </>
    ),
    "steel-calculator": (
      <>
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M20 ${50 + i * 16}h160`} {...s} strokeWidth={3 + i} opacity={0.5 + i * 0.15} />)}
        <text x="100" y="40" textAnchor="middle" fontSize="9" fill="currentColor">D²/162 kg/m</text>
      </>
    ),
    "brick-calculator": (
      <>
        {[0, 1, 2, 3, 4].map((r) =>
          [0, 1, 2, 3, 4].map((c) => (
            <rect key={`${r}${c}`} x={20 + c * 32 + (r % 2 ? 16 : 0) - (r % 2 && c === 4 ? 16 : 0)} y={30 + r * 16} width={r % 2 && c === 4 ? 16 : 30} height={14} {...s} />
          )),
        )}
      </>
    ),
    "plaster-calculator": (
      <>
        <rect x="40" y="25" width="40" height="90" {...s} />
        <rect x="80" y="25" width="12" height="90" {...s} strokeDasharray="3 3" />
        <rect x="92" y="25" width="6" height="90" {...s} />
        <text x="140" y="74" fontSize="9" fill="currentColor">12 mm · 1:6</text>
      </>
    ),
    "tile-calculator": (
      <>
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4, 5].map((c) => <rect key={`${r}${c}`} x={22 + c * 27} y={28 + r * 22} width={25} height={20} {...s} />))}
      </>
    ),
    "paint-calculator": (
      <>
        <rect x="30" y="40" width="90" height="26" rx="6" {...s} />
        <path d="M120 53h20v34H80v26" {...s} />
        <path d="M30 100c30-12 60 12 90 0s50-10 60 0" {...s} strokeDasharray="4 4" />
      </>
    ),
    "excavation-calculator": (
      <>
        <path d="M10 45h50l12 55h56l12-55h50" {...s} />
        <path d="M72 100h56" {...s} strokeDasharray="3 3" />
        <text x="100" y="80" textAnchor="middle" fontSize="9" fill="currentColor">m³ → brass</text>
      </>
    ),
    "construction-unit-converter": (
      <>
        <path d="M40 55h120l-12-10M160 85H40l12 10" {...s} />
        <text x="100" y="40" textAnchor="middle" fontSize="10" fill="currentColor">m³ ↔ cft</text>
        <text x="100" y="112" textAnchor="middle" fontSize="10" fill="currentColor">brass ↔ bags</text>
      </>
    ),
    "house-construction-cost-calculator": (
      <>
        <path d="M30 110V60l70-35 70 35v50z" {...s} />
        <path d="M30 85h140M100 25v85" {...s} strokeDasharray="3 3" />
        <rect x="88" y="88" width="24" height="22" {...s} />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 200 130" className="h-full w-full text-amber" aria-hidden="true">
      {d[slug]}
    </svg>
  );
}

/** Section 5: the calculators as a horizontal rail (pinned on desktop), with a live concrete calculator first. */
export function CalcRail({ lang, cards, allHref }: { lang: Lang; cards: CalcCard[]; allHref: string }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [vol, setVol] = useState("10");
  const [grade, setGrade] = useState<"M15" | "M20" | "M25">("M20");
  const live = useMemo(() => {
    const v = Number(vol);
    return v > 0 ? calcConcrete({ volumeM3: v, grade }).values : null;
  }, [vol, grade]);

  useEffect(() => {
    if (prefersReduced() || window.innerWidth < 900) return;
    setPinned(true);
    let stop = false;
    let kill = () => {};
    loadGsap().then(({ gsap }) => {
      if (stop || !section.current || !track.current) return;
      const dist = () => Math.max(0, track.current!.scrollWidth - window.innerWidth + 64);
      const tw = gsap.to(track.current, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      kill = () => {
        tw.scrollTrigger?.kill();
        tw.kill();
      };
    });
    return () => {
      stop = true;
      kill();
    };
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden bg-night text-white">
      <div className="flex min-h-[100svh] flex-col justify-center gap-10 py-20">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-4 px-5 sm:px-8">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-amber">
              {L(lang, "05 — Engineering calculators", "05 — इंजीनियरिंग कैलकुलेटर")}
            </p>
            <h2 className="font-display mt-3 text-[28px] font-black uppercase leading-[0.95] tracking-tight sm:text-[40px]">
              {L(lang, "Every quantity on site.", "साइट की हर मात्रा।")}
            </h2>
          </div>
          <Link href={allHref} className="text-[15px] font-bold text-white/80 underline decoration-amber decoration-2 underline-offset-4 hover:text-white">
            {L(lang, "All calculators →", "सभी कैलकुलेटर →")}
          </Link>
        </div>
        <div
          ref={track}
          className={`flex gap-5 px-5 sm:px-8 ${pinned ? "w-max" : "snap-x snap-mandatory overflow-x-auto pb-4"} lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]`}
        >
          {/* live concrete calculator — the real formula from the concrete calculator */}
          <div className="flex w-[86vw] max-w-[440px] shrink-0 snap-start flex-col gap-4 rounded-3xl border border-amber/40 bg-gradient-to-b from-[#16200a] to-night-2 p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber">{L(lang, "Try it · live", "आज़माइए · लाइव")}</p>
            <h3 className="font-display text-[26px] font-extrabold">{L(lang, "Concrete mix", "कंक्रीट मिक्स")}</h3>
            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1 text-[12px] font-semibold text-white/60">
                {L(lang, "Volume (m³)", "मात्रा (m³)")}
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={vol}
                  onChange={(e) => setVol(e.target.value)}
                  className="h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-[16px] font-bold text-white outline-none focus:border-amber"
                />
              </label>
              <label className="flex flex-col gap-1 text-[12px] font-semibold text-white/60">
                {L(lang, "Grade", "ग्रेड")}
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as typeof grade)}
                  className="h-11 rounded-xl border border-white/15 bg-night-3 px-3 text-[15px] font-bold text-white"
                >
                  <option>M15</option>
                  <option>M20</option>
                  <option>M25</option>
                </select>
              </label>
            </div>
            <dl className="grid grid-cols-3 gap-2">
              {(
                [
                  [L(lang, "Cement", "सीमेंट"), live ? `${Math.ceil(live.cementBags)}` : "–", L(lang, "bags", "बैग")],
                  [L(lang, "Sand", "रेत"), live ? `${Math.round(live.sandCft)}` : "–", "cft"],
                  [L(lang, "Aggregate", "गिट्टी"), live ? `${Math.round(live.aggregateCft)}` : "–", "cft"],
                ] as const
              ).map(([k, v, u]) => (
                <div key={k} className="rounded-xl bg-white/5 px-3 py-2.5">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-white/50">{k}</dt>
                  <dd className="font-display text-[20px] font-extrabold text-amber">
                    {v} <span className="text-[11px] font-semibold text-white/50">{u}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <Link href={cards.find((c) => c.slug === "concrete-calculator")?.href ?? allHref} className="mt-auto text-[14px] font-bold text-amber">
              {L(lang, "Full working, PDF →", "पूरा हिसाब, PDF →")}
            </Link>
          </div>
          {cards.map((c, i) => (
            <Link
              key={c.slug}
              href={c.href}
              className="group relative flex w-[78vw] max-w-[360px] shrink-0 snap-start flex-col gap-3 overflow-hidden rounded-3xl border border-night-line bg-night-2 p-6 transition duration-500 hover:-translate-y-1 hover:border-amber/50"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(rgba(198,244,50,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(198,244,50,0.05)_1px,transparent_1px)] [background-size:22px_22px] opacity-0 transition group-hover:opacity-100"
              />
              <span className="font-mono relative text-[12px] text-white/40">{String(i + 1).padStart(2, "0")}</span>
              <span className="relative h-32 opacity-80 transition group-hover:opacity-100">
                <Drawing slug={c.slug} />
              </span>
              <h3 className="font-display relative text-[22px] font-extrabold leading-tight">{c.name}</h3>
              <p className="relative text-[13px] font-semibold text-amber">{c.short}</p>
              <p className="relative line-clamp-3 text-[14px] leading-relaxed text-white/60">{c.intro}</p>
              <span className="relative mt-auto inline-flex items-center gap-2 pt-2 text-[14px] font-bold">
                {L(lang, "Open calculator", "कैलकुलेटर खोलें")}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
