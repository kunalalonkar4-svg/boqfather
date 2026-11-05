"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "./Chrome";

export function HomePage({ lang }: { lang: Lang }) {
  const d = t(lang);

  // Estimator State
  const [area, setArea] = useState<number>(1200);
  const [quality, setQuality] = useState<"standard" | "premium" | "luxury">("premium");
  const [activeTab, setActiveTab] = useState<"cost" | "materials">("cost");

  const rates = {
    standard: 1650,
    premium: 2050,
    luxury: 2750,
  };

  const totalCost = area * rates[quality];
  const cementBags = Math.round(area * 0.42);
  const steelTons = ((area * 3.8) / 1000).toFixed(1);
  const sandCuft = Math.round(area * 1.8);
  const bricksCount = Math.round(area * 18);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}${langPath(lang)}`,
    inLanguage: lang === "hi" ? "hi-IN" : "en-IN",
    description: d.home_sub,
  };

  const plotPresets = [
    { w: 20, d: 40, area: 800, gaj: 89, est: "₹16.4 L" },
    { w: 20, d: 50, area: 1000, gaj: 111, est: "₹20.5 L" },
    { w: 25, d: 50, area: 1250, gaj: 139, est: "₹25.6 L" },
    { w: 30, d: 40, area: 1200, gaj: 133, est: "₹24.6 L" },
    { w: 30, d: 50, area: 1500, gaj: 167, est: "₹30.8 L" },
    { w: 40, d: 60, area: 2400, gaj: 267, est: "₹49.2 L" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en")} />

      <main lang={lang} className="flex-1">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          {/* Subtle Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 blur-[120px] pointer-events-none rounded-full" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/80 text-xs font-mono text-slate-300 mb-6">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>PRECISION CONSTRUCTION ESTIMATOR</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto mb-4">
            Plan your house construction. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Know every brick & rupee.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Turn your plot size into accurate item-wise BOQ, material requirements, and turnkey construction cost estimates within seconds.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <Link
              href={langPath(lang, "house-boq-estimate")}
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25"
            >
              Start Free BOQ Estimate →
            </Link>
            <Link
              href={langPath(lang, "contractor-quote-checker")}
              className="px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition-all"
            >
              Check Contractor Quote
            </Link>
          </div>

          {/* Interactive Live Cockpit Card (No Cartoon Maps!) */}
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-left">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase font-mono text-slate-400">Live Project Estimator</span>
                <h3 className="text-lg font-bold text-white mt-0.5">30 × 40 ft G+1 Duplex (1,200 sq.ft)</h3>
              </div>
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setActiveTab("cost")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "cost" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Cost Breakdown
                </button>
                <button
                  onClick={() => setActiveTab("materials")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "materials" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Key Materials
                </button>
              </div>
            </div>

            {/* Metrics Display */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6 items-center">
              <div className="md:col-span-7 space-y-4">
                {activeTab === "cost" ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs py-2 border-b border-slate-800/80">
                      <span className="text-slate-300">Structure & RCC (Foundations, Columns, Slabs)</span>
                      <span className="font-mono font-bold text-white">₹14.20 L (53%)</span>
                    </div>
                    <div className="flex justify-between text-xs py-2 border-b border-slate-800/80">
                      <span className="text-slate-300">Brick Masonry & Sand Plaster</span>
                      <span className="font-mono font-bold text-white">₹4.80 L (18%)</span>
                    </div>
                    <div className="flex justify-between text-xs py-2 border-b border-slate-800/80">
                      <span className="text-slate-300">Flooring, Paint, Doors & Windows</span>
                      <span className="font-mono font-bold text-white">₹5.20 L (19%)</span>
                    </div>
                    <div className="flex justify-between text-xs py-2">
                      <span className="text-slate-300">Electrical & Plumbing Rough-ins</span>
                      <span className="font-mono font-bold text-white">₹2.64 L (10%)</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block mb-1">OPC 53 Cement</span>
                      <span className="text-lg font-bold font-mono text-white">460 Bags</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block mb-1">TMT Steel (Fe 550)</span>
                      <span className="text-lg font-bold font-mono text-white">4.2 Tons</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block mb-1">River Sand</span>
                      <span className="text-lg font-bold font-mono text-white">2,160 Cu.ft</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Red Clay Bricks</span>
                      <span className="text-lg font-bold font-mono text-white">21,600 Nos</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Card */}
              <div className="md:col-span-5 p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between h-full">
                <div>
                  <span className="text-xs uppercase font-mono text-slate-400">Total Project Valuation</span>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1 mb-2">
                    ₹26,84,000
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Turnkey rate @ ₹2,236/sq.ft including all materials, labor, and supervision.
                  </p>
                </div>

                <Link
                  href={langPath(lang, "house-boq-estimate")}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center transition-all shadow-md"
                >
                  Generate BOQ For Your Plot →
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* ================= INTERACTIVE SLIDER SECTION ================= */}
        <section className="py-16 border-t border-slate-800/80 bg-slate-900/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Calibrate your build budget
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Slide the area bar to estimate total turnkey cost and materials in real time.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-sm font-mono mb-2">
                    <span className="text-slate-400">COVERED SLAB AREA</span>
                    <span className="text-blue-400 text-lg font-bold">{area} SQ.FT</span>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="4000"
                    step="50"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                    <span>600 sq.ft</span>
                    <span>2,000 sq.ft</span>
                    <span>4,000 sq.ft</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-mono text-slate-400 mb-2 uppercase">
                    Finish Quality
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {(["standard", "premium", "luxury"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setQuality(lvl)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          quality === lvl
                            ? "bg-blue-600/20 border-blue-500 text-blue-300"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {lvl} (₹{rates[lvl]}/sq.ft)
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">Total Est. Cost</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      ₹{(totalCost / 100000).toFixed(2)} Lakh
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs font-mono text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Cement</span>
                      <span className="font-bold">{cementBags} Bags</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Steel</span>
                      <span className="font-bold">{steelTons} Tons</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ================= PLOT DIMENSIONS SELECTOR (NO CARTOON MAPS) ================= */}
        <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Standard plot dimensions
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your plot size below to calculate exact turnkey BOQ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plotPresets.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold font-mono text-white">
                      {item.w} × {item.d} ft
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono">
                      {item.gaj} Gaj
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Covered Built-up: <strong className="text-slate-200">{item.area} sq.ft</strong> (G+1 Structure)
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Est. Budget</span>
                    <span className="text-base font-bold font-mono text-emerald-400">{item.est}</span>
                  </div>
                  <Link
                    href={langPath(lang, `house-boq-estimate?w=${item.w}&d=${item.d}`)}
                    className="py-1.5 px-3.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
                  >
                    View BOQ →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ================= 9 MATERIAL CALCULATORS ================= */}
        <section className="py-20 border-t border-slate-800/80 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Dedicated material calculators
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Zero-wastage structural calculators for Indian trade standards.
              </p>
            </div>
            <Link
              href={langPath(lang, "calculators")}
              className="text-xs font-mono text-blue-400 hover:text-blue-300"
            >
              All 9 Calculators →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CALCULATORS.filter(
              (c) => !["house-construction-cost-calculator", "house-boq-estimate", "contractor-quote-checker"].includes(c.slug)
            ).map((c) => (
              <Link
                key={c.slug}
                href={langPath(lang, c.slug)}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/80 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-400 font-mono font-bold flex items-center justify-center text-xs">
                      {c.mark}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {c[lang].name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {c[lang].short}
                  </p>
                </div>
                <span className="mt-4 text-[11px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                  Open Calculator →
                </span>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}

export function CalculatorsIndex({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <SiteHeader
        lang={lang}
        altPath={langPath(lang === "en" ? "hi" : "en", "calculators")}
      />
      <main lang={lang} className="flex-1 max-w-6xl mx-auto px-4 pt-12 pb-24 sm:px-6 w-full">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
          {d.calculators_h1}
        </h1>
        <p className="max-w-2xl text-slate-400 text-sm mb-8">
          {d.calculators_sub}
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((c) => (
            <li key={c.slug}>
              <Link
                href={langPath(lang, c.slug)}
                className="flex h-full flex-col p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold font-mono text-blue-400">
                    {c.mark}
                  </span>
                  <span className="text-base font-bold text-white">{c[lang].name}</span>
                </div>
                <span className="text-xs leading-relaxed text-slate-400 mb-4">
                  {c[lang].intro}
                </span>
                <span className="mt-auto text-xs font-mono text-blue-400">
                  Open Calculator →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter lang={lang} />
    </div>
  );
}
