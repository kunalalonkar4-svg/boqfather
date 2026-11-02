"use client";

import { useId } from "react";
import { LengthUnit, parseFtIn, toM } from "@/engine";

const inputCls =
  "h-12 w-full rounded-lg border border-[#cfc9be] bg-white px-3 text-[15px] text-ink outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/30";

export function NumberField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  hint?: string;
  inputMode?: "decimal" | "text";
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-body">
        {props.label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={inputCls + (props.suffix ? " pr-14" : "")}
          inputMode={props.inputMode ?? "decimal"}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
        {props.suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted">{props.suffix}</span>
        )}
      </div>
      {props.hint && <span className="text-[12px] text-muted">{props.hint}</span>}
    </div>
  );
}

export function SelectField<T extends string>(props: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-body">
        {props.label}
      </label>
      <select id={id} className={inputCls} value={props.value} onChange={(e) => props.onChange(e.target.value as T)}>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Segmented<T extends string>(props: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-body">{props.label}</span>
      <div role="radiogroup" aria-label={props.label} className="flex flex-wrap gap-1 rounded-xl bg-[#efece6] p-1">
        {props.options.map((o) => {
          const on = o.value === props.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => props.onChange(o.value)}
              className={
                "min-h-10 flex-1 rounded-lg px-3 text-[14px] transition " +
                (on ? "bg-white font-bold text-ink shadow-sm" : "font-semibold text-muted hover:text-ink")
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A length typed in metres or in feet (decimal or feet-inch like 13'-8"). Returns metres or NaN. */
export function dimToM(text: string, unit: LengthUnit): number {
  const t = text.trim();
  if (!t) return NaN;
  if (unit === "ft" && /['"\s-]/.test(t)) return parseFtIn(t);
  const n = Number(t);
  return Number.isFinite(n) ? toM(n, unit) : NaN;
}

export const num = (text: string) => {
  const n = Number(text);
  return Number.isFinite(n) ? n : NaN;
};

export function Card(props: { children: React.ReactNode; className?: string }) {
  return <section className={"rounded-2xl border border-line bg-white p-5 sm:p-6 " + (props.className ?? "")}>{props.children}</section>;
}
