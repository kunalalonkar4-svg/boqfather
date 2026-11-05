"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "./Chrome";

export function HomePage({ lang }: { lang: Lang }) {
  const d = t(lang);

  // Cockpit Estimator State
  const [area, setArea] = useState<number>(1200);
  const [quality, setQuality] = useState<"standard" | "premium" | "luxury">("premium");
  const [activeTab, setActiveTab] = useState<"boq" | "materials" | "stages">("boq");

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
    <>
      <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en")} />

      <main lang={lang} className="bg-[#0e0e0e] text-[#ffffff] min-h-screen selection:bg-[#405bff]/30 selection:text-white">
        
        {/* ================= 1. HERO SECTION (LAUNCHDARKLY NEON COCKPIT) ================= */}
        <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto text-center overflow-hidden">
          {/* Signal Violet Ambient Wash */}
          <div 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none rounded-full blur-[140px] opacity-25"
            style={{ background: "linear-gradient(179deg, #405bff 1.06%, #7084ff 123.42%)" }}
          />

          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[30px] border border-[#414042] bg-[#191919] text-xs font-mono tracking-[0.167em] text-[#d1d3d4] mb-8">
            <span className="h-2 w-2 rounded-full bg-[#405bff] animate-pulse" />
            <span>BOQ ESTIMATION RUNTIME v2.0</span>
          </div>

          {/* Two-Line Display Headline (LaunchDarkly Signature) */}
          <h1 className="text-4xl sm:text-7xl lg:text-[84px] font-[500] leading-[1.05] tracking-tight max-w-5xl mx-auto mb-6">
            <span className="text-[#ffffff] block">Build at engineering speed.</span>
            <span className="bg-gradient-to-b from-[#7084ff] to-[#405bff] bg-clip-text text-transparent block">
              Stay in cost control.
            </span>
          </h1>

          <p className="text-base sm:text-lg font-[400] text-[#a7a9ac] max-w-2xl mx-auto leading-relaxed mb-10">
            The turnkey construction estimation layer. Transform plot dimensions into verified item-wise BOQs, contractor-proof quantities, and bank-ready financials.
          </p>

          {/* LaunchDarkly Hero Form Console Input */}
          <div className="max-w-[620px] mx-auto p-1.5 sm:p-2 rounded-[60px] bg-[#191919] border border-[#414042] shadow-[0_0_40px_rgba(64,91,255,0.22)] flex flex-col sm:flex-row items-center gap-2 mb-12">
            <div className="flex-1 flex items-center px-4 w-full">
              <span className="text-xs font-mono text-[#58595b] mr-2">PLOT AREA:</span>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                placeholder="Enter plot area in sq.ft..."
                className="bg-transparent border-none text-[#ffffff] font-mono text-sm sm:text-base focus:outline-none w-full placeholder-[#58595b]"
              />
              <span className="text-xs font-mono text-[#7084ff]">SQ.FT</span>
            </div>

            <Link
              href={langPath(lang, `house-boq-estimate?w=${Math.round(Math.sqrt(area * 1.5))}&d=${Math.round(Math.sqrt(area / 1.5))}`)}
              className="w-full sm:w-auto px-7 py-3 rounded-[30px] bg-[#405bff] hover:bg-[#354cdb] text-white text-sm font-[500] transition-colors whitespace-nowrap text-center"
            >
              Get Itemized BOQ →
            </Link>
          </div>

          {/* Grayscale Logo / Trust Strip */}
          <div className="pt-6 border-t border-[#2c2c2c] max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-[#6d6e71] uppercase tracking-wider">
            <span>IS 1200 / CPWD COMPLIANT</span>
            <span>•</span>
            <span>ZERO SPREADSHEET DRIFT</span>
            <span>•</span>
            <span>STATE SCHEDULE OF RATES (SOR)</span>
          </div>

          {/* ================= EMBEDDED PRODUCT WHITE SCREENSHOT PANEL ================= */}
          {/* Key LaunchDarkly pattern: Light workspace panel on dark canvas */}
          <div className="mt-16 text-left rounded-[30px] bg-[#ffffff] p-6 sm:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.45)] text-[#0e0e0e] max-w-[1100px] mx-auto border border-[#d1d3d4]">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-[#10b981]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#64748b]">
                  LIVE WORKSPACE: {area} SQ.FT G+1 TURNKEY BILL OF QUANTITIES
                </span>
              </div>

              {/* Segmented Tab Control */}
              <div className="inline-flex p-1 rounded-[30px] bg-[#f1f5f9] border border-[#e2e8f0]">
                <button
                  onClick={() => setActiveTab("boq")}
                  className={`px-4 py-1.5 rounded-[30px] text-xs font-[500] transition-all flex items-center gap-1.5 ${
                    activeTab === "boq" ? "bg-[#0e0e0e] text-white shadow-sm" : "text-[#64748b] hover:text-[#0e0e0e]"
                  }`}
                >
                  {activeTab === "boq" && <span className="h-1.5 w-1.5 rounded-full bg-[#405bff]" />}
                  Financial Breakdown
                </button>
                <button
                  onClick={() => setActiveTab("materials")}
                  className={`px-4 py-1.5 rounded-[30px] text-xs font-[500] transition-all flex items-center gap-1.5 ${
                    activeTab === "materials" ? "bg-[#0e0e0e] text-white shadow-sm" : "text-[#64748b] hover:text-[#0e0e0e]"
                  }`}
                >
                  {activeTab === "materials" && <span className="h-1.5 w-1.5 rounded-full bg-[#405bff]" />}
                  Material Schedule
                </button>
                <button
                  onClick={() => setActiveTab("stages")}
                  className={`px-4 py-1.5 rounded-[30px] text-xs font-[500] transition-all flex items-center gap-1.5 ${
                    activeTab === "stages" ? "bg-[#0e0e0e] text-white shadow-sm" : "text-[#64748b] hover:text-[#0e0e0e]"
                  }`}
                >
                  {activeTab === "stages" && <span className="h-1.5 w-1.5 rounded-full bg-[#405bff]" />}
                  Execution Stages
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                {activeTab === "boq" && (
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between items-center text-sm py-2 border-b border-[#f1f5f9]">
                      <span className="font-[500] text-[#334155]">Substructure & RCC Frame (PCC, Footings, Columns)</span>
                      <span className="font-mono font-bold text-[#0e0e0e]">₹{((totalCost * 0.52) / 100000).toFixed(2)} L</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2 border-b border-[#f1f5f9]">
                      <span className="font-[500] text-[#334155]">Brick Masonry, Parapets & Sand Plaster</span>
                      <span className="font-mono font-bold text-[#0e0e0e]">₹{((totalCost * 0.18) / 100000).toFixed(2)} L</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2 border-b border-[#f1f5f9]">
                      <span className="font-[500] text-[#334155]">Architectural Finishes (Vitrified Tiles, Paint, Joinery)</span>
                      <span className="font-mono font-bold text-[#0e0e0e]">₹{((totalCost * 0.20) / 100000).toFixed(2)} L</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2">
                      <span className="font-[500] text-[#334155]">Concealed Conduit Electrical & Sanitary Plumbing</span>
                      <span className="font-mono font-bold text-[#0e0e0e]">₹{((totalCost * 0.10) / 100000).toFixed(2)} L</span>
                    </div>
                  </div>
                )}

                {activeTab === "materials" && (
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="text-[#64748b] block mb-1">OPC 53 Cement</span>
                      <span className="text-xl font-bold text-[#0e0e0e]">{cementBags} Bags</span>
                    </div>
                    <div className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="text-[#64748b] block mb-1">TMT Fe 550D Rebar</span>
                      <span className="text-xl font-bold text-[#0e0e0e]">{steelTons} Tons</span>
                    </div>
                    <div className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="text-[#64748b] block mb-1">Coarse Sand</span>
                      <span className="text-xl font-bold text-[#0e0e0e]">{sandCuft} Cu.ft</span>
                    </div>
                    <div className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="text-[#64748b] block mb-1">Standard Red Clay Bricks</span>
                      <span className="text-xl font-bold text-[#0e0e0e]">{bricksCount} Units</span>
                    </div>
                  </div>
                )}

                {activeTab === "stages" && (
                  <div className="space-y-2 text-xs font-sans">
                    <div className="flex justify-between p-3 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="font-medium text-[#1e293b]">Foundation, Plinth Beam & DPC</span>
                      <span className="font-mono text-[#2563eb] font-semibold">Weeks 1 – 4</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="font-medium text-[#1e293b]">RCC Columns & First Floor Slab Casting</span>
                      <span className="font-mono text-[#2563eb] font-semibold">Weeks 5 – 9</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="font-medium text-[#1e293b]">Internal Brickwork & Plaster Curing</span>
                      <span className="font-mono text-[#2563eb] font-semibold">Weeks 10 – 14</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="font-medium text-[#1e293b]">Tiling, Electrical Fitments & Final Coat Paint</span>
                      <span className="font-mono text-[#10b981] font-semibold">Weeks 15 – 18</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Summary Column */}
              <div className="lg:col-span-5 p-6 rounded-[20px] bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase font-mono font-semibold text-[#64748b]">Total Valuation @ {quality} finish</span>
                  <div className="text-4xl font-[500] font-mono text-[#0e0e0e] mt-1 mb-2">
                    ₹{(totalCost / 100000).toFixed(2)} Lakh
                  </div>
                  <p className="text-xs text-[#64748b] leading-relaxed mb-6 font-sans">
                    Estimated turnkey construction contract cost for {area} sq.ft covered area at ₹{rates[quality]}/sq.ft benchmark.
                  </p>
                </div>

                <Link
                  href={langPath(lang, "house-boq-estimate")}
                  className="w-full py-3.5 px-6 rounded-[30px] bg-[#0e0e0e] hover:bg-[#191919] text-white text-xs font-semibold text-center transition-all shadow-md"
                >
                  Export Measurement Book (.XLSX & .PDF) →
                </Link>
              </div>

            </div>
          </div>
        </section>


        {/* ================= 2. INTERACTIVE ESTIMATOR SLIDER SECTION ================= */}
        <section className="py-24 border-t border-[#191919] max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-[500] text-white tracking-tight">
              Calibrate your build budget
            </h2>
            <p className="text-sm text-[#a7a9ac] mt-2">
              Move the slider to configure covered square footage and structural specifications.
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-[30px] bg-[#191919] border border-[#414042] max-w-4xl mx-auto shadow-[0_0_35px_rgba(112,132,255,0.08)]">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center text-sm font-mono mb-3">
                  <span className="text-[#a7a9ac]">COVERED SLAB AREA</span>
                  <span className="text-[#7084ff] text-xl font-bold">{area} SQ.FT</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="4000"
                  step="50"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full h-2 bg-[#2c2c2c] rounded-[10px] appearance-none cursor-pointer accent-[#405bff]"
                />
                <div className="flex justify-between text-xs font-mono text-[#58595b] mt-2">
                  <span>600 sq.ft</span>
                  <span>2,000 sq.ft</span>
                  <span>4,000 sq.ft</span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-mono text-[#a7a9ac] mb-3 uppercase tracking-wider">
                  Material Specification Standard
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {(["standard", "premium", "luxury"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setQuality(lvl)}
                      className={`py-3 px-4 rounded-[30px] text-xs font-[500] capitalize border transition-all ${
                        quality === lvl
                          ? "bg-[#405bff]/20 border-[#7084ff] text-[#ffffff] shadow-[0_0_20px_rgba(64,91,255,0.25)]"
                          : "bg-[#191919] border-[#414042] text-[#d1d3d4] hover:border-[#6d6e71]"
                      }`}
                    >
                      {lvl} (₹{rates[lvl]}/sq.ft)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ================= 3. STANDARD PLOT BENCHMARKS (NO CARTOON MAPS) ================= */}
        <section className="py-24 border-t border-[#191919] max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-[500] text-white tracking-tight">
              Standard plot dimensions
            </h2>
            <p className="text-sm text-[#a7a9ac] mt-2">
              Pre-calculated structural bill of quantities indexed by residential plot sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plotPresets.map((item, idx) => (
              <div
                key={idx}
                className="p-8 rounded-[30px] bg-[#191919] border border-[#414042] hover:border-[#7084ff] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-[500] font-mono text-[#ffffff]">
                      {item.w} × {item.d} ft
                    </span>
                    <span className="px-3 py-1 rounded-[30px] bg-[#405bff]/10 text-[#7084ff] border border-[#405bff]/30 text-xs font-mono">
                      {item.gaj} Gaj
                    </span>
                  </div>
                  <p className="text-xs text-[#a7a9ac] font-sans">
                    Structural Footprint: <span className="text-white font-mono">{item.area} sq.ft</span> (G+1 Standard)
                  </p>
                </div>

                <div className="pt-6 border-t border-[#2c2c2c] mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-[#6d6e71] block">Turnkey Budget</span>
                    <span className="text-xl font-bold font-mono text-white">{item.est}</span>
                  </div>
                  <Link
                    href={langPath(lang, `house-boq-estimate?w=${item.w}&d=${item.d}`)}
                    className="px-5 py-2.5 rounded-[30px] bg-[#2c2c2c] group-hover:bg-[#405bff] text-white text-xs font-[500] transition-colors"
                  >
                    View BOQ →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ================= 4. CORE PLATFORM CAPABILITIES (3-COL LAUNCHDARKLY CARDS) ================= */}
        <section className="py-24 border-t border-[#191919] max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-[500] text-white tracking-tight">
              Built for engineering precision
            </h2>
            <p className="text-sm text-[#a7a9ac] mt-2">
              Eliminate guesswork across materials, labor contracts, and tender documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="p-8 sm:p-10 rounded-[30px] bg-[#191919] border border-[#414042] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#7084ff] block mb-3">01 / AUDIT</span>
                <h3 className="text-xl font-[500] text-white mb-3">Contractor Quote Checker</h3>
                <p className="text-sm text-[#a7a9ac] leading-relaxed">
                  Upload or benchmark contractor quotes against local state PWD schedule of rates. Identify item-level inflation before signing contracts.
                </p>
              </div>
              <Link
                href={langPath(lang, "contractor-quote-checker")}
                className="mt-8 text-xs font-mono text-[#7084ff] hover:text-white transition-colors"
              >
                Inspect Contractor Rates →
              </Link>
            </div>

            {/* Card 2 */}
            <div className="p-8 sm:p-10 rounded-[30px] bg-[#191919] border border-[#414042] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#7084ff] block mb-3">02 / COMPLIANCE</span>
                <h3 className="text-xl font-[500] text-white mb-3">IS 1200 Measurement Book</h3>
                <p className="text-sm text-[#a7a9ac] leading-relaxed">
                  Generate formal measurement sheets categorized by excavation, plain cement concrete, RCC superstructure, and plastering divisions.
                </p>
              </div>
              <Link
                href={langPath(lang, "house-boq-estimate")}
                className="mt-8 text-xs font-mono text-[#7084ff] hover:text-white transition-colors"
              >
                Generate Measurement Sheet →
              </Link>
            </div>

            {/* Card 3 */}
            <div className="p-8 sm:p-10 rounded-[30px] bg-[#191919] border border-[#414042] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#7084ff] block mb-3">03 / EXPORT</span>
                <h3 className="text-xl font-[500] text-white mb-3">Bank Loan Documentation</h3>
                <p className="text-sm text-[#a7a9ac] leading-relaxed">
                  One-click export of structured estimates to Microsoft Excel (.XLSX) and verified PDF reports formatted for housing loan disbursement.
                </p>
              </div>
              <span className="mt-8 text-xs font-mono text-[#6d6e71]">
                XLSX · PDF · CPWD FORMAT
              </span>
            </div>

          </div>
        </section>


        {/* ================= 5. ALL 9 ENGINEERING CALCULATORS ================= */}
        <section className="py-24 border-t border-[#191919] max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-[500] text-white tracking-tight">
                Dedicated material calculators
              </h2>
              <p className="text-xs font-mono text-[#a7a9ac] mt-1">
                Zero-wastage structural calculators calibrated for Indian trade standards.
              </p>
            </div>
            <Link
              href={langPath(lang, "calculators")}
              className="text-xs font-mono text-[#7084ff] hover:text-white"
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
                className="p-6 rounded-[30px] bg-[#191919] border border-[#414042] hover:border-[#7084ff] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-8 w-8 rounded-[10px] bg-[#2c2c2c] text-[#7084ff] font-mono font-bold flex items-center justify-center text-xs">
                      {c.mark}
                    </span>
                    <h3 className="text-sm font-[500] text-white group-hover:text-[#7084ff] transition-colors">
                      {c[lang].name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#a7a9ac] leading-relaxed">
                    {c[lang].short}
                  </p>
                </div>
                <span className="mt-5 text-[11px] font-mono text-[#6d6e71] group-hover:text-[#d1d3d4] transition-colors">
                  Launch Tool →
                </span>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <SiteFooter lang={lang} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

export function CalculatorsIndex({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <>
      <SiteHeader
        lang={lang}
        altPath={langPath(lang === "en" ? "hi" : "en", "calculators")}
      />
      <main lang={lang} className="bg-[#0e0e0e] text-white mx-auto max-w-[1200px] px-4 pt-16 pb-28 sm:px-6">
        <h1 className="text-3xl sm:text-5xl font-[500] tracking-tight mb-3">
          {d.calculators_h1}
        </h1>
        <p className="max-w-2xl text-[#a7a9ac] text-sm mb-12">
          {d.calculators_sub}
        </p>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((c) => (
            <li key={c.slug}>
              <Link
                href={langPath(lang, c.slug)}
                className="flex h-full flex-col p-8 rounded-[30px] bg-[#191919] border border-[#414042] hover:border-[#7084ff] transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#2c2c2c] text-sm font-bold font-mono text-[#7084ff]">
                    {c.mark}
                  </span>
                  <span className="text-base font-[500] text-white">{c[lang].name}</span>
                </div>
                <span className="text-xs leading-relaxed text-[#a7a9ac] mb-6">
                  {c[lang].intro}
                </span>
                <span className="mt-auto text-xs font-mono text-[#7084ff]">
                  Open Calculator →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
