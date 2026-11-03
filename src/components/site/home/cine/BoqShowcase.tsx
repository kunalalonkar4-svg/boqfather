"use client";

import Link from "next/link";
import { CountUp, Reveal } from "../Motion";
import type { Lang } from "@/lib/site";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

export interface QtyTile {
  k: string;
  v: number;
  unit: string;
  dec?: number;
  rupee?: boolean;
  note?: string;
}
export interface BoqRow {
  code: string;
  desc: string;
  qty: string;
  rate: string;
  amount: number;
}

/** Section 3: every rupee, item by item — real numbers from the BOQ engine, counted up as they come into view. */
export function BoqShowcase({
  lang,
  total,
  perSqft,
  builtUp,
  tiles,
  rows,
  items,
  caption,
  href,
}: {
  lang: Lang;
  total: number;
  perSqft: number;
  builtUp: number;
  tiles: QtyTile[];
  rows: BoqRow[];
  items: number;
  caption: string;
  href: string;
}) {
  return (
    <section id="features" className="relative overflow-hidden bg-night py-16 text-white sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-glow/20 blur-[120px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-amber">
            {L(lang, "03 — Item-wise BOQ", "03 — आइटम-वार BOQ")}
          </p>
          <h2 className="font-display mt-3 text-[30px] font-black uppercase leading-[0.92] tracking-tight sm:text-[56px]">
            {L(lang, "Every rupee.", "हर रुपया।")}
            <br />
            <span className="text-white/35">{L(lang, "Item by item.", "आइटम-दर-आइटम।")}</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <Reveal className="min-w-0">
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-night-line bg-gradient-to-b from-night-3 to-night-2 p-7">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">
                  {L(lang, "Total construction cost", "कुल निर्माण खर्च")}
                </p>
                <p className="font-display mt-2 text-[34px] font-black leading-none tracking-tight text-amber sm:text-[44px]">
                  ₹<CountUp to={Math.round(total)} ms={1800} />
                </p>
                <p className="mt-3 text-[14px] text-white/60">
                  ₹{Math.round(perSqft).toLocaleString("en-IN")} / sq ft · {Math.round(builtUp).toLocaleString("en-IN")} sq ft ·{" "}
                  {items} {L(lang, "BOQ items", "BOQ आइटम")}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {tiles.map((t) => (
                  <div
                    key={t.k}
                    className="group rounded-2xl border border-night-line bg-night-2 p-4 transition hover:border-amber/50"
                  >
                    <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">{t.k}</dt>
                    <dd className="font-display mt-1.5 break-words text-[19px] font-extrabold leading-tight sm:text-[22px]">
                      {t.rupee && "₹"}
                      <CountUp
                        to={t.v}
                        format={(n) =>
                          n.toLocaleString("en-IN", { maximumFractionDigits: t.dec ?? 0, minimumFractionDigits: t.dec ?? 0 })
                        }
                      />
                      <span className="ml-1 text-[13px] font-semibold text-white/50">{t.unit}</span>
                    </dd>
                    {t.note && <dd className="mt-1 text-[11px] leading-snug text-white/40">{t.note}</dd>}
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal className="min-w-0" delay={120}>
            <div className="overflow-hidden rounded-3xl border border-night-line bg-night-2 shadow-[0_40px_120px_-40px_rgba(61,139,255,0.35)]">
              <div className="flex items-center justify-between gap-3 border-b border-night-line px-5 py-3.5">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                </span>
                <span className="text-[12px] font-semibold text-white/50">
                  {L(lang, "Abstract of cost · BOQFather", "एब्स्ट्रैक्ट ऑफ़ कॉस्ट · BOQFather")}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-[13px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-[0.1em] text-white/40">
                      <th className="px-5 py-3 font-semibold">{L(lang, "Item", "आइटम")}</th>
                      <th className="px-3 py-3 text-right font-semibold">{L(lang, "Qty", "मात्रा")}</th>
                      <th className="px-3 py-3 text-right font-semibold">{L(lang, "Rate", "रेट")}</th>
                      <th className="px-5 py-3 text-right font-semibold">{L(lang, "Amount", "रकम")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, k) => (
                      <tr
                        key={r.code}
                        className="row-in border-t border-night-line"
                        style={{ animationDelay: `${k * 90}ms` }}
                      >
                        <td className="px-5 py-3">
                          <span className="mr-2 font-mono text-[11px] text-amber">{r.code}</span>
                          <span className="text-white/85">{r.desc}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-white/70">{r.qty}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-white/70">{r.rate}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-right font-semibold tabular-nums">
                          ₹{Math.round(r.amount).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-night-line px-5 py-4">
                <p className="max-w-md text-[12px] leading-relaxed text-white/45">{caption}</p>
                <Link
                  href={href}
                  className="inline-flex h-11 items-center rounded-full bg-amber px-5 text-[14px] font-bold text-white hover:brightness-110"
                >
                  {L(lang, "Make my BOQ →", "मेरा BOQ बनाएं →")}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
