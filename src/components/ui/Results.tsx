"use client";

import type { Step } from "@/engine";
import type { Lang } from "@/lib/site";
import { t } from "@/i18n/ui";

export interface Stat {
  label: string;
  value: string;
  sub?: string;
}

/** Dark results panel with the headline numbers. */
export function ResultPanel(props: {
  lang: Lang;
  title?: string;
  stats: Stat[];
  children?: React.ReactNode;
}) {
  const d = t(props.lang);
  return (
    <section
      aria-live="polite"
      className="rounded-2xl bg-ink p-5 text-[#f5f3ef] sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-amber">
          {props.title ?? d.results}
        </h2>
        <span className="rounded-full bg-[#2a2c2f] px-2.5 py-1 text-[11px] font-semibold text-[#cfcbc2]">
          {d.preliminary}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {props.stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-[#222427] p-3.5">
            <dt className="text-[12px] text-[#cfcbc2]">{s.label}</dt>
            <dd className="font-display mt-0.5 text-[22px] font-extrabold leading-tight">
              {s.value}
            </dd>
            {s.sub && (
              <dd className="mt-0.5 text-[12px] text-[#cfcbc2]">{s.sub}</dd>
            )}
          </div>
        ))}
      </dl>
      {props.children}
    </section>
  );
}

export function Working(props: {
  lang: Lang;
  steps: Step[];
  assumptions: string[];
}) {
  const d = t(props.lang);
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <h2 className="font-display text-[19px] font-bold">{d.working}</h2>
      <ol className="mt-4 flex flex-col divide-y divide-[#f0ece5]">
        {props.steps.map((s, i) => (
          <li
            key={i}
            className="grid grid-cols-[28px_1fr] gap-x-3 py-3 sm:grid-cols-[28px_1fr_auto]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-tint text-[12px] font-bold text-amber-dark">
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold">{s.label}</div>
              {s.formula && (
                <div className="mt-0.5 break-words font-mono text-[13px] text-muted">
                  {s.formula}
                </div>
              )}
            </div>
            <div className="col-start-2 mt-1 text-[14px] font-bold sm:col-start-3 sm:mt-0 sm:text-right">
              {s.value}
            </div>
          </li>
        ))}
      </ol>
      <h3 className="mt-5 text-[14px] font-bold">{d.assumptions}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-body">
        {props.assumptions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
    </section>
  );
}

export function WhatsAppShare(props: { lang: Lang; text: string }) {
  const d = t(props.lang);
  const share = () => {
    const url = window.location.href.split("#")[0];
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${props.text}\n\n${url}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  return (
    <button
      type="button"
      onClick={share}
      className="no-print inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-good px-4 text-[14px] font-bold text-white hover:brightness-110"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z" />
      </svg>
      {d.share_whatsapp}
    </button>
  );
}

/** Standard calculator layout: form | results, then the working below. */
export function CalcFrame(props: {
  form: React.ReactNode;
  result: React.ReactNode;
  working?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4">{props.form}</div>
        </div>
        <div className="flex flex-col gap-3 lg:sticky lg:top-4">
          {props.result}
        </div>
      </div>
      {props.working}
    </div>
  );
}

export function Invalid(props: { lang: Lang }) {
  return (
    <p className="rounded-xl bg-warn-tint px-4 py-3 text-[14px] text-[#4a3b12]">
      {props.lang === "hi"
        ? "कृपया सभी साइज़ सही नंबर में डालें।"
        : "Please enter valid numbers for all sizes."}
    </p>
  );
}
