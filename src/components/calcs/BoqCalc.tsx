"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BOQ_RATES,
  BoqExtras,
  BoqQuality,
  BoqResult,
  calcBoq,
  fitPlot,
  floorLabel,
  inr,
  lakhWords,
  Location,
  LOCATION_FACTORS,
  RateKey,
  round,
  ROOM_DEFS,
  ROOM_TYPES,
  RoomSpec,
  RoomType,
  rupees,
} from "@/engine";
import {
  BbsPanel,
  ComparePanel,
  PlanPanel,
  SketchPanel,
  SpecPanel,
} from "./boq/BoqPanels";
import { name, t } from "@/i18n/ui";
import type { Lang } from "@/lib/site";
import { dimToM, Segmented, SelectField } from "@/components/ui/Fields";
import { WhatsAppShare } from "@/components/ui/Results";

const FT = 3.28084;
const SQFT = 10.7639;
const ft = (m: number) => String(round(m * FT, 1));

interface RoomRow {
  id: number;
  type: RoomType;
  L: string;
  B: string;
  windows: number;
  wc: "ewc" | "iwc";
}

let nextId = 1;
const mk = (type: RoomType, extra: Partial<RoomRow> = {}): RoomRow => ({
  id: nextId++,
  type,
  L: ft(ROOM_DEFS[type].L),
  B: ft(ROOM_DEFS[type].B),
  windows: ROOM_DEFS[type].windows,
  wc: "ewc",
  ...extra,
});
const typicalGround = (): RoomRow[] => [
  mk("hall"),
  mk("kitchen"),
  mk("dining"),
  mk("bedroom", { L: "12.8" }),
  mk("bedroom"),
  mk("passage"),
  mk("toilet"),
  mk("toilet", { wc: "iwc" }),
];
const typicalUpper = (): RoomRow[] => [
  mk("hall"),
  mk("bedroom", { L: "12.8" }),
  mk("bedroom"),
  mk("passage"),
  mk("toilet"),
  mk("toilet"),
  mk("balcony"),
];
const copyRows = (rows: RoomRow[]) => rows.map((r) => ({ ...r, id: nextId++ }));

const FLOOR_NAME = (i: number, hi: boolean) =>
  hi
    ? ["ग्राउंड फ़्लोर", "पहली मंज़िल", "दूसरी मंज़िल", "तीसरी मंज़िल"][i]
    : ["Ground floor", "First floor", "Second floor", "Third floor"][i];

