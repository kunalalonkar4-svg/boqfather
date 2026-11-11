"use client";

import { ElevationDrawing } from "./ElevationDrawing";
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
                  ? "border-ink bg-ink text-white"
                  : "border-[#d8d8d8] bg-white text-ink hover:border-ink"
              }`}
            >
              {r.w}×{r.d}
            </button>
          ))}
        </div>
        <div role="group" aria-label={labels.finish} className="inline-flex w-fit overflow-hidden rounded-[4px] border border-[#d8d8d8] bg-white">
          {QUALITY.map((q) => (
            <button
              key={q}
              type="button"
              aria-pressed={q === quality}
              onClick={() => setQuality(q)}
              className={`px-4 py-1.5 text-[14px] font-semibold transition ${
                q === quality ? "bg-ink text-white" : "text-ink hover:bg-[#f5f5f5]"
              }`}
            >
              {labels.quality[q]}
            </button>
          ))}
        </div>
      </div>

      {/* one frame: the elevation and its facts on the left, the cost and its breakdown on the right */}
      <div className="grid overflow-hidden rounded-[14px] border border-line bg-white lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
       <div className="min-w-0">
        <div className="relative bg-gradient-to-b from-[#f0f0f0] to-[#f5f5f5]">
          <ElevationDrawing key={row.slug} w={row.w} className="block aspect-[16/10] w-full" />
        </div>

        <div className="grid grid-cols-3 divide-x divide-line border-y border-line text-[13px] text-ink">
          <div className="px-3 py-2">
            <span className="block text-[#5a5a5a]">{labels.plot}</span>
            <b className="tabular-nums">
              {row.w} × {row.d} ft
            </b>
          </div>
          <div className="px-3 py-2">
            <span className="block text-[#5a5a5a]">{labels.built}</span>
            <b className="tabular-nums">
              {rupee(row.builtUp)} {labels.sqft}
            </b>
          </div>
          <div className="px-3 py-2">
            <span className="block text-[#5a5a5a]">G+1</span>
            <b>{row.bhk} BHK</b>
          </div>
        </div>
       </div>

       <div className="flex min-w-0 flex-col">
        <div className="flex items-end justify-between gap-3 bg-[#0f2440] px-5 py-5 text-white">
          <div>
            <span className="block text-[13px] font-semibold text-[#b8cdea]">
              {labels.total} · {labels.quality[quality]}
            </span>
            <span aria-live="polite" className="font-hoard text-[44px] font-black leading-none tabular-nums sm:text-[56px]">
              ₹{lakh(total)} <span className="text-[22px] sm:text-[26px]">{labels.lakh}</span>
            </span>
          </div>
          <div className="pb-1 text-right text-[14px] font-semibold tabular-nums">
            ₹{rupee(cur.perSqft)}
            <span className="block text-[12px] font-medium text-[#b8cdea]">{labels.perSqft}</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
          <p className="mb-2 text-[13px] font-semibold text-[#5a5a5a]">{labels.biggest}</p>
          <ul className="mb-4 flex flex-col gap-2.5">
            {cur.stages.map((s) => (
              <li key={s.t} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-[13px] text-ink">
                <span className="truncate">{s.t}</span>
                <span className="font-semibold tabular-nums">₹{lakh(s.v)} {labels.lakh}</span>
                <span className="col-span-2 h-[5px] bg-[#e8e8e8]">
                  <span className="block h-full bg-[#146ef5] transition-[width] duration-500" style={{ width: `${Math.max(4, (s.v / top) * 100)}%` }} />
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={row.href}
            className="mt-auto inline-flex h-12 w-full items-center justify-center rounded-[4px] bg-amber px-5 text-[15px] font-bold text-white transition hover:bg-amber-dark"
          >
            {labels.cta.replace("{size}", `${row.w}×${row.d}`)}
          </Link>
        </div>
       </div>
      </div>
      <p className="mt-2 text-[12.5px] text-[#5a5a5a]">{labels.note}</p>
    </div>
  );
}
