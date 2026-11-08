"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lang } from "@/lib/site";

export interface ElevationCard {
  href: string;
  img: string;
  alt: string;
  title: string;
  sub: string;
  group: "narrow" | "medium" | "wide" | "shop";
}

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

/** Filter chips and the card grid. Every card is in the HTML; the chips only hide cards. */
export function ElevationGallery({ lang, cards }: { lang: Lang; cards: ElevationCard[] }) {
  const [group, setGroup] = useState<"all" | ElevationCard["group"]>("all");
  const chips: { id: "all" | ElevationCard["group"]; label: string }[] = [
    { id: "all", label: L(lang, "All designs", "सभी डिज़ाइन") },
    { id: "narrow", label: L(lang, "Plots up to 25 ft wide", "25 फ़ीट तक चौड़े प्लॉट") },
    { id: "medium", label: L(lang, "30 to 35 ft", "30 से 35 फ़ीट") },
    { id: "wide", label: L(lang, "40 ft and wider", "40 फ़ीट और चौड़े") },
    { id: "shop", label: L(lang, "House with shop", "दुकान के साथ घर") },
  ];
  const shown = cards.filter((c) => group === "all" || c.group === group);
  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label={L(lang, "Filter by plot width", "प्लॉट की चौड़ाई से चुनें")} className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={group === c.id}
            onClick={() => setGroup(c.id)}
            className={`rounded-[4px] border px-3.5 py-2 text-[14px] font-bold transition ${
              group === c.id ? "border-ink bg-ink text-white" : "border-[#d8d8d8] bg-white text-ink hover:border-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
        <span className="self-center pl-1 text-[13px] text-muted">
          {shown.length} {L(lang, "designs", "डिज़ाइन")}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.href} hidden={!shown.includes(c)}>
            <Link
              href={c.href}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-ink hover:hover:shadow-[0_14px_32px_-14px_rgba(8,8,8,0.35)]"
            >
              <span className="block aspect-[16/10] overflow-hidden bg-[#e9eef4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.img}
                  alt={c.alt}
                  loading="lazy"
                  width={800}
                  height={450}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
              </span>
              <span className="flex flex-col gap-1 p-4">
                <span className="font-display text-[18px] font-extrabold leading-snug">{c.title}</span>
                <span className="text-[13px] text-muted">{c.sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
