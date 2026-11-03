"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/site";
import { canWebGL, loadGsap, prefersReduced } from "./gsap";

export interface StageInfo {
  title: string;
  desc: string;
  facts: { k: string; v: string }[];
  /** BOQ cost of the work done up to this stage, ₹ */
  costSoFar: number;
}

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const lakh = (x: number, lang: Lang) =>
  `₹${(x / 1e5).toLocaleString("en-IN", { maximumFractionDigits: 1 })} ${L(lang, "lakh", "लाख")}`;

/**
 * Pinned scroll sequence: the house builds itself from an empty plot to a finished home.
 * Desktop: live 3D scrubbed by the scroll. Phones / no WebGL: the same eight stages as rendered stills.
 * Reduced motion: a plain list of the stages.
 */
export function BuildJourney({
  lang,
  stages,
  total,
  caption,
}: {
  lang: Lang;
  stages: StageInfo[];
  total: number;
  caption: string;
}) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"3d" | "img" | "list">("img");
  const [s, setS] = useState(0); // 0..7, float
  const target = useRef(0);

  useEffect(() => {
    if (prefersReduced()) return setMode("list");
    setMode(window.innerWidth >= 768 && canWebGL() ? "3d" : "img");
  }, []);

  // scroll → stage
  useEffect(() => {
    if (mode === "list") return;
    let stop = false;
    let kill = () => {};
    loadGsap().then(({ ScrollTrigger }) => {
      if (stop || !section.current) return;
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          // the last part of the scroll rests on the finished house
          target.current = Math.min(7, self.progress * 7.7);
        },
      });
      kill = () => st.kill();
    });
    return () => {
      stop = true;
      kill();
    };
  }, [mode]);

  // smooth follow + 3D render
  useEffect(() => {
    if (mode === "list") return;
    let stop = false;
    let raf = 0;
    let sc: import("../build/buildScene").BuildScene | null = null;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "200px" });
    if (section.current) io.observe(section.current);
    let cur = 0;
    const loop = (t: number) => {
      const d = target.current - cur;
      if (Math.abs(d) > 0.0005) {
        cur += d * 0.12;
        setS(cur);
      }
      if (sc && visible) {
        sc.setStage(cur);
        sc.render(t);
      }
      raf = requestAnimationFrame(loop);
    };
    (async () => {
      if (mode === "3d") {
        const { createBuildScene } = await import("../build/buildScene");
        if (stop || !canvas.current) return;
        sc = createBuildScene(canvas.current, { quality: window.innerWidth >= 1100 ? "high" : "low" });
        const ro = new ResizeObserver(() => sc?.resize());
        ro.observe(canvas.current);
        const prev = io.disconnect.bind(io);
        io.disconnect = () => {
          ro.disconnect();
          prev();
        };
      }
      raf = requestAnimationFrame(loop);
    })();
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      sc?.dispose();
    };
  }, [mode]);

  // stage k is being built while s runs from k to k+1
  const i = Math.min(7, Math.floor(s + 0.02));
  const st = stages[i];

  const head = (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-amber">
        {L(lang, "02 — Plot to home", "02 — प्लॉट से घर")}
      </p>
      <h2 className="font-display mt-3 max-w-3xl text-[36px] font-black uppercase leading-[0.95] tracking-tight [font-stretch:115%] sm:text-[60px]">
        {L(lang, "Watch it get built. Know what each stage costs.", "घर बनते देखिए। हर स्टेज का खर्च जानिए।")}
      </h2>
    </div>
  );

  if (mode === "list")
    return (
      <section id="build" className="bg-night py-20 text-white">
        {head}
        <ol className="mx-auto mt-10 grid max-w-7xl gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {stages.map((x, k) => (
            <li key={x.title} className="overflow-hidden rounded-2xl border border-night-line bg-night-2">
              <img src={`/home/stage-${k}.webp`} alt="" className="aspect-video w-full object-cover" loading="lazy" />
              <div className="p-4">
                <p className="text-[12px] font-bold text-amber">0{k + 1}</p>
                <h3 className="font-display text-[18px] font-extrabold">{x.title}</h3>
                <p className="mt-1 text-[14px] text-white/65">{x.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    );

  return (
    <section id="build" ref={section} className="relative bg-night text-white" style={{ height: "800vh" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {mode === "3d" ? (
          <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        ) : (
          <div aria-hidden="true" className="absolute inset-0">
            {stages.map((_, k) => (
              <img
                key={k}
                src={`/home/stage-${k}-m.webp`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: Math.max(0, Math.min(1, 1.6 - Math.abs(s - (k < 7 ? k + 0.5 : 7)) * 1.6)) }}
                loading={k < 2 ? "eager" : "lazy"}
              />
            ))}
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,11,0.85)_0%,rgba(8,9,11,0.35)_40%,rgba(8,9,11,0)_65%),linear-gradient(0deg,rgba(8,9,11,0.9)_0%,rgba(8,9,11,0)_30%),linear-gradient(180deg,rgba(8,9,11,0.7)_0%,rgba(8,9,11,0)_22%)]"
        />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-between px-5 pb-6 pt-20 sm:px-8 sm:pb-10">
          <div className="max-w-[min(100%,460px)]">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-amber">
              {L(lang, "Plot to home", "प्लॉट से घर")} · {String(i + 1).padStart(2, "0")} / 08
            </p>
            <h2 key={st.title} className="stage-in font-display mt-3 text-[34px] font-black uppercase leading-[0.95] tracking-tight [font-stretch:112%] sm:text-[54px]">
              {st.title}
            </h2>
            <p key={`d${i}`} className="stage-in mt-4 text-[15px] leading-relaxed text-white/75 sm:text-[17px]">
              {st.desc}
            </p>
            <dl key={`f${i}`} className="stage-in mt-6 grid grid-cols-2 gap-2 sm:gap-3">
              {st.facts.map((f) => (
                <div key={f.k} className="rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-3 backdrop-blur-md">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/55">{f.k}</dt>
                  <dd className="font-display mt-0.5 text-[18px] font-extrabold sm:text-[21px]">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
                  {L(lang, "BOQ cost so far", "अब तक का BOQ खर्च")}
                </p>
                <p className="font-display text-[26px] font-extrabold tabular-nums sm:text-[34px]">
                  {lakh(stages[i].costSoFar, lang)}
                  <span className="text-[15px] font-semibold text-white/45"> / {lakh(total, lang)}</span>
                </p>
              </div>
              <p className="hidden max-w-xs text-right text-[12px] text-white/45 md:block">{caption}</p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber shadow-[0_0_12px_#c6f432]"
                style={{ width: `${(stages[i].costSoFar / total) * 100}%`, transition: "width 400ms ease" }}
              />
            </div>
            <ol className="grid grid-cols-8 gap-1.5" aria-label={L(lang, "Stages", "स्टेज")}>
              {stages.map((x, k) => (
                <li key={x.title} className="flex flex-col gap-1.5">
                  <span className={`h-0.5 rounded-full transition-colors ${k <= i ? "bg-amber" : "bg-white/15"}`} />
                  <span className={`hidden truncate text-[11px] font-semibold uppercase tracking-wide sm:block ${k === i ? "text-white" : "text-white/40"}`}>
                    {x.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
