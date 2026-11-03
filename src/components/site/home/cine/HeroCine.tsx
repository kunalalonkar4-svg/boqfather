"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/site";
import { canWebGL, loadGsap, prefersReduced } from "./gsap";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

/** Full-screen hero: the finished house at blue hour, live 3D on capable screens, a still render elsewhere. */
export function HeroCine({
  lang,
  stats,
  estimateHref,
  plansHref,
}: {
  lang: Lang;
  stats: [string, string][];
  estimateHref: string;
  plansHref: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let stop = false;
    let cleanup = () => {};
    const wide = window.innerWidth >= 900;
    if (wide && !prefersReduced() && canWebGL()) {
      (async () => {
        const { createBuildScene } = await import("../build/buildScene");
        if (stop || !canvas.current) return;
        const sc = createBuildScene(canvas.current, { quality: "high", frame: "hero" });
        sc.setStage(7);
        sc.setDrift(true);
        let raf = 0;
        let visible = true;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(canvas.current);
        const loop = (t: number) => {
          if (visible) sc.render(t);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        const ro = new ResizeObserver(() => sc.resize());
        ro.observe(canvas.current);
        setTimeout(() => !stop && setLive(true), 250);
        cleanup = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          ro.disconnect();
          sc.dispose();
        };
      })();
    }
    // copy drifts up and fades as the page scrolls
    if (!prefersReduced())
      loadGsap().then(({ gsap }) => {
        if (stop || !root.current || !copy.current) return;
        const tw = gsap.to(copy.current, {
          yPercent: -18,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        const prev = cleanup;
        cleanup = () => {
          tw.scrollTrigger?.kill();
          tw.kill();
          prev();
        };
      });
    return () => {
      stop = true;
      cleanup();
    };
  }, []);

  const lines = lang === "hi"
    ? ["आपके घर का", "पूरा खर्च।", "आइटम-दर-आइटम।"]
    : ["THE FULL COST", "OF YOUR HOUSE.", "ITEM BY ITEM."];

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-[88svh] flex-col justify-end overflow-hidden bg-night text-white"
    >
      {/* still render (always there; the live scene fades in over it) */}
      <picture>
        <source media="(max-width: 767px)" srcSet="/home/hero-house-m.webp" />
        <img
          src="/home/hero-house.webp"
          alt={L(lang, "Modern G+1 house at dusk, 30×40 ft plot", "शाम के समय आधुनिक G+1 घर, 30×40 फ़ीट प्लॉट")}
          className="kenburns absolute inset-0 -z-20 h-full w-full object-cover object-[60%_center]"
          fetchPriority="high"
        />
      </picture>
      <canvas
        ref={canvas}
        aria-hidden="true"
        className={`absolute inset-0 -z-10 h-full w-full transition-opacity duration-[1500ms] ${live ? "opacity-100" : "opacity-0"}`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,11,0.92)_0%,rgba(8,9,11,0.6)_38%,rgba(8,9,11,0)_68%),linear-gradient(0deg,#08090b_0%,rgba(8,9,11,0)_35%)]"
      />
      <div ref={copy} className="mx-auto w-full max-w-7xl px-5 pb-8 pt-24 sm:px-8 lg:pb-10">
        <p className="reveal-up mb-6 inline-flex max-w-full items-center gap-2 rounded-2xl border border-amber/40 bg-amber/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber sm:rounded-full sm:text-[12px] sm:tracking-[0.22em]">
          <span className="h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_10px_#3b82f6]" />
          {L(lang, "The engineer's way to build smarter", "समझदारी से घर बनाने का इंजीनियर वाला तरीका")}
        </p>
        <h1 className="font-display max-w-4xl text-[34px] font-black leading-[0.95] tracking-[-0.02em] sm:text-[50px] lg:text-[64px]">
          {lines.map((l, i) => (
            <span key={l} className="block overflow-hidden pb-[0.06em]">
              <span
                className={`line-up block ${i === 2 ? "text-amber" : ""}`}
                style={{ animationDelay: `${150 + i * 140}ms` }}
              >
                {l}
              </span>
            </span>
          ))}
        </h1>
        <p
          className="reveal-up mt-6 max-w-xl text-[16px] leading-relaxed text-white/75 sm:text-[18px]"
          style={{ animationDelay: "650ms" }}
        >
          {L(
            lang,
            "From your first plot measurement to the final construction BOQ. Know what your house needs before construction begins.",
            "प्लॉट के पहले नाप से आख़िरी BOQ तक। निर्माण शुरू होने से पहले जानिए कि आपके घर को क्या-क्या चाहिए।",
          )}
        </p>
        <div className="reveal-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "800ms" }}>
          <Link
            href={estimateHref}
            className="group inline-flex h-14 items-center gap-3 rounded-full bg-amber pl-7 pr-2 text-[16px] font-bold text-white shadow-[0_0_40px_-8px_rgba(23,105,210,0.7)] transition hover:brightness-110"
          >
            {L(lang, "Make my estimate", "मेरा एस्टिमेट बनाएं")}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-night text-amber transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href={plansHref}
            className="inline-flex h-14 items-center rounded-full border border-white/30 bg-white/5 px-7 text-[16px] font-bold backdrop-blur transition hover:border-white hover:bg-white/10"
          >
            {L(lang, "Explore house plans", "घर के नक्शे देखें")}
          </Link>
        </div>
        <div className="reveal-up mt-10 flex items-end justify-between gap-6" style={{ animationDelay: "1000ms" }}>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:gap-10">
            {stats.map(([v, k]) => (
              <div key={k}>
                <dt className="sr-only">{k}</dt>
                <dd className="font-display text-[26px] font-extrabold leading-none sm:text-[32px]">{v}</dd>
                <dd className="mt-1 text-[12px] font-medium uppercase tracking-[0.12em] text-white/55">{k}</dd>
              </div>
            ))}
          </dl>
          <a
            href="#build"
            className="hidden shrink-0 flex-col items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white md:flex"
          >
            {L(lang, "Scroll", "स्क्रॉल")}
            <span className="relative h-12 w-[1px] overflow-hidden bg-white/20">
              <span className="scroll-cue absolute left-0 top-0 h-4 w-full bg-amber" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
