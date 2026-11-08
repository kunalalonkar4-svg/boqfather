"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface ShowItem {
  key: string;
  label: string;
  outcome: string;
  cta: string;
  href: string;
  preview: ReactNode;
}

/**
 * "What you get": four options on the left, one large real preview on the right.
 * A mouse hovering an option previews it after a short delay; a click or tap selects it; the keyboard reaches
 * every option. All previews share one grid cell, so the section keeps the same height whichever is shown.
 */
export function Showcase({ items, label }: { items: ShowItem[]; label: string }) {
  const [active, setActive] = useState(0);
  const [peek, setPeek] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  const shown = peek ?? active;
  const cur = items[shown];

  const hover = (k: number, on: boolean, e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (timer.current) clearTimeout(timer.current);
    if (on) timer.current = setTimeout(() => setPeek(k), 140);
    else setPeek(null);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)] lg:gap-10">
      <ul aria-label={label} className="flex flex-col gap-2" onPointerLeave={() => { if (timer.current) clearTimeout(timer.current); setPeek(null); }}>
        {items.map((it, k) => {
          const on = k === active;
          return (
            <li key={it.key}>
              <button
                type="button"
                aria-pressed={on}
                aria-controls="show-panel"
                onClick={() => {
                  setActive(k);
                  setPeek(null);
                }}
                onPointerEnter={(e) => hover(k, true, e)}
                onPointerLeave={(e) => hover(k, false, e)}
                className={`flex w-full flex-col gap-1 rounded-[10px] border px-4 py-3.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber ${
                  on
                    ? "border-amber bg-[#eef5ff] shadow-[inset_3px_0_0_0_#146ef5]"
                    : k === peek
                      ? "border-[#b9d3fb] bg-[#f6f9ff]"
                      : "border-line bg-white hover:border-[#b9d3fb]"
                }`}
              >
                <span className="text-[17px] font-extrabold leading-snug text-ink">{it.label}</span>
                <span className="text-[14px] leading-relaxed text-[#5a5a5a]">{it.outcome}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div id="show-panel" className="min-w-0">
        <div className="overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_18px_44px_-28px_rgba(8,8,8,0.4)]">
          <div className="grid grid-cols-[minmax(0,1fr)]">
            {items.map((it, k) => (
              <div
                key={it.key}
                aria-hidden={k !== shown}
                className={`min-w-0 [grid-area:1/1] transition-opacity duration-300 ${k === shown ? "opacity-100" : "pointer-events-none opacity-0"}`}
                {...(k !== shown ? { inert: true } : {})}
              >
                {it.preview}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 text-[15px] font-semibold text-ink" aria-live="polite">
            {cur.outcome}
          </p>
          <Link
            href={cur.href}
            className="inline-flex h-11 shrink-0 items-center rounded-[4px] bg-amber px-5 text-[15px] font-bold text-white transition hover:bg-amber-dark"
          >
            {cur.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
