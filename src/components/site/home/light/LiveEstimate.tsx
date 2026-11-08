"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Quality = "basic" | "standard" | "premium";
export interface LiveRow {
  slug: string;
  w: number;
  d: number;
  bhk: number;
  builtUp: number;
  img: string;
  href: string;
  q: Record<Quality, { total: number; perSqft: number; stages: { t: string; v: number }[] }>;
}

const QUALITY: Quality[] = ["basic", "standard", "premium"];
const rupee = (x: number) => x.toLocaleString("en-IN", { maximumFractionDigits: 0 });
const lakh = (x: number) => (x / 1e5).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Eases a number to its new value, so a changed cost reads as a change; plain jump when motion is reduced. */
function useTween(target: number) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = target;
      setV(target);
      return;
    }
    const a = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 420);
      const e = 1 - Math.pow(1 - k, 3);
      const cur = a + (target - a) * e;
      from.current = cur;
      setV(cur);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

export function LiveEstimate({
  rows,
  initial,
  labels,
}: {
  rows: LiveRow[];
  initial: string;
  labels: {
    plot: string;
    finish: string;
    quality: Record<Quality, string>;
    sqft: string;
    built: string;
    perSqft: string;
    total: string;
    lakh: string;
    frontage: string;
    biggest: string;
    cta: string;
    note: string;
  };
}) {
  const [slug, setSlug] = useState(initial);
  const [quality, setQuality] = useState<Quality>("standard");
  const row = rows.find((r) => r.slug === slug) ?? rows[0];
  const cur = row.q[quality];
  const total = useTween(cur.total);
  const top = Math.max(...cur.stages.map((s) => s.v));

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-col gap-3">
        <div role="group" aria-label={labels.plot} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {rows.map((r) => (
            <button
              key={r.slug}
              type="button"
              aria-pressed={r.slug === slug}
              onClick={() => setSlug(r.slug)}
              className={`shrink-0 rounded-[4px] border px-3 py-1.5 text-[14px] font-bold tabular-nums transition ${
                r.slug === slug
                  ? "border-[#0e2a47] bg-[#0e2a47] text-white"
                  : "border-[#c5cfdb] bg-white text-[#0e2a47] hover:border-[#0e2a47]"
              }`}
            >
              {r.w}×{r.d}
            </button>
          ))}
        </div>
        <div role="group" aria-label={labels.finish} className="inline-flex w-fit overflow-hidden rounded-[4px] border border-[#c5cfdb] bg-white">
          {QUALITY.map((q) => (
            <button
              key={q}
              type="button"
              aria-pressed={q === quality}
              onClick={() => setQuality(q)}
              className={`px-4 py-1.5 text-[14px] font-semibold transition ${
                q === quality ? "bg-[#0e2a47] text-white" : "text-[#0e2a47] hover:bg-[#eef1f4]"
              }`}
            >
              {labels.quality[q]}
            </button>
          ))}
        </div>
      </div>

      {/* the sheet: a drawing with its title block and a site-hoarding cost board */}
      <div className="overflow-hidden rounded-[6px] border border-[#0e2a47] bg-white shadow-[8px_8px_0_0_rgba(14,42,71,0.12)]">
        <div className="relative bg-gradient-to-b from-[#dbeaf8] to-[#f4f8fc]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={row.slug}
            src={row.img}
            alt=""
            width={1200}
            height={720}
            className="aspect-[16/9] w-full object-cover object-bottom"
            fetchPriority="high"
          />
          <svg aria-hidden="true" viewBox="0 0 100 8" preserveAspectRatio="none" className="absolute inset-x-0 bottom-2 h-6 w-full">
            <g stroke="#0e2a47" strokeWidth="0.35" vectorEffect="non-scaling-stroke" fill="none">
              <path d="M10 4H90M10 1.6V6.4M90 1.6V6.4" vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
          <span className="absolute bottom-[10px] left-1/2 -translate-x-1/2 rounded-[3px] bg-white px-2 py-0.5 text-[12px] font-bold tabular-nums text-[#0e2a47]">
            {row.w} ft {labels.frontage}
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-[#0e2a47]/25 border-y border-[#0e2a47] text-[13px] text-[#0e2a47]">
          <div className="px-3 py-2">
            <span className="block text-[#52627a]">{labels.plot}</span>
            <b className="tabular-nums">
              {row.w} × {row.d} ft
            </b>
          </div>
          <div className="px-3 py-2">
            <span className="block text-[#52627a]">{labels.built}</span>
            <b className="tabular-nums">
              {rupee(row.builtUp)} {labels.sqft}
            </b>
          </div>
          <div className="px-3 py-2">
            <span className="block text-[#52627a]">G+1</span>
            <b>{row.bhk} BHK</b>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 bg-[#ffc933] px-4 py-3 text-[#0e2a47]">
          <div>
            <span className="block text-[13px] font-semibold">{labels.total}</span>
            <span aria-live="polite" className="font-hoard text-[40px] font-black leading-none tabular-nums sm:text-[52px]">
              ₹{lakh(total)} <span className="text-[22px] sm:text-[26px]">{labels.lakh}</span>
            </span>
          </div>
          <div className="pb-1 text-right text-[14px] font-semibold tabular-nums">
            ₹{rupee(cur.perSqft)}
            <span className="block text-[12px] font-medium">{labels.perSqft}</span>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3">
          <p className="mb-2 text-[13px] font-semibold text-[#52627a]">{labels.biggest}</p>
          <ul className="flex flex-col gap-2">
            {cur.stages.map((s) => (
              <li key={s.t} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-[13px] text-[#0e2a47]">
                <span className="truncate">{s.t}</span>
                <span className="font-semibold tabular-nums">₹{lakh(s.v)} {labels.lakh}</span>
                <span className="col-span-2 h-[5px] bg-[#e6ecf3]">
                  <span className="block h-full bg-[#1668d6] transition-[width] duration-500" style={{ width: `${Math.max(4, (s.v / top) * 100)}%` }} />
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={row.href}
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[4px] bg-[#0e2a47] px-5 text-[15px] font-bold text-white transition hover:bg-[#16406b]"
          >
            {labels.cta.replace("{size}", `${row.w}×${row.d}`)}
          </Link>
        </div>
      </div>
      <p className="mt-2 text-[12.5px] text-[#52627a]">{labels.note}</p>
    </div>
  );
}
