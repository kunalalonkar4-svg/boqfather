"use client";

import { useRef, useState, type ReactNode } from "react";

/** Drag the handle to compare two layers (left = before, right = after). */
export function BeforeAfter({
  before,
  after,
  label,
}: {
  before: ReactNode;
  after: ReactNode;
  label: string;
}) {
  const [pos, setPos] = useState(40);
  const box = useRef<HTMLDivElement>(null);
  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={box}
      className="relative aspect-[4/5] w-full touch-pan-y sm:aspect-[4/3] select-none overflow-hidden rounded-[14px] border border-line bg-white "
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons) move(e.clientX);
      }}
    >
      <div className="absolute inset-0">{after}</div>
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {before}
      </div>
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
        style={{ left: `${pos}%` }}
      >
        <button
          type="button"
          role="slider"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-orientation="horizontal"
          className="absolute left-1/2 top-1/2 flex h-11 w-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[18px] font-bold shadow-lg"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(4, p - 5));
            if (e.key === "ArrowRight") setPos((p) => Math.min(96, p + 5));
            if (e.key === "Home") setPos(4);
            if (e.key === "End") setPos(96);
          }}
        >
          ‹›
        </button>
      </div>
    </div>
  );
}
