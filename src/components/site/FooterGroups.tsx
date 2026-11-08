"use client";

import { ReactNode, useState } from "react";

export interface FooterGroup {
  key: string;
  label: string;
  panel: ReactNode;
}

/**
 * A row of link groups that open a full-width panel underneath (the way large property sites do their footer).
 * Every panel is in the HTML from the start, only hidden, so the links stay readable by search engines.
 */
export function FooterGroups({ groups }: { groups: FooterGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="border-y border-[#1d3a60]">
      <div role="tablist" className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {groups.map((g) => {
          const on = open === g.key;
          return (
            <button
              key={g.key}
              type="button"
              role="tab"
              id={`fg-tab-${g.key}`}
              aria-expanded={on}
              aria-controls={`fg-${g.key}`}
              onClick={() => setOpen(on ? null : g.key)}
              className={`flex items-center justify-center gap-2 border-[#1d3a60] px-3 py-4 text-[15px] font-semibold transition hover:text-white [&:not(:last-child)]:border-r ${
                on ? "bg-[#16335a] text-white" : "text-[#d3deec]"
              }`}
            >
              {g.label}
              <svg aria-hidden="true" viewBox="0 0 12 8" className={`h-2 w-3 transition ${on ? "rotate-180" : ""}`}>
                <path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          );
        })}
      </div>
      {groups.map((g) => (
        <div
          key={g.key}
          id={`fg-${g.key}`}
          role="tabpanel"
          aria-labelledby={`fg-tab-${g.key}`}
          hidden={open !== g.key}
          className="border-t border-[#1d3a60] bg-[#0b1d36]"
        >
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{g.panel}</div>
        </div>
      ))}
    </div>
  );
}
