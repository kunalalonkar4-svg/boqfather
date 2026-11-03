"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/site";
import { Reveal } from "../Motion";
import { prefersReduced } from "./gsap";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

export interface ReportTab {
  key: string;
  label: string;
  title: string;
  points: string[];
  img: string;
  alt: string;
}

/** Section 6: the reports, shown with screenshots of the real tool inside a browser frame. */
export function Reports({
  lang,
  tabs,
  href,
  extras,
}: {
  lang: Lang;
  tabs: ReportTab[];
  href: string;
  extras: { href: string; title: string; text: string; tag: string }[];
}) {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!auto || prefersReduced()) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (box.current) io.observe(box.current);
    const id = setInterval(() => visible && setI((x) => (x + 1) % tabs.length), 5200);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [auto, tabs.length]);
  const t = tabs[i];

  return (
    <section className="relative overflow-hidden bg-night py-16 text-white sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-0 h-[520px] w-[520px] rounded-full bg-amber/10 blur-[140px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-amber">
            {L(lang, "06 — Engineering reports", "06 — इंजीनियरिंग रिपोर्ट")}
          </p>
          <h2 className="font-display mt-3 max-w-4xl text-[28px] font-black uppercase leading-[0.95] tracking-tight sm:text-[40px]">
            {L(lang, "Reports a site engineer would sign.", "ऐसी रिपोर्ट, जिस पर साइट इंजीनियर साइन करे।")}
          </h2>
        </Reveal>
        <div ref={box} className="mt-10 flex gap-2 overflow-x-auto pb-2" role="tablist">
          {tabs.map((x, k) => (
            <button
              key={x.key}
              type="button"
              role="tab"
              aria-selected={k === i}
              onClick={() => {
                setI(k);
                setAuto(false);
              }}
              className={`relative shrink-0 overflow-hidden rounded-full border px-4 py-2.5 text-[14px] font-bold transition ${
                k === i ? "border-amber bg-amber text-night" : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
              }`}
            >
              {x.label}
              {k === i && auto && <span className="tab-timer absolute bottom-0 left-0 h-[2px] bg-night/40" />}
            </button>
          ))}
        </div>
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div key={t.key} className="stage-in">
            <h3 className="font-display text-[28px] font-extrabold leading-tight sm:text-[26px]">{t.title}</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {t.points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-white/70">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href={href}
              className="mt-8 inline-flex h-12 items-center rounded-full border border-white/25 px-6 text-[15px] font-bold transition hover:border-amber hover:text-amber"
            >
              {L(lang, "Open the BOQ tool →", "BOQ टूल खोलें →")}
            </Link>
          </div>
          <div className="relative [perspective:1600px]">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-night-2 shadow-[0_60px_140px_-50px_rgba(61,139,255,0.6)] transition duration-700 lg:[transform:rotateY(-8deg)_rotateX(3deg)] lg:hover:[transform:none]">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </span>
                <span className="ml-2 truncate rounded-md bg-white/5 px-3 py-1 text-[11px] text-white/45">
                  boqfather.vercel.app/house-boq-estimate
                </span>
              </div>
              <div className="relative aspect-[16/10] bg-white">
                {tabs.map((x, k) => (
                  <img
                    key={x.key}
                    src={x.img}
                    alt={x.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700"
                    style={{ opacity: k === i ? 1 : 0 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {extras.map((e, k) => (
            <Reveal key={e.href} delay={k * 80}>
              <Link
                href={e.href}
                className="group flex h-full flex-col gap-2 rounded-2xl border border-night-line bg-[linear-gradient(rgba(61,139,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(61,139,255,0.06)_1px,transparent_1px)] bg-night-2 [background-size:20px_20px] p-5 transition hover:border-glow/60"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-glow">{e.tag}</span>
                <span className="font-display text-[19px] font-extrabold">{e.title}</span>
                <span className="text-[14px] leading-relaxed text-white/60">{e.text}</span>
                <span className="mt-auto pt-2 text-[14px] font-bold text-white/80 group-hover:text-amber">
                  {L(lang, "Open →", "खोलें →")}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
