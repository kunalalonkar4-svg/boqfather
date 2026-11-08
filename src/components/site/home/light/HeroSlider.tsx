"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export interface HeroSlide {
  img: string;
  alt: string;
  style: string;
  plot: string;
  builtUp: string;
  bhk: string;
  total: string;
  perSqft: string;
  planHref: string;
  boqHref: string;
}

export interface HeroSliderLabels {
  region: string;
  prev: string;
  next: string;
  slide: string;
  plot: string;
  builtUp: string;
  finish: string;
  finishValue: string;
  estimate: string;
  perSqft: string;
  sample: string;
  openPlan: string;
  getBoq: string;
}

/**
 * Manual hero slider: a few real BOQFather elevations, each paired with its own plot size and sample estimate.
 * Arrows, dots, swipe and the left/right keys; no autoplay. The details and both links follow the active slide.
 */
export function HeroSlider({ slides, labels }: { slides: HeroSlide[]; labels: HeroSliderLabels }) {
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const n = slides.length;
  const go = (k: number) => setI(((k % n) + n) % n);
  const s = slides[i];

  return (
    <div className="min-w-0">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={labels.region}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(i - 1);
          if (e.key === "ArrowRight") go(i + 1);
        }}
        className="group relative overflow-hidden rounded-[14px] border border-line bg-[#eef2f7] outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber"
      >
        <div
          className="flex touch-pan-y select-none"
          style={{
            transform: `translateX(calc(${-i * 100}% + ${drag}px))`,
            transition: drag ? "none" : "transform 450ms cubic-bezier(0.22, 0.7, 0.2, 1)",
          }}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            start.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            const st = start.current;
            if (!st) return;
            const dx = e.clientX - st.x;
            if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(e.clientY - st.y)) setDrag(dx);
          }}
          onPointerUp={() => {
            if (drag < -50) go(i + 1);
            else if (drag > 50) go(i - 1);
            setDrag(0);
            start.current = null;
          }}
          onPointerCancel={() => {
            setDrag(0);
            start.current = null;
          }}
          onDragStart={(e) => e.preventDefault()}
        >
          {slides.map((sl, k) => (
            <div
              key={sl.img}
              className="w-full shrink-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${k + 1} / ${n}`}
              aria-hidden={k !== i}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sl.img}
                alt={sl.alt}
                width={1600}
                height={900}
                draggable={false}
                loading={k === 0 ? "eager" : "lazy"}
                fetchPriority={k === 0 ? "high" : "auto"}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(i - 1)}
          aria-label={labels.prev}
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-[18px] text-ink shadow transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          onClick={() => go(i + 1)}
          aria-label={labels.next}
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-[18px] text-ink shadow transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber"
        >
          <span aria-hidden="true">›</span>
        </button>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-10">
          <span className="min-w-0 truncate rounded-[4px] bg-white/95 px-2.5 py-1 text-[13px] font-bold text-ink">{s.style}</span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap rounded-[4px] bg-black/55 px-2 py-0.5 text-[12px] font-semibold tabular-nums text-white" aria-live="polite">
              {labels.slide.replace("{i}", String(i + 1)).replace("{n}", String(n))}
            </span>
            <span className="flex gap-1.5">
              {slides.map((sl, k) => (
                <button
                  key={sl.img}
                  type="button"
                  aria-label={`${k + 1} / ${n}`}
                  aria-current={k === i}
                  onClick={() => go(k)}
                  className="flex h-5 w-5 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span className={`block h-2 rounded-full transition-all ${k === i ? "w-5 bg-white" : "w-2 bg-white/60"}`} />
                </button>
              ))}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-3 rounded-[14px] border border-line bg-white p-4" aria-live="polite">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px] sm:grid-cols-4">
          <div>
            <dt className="text-[#5a5a5a]">{labels.plot}</dt>
            <dd className="font-bold tabular-nums text-ink">{s.plot}</dd>
          </div>
          <div>
            <dt className="text-[#5a5a5a]">{labels.builtUp}</dt>
            <dd className="font-bold tabular-nums text-ink">{s.builtUp}</dd>
          </div>
          <div>
            <dt className="text-[#5a5a5a]">{labels.finish}</dt>
            <dd className="font-bold text-ink">
              {labels.finishValue} · {s.bhk}
            </dd>
          </div>
          <div>
            <dt className="text-[#5a5a5a]">{labels.estimate}</dt>
            <dd className="font-bold tabular-nums text-amber-dark">{s.total}</dd>
          </div>
        </dl>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
          <p className="text-[12.5px] leading-snug text-[#5a5a5a]">
            {labels.sample} · {s.perSqft} {labels.perSqft}
          </p>
          <span className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] font-bold">
            <Link href={s.planHref} className="underline decoration-amber decoration-2 underline-offset-4 hover:text-amber-dark">
              {labels.openPlan}
            </Link>
            <Link href={s.boqHref} className="underline decoration-amber decoration-2 underline-offset-4 hover:text-amber-dark">
              {labels.getBoq}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
