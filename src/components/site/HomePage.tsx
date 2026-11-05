"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CALCULATORS } from "@/content/calculators";
import { t } from "@/i18n/ui";
import { Lang, langPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "./Chrome";

export function HomePage({ lang }: { lang: Lang }) {
  const d = t(lang);

  // Live Interactive Estimator State
  const [area, setArea] = useState<number>(1200);
  const [quality, setQuality] = useState<"standard" | "premium" | "luxury">("premium");
  const [activeTab, setActiveTab] = useState<"breakdown" | "materials" | "timeline">("breakdown");

  const rates = {
    standard: 1650,
    premium: 2050,
    luxury: 2750,
  };

  const totalCost = area * rates[quality];
  const cementBags = Math.round(area * 0.42);
  const steelTons = ((area * 3.8) / 1000).toFixed(1);
  const sandTons = Math.round(area * 1.8);
  const aggregateTons = Math.round(area * 1.35);
  const bricksCount = Math.round(area * 18);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}${langPath(lang)}`,
    inLanguage: lang === "hi" ? "hi-IN" : "en-IN",
    description: d.home_sub,
  };

  const popularPlots = [
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
      
      <main lang={lang} className="bg-slate-950 text-slate-100 overflow-hidden font-sans">
        
        {/* ================= 1. HERO SECTION (INTERNATIONAL SAAS STYLE) ================= */}
        <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-slate-800/80">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/15 blur-[140px] pointer-events-none rounded-full" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[300px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Top Pill Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/90 backdrop-blur-md shadow-inner text-xs text-slate-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-200">BOQFather 2.0</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  {lang === "hi" ? "सटीक कंस्ट्रक्शन कॉस्ट और बीओक्यू इंजन" : "Precision House Cost & BOQ Estimation"}
                </span>
              </div>
            </div>

            {/* Headline */}
            <div className="text-center max-w-4xl mx-auto mb-10">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
                {lang === "hi" ? "घर बनाने का बजट तय करें।" : "Plan your house construction."} <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  {lang === "hi" ? "हर ईंट और खर्च का सटीक हिसाब।" : "Know every brick & rupee."}
                </span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {lang === "hi"
                  ? "अपने प्लॉट साइज़ से आइटम-वाइज़ BOQ, स्टील, सीमेंट और लेबर रेट का पारदर्शी एस्टीमेट तुरंत पाएं — बिना किसी ठेकेदार के धोखे के।"
                  : "Turn your plot size into accurate item-wise BOQ, material requirements, and turnkey construction cost estimates within seconds."}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={langPath(lang, "house-boq-estimate")}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base transition-all duration-200 shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)]"
                >
                  {lang === "hi" ? "फ़्री BOQ एस्टीमेट शुरू करें →" : "Start Free BOQ Estimate →"}
                </Link>
                <Link
                  href={langPath(lang, "contractor-quote-checker")}
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-base transition-colors duration-200 backdrop-blur-md"
                >
                  {lang === "hi" ? "ठेकेदार कोटेशन चेक करें" : "Check Contractor Quote"}
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>IS 1200 / CPWD Standard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-400">✓</span>
                  <span>99.2% Estimation Precision</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">✓</span>
                  <span>Direct Excel & PDF Export</span>
                </div>
              </div>
            </div>

            {/* Interactive Showcase Dashboard (No Cartoon Maps!) */}
            <div className="relative mx-auto max-w-5xl rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950 border border-slate-800 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/80 mb-4 bg-slate-950/60 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-xs font-mono text-slate-400">Live_Construction_BOQ_Engine_v2.0</span>
                </div>

                {/* View Switcher Pills */}
                <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab("breakdown")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === "breakdown" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Cost Breakdown
                  </button>
                  <button
                    onClick={() => setActiveTab("materials")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === "materials" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Material Schedule
                  </button>
                  <button
                    onClick={() => setActiveTab("timeline")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === "timeline" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Construction Stages
                  </button>
                </div>
              </div>

              {/* Interactive Dashboard Canvas */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 border border-slate-800/90 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Metrics */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Reference Project</p>
                      <h3 className="text-xl font-bold text-white">30 × 40 ft G+1 Duplex (1200 sq.ft)</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                      Verified IS 1200
                    </span>
                  </div>

                  {activeTab === "breakdown" && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Structure & RCC (Foundations, Columns, Beams, Slabs)</span>
                          <span className="font-mono font-bold text-blue-400">₹14,20,000 (53%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-[53%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Brickwork, Masonry & Plastering</span>
                          <span className="font-mono font-bold text-indigo-400">₹4,80,000 (18%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full w-[18%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Finishes (Flooring, Painting, Doors & Windows)</span>
                          <span className="font-mono font-bold text-emerald-400">₹5,20,000 (19%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[19%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Electrical & Plumbing Rough-ins</span>
                          <span className="font-mono font-bold text-amber-400">₹2,64,000 (10%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-[10%]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "materials" && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">OPC 53 Cement</span>
                        <span className="text-base font-bold font-mono text-white">460 Bags</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">TMT Steel (Fe 550D)</span>
                        <span className="text-base font-bold font-mono text-white">4.2 Tons</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">River Sand</span>
                        <span className="text-base font-bold font-mono text-white">2,160 Cu.ft</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Red Clay Bricks</span>
                        <span className="text-base font-bold font-mono text-white">21,600 Nos</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "timeline" && (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900">
                        <span className="text-slate-300">Phase 1: Excavation & Footings</span>
                        <span className="font-mono text-blue-400">Month 1</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900">
                        <span className="text-slate-300">Phase 2: Columns & Roof Slabs (G+1)</span>
                        <span className="font-mono text-blue-400">Month 2 – 3</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900">
                        <span className="text-slate-300">Phase 3: Brickwork & Plaster</span>
                        <span className="font-mono text-blue-400">Month 4</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900">
                        <span className="text-slate-300">Phase 4: Flooring, Paint & Handover</span>
                        <span className="font-mono text-emerald-400">Month 5 – 5.5</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Price Highlight Card */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Total Project Valuation</span>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 mt-1 mb-2">
                      ₹26,84,000
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      Turnkey rate @ ₹2,236/sq.ft including all materials, shuttering, structural steel, and labor contracts.
                    </p>
                  </div>

                  <Link
                    href={langPath(lang, "house-boq-estimate")}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg"
                  >
                    Generate Custom BOQ For Your Plot →
                  </Link>
                </div>

              </div>

            </div>

          </div>
        </section>


        {/* ================= 2. LIVE INTERACTIVE ESTIMATOR SLIDER ================= */}
        <section className="py-16 bg-slate-900/60 border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                ⚡ {lang === "hi" ? "त्वरित बजट कैलकुलेटर" : "Instant Live Budget Estimator"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {lang === "hi" ? "प्लॉट साइज़ चुनिए — खर्च तुरंत देखिए" : "Slide your built-up area — see cost in real time"}
              </h2>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Controls */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                    <span>{lang === "hi" ? "कवर्ड एरिया (Built-up Area)" : "Built-up Area"}</span>
                    <span className="font-mono text-blue-400 font-bold text-base">{area} sq.ft</span>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="4000"
                    step="50"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>600 sq.ft</span>
                    <span>2,000 sq.ft</span>
                    <span>4,000 sq.ft</span>
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-medium text-slate-300 mb-2">
                    {lang === "hi" ? "कंस्ट्रक्शन क्वालिटी" : "Construction Finish Quality"}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["standard", "premium", "luxury"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setQuality(lvl)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          quality === lvl
                            ? "bg-blue-600/25 border-blue-500 text-blue-300 shadow-sm"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {lvl} (₹{rates[lvl]}/sq.ft)
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Output Box */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                  {lang === "hi" ? "अनुमानित कुल खर्च" : "Estimated Project Cost"}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 mt-1 mb-4">
                  ₹{(totalCost / 100000).toFixed(2)} <span className="text-lg text-slate-400 font-sans font-medium">Lakh</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-800 pt-3 mb-5">
                  <div>
                    <p className="text-slate-500">{lang === "hi" ? "सीमेंट बैग" : "Cement Bags"}</p>
                    <p className="font-mono font-bold text-slate-200 text-sm">{cementBags} Bags</p>
                  </div>
                  <div>
                    <p className="text-slate-500">{lang === "hi" ? "स्टील (सरिया)" : "TMT Steel"}</p>
                    <p className="font-mono font-bold text-slate-200 text-sm">{steelTons} Tons</p>
                  </div>
                </div>

                <Link
                  href={langPath(lang, "house-boq-estimate")}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg"
                >
                  {lang === "hi" ? "पूरा रूम-वाइज़ BOQ डाउनलोड करें (Excel & PDF)" : "Download Itemized BOQ (Excel & PDF)"}
                </Link>
              </div>

            </div>
          </div>
        </section>


        {/* ================= 3. POPULAR PLOT DIMENSIONS SELECTOR (NO CARTOONS) ================= */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
              📐 Standard Plot Benchmarks
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              {lang === "hi" ? "लोकप्रिय प्लॉट साइज़ के अनुसार तुरंत खर्च निकालें" : "Turnkey Estimates by Plot Dimensions"}
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Select your plot dimension below to view turnkey construction cost and itemized bill of quantities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularPlots.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold font-mono text-white">
                      {item.w} × {item.d} ft
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono">
                      {item.gaj} Gaj
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Covered Built-up: <strong className="text-slate-200">{item.area} sq.ft</strong> (G+1 Duplex Structure)
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Est. Turnkey Budget</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">{item.est}</span>
                  </div>
                  <Link
                    href={langPath(lang, `house-boq-estimate?w=${item.w}&d=${item.d}`)}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
                  >
                    View BOQ →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ================= 4. BENTO GRID ENGINEERING SUITE ================= */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
              ⚙️ {lang === "hi" ? "इंजीनियरिंग क्षमताएं" : "Architectural Suite"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              {lang === "hi" ? "कंस्ट्रक्शन प्लानिंग के लिए सब कुछ एक जगह" : "Everything you need to build with confidence"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento 1: BOQ */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-3">
                  IS 1200 / CPWD Standard
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {lang === "hi" ? "आइटम-वाइज़ BOQ और मेज़रमेंट बुक" : "Automated Item-Wise BOQ & Measurement Book"}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  {lang === "hi"
                    ? "फाउंडेशन, कंक्रीट, ब्रिकवर्क, प्लास्टर से लेकर पेंट और टाइल्स तक — हर काम की मात्रा और रेट का विस्तृत ब्योरा।"
                    : "From excavation and reinforcement to brick masonry and vitrified tiles — accurate measurement sheets ready for contractors."}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 text-xs font-mono text-slate-300">
                  <span>✔ Excavation</span>
                  <span>✔ RCC M25</span>
                  <span>✔ Brickwork 9"</span>
                  <span>✔ TMT Fe550</span>
                </div>
                <Link
                  href={langPath(lang, "house-boq-estimate")}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  Open Estimator →
                </Link>
              </div>
            </div>

            {/* Bento 2: Quote Checker */}
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
                  Market Protection
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  {lang === "hi" ? "ठेकेदार कोटेशन चेकर" : "Contractor Quote Checker"}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {lang === "hi"
                    ? "ठेकेदार के रेट को बाज़ार भाव से मिलाएं, ओवर-प्राइसिंग पकड़ें और साइन करने से पहले 14 ज़रूरी सवाल जांचें।"
                    : "Benchmark your contractor's quote with local state rates and prevent hidden cost inflations."}
                </p>
              </div>

              <Link
                href={langPath(lang, "contractor-quote-checker")}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Check Contractor Quote →
              </Link>
            </div>

            {/* Bento 3: Export Formats */}
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-3">
                  Bank & Loan Ready
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  {lang === "hi" ? "Excel और PDF एक्सपोर्ट" : "1-Click Excel & PDF Export"}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {lang === "hi"
                    ? "बैंक लोन और साइट इंजीनियर के लिए तुरंत प्रॉफेशनल PDF और फॉर्मूला-इनेबल्ड Excel शीट डाउनलोड करें।"
                    : "Generate formal estimates ready for bank housing loans and site supervisors."}
                </p>
              </div>

              <span className="mt-6 text-xs font-mono text-slate-400">.XLSX · .PDF · .DWG</span>
            </div>

            {/* Bento 4: Material Calculators */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold mb-3">
                  Precision Engineering
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {lang === "hi" ? "9 विशिष्ट मटेरियल कैलकुलेटर" : "9 Dedicated Construction Calculators"}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  {lang === "hi"
                    ? "ईंट, सीमेंट, रेत, सरिया, प्लास्टर, पेंट, और फर्श की सटीक खपत तुरंत मापें।"
                    : "Zero-wastage calculators for brickwork, RCC slab concrete, plaster mortar, and structural steel."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {CALCULATORS.slice(0, 5).map((c) => (
                  <Link
                    key={c.slug}
                    href={langPath(lang, c.slug)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors"
                  >
                    {c[lang].name}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </section>


        {/* ================= 5. POPULAR CALCULATORS GRID ================= */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {lang === "hi" ? "सभी कंस्ट्रक्शन कैलकुलेटर" : "All Construction Calculators"}
              </h2>
            </div>
            <Link
              href={langPath(lang, "calculators")}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              {d.all_calculators} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CALCULATORS.filter(
              (c) => !["house-construction-cost-calculator", "house-boq-estimate", "contractor-quote-checker"].includes(c.slug)
            ).map((c) => (
              <Link
                key={c.slug}
                href={langPath(lang, c.slug)}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center text-xs">
                      {c.mark}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                      {c[lang].name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {c[lang].short}
                  </p>
                </div>
                <span className="mt-4 text-[11px] font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">
                  Open Calculator →
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
      <main lang={lang} className="mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {d.calculators_h1}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600 text-sm">
          {d.calculators_sub}
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((c) => (
            <li key={c.slug}>
              <Link
                href={langPath(lang, c.slug)}
                className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-500 shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                    {c.mark}
                  </span>
                  <span className="text-base font-bold text-slate-900">{c[lang].name}</span>
                </span>
                <span className="text-xs leading-relaxed text-slate-600">
                  {c[lang].intro}
                </span>
                <span className="mt-auto text-xs font-semibold text-blue-600">
                  {d.open} →
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