function MiniStep(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[12.5px] text-muted">{props.label}</span>
      <button
        type="button"
        aria-label={`${props.label} −`}
        disabled={props.value <= props.min}
        onClick={() => props.onChange(Math.max(props.min, props.value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-[#efece6] text-[17px] font-bold disabled:opacity-40"
      >
        −
      </button>
      <output className="w-5 text-center text-[15px] font-bold">
        {props.value}
      </output>
      <button
        type="button"
        aria-label={`${props.label} +`}
        disabled={props.value >= props.max}
        onClick={() => props.onChange(Math.min(props.max, props.value + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-[#efece6] text-[17px] font-bold disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

export default function BoqCalc({ lang }: { lang: Lang }) {
  const d = t(lang);
  const hi = lang === "hi";
  const [floorCount, setFloorCount] = useState<"1" | "2" | "3" | "4">("2");
  const [plans, setPlans] = useState<RoomRow[][]>(() => [
    typicalGround(),
    typicalUpper(),
    typicalUpper(),
    typicalUpper(),
  ]);
  const [tab, setTab] = useState(0);
  const [location, setLocation] = useState<Location>("tier2");
  const [floorH, setFloorH] = useState("10");
  const [winW, setWinW] = useState("5");
  const [winH, setWinH] = useState("4");
  const [plinth, setPlinth] = useState("1.5");
  const [terrace, setTerrace] = useState<"yes" | "no">("yes");
  const [rates, setRates] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"" | "pdf" | "xls">("");
  // plot-first start
  // B = road-side width (frontage), L = depth from the road to the back
  const [plot, setPlot] = useState({
    L: "50",
    B: "30",
    front: "5",
    back: "3",
    side: "3",
    bhk: "3",
    parking: "yes" as "yes" | "no",
    facing: "E" as "N" | "E" | "S" | "W",
    layout: "family" as "family" | "units",
  });
  const [applied, setApplied] = useState("");
  const [plotFit, setPlotFit] = useState<{
    aspect: number;
    buildableM2: number;
    widthM: number;
    depthM: number;
    perimeterM: number;
    warnings: string[];
    notes: { en: string; hi: string }[];
  } | null>(null);
  // finish level, walls, extras, imported rates
  const [quality, setQuality] = useState<BoqQuality>("standard");
  const [wall, setWall] = useState<"brick" | "aac">("brick");
  const [ex, setEx] = useState({
    boundary: false,
    bLen: "",
    bH: "5",
    gate: false,
    gW: "10",
    gH: "6",
    septic: false,
    users: "6",
    oht: false,
    ohtL: "2000",
    sump: false,
    sumpL: "5000",
    bore: false,
    boreFt: "250",
    pump: true,
    elevation: false,
    falseCeiling: false,
    rwh: false,
    connections: false,
  });
  const [rateSet, setRateSet] = useState<Partial<
    Record<RateKey, number>
  > | null>(null);
  const [rateMsg, setRateMsg] = useState("");
  const [view, setView] = useState<
    "boq" | "sketch" | "spec" | "bbs" | "plan" | "compare"
  >("sketch");
  // plot-first by default: every change to the plot re-plans the rooms, the drawing and the estimate
  const [plotLive, setPlotLive] = useState(true);
  const setE = (patch: Partial<typeof ex>) =>
    setEx((e) => ({ ...e, ...patch }));

  const F = Number(floorCount);
  const cur = Math.min(tab, F - 1);
  const setFloor = (f: number, fn: (rows: RoomRow[]) => RoomRow[]) =>
    setPlans((p) => p.map((rows, i) => (i === f ? fn(rows) : rows)));
  const upd = (f: number, id: number, patch: Partial<RoomRow>) =>
    setFloor(f, (rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );

  const floorRooms: RoomSpec[][] = useMemo(
    () =>
      plans.slice(0, F).map((rows) =>
        rows
          .map((r) => ({
            type: r.type,
            L: dimToM(r.L, "ft"),
            B: dimToM(r.B, "ft"),
            windows: r.windows,
            wc: r.wc,
          }))
          .filter((r) => r.L > 0.3 && r.B > 0.3),
      ),
    [plans, F],
  );
  const valid = floorRooms.every((f) => f.length > 0);

  const spec = useMemo(() => {
    const m = (v: string, dflt: number) => {
      const x = dimToM(v, "ft");
      return x > 0 ? x : dflt;
    };
    return {
      floorH: m(floorH, 3.0),
      winW: m(winW, 1.5),
      winH: m(winH, 1.2),
      plinth: m(plinth, 0.45),
      stairToTerrace: terrace === "yes",
      quality,
      wall,
      ...(plotFit
        ? {
            aspect: plotFit.aspect,
            buildableM2: plotFit.buildableM2,
            widthM: plotFit.widthM,
            depthM: plotFit.depthM,
          }
        : {}),
      facing: plot.facing,
    };
  }, [
    floorH,
    winW,
    winH,
    plinth,
    terrace,
    quality,
    wall,
    plotFit,
    plot.facing,
  ]);

  const extras: BoqExtras = useMemo(() => {
    const m = (v: string) => Math.max(0, dimToM(v, "ft") || 0);
    const n = (v: string) => Math.max(0, Number(v) || 0);
    const bLen = ex.bLen.trim()
      ? m(ex.bLen)
      : plotFit
        ? plotFit.perimeterM - (ex.gate ? m(ex.gW) : 0)
        : 0;
    return {
      ...(ex.boundary && bLen > 0
        ? { boundary: { length: bLen, height: m(ex.bH) || 1.5 } }
        : {}),
      ...(ex.gate ? { gate: { width: m(ex.gW), height: m(ex.gH) } } : {}),
      ...(ex.septic ? { septic: { users: n(ex.users) || 5 } } : {}),
      ...(ex.oht ? { oht: { litres: n(ex.ohtL) } } : {}),
      ...(ex.sump ? { sump: { litres: n(ex.sumpL) } } : {}),
      ...(ex.bore
        ? { borewell: { depthFt: n(ex.boreFt), pump: ex.pump } }
        : {}),
      elevation: ex.elevation,
      falseCeiling: ex.falseCeiling,
      rwh: ex.rwh,
      connections: ex.connections,
    };
  }, [ex, plotFit]);

  const res: BoqResult | null = useMemo(() => {
    if (!valid) return null;
    const input = {
      floorRooms,
      spec,
      extras,
      locationFactor: LOCATION_FACTORS[location],
      ...(rateSet ? { rateSet } : {}),
    };
    const first = calcBoq(input);
    const overrides: Record<string, number> = {};
    for (const s of first.sections)
      for (const i of s.items) {
        const v = Number(rates[i.desc]);
        if (
          rates[i.desc] !== undefined &&
          rates[i.desc] !== "" &&
          Number.isFinite(v) &&
          v >= 0
        )
          overrides[i.code] = v;
      }
    return Object.keys(overrides).length
      ? calcBoq({ ...input, rateOverrides: overrides })
      : first;
  }, [floorRooms, spec, extras, location, rates, valid, rateSet]);

  const runVariant = useCallback(
    (q: BoqQuality, w: "brick" | "aac") =>
      calcBoq({
        floorRooms,
        spec: { ...spec, quality: q, wall: w },
        extras,
        locationFactor: LOCATION_FACTORS[location],
        ...(rateSet ? { rateSet } : {}),
      }),
    [floorRooms, spec, extras, location, rateSet],
  );

  const applyPlot = () => {
    const m = (v: string) => Math.max(0, dimToM(v, "ft") || 0);
    const pL = m(plot.L),
      pB = m(plot.B);
    if (!(pL > 3 && pB > 3)) return;
    const fit = fitPlot({
      plotL: pL,
      plotB: pB,
      front: m(plot.front),
      back: m(plot.back),
      side: m(plot.side),
      bhk: Number(plot.bhk),
      floors: Number(floorCount),
      parking: plot.parking === "yes",
      layout: plot.layout,
    });
    const made = fit.floorRooms.map((list) =>
      list.map((r) =>
        mk(r.type, { L: ft(r.L), B: ft(r.B), ...(r.wc ? { wc: r.wc } : {}) }),
      ),
    );
    setPlans((old) => [0, 1, 2, 3].map((i) => made[i] ?? old[i]));
    setPlotFit({
      aspect: fit.buildL / fit.buildB,
      buildableM2: fit.buildArea,
      widthM: fit.buildB,
      depthM: fit.buildL,
      perimeterM: 2 * (pL + pB),
      warnings: fit.warnings,
      notes: fit.notes,
    });
    setApplied(JSON.stringify(plot));
    setView("sketch");
  };
  // plan once on load from the default plot (or the plot in the link, e.g. ?w=30&d=50&bhk=3&floors=2); after that the user presses "Make plan"
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const w = q.get("w"),
      dd = q.get("d");
    const okNum = (v: string | null) => v !== null && Number(v) >= 0;
    if (okNum(w) && okNum(dd)) {
      const fc = q.get("facing");
      setPlot((p) => ({
        ...p,
        B: w!,
        L: dd!,
        ...(okNum(q.get("front")) ? { front: q.get("front")! } : {}),
        ...(okNum(q.get("back")) ? { back: q.get("back")! } : {}),
        ...(okNum(q.get("side")) ? { side: q.get("side")! } : {}),
        ...(okNum(q.get("bhk")) ? { bhk: q.get("bhk")! } : {}),
        ...(fc && ["N", "E", "S", "W"].includes(fc)
          ? { facing: fc as "N" | "E" | "S" | "W" }
          : {}),
      }));
      const fl = q.get("floors");
      if (fl && ["1", "2", "3", "4"].includes(fl))
        setFloorCount(fl as "1" | "2" | "3" | "4");
      setPending(true);
      return;
    }
    if (plotLive) applyPlot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!pending) return;
    setPending(false);
    applyPlot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);
  useEffect(() => {
    if (plotLive && applied) applyPlot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorCount]);
  const plotChanged =
    plotLive && applied !== "" && applied !== JSON.stringify(plot);

  const rateSheet = async (kind: "down" | "up", file?: File) => {
    const m = await import("@/lib/boqExport");
    if (kind === "down") {
      const cur: Record<string, number> = {};
      for (const k of Object.keys(BOQ_RATES) as RateKey[])
        cur[k] =
          rateSet?.[k] ?? Math.round(BOQ_RATES[k] * LOCATION_FACTORS[location]);
      await m.downloadRateSheet(cur);
    } else if (file) {
      try {
        const got = await m.readRateSheet(file);
        const n = Object.keys(got).length;
        if (n) {
          setRateSet(got);
          setRates({});
          setRateMsg(hi ? `${n} रेट लोड हो गए` : `${n} rates loaded`);
        } else
          setRateMsg(
            hi ? "फ़ाइल में रेट नहीं मिले" : "No rates found in the file",
          );
      } catch {
        setRateMsg(hi ? "फ़ाइल नहीं पढ़ पाए" : "Could not read the file");
      }
    }
  };

  const beds = floorRooms.flat().filter((r) => r.type === "bedroom").length;
  const floorTag = F === 1 ? "G" : `G+${F - 1}`;
  // separate units (a kitchen on every floor) read as "2BHK + 2BHK"; one family house as "4BHK"
  const unitWise =
    F > 1 && floorRooms.every((f) => f.some((r) => r.type === "kitchen"));
  const bhkLabel = unitWise
    ? floorRooms
        .map((f) => `${f.filter((r) => r.type === "bedroom").length}BHK`)
        .join(" + ")
    : `${beds}BHK`;
  const title = res
    ? `${bhkLabel} ${floorTag} house – ${Math.round(res.geometry.builtUpSqft)} sqft`
    : "";

  const run = async (kind: "pdf" | "xls") => {
    if (!res) return;
    setBusy(kind);
    try {
      const m = await import("@/lib/boqExport");
      if (kind === "pdf") await m.downloadBoqPdf(res, title);
      else await m.downloadBoqExcel(res, title);
    } finally {
      setBusy("");
    }
  };

  const rows = plans[cur];
  const maxSub = res ? Math.max(...res.sections.map((s) => s.subtotal)) : 1;
  const carpetOf = (f: number) =>
    floorRooms[f]?.reduce((a, r) => a + r.L * r.B, 0) ?? 0;

  return (
    <div className="flex flex-col gap-5 pb-20 lg:pb-0">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5 rounded-2xl border border-line bg-white p-4 sm:p-6">
          <details
            className="group rounded-xl border-2 border-dashed border-amber bg-amber-tint/40 p-3"
            open
          >
            <summary className="cursor-pointer list-none text-[14px] font-extrabold text-amber-dark">
              {hi
                ? "⚡ प्लॉट साइज़ से शुरू करें (आसान)"
                : "⚡ Start from your plot size (easiest)"}
              {plotFit && (
                <span className="ml-2 font-semibold text-good">
                  ✓ {hi ? "लागू" : "applied"} ·{" "}
                  {inr(plotFit.buildableM2 * SQFT)} sqft{" "}
                  {hi ? "बनाने लायक" : "buildable"}
                </span>
              )}
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {(
                  [
                    [
                      "B",
                      hi
                        ? "सड़क की तरफ़ चौड़ाई (फ़्रंट)"
                        : "Road-side width (frontage)",
                    ],
                    ["L", hi ? "गहराई (आगे से पीछे)" : "Depth (front to back)"],
                    [
                      "front",
                      hi
                        ? "आगे छोड़ें (सड़क की तरफ़)"
                        : "Front setback (road side)",
                    ],
                    ["back", hi ? "पीछे छोड़ें" : "Rear setback"],
                    [
                      "side",
                      hi ? "साइड छोड़ें (हर तरफ़)" : "Side setback (each)",
                    ],
                  ] as const
                ).map(([k, lbl]) => (
                  <label
                    key={k}
                    className="flex flex-col gap-1 text-[12.5px] font-semibold"
                  >
                    {lbl}
                    <span className="flex items-center gap-1">
                      <input
                        className="h-10 w-full min-w-0 rounded-lg border border-[#cfc9be] bg-white px-2 text-right text-[14px] font-normal"
                        value={plot[k]}
                        onChange={(e) =>
                          setPlot((p) => ({ ...p, [k]: e.target.value }))
                        }
                      />
                      <span className="text-[11px] font-normal text-muted">
                        ft
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Segmented
                  label={
                    plot.layout === "family"
                      ? hi
                        ? "पूरे घर में BHK"
                        : "BHK in the whole house"
                      : hi
                        ? "हर मंज़िल पर BHK"
                        : "BHK on each floor"
                  }
                  value={plot.bhk}
                  onChange={(v) => setPlot((p) => ({ ...p, bhk: v }))}
                  options={(plot.layout === "family"
                    ? ["1", "2", "3", "4", "5"]
                    : ["1", "2", "3", "4"]
                  ).map((v) => ({ value: v, label: `${v} BHK` }))}
                />
                <Segmented
                  label={
                    hi
                      ? "ग्राउंड फ़्लोर पर पार्किंग"
                      : "Parking on ground floor"
                  }
                  value={plot.parking}
                  onChange={(v) => setPlot((p) => ({ ...p, parking: v }))}
                  options={[
                    { value: "yes", label: hi ? "हां" : "Yes" },
                    { value: "no", label: hi ? "नहीं" : "No" },
                  ]}
                />
              </div>
              <Segmented
                label={hi ? "घर किस तरह का" : "Type of house"}
                value={plot.layout}
                onChange={(v) =>
                  setPlot((p) => ({
                    ...p,
                    layout: v,
                    bhk: v === "units" && Number(p.bhk) > 4 ? "4" : p.bhk,
                  }))
                }
                options={[
                  {
                    value: "family",
                    label: hi
                      ? "एक परिवार का घर (एक किचन)"
                      : "One family house (one kitchen)",
                  },
                  {
                    value: "units",
                    label: hi
                      ? "हर मंज़िल अलग घर (किराया)"
                      : "Separate home on each floor (rent)",
                  },
                ]}
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold">
                  {hi
                    ? "सड़क किस दिशा में है (प्लॉट का फ़ेसिंग)"
                    : "Road is on which side (plot facing)"}
                </span>
                <div role="radiogroup" className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      ["N", hi ? "उत्तर" : "North"],
                      ["E", hi ? "पूर्व" : "East"],
                      ["S", hi ? "दक्षिण" : "South"],
                      ["W", hi ? "पश्चिम" : "West"],
                    ] as const
                  ).map(([v, lbl]) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={plot.facing === v}
                      onClick={() => setPlot((p) => ({ ...p, facing: v }))}
                      className={
                        "h-10 rounded-lg text-[13.5px] font-bold " +
                        (plot.facing === v
                          ? "bg-ink text-white"
                          : "border border-line bg-white")
                      }
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[12px] text-muted">
                {hi
                  ? "उदाहरण: 20×50 प्लॉट = सड़क की तरफ़ 20 ft, गहराई 50 ft।"
                  : "Example: a 20×50 plot = 20 ft on the road side, 50 ft deep."}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPlotLive(true);
                    applyPlot();
                  }}
                  className={
                    "inline-flex h-12 items-center rounded-lg px-5 text-[15px] font-extrabold " +
                    (plotChanged || !plotLive
                      ? "bg-amber text-ink"
                      : "bg-ink text-white")
                  }
                >
                  {hi
                    ? "नक्शा और एस्टिमेट बनाएं →"
                    : "Make plan and estimate →"}
                </button>
                {plotChanged && (
                  <span className="text-[13px] font-semibold text-warn">
                    {hi
                      ? "प्लॉट बदला है — बटन दबाएं"
                      : "Plot changed — press the button"}
                  </span>
                )}
                {plotLive && (
                  <button
                    type="button"
                    onClick={() => {
                      setPlotLive(false);
                      setPlotFit(null);
                    }}
                    className="text-[13px] font-semibold text-muted underline"
                  >
                    {hi
                      ? "प्लॉट के बिना खुद कमरे डालें"
                      : "Enter rooms without a plot"}
                  </button>
                )}
              </div>
              {plotFit?.notes.map((n) => (
                <p
                  key={n.en}
                  className="rounded-lg bg-amber-tint px-3 py-2 text-[13px] text-ink"
                >
                  {hi ? n.hi : n.en}
                </p>
              ))}
              {plotFit?.warnings.map((w) => (
                <p
                  key={w}
                  className="rounded-lg bg-warn-tint px-3 py-2 text-[13px] text-warn"
                >
                  {hi
                    ? "प्लॉट छोटा है: कमरे न्यूनतम साइज़ पर हैं, फिर भी सेटबैक के बाद की जगह से बड़े हो सकते हैं। कम बेडरूम या बिना पार्किंग आज़माएं।"
                    : w}
                </p>
              ))}
              <span className="text-[12px] text-muted">
                {hi
                  ? "बटन दबाते ही हर मंज़िल के कमरे प्लॉट में फ़िट होकर नक्शा और एस्टिमेट बनता है; नीचे कोई भी कमरा या साइज़ बदल सकते हैं।"
                  : "Press the button: rooms on every floor are fitted to the plot, then the plan and estimate are made; you can change any room or size below."}
              </span>
            </div>
          </details>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold uppercase tracking-wide text-amber-dark">
              {hi ? "स्टेप 1 · कितनी मंज़िल?" : "Step 1 · How many floors?"}
            </span>
            <div
              role="radiogroup"
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {(["1", "2", "3", "4"] as const).map((v) => {
                const n = Number(v);
                const on = floorCount === v;
                return (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      setFloorCount(v);
                      setTab((x) => Math.min(x, n - 1));
                    }}
                    className={
                      "flex flex-col items-start rounded-xl border-2 px-3 py-2 text-left " +
                      (on
                        ? "border-amber bg-amber-tint"
                        : "border-line bg-white hover:border-[#cfc9be]")
                    }
                  >
                    <span className="text-[16px] font-extrabold">
                      {n === 1 ? "G" : `G+${n - 1}`}
                    </span>
                    <span className="text-[12px] leading-tight text-muted">
                      {n === 1
                        ? hi
                          ? "सिर्फ़ ग्राउंड फ़्लोर"
                          : "Ground floor only"
                        : hi
                          ? `ग्राउंड + ${n - 1} मंज़िल`
                          : `Ground + ${n - 1} floor${n > 2 ? "s" : ""}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-bold uppercase tracking-wide text-amber-dark">
              {hi
                ? "स्टेप 2 · हर मंज़िल के कमरे और साइज़"
                : "Step 2 · Rooms and sizes on each floor"}
            </span>
            <div role="tablist" className="flex gap-1.5 overflow-x-auto pb-1">
              {Array.from({ length: F }, (_, f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={cur === f}
                  onClick={() => setTab(f)}
                  className={
                    "shrink-0 rounded-lg px-3 py-2 text-left " +
                    (cur === f ? "bg-ink text-white" : "bg-[#efece6] text-ink")
                  }
                >
                  <span className="block text-[14px] font-bold">
                    {FLOOR_NAME(f, hi)}
                  </span>
                  <span
                    className={
                      "block text-[11.5px] " +
                      (cur === f ? "text-[#cfcbc2]" : "text-muted")
                    }
                  >
                    {plans[f].length} {hi ? "कमरे" : "rooms"} ·{" "}
                    {inr(carpetOf(f) * SQFT)} sqft
                  </span>
                </button>
              ))}
            </div>

            <ul className="flex flex-col gap-2">
              {rows.map((r, idx) => {
                const area = dimToM(r.L, "ft") * dimToM(r.B, "ft") * SQFT;
                const sameBefore = [
                  ...plans.slice(0, cur).flat(),
                  ...rows.slice(0, idx),
                ].filter(
                  (x) => ROOM_DEFS[x.type].code === ROOM_DEFS[r.type].code,
                ).length;
                return (
                  <li
                    key={r.id}
                    className="rounded-xl border border-line bg-[#fcfbf8] p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-display flex h-8 min-w-9 items-center justify-center rounded-md bg-amber-tint px-1.5 text-[12px] font-extrabold text-amber-dark">
                        {ROOM_DEFS[r.type].code}
                        {sameBefore + 1}
                      </span>
                      <select
                        aria-label={hi ? "कमरे का प्रकार" : "Room type"}
                        value={r.type}
                        onChange={(e) => {
                          const type = e.target.value as RoomType;
                          upd(cur, r.id, {
                            type,
                            L: ft(ROOM_DEFS[type].L),
                            B: ft(ROOM_DEFS[type].B),
                            windows: ROOM_DEFS[type].windows,
                          });
                        }}
                        className="h-9 min-w-0 flex-1 rounded-md border border-[#cfc9be] bg-white px-2 text-[14px] font-semibold"
                      >
                        {ROOM_TYPES.map((k) => (
                          <option key={k} value={k}>
                            {ROOM_DEFS[k].name[lang]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        aria-label={hi ? "कमरा हटाएं" : "Remove room"}
                        onClick={() =>
                          setFloor(cur, (rs) => rs.filter((x) => x.id !== r.id))
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[20px] text-muted hover:bg-[#fdecea] hover:text-[#9a3b2e]"
                      >
                        ×
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          aria-label={hi ? "लंबाई फ़ीट" : "Length ft"}
                          className="h-9 w-[68px] rounded-md border border-[#cfc9be] bg-white px-2 text-right text-[14px]"
                          value={r.L}
                          onChange={(e) =>
                            upd(cur, r.id, { L: e.target.value })
                          }
                        />
                        <span className="text-muted">×</span>
                        <input
                          aria-label={hi ? "चौड़ाई फ़ीट" : "Width ft"}
                          className="h-9 w-[68px] rounded-md border border-[#cfc9be] bg-white px-2 text-right text-[14px]"
                          value={r.B}
                          onChange={(e) =>
                            upd(cur, r.id, { B: e.target.value })
                          }
                        />
                        <span className="text-[12.5px] text-muted">
                          ft · {area > 0 ? `${Math.round(area)} sqft` : "—"}
                        </span>
                      </div>
                      <MiniStep
                        label={hi ? "खिड़की" : "Windows"}
                        value={r.windows}
                        min={0}
                        max={4}
                        onChange={(n) => upd(cur, r.id, { windows: n })}
                      />
                      {r.type === "toilet" && (
                        <div className="flex overflow-hidden rounded-md border border-[#cfc9be] text-[12.5px]">
                          {(["ewc", "iwc"] as const).map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => upd(cur, r.id, { wc: w })}
                              className={
                                "px-2.5 py-1.5 font-semibold " +
                                (r.wc === w ? "bg-ink text-white" : "bg-white")
                              }
                            >
                              {w === "ewc"
                                ? hi
                                  ? "वेस्टर्न WC"
                                  : "Western WC"
                                : hi
                                  ? "इंडियन WC"
                                  : "Indian WC"}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
              {rows.length === 0 && (
                <li className="rounded-xl border border-dashed border-[#cfc9be] p-4 text-center text-[14px] text-muted">
                  {hi
                    ? "इस मंज़िल पर कम से कम एक कमरा जोड़ें"
                    : "Add at least one room on this floor"}
                </li>
              )}
            </ul>

            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold">
                {hi ? "+ कमरा जोड़ें" : "+ Add a room"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ROOM_TYPES.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFloor(cur, (rs) => [...rs, mk(k)])}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-semibold hover:border-amber hover:bg-amber-tint"
                  >
                    + {ROOM_DEFS[k].name[lang]}
                  </button>
                ))}
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {cur > 0 && (
                  <button
                    type="button"
                    onClick={() => setFloor(cur, () => copyRows(plans[0]))}
                    className="rounded-lg border border-steel px-3 py-2 text-[13px] font-semibold text-steel"
                  >
                    {hi
                      ? "ग्राउंड फ़्लोर जैसा कॉपी करें"
                      : "Copy ground floor here"}
                  </button>
                )}
                {cur > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFloor(cur, () => copyRows(plans[cur - 1]))
                    }
                    className="rounded-lg border border-steel px-3 py-2 text-[13px] font-semibold text-steel"
                  >
                    {hi ? "नीचे वाली मंज़िल कॉपी करें" : "Copy floor below"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setFloor(cur, () =>
                      cur === 0 ? typicalGround() : typicalUpper(),
                    )
                  }
                  className="rounded-lg border border-line px-3 py-2 text-[13px] font-semibold text-muted"
                >
                  {hi ? "सामान्य लेआउट रखें" : "Reset to typical"}
                </button>
              </div>
              <span className="text-[12px] text-muted">
                {hi
                  ? `साइज़ फ़ीट में — 12.5 या 12'-6" दोनों चलेंगे। सीढ़ी अपने आप जुड़ती है।`
                  : `Sizes in feet — 12.5 or 12'-6" both work. Staircase is added automatically.`}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-bold uppercase tracking-wide text-amber-dark">
              {hi
                ? "स्टेप 3 · क्वालिटी, दीवार और जगह"
                : "Step 3 · Finish level, walls and location"}
            </span>
            <div role="radiogroup" className="grid grid-cols-3 gap-2">
              {(
                [
                  [
                    "basic",
                    hi ? "बेसिक" : "Basic",
                    hi ? "किफ़ायती, ISI" : "Economy, ISI",
                  ],
                  [
                    "standard",
                    hi ? "स्टैंडर्ड" : "Standard",
                    hi ? "ब्रांडेड, मिड-रेंज" : "Branded mid-range",
                  ],
                  [
                    "premium",
                    hi ? "प्रीमियम" : "Premium",
                    hi ? "टॉप ब्रांड, बड़ी टाइल" : "Top brands",
                  ],
                ] as const
              ).map(([v, t1, t2]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={quality === v}
                  onClick={() => setQuality(v)}
                  className={
                    "flex flex-col items-start rounded-xl border-2 px-3 py-2 text-left " +
                    (quality === v
                      ? "border-amber bg-amber-tint"
                      : "border-line bg-white")
                  }
                >
                  <span className="text-[14px] font-extrabold">{t1}</span>
                  <span className="text-[11.5px] leading-tight text-muted">
                    {t2}
                  </span>
                </button>
              ))}
            </div>
            <Segmented
              label={hi ? "दीवार का मटीरियल" : "Wall material"}
              value={wall}
              onChange={setWall}
              options={[
                {
                  value: "brick",
                  label: hi ? 'ईंट 9" / 4.5"' : 'Bricks 9" / 4.5"',
                },
                {
                  value: "aac",
                  label: hi ? 'AAC ब्लॉक 8" / 4"' : 'AAC blocks 8" / 4"',
                },
              ]}
            />
            <SelectField
              label={d.location}
              value={location}
              onChange={setLocation}
              options={(Object.keys(LOCATION_FACTORS) as Location[]).map(
                (k) => ({
                  value: k,
                  label: `${d[`loc_${k}` as const]} (×${LOCATION_FACTORS[k]} ${hi ? "रेट" : "rates"})`,
                }),
              )}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  [hi ? "मंज़िल की ऊंचाई" : "Floor height", floorH, setFloorH],
                  [hi ? "प्लिंथ ऊंचाई" : "Plinth height", plinth, setPlinth],
                  [hi ? "खिड़की चौड़ाई" : "Window width", winW, setWinW],
                  [hi ? "खिड़की ऊंचाई" : "Window height", winH, setWinH],
                ] as const
              ).map(([lbl, v, set]) => (
                <label
                  key={lbl}
                  className="flex flex-col gap-1 text-[13px] font-semibold"
                >
                  {lbl}
                  <span className="flex items-center gap-1.5">
                    <input
                      className="h-10 w-full min-w-0 rounded-lg border border-[#cfc9be] px-2 text-right text-[14px] font-normal"
                      value={v}
                      onChange={(e) => set(e.target.value)}
                    />
                    <span className="text-[12px] font-normal text-muted">
                      ft
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <Segmented
              label={hi ? "छत तक सीढ़ी" : "Staircase up to terrace"}
              value={terrace}
              onChange={setTerrace}
              options={[
                { value: "yes", label: hi ? "हां" : "Yes" },
                { value: "no", label: hi ? "नहीं" : "No" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-bold uppercase tracking-wide text-amber-dark">
              {hi
                ? "स्टेप 4 · बाहरी काम और सुविधाएं"
                : "Step 4 · External works and services"}
            </span>
            <div className="flex flex-col gap-2">
              {(
                [
                  ["boundary", hi ? "बाउंड्री वॉल" : "Boundary wall"],
                  ["gate", hi ? "मेन गेट (MS)" : "Main gate (MS)"],
                  [
                    "septic",
                    hi ? "सेप्टिक टैंक + सोक पिट" : "Septic tank + soak pit",
                  ],
                  ["oht", hi ? "छत पर पानी की टंकी" : "Overhead water tank"],
                  ["sump", hi ? "अंडरग्राउंड सम्प" : "Underground sump"],
                  ["bore", hi ? "बोरवेल" : "Borewell"],
                  ["elevation", hi ? "फ़्रंट एलिवेशन" : "Front elevation"],
                  [
                    "falseCeiling",
                    hi
                      ? "फ़ॉल्स सीलिंग (हॉल, बेडरूम)"
                      : "False ceiling (hall, bedrooms)",
                  ],
                  [
                    "rwh",
                    hi
                      ? "रेनवॉटर हार्वेस्टिंग पिट"
                      : "Rainwater harvesting pit",
                  ],
                  [
                    "connections",
                    hi
                      ? "बिजली-पानी कनेक्शन"
                      : "Electricity and water connection",
                  ],
                ] as const
              ).map(([k, lbl]) => (
                <div
                  key={k}
                  className={
                    "rounded-xl border px-3 py-2 " +
                    (ex[k] ? "border-amber bg-[#fffaf0]" : "border-line")
                  }
                >
                  <label className="flex cursor-pointer items-center gap-2.5 text-[14px] font-semibold">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#b07a0a]"
                      checked={ex[k]}
                      onChange={(e) =>
                        setE({ [k]: e.target.checked } as Partial<typeof ex>)
                      }
                    />
                    {lbl}
                  </label>
                  {ex[k] &&
                    k !== "elevation" &&
                    k !== "falseCeiling" &&
                    k !== "rwh" &&
                    k !== "connections" && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                        {k === "boundary" && (
                          <>
                            <span className="text-muted">
                              {hi ? "लंबाई" : "Length"}
                            </span>
                            <input
                              className="h-9 w-20 rounded-md border border-[#cfc9be] px-2 text-right"
                              placeholder={
                                plotFit
                                  ? String(
                                      round(
                                        (plotFit.perimeterM -
                                          (ex.gate ? dimToM(ex.gW, "ft") : 0)) *
                                          FT,
                                        0,
                                      ),
                                    )
                                  : "ft"
                              }
                              value={ex.bLen}
                              onChange={(e) => setE({ bLen: e.target.value })}
                            />
                            <span className="text-muted">
                              ft · {hi ? "ऊंचाई" : "height"}
                            </span>
                            <input
                              className="h-9 w-16 rounded-md border border-[#cfc9be] px-2 text-right"
                              value={ex.bH}
                              onChange={(e) => setE({ bH: e.target.value })}
                            />
                            <span className="text-muted">ft</span>
                            {!plotFit && !ex.bLen && (
                              <span className="text-warn">
                                {hi
                                  ? "लंबाई डालें या प्लॉट साइज़ लगाएं"
                                  : "enter length or apply a plot"}
                              </span>
                            )}
                          </>
                        )}
                        {k === "gate" && (
                          <>
                            <input
                              className="h-9 w-16 rounded-md border border-[#cfc9be] px-2 text-right"
                              value={ex.gW}
                              onChange={(e) => setE({ gW: e.target.value })}
                            />
                            <span className="text-muted">×</span>
                            <input
                              className="h-9 w-16 rounded-md border border-[#cfc9be] px-2 text-right"
                              value={ex.gH}
                              onChange={(e) => setE({ gH: e.target.value })}
                            />
                            <span className="text-muted">ft</span>
                          </>
                        )}
                        {k === "septic" && (
                          <>
                            <input
                              className="h-9 w-16 rounded-md border border-[#cfc9be] px-2 text-right"
                              value={ex.users}
                              onChange={(e) => setE({ users: e.target.value })}
                            />
                            <span className="text-muted">
                              {hi ? "लोग" : "users"}
                            </span>
                          </>
                        )}
                        {k === "oht" && (
                          <>
                            <input
                              className="h-9 w-20 rounded-md border border-[#cfc9be] px-2 text-right"
                              value={ex.ohtL}
                              onChange={(e) => setE({ ohtL: e.target.value })}
                            />
                            <span className="text-muted">
                              {hi ? "लीटर" : "litres"}
                            </span>
                          </>
                        )}
                        {k === "sump" && (
                          <>
                            <input
                              className="h-9 w-20 rounded-md border border-[#cfc9be] px-2 text-right"
                              value={ex.sumpL}
                              onChange={(e) => setE({ sumpL: e.target.value })}
                            />
                            <span className="text-muted">
                              {hi ? "लीटर" : "litres"}
                            </span>
                          </>
                        )}
                        {k === "bore" && (
                          <>
                            <input
                              className="h-9 w-20 rounded-md border border-[#cfc9be] px-2 text-right"
                              value={ex.boreFt}
                              onChange={(e) => setE({ boreFt: e.target.value })}
                            />
                            <span className="text-muted">
                              {hi ? "फ़ीट गहरा" : "ft deep"}
                            </span>
                            <label className="ml-2 flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-[#b07a0a]"
                                checked={ex.pump}
                                onChange={(e) =>
                                  setE({ pump: e.target.checked })
                                }
                              />
                              {hi ? "सबमर्सिबल पंप" : "Submersible pump"}
                            </label>
                          </>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {res ? (
          <div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-4">
            <section
              id="boq-total"
              aria-live="polite"
              className="scroll-mt-4 rounded-2xl bg-ink p-5 text-[#f5f3ef] sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-bold uppercase tracking-wide text-amber">
                  {floorTag} · {hi ? "आइटम-वार BOQ" : "Item-wise BOQ"}
                </span>
                <span className="rounded-full bg-[#2a2c2f] px-2.5 py-1 text-[11px] font-semibold text-[#cfcbc2]">
                  {d.preliminary}
                </span>
              </div>
              <div className="font-display mt-2 text-[38px] font-extrabold leading-none sm:text-[44px]">
                {rupees(res.grandTotal)}
              </div>
              <div className="mt-1 text-[14px] text-[#cfcbc2]">
                ≈ ₹{lakhWords(res.grandTotal)} ·{" "}
                {hi ? "5% आकस्मिक खर्च सहित" : "incl. 5% contingency"}
                {res.externalTotal > 0 && (
                  <span className="block">
                    {hi ? "घर" : "House"} ₹
                    {lakhWords(res.grandTotal - res.externalTotal)} +{" "}
                    {hi ? "बाहरी काम" : "external works"} ₹
                    {lakhWords(res.externalTotal)}
                  </span>
                )}
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-[#222427] p-3">
                  <dt className="text-[12px] text-[#cfcbc2]">
                    {d.per_sqft}
                    {res.externalTotal > 0 ? (hi ? " (घर)" : " (house)") : ""}
                  </dt>
                  <dd className="text-[17px] font-bold text-amber">
                    {rupees(res.perSqft)}
                  </dd>
                </div>
                <div className="rounded-xl bg-[#222427] p-3">
                  <dt className="text-[12px] text-[#cfcbc2]">
                    {hi ? "कुल बिल्ट-अप" : "Total built-up"}
                  </dt>
                  <dd className="text-[17px] font-bold">
                    {inr(res.geometry.builtUpSqft)}
                  </dd>
                </div>
                <div className="rounded-xl bg-[#222427] p-3">
                  <dt className="text-[12px] text-[#cfcbc2]">
                    {hi ? "BOQ आइटम" : "BOQ items"}
                  </dt>
                  <dd className="text-[17px] font-bold">
                    {res.sections.reduce((a, s) => a + s.items.length, 0)}
                  </dd>
                </div>
              </dl>
              <ul className="mt-3 flex flex-col gap-1.5 text-[13px]">
                {res.geometry.perFloor.map((p) => (
                  <li
                    key={p.floor}
                    className="flex flex-wrap justify-between gap-x-3 rounded-lg bg-[#222427] px-3 py-2"
                  >
                    <span className="font-semibold">
                      {FLOOR_NAME(p.floor, hi)}
                    </span>
                    <span className="text-[#cfcbc2]">
                      {inr(p.builtUpSqft)} sqft · {round(p.L * FT, 1)} ×{" "}
                      {round(p.B * FT, 1)} ft · {p.columns}{" "}
                      {hi ? "कॉलम" : "columns"}
                    </span>
                  </li>
                ))}
              </ul>
              {res.warnings.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5 rounded-lg bg-[#3a2f12] px-3 py-2.5 text-[13px] text-[#ffd98a]">
                  <span className="font-bold">
                    ⚠ {hi ? "जांचें" : "Check"} ({res.warnings.length})
                  </span>
                  {res.warnings.map((w) => (
                    <span key={w.en}>• {w[lang]}</span>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[12px] text-[#cfcbc2]">
                {hi ? "क्वालिटी" : "Finish"}:{" "}
                {
                  {
                    basic: hi ? "बेसिक" : "Basic",
                    standard: hi ? "स्टैंडर्ड" : "Standard",
                    premium: hi ? "प्रीमियम" : "Premium",
                  }[res.quality]
                }{" "}
                ·{" "}
                {res.wall === "aac"
                  ? hi
                    ? "AAC दीवार"
                    : "AAC walls"
                  : hi
                    ? "ईंट की दीवार"
                    : "Brick walls"}{" "}
                · {hi ? "सरिया BBS से" : "Steel from BBS"} {inr(res.bbs.total)}{" "}
                kg
                {rateSet ? ` · ${hi ? "आपके रेट" : "your rates"}` : ""}
              </p>
            </section>
            <div className="no-print flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => run("xls")}
                disabled={!!busy}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-amber px-4 text-[14px] font-extrabold text-ink hover:brightness-105 disabled:opacity-60"
              >
                {busy === "xls" ? "…" : hi ? "Excel डाउनलोड" : "Download Excel"}
              </button>
              <button
                type="button"
                onClick={() => run("pdf")}
                disabled={!!busy}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-ink bg-white px-4 text-[14px] font-bold disabled:opacity-60"
              >
                {busy === "pdf"
                  ? "…"
                  : hi
                    ? "PDF (एब्स्ट्रैक्ट + MB)"
                    : "PDF (abstract + MB)"}
              </button>
              <WhatsAppShare
                lang={lang}
                text={`BOQFather – ${title}: item-wise BOQ ${rupees(res.grandTotal)} (${rupees(res.perSqft)}/sqft)`}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#cfc9be] bg-white p-6 text-[15px] text-muted">
            {hi
              ? "हर मंज़िल पर कम से कम एक कमरा और सही साइज़ डालें।"
              : "Add at least one room with a valid size on every floor."}
          </div>
        )}
      </div>

      {res && (
        <a
          href="#boq-total"
          className="no-print fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-ink text-[#f5f3ef] shadow-[0_-4px_16px_rgba(0,0,0,0.25)] lg:hidden"
          style={{
            paddingTop: 10,
            paddingBottom: "max(10px, env(safe-area-inset-bottom))",
            paddingLeft: "max(16px, env(safe-area-inset-left))",
            paddingRight: "max(16px, env(safe-area-inset-right))",
          }}
        >
          <span className="flex flex-col leading-tight">
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber">
              {floorTag} · {inr(res.geometry.builtUpSqft)} sqft
            </span>
            <span className="font-display text-[20px] font-extrabold">
              {rupees(res.grandTotal)}
            </span>
          </span>
          <span className="rounded-lg bg-amber px-3 py-2 text-[13px] font-extrabold text-ink">
            {hi ? "BOQ देखें ↑" : "See BOQ ↑"}
          </span>
        </a>
      )}
      {res && (
        <>
          <nav
            aria-label={hi ? "रिपोर्ट के हिस्से" : "Report sections"}
            className="sticky top-0 z-10 -mx-1 flex gap-1.5 overflow-x-auto bg-ground px-1 py-2"
          >
            {(
              [
                ["boq", hi ? "BOQ और MB" : "BOQ and MB"],
                ["sketch", hi ? "नक्शा स्केच" : "Sketch"],
                ["spec", hi ? "स्पेक शीट" : "Spec sheet"],
                ["bbs", "BBS"],
                ["plan", hi ? "प्लान, ख़रीद, EMI" : "Plan, purchase, EMI"],
                ["compare", hi ? "तुलना" : "Compare"],
              ] as const
            ).map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                aria-pressed={view === k}
                onClick={() => setView(k)}
                className={
                  "shrink-0 rounded-full px-4 py-2 text-[14px] font-bold " +
                  (view === k
                    ? "bg-ink text-white"
                    : "border border-line bg-white text-ink")
                }
              >
                {lbl}
              </button>
            ))}
          </nav>
          {view !== "boq" && (
            <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              {view === "sketch" && (
                <SketchPanel
                  r={res}
                  lang={lang}
                  names={(tp) =>
                    tp in ROOM_DEFS ? ROOM_DEFS[tp as RoomType].name[lang] : tp
                  }
                />
              )}
              {view === "spec" && <SpecPanel r={res} lang={lang} />}
              {view === "bbs" && <BbsPanel r={res} lang={lang} />}
              {view === "plan" && <PlanPanel r={res} lang={lang} />}
              {view === "compare" && (
                <ComparePanel r={res} lang={lang} run={runVariant} />
              )}
            </section>
          )}
          {view === "boq" && (
            <>
              <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-[20px] font-bold">
                    {hi ? "एब्स्ट्रैक्ट ऑफ़ कॉस्ट" : "Abstract of cost"}
                  </h2>
                  <span className="text-[13px] text-muted">
                    {hi
                      ? "कोई भी रेट बदलें — कुल अपने आप बदलेगा"
                      : "Edit any rate — totals update instantly"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[#f5f3ef] px-3 py-2.5 text-[13px]">
                  <span className="font-semibold">
                    {hi
                      ? "रेट सेट (SOR / DSR / अपने रेट):"
                      : "Rate set (SOR / DSR / your own):"}
                  </span>
                  <button
                    type="button"
                    onClick={() => rateSheet("down")}
                    className="rounded-md border border-steel bg-white px-2.5 py-1.5 font-semibold text-steel"
                  >
                    {hi ? "रेट शीट डाउनलोड" : "Download rate sheet"}
                  </button>
                  <label className="cursor-pointer rounded-md border border-steel bg-white px-2.5 py-1.5 font-semibold text-steel">
                    {hi ? "भरी हुई शीट अपलोड" : "Upload filled sheet"}
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="sr-only"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        rateSheet("up", e.target.files[0])
                      }
                    />
                  </label>
                  {rateSet && (
                    <button
                      type="button"
                      onClick={() => {
                        setRateSet(null);
                        setRateMsg("");
                      }}
                      className="font-semibold text-muted underline"
                    >
                      {hi ? "बाज़ार रेट पर वापस" : "Back to market rates"}
                    </button>
                  )}
                  {rateMsg && (
                    <span className="font-semibold text-good">{rateMsg}</span>
                  )}
                </div>
                <ul className="mt-4 flex flex-col gap-2">
                  {res.sections.map((s) => (
                    <li
                      key={s.code}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-[14px] sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)_120px]"
                    >
                      <span className="font-semibold">
                        {s.code}. {s.title[lang]}
                      </span>
                      <span className="order-3 col-span-2 h-2.5 rounded-full bg-[#f0ece5] sm:order-none sm:col-span-1">
                        <span
                          className="block h-2.5 rounded-full bg-amber"
                          style={{ width: `${(s.subtotal / maxSub) * 100}%` }}
                        />
                      </span>
                      <span className="text-right font-semibold">
                        {rupees(s.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-3">
                  {res.sections.map((s, si) => (
                    <details
                      key={s.code}
                      open={si === 0}
                      className="rounded-xl border border-line"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-[#fbf3de] px-4 py-3 text-[15px] font-bold">
                        <span>
                          {s.code}. {s.title[lang]}{" "}
                          <span className="font-normal text-muted">
                            · {s.items.length} {hi ? "आइटम" : "items"}
                          </span>
                        </span>
                        <span>{rupees(s.subtotal)}</span>
                      </summary>
                      <ul className="divide-y divide-[#f0ece5]">
                        {s.items.map((i) => (
                          <li key={i.code} className="px-4 py-3">
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 sm:grid-cols-[48px_minmax(0,1fr)_120px_110px_120px] sm:items-center">
                              <span className="hidden text-[13px] font-bold text-amber-dark sm:block">
                                {i.code}
                              </span>
                              <span className="text-[14px]">
                                <span className="mr-1.5 font-bold text-amber-dark sm:hidden">
                                  {i.code}
                                </span>
                                {i.desc}
                              </span>
                              <span className="text-right text-[14px] font-semibold">
                                {i.qty} {i.unit}
                              </span>
                              <label className="flex items-center gap-2 text-[12px] text-muted sm:justify-end">
                                <span>₹</span>
                                <input
                                  aria-label={`${i.code} rate`}
                                  inputMode="decimal"
                                  className="h-9 w-24 rounded-md border border-[#cfc9be] px-2 text-right text-[14px] text-ink"
                                  value={rates[i.desc] ?? String(i.rate)}
                                  onChange={(e) =>
                                    setRates((r) => ({
                                      ...r,
                                      [i.desc]: e.target.value,
                                    }))
                                  }
                                />
                                <span>/{i.unit}</span>
                              </label>
                              <span className="text-right text-[14px] font-bold">
                                {rupees(i.amount)}
                              </span>
                            </div>
                            <details className="mt-2">
                              <summary className="cursor-pointer text-[13px] font-semibold text-steel">
                                {hi ? "मेज़रमेंट देखें" : "Show measurement"}
                              </summary>
                              <p className="mt-1 text-[12px] italic text-muted">
                                {i.basis}
                              </p>
                              <div className="mt-2 overflow-x-auto">
                                <table className="w-full min-w-[520px] border-collapse text-[12.5px]">
                                  <thead>
                                    <tr className="bg-[#f5f3ef] text-left text-muted">
                                      <th className="px-2 py-1.5 font-semibold">
                                        {hi ? "विवरण" : "Description"}
                                      </th>
                                      <th className="px-2 py-1.5 text-right font-semibold">
                                        Nos
                                      </th>
                                      <th className="px-2 py-1.5 text-right font-semibold">
                                        L
                                      </th>
                                      <th className="px-2 py-1.5 text-right font-semibold">
                                        B
                                      </th>
                                      <th className="px-2 py-1.5 text-right font-semibold">
                                        H/D
                                      </th>
                                      <th className="px-2 py-1.5 text-right font-semibold">
                                        Qty
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="tabular-nums">
                                    {i.rows.map((x, k) => (
                                      <tr
                                        key={k}
                                        className={
                                          "border-t border-[#f0ece5] " +
                                          (x.q < 0 ? "text-[#9a3b2e]" : "")
                                        }
                                      >
                                        <td className="px-2 py-1.5">
                                          {x.desc}
                                        </td>
                                        <td className="px-2 py-1.5 text-right">
                                          {x.n}
                                        </td>
                                        <td className="px-2 py-1.5 text-right">
                                          {x.L !== undefined
                                            ? round(x.L, 3)
                                            : ""}
                                        </td>
                                        <td className="px-2 py-1.5 text-right">
                                          {x.B !== undefined
                                            ? round(x.B, 3)
                                            : ""}
                                        </td>
                                        <td className="px-2 py-1.5 text-right">
                                          {x.H !== undefined
                                            ? round(x.H, 3)
                                            : ""}
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-semibold">
                                          {round(x.q, Math.max(i.dec, 1))}
                                        </td>
                                      </tr>
                                    ))}
                                    <tr className="border-t border-line bg-[#fce7b2]">
                                      <td className="px-2 py-1.5 font-bold">
                                        TOTAL
                                      </td>
                                      <td colSpan={4} />
                                      <td className="px-2 py-1.5 text-right font-bold">
                                        {i.qty} {i.unit}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </details>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>

                <dl className="mt-5 flex flex-col gap-1.5 border-t border-line pt-4 text-[15px]">
                  <div className="flex justify-between gap-3">
                    <dt>{hi ? "सभी आइटम का जोड़" : "Total of all items"}</dt>
                    <dd className="font-semibold">{rupees(res.itemsTotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>
                      {hi ? "आकस्मिक / अन्य 5%" : "Contingency / misc. 5%"}
                    </dt>
                    <dd className="font-semibold">{rupees(res.contingency)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 rounded-lg bg-[#fce7b2] px-3 py-2 text-[17px] font-extrabold">
                    <dt>{hi ? "कुल योग" : "Grand total"}</dt>
                    <dd>{rupees(res.grandTotal)}</dd>
                  </div>
                </dl>
              </section>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
                  <h2 className="font-display text-[19px] font-bold">
                    {hi
                      ? "सामग्री और थंब रूल जांच"
                      : "Materials and thumb-rule check"}
                  </h2>
                  <ul className="mt-4 flex flex-col divide-y divide-[#f0ece5] text-[14px]">
                    {res.thumb.map((tr) => {
                      const off = Math.abs(tr.diffPct) > 25;
                      return (
                        <li
                          key={tr.key}
                          className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 py-2.5"
                        >
                          <span className="font-semibold">
                            {name(tr.key, lang)}
                          </span>
                          <span className="text-right font-bold">
                            {inr(tr.qty)} {name(tr.unit, lang)}
                          </span>
                          <span className="text-[12px] text-muted">
                            {hi ? "थंब रूल" : "Thumb rule"} {tr.perSqft}/sqft ={" "}
                            {inr(tr.thumbQty)}
                          </span>
                          <span
                            className={
                              "text-right text-[12px] font-bold " +
                              (off ? "text-warn" : "text-good")
                            }
                          >
                            {tr.diffPct >= 0 ? "+" : ""}
                            {Math.round(tr.diffPct)}%
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-3 text-[12px] leading-relaxed text-muted">
                    {hi
                      ? "25% से ज़्यादा फ़र्क पीले रंग में। एक-मंज़िला घर, 9 इंच की बाहरी दीवार और पैरापेट से ईंट थंब रूल से ज़्यादा आती है।"
                      : "Differences over 25% are flagged. Low-rise houses with 9-inch outer walls and parapets need more bricks than the multi-storey thumb rule."}
                  </p>
                </section>

                <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
                  <h2 className="font-display text-[19px] font-bold">
                    {hi ? "कमरों की सूची" : "Room schedule"}
                  </h2>
                  {res.geometry.perFloor.map((p) => (
                    <div key={p.floor} className="mt-4">
                      <h3 className="text-[14px] font-bold text-steel">
                        {FLOOR_NAME(p.floor, hi)} (
                        {floorLabel(p.floor, res.geometry.floors)}) ·{" "}
                        {inr(p.carpetSqft)} sqft {hi ? "कारपेट" : "carpet"}
                      </h3>
                      <ul className="mt-1 flex flex-col divide-y divide-[#f0ece5] text-[14px]">
                        {res.rooms
                          .filter((r) => r.floor === p.floor)
                          .map((r) => (
                            <li
                              key={r.code}
                              className="flex flex-wrap justify-between gap-x-3 py-2"
                            >
                              <span>
                                <span className="mr-2 font-bold text-amber-dark">
                                  {r.code}
                                </span>
                                {ROOM_DEFS[r.type].name[lang]}
                              </span>
                              <span className="tabular-nums text-muted">
                                {round(r.L * FT, 1)} × {round(r.B * FT, 1)} ft ·{" "}
                                {Math.round(r.area * SQFT)} sqft
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </section>
              </div>

              <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
                <h2 className="font-display text-[19px] font-bold">
                  {d.assumptions}
                </h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-body">
                  {res.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
