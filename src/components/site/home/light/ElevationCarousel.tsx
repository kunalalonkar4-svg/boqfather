"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export interface CarouselItem {
  slug: string;
  group: "narrow" | "medium" | "wide" | "shop";
  href: string;
  planHref: string;
  front: string;
  plan: string;
  style: string;
  plot: string;
  facing: string;
  meta: string;
  cost: string;
}

export interface CarouselLabels {
  region: string;
  prev: string;
  next: string;
  front: string;
  plan: string;
  view: string;
  filter: string;
  groups: Record<"all" | "narrow" | "medium" | "wide" | "shop", string>;
  openElevation: string;
  openPlan: string;
  from: string;
}

/** Elevation gallery: native scroll-snap row, arrows, keyboard, group filter and a Front / Plan switch. */
export function ElevationCarousel({ items, labels }: { items: CarouselItem[]; labels: CarouselLabels }) {
  const [group, setGroup] = useState<keyof CarouselLabels["groups"]>("all");
  const [view, setView] = useState<"front" | "plan">("front");
  const row = useRef<HTMLUListElement>(null);
  const list = group === "all" ? items : items.filter((x) => x.group === group);
  const present = (["all", "narrow", "medium", "wide", "shop"] as const).filter((g) => g === "all" || items.some((x) => x.group === g));

  const scroll = (dir: number) => {
    const el = row.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = (card?.getBoundingClientRect().width ?? 320) + 16;
    el.scrollBy({ left: dir * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const pick = (g: keyof CarouselLabels["groups"]) => {
    setGroup(g);
    row.current?.scrollTo({ left: 0 });
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={labels.filter} className="flex flex-wrap gap-2">
          {present.map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={g === group}
              onClick={() => pick(g)}
              className={`rounded-full border px-3.5 py-1.5 text-[14px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber ${
                g === group ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"
              }`}
            >
              {labels.groups[g]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div role="group" aria-label={labels.view} className="inline-flex overflow-hidden rounded-[4px] border border-line bg-white">
            {(["front", "plan"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={v === view}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-[14px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber ${
                  v === view ? "bg-ink text-white" : "text-ink hover:bg-[#f5f5f5]"
                }`}
              >
                {labels[v]}
              </button>
            ))}
          </div>
          <span className="hidden gap-2 md:flex">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => scroll(d)}
                aria-label={d < 0 ? labels.prev : labels.next}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-[18px] transition hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber"
              >
                <span aria-hidden="true">{d < 0 ? "‹" : "›"}</span>
              </button>
            ))}
          </span>
        </div>
      </div>

      <ul
        ref={row}
        role="region"
        aria-roledescription="carousel"
        aria-label={labels.region}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") scroll(1);
          if (e.key === "ArrowLeft") scroll(-1);
        }}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-3 outline-offset-2 [scrollbar-width:thin] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber motion-reduce:scroll-auto scroll-px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6"
      >
        {list.map((x, k) => (
          <li key={x.slug} className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-32px)/3)]">
            <article className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-white transition duration-300 focus-within:-translate-y-1 hover:-translate-y-1 hover:shadow-[0_16px_34px_-18px_rgba(8,8,8,0.4)] motion-reduce:transition-none">
              <Link href={x.href} className="block overflow-hidden border-b border-line bg-[#eef2f7] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={view === "front" ? x.front : x.plan}
                  alt={`${x.style} · ${x.plot}`}
                  width={800}
                  height={533}
                  loading={k < 3 ? "eager" : "lazy"}
                  draggable={false}
                  className={`aspect-[3/2] w-full transition duration-500 group-hover:scale-[1.03] group-focus-within:scale-[1.03] motion-reduce:transition-none ${
                    view === "front" ? "object-cover" : "bg-white object-contain p-3"
                  }`}
                />
              </Link>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <p className="flex flex-wrap items-baseline gap-x-2 text-[13px] font-bold tabular-nums text-amber-dark">
                  {x.plot} <span className="font-medium text-[#5a5a5a]">· {x.facing}</span>
                </p>
                <h3 className="text-[17px] font-extrabold leading-snug text-ink">{x.style}</h3>
                <p className="text-[13.5px] leading-snug text-[#5a5a5a]">
                  {x.meta} · {labels.from} {x.cost}
                </p>
                <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3 text-[14px] font-bold">
                  <Link href={x.planHref} className="underline decoration-amber decoration-2 underline-offset-4 hover:text-amber-dark">
                    {labels.openPlan}
                  </Link>
                  <Link href={x.href} className="underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-amber">
                    {labels.openElevation}
                  </Link>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
