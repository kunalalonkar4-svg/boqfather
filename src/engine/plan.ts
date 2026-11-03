/**
 * Construction plan from an item-wise BOQ: stages with timeline, materials to buy per stage,
 * month-by-month spend, and home-loan EMI / pre-EMI during construction.
 */
import type { BoqResult, MatKey } from "./boq";
import { round } from "./units";

export interface Stage {
  key: string;
  name: { en: string; hi: string };
  start: number; // months from start
  months: number;
  amount: number; // incl. contingency share
  mat: Partial<Record<MatKey, number>>;
  items: string[];
}

export interface MonthRow {
  month: number;
  spend: number;
  cumulative: number;
  stages: string[];
}

export interface PlanResult {
  stages: Stage[];
  months: MonthRow[];
  totalMonths: number;
}

const FLOOR_RE = /^(GF|FF|F\d+)\b|(?:Beams|Slab|slab over|over) (GF|FF|F\d+)\b/;

function floorIndex(tag: string): number {
  if (tag === "GF") return 0;
  if (tag === "FF") return 1;
  return Number(tag.slice(1)) || 0;
}

const FLOOR_NAMES_EN = [
  "Ground floor",
  "First floor",
  "Second floor",
  "Third floor",
];
const FLOOR_NAMES_HI = [
  "ग्राउंड फ़्लोर",
  "पहली मंज़िल",
  "दूसरी मंज़िल",
  "तीसरी मंज़िल",
];

export function buildPlan(r: BoqResult): PlanResult {
  const F = r.geometry.floors;
  const hasExtra = r.sections.some((s) => s.title.en.startsWith("External"));
  const defs: { key: string; en: string; hi: string; months: number }[] = [
    {
      key: "foundation",
      en: "Excavation, foundation and plinth",
      hi: "खुदाई, नींव और प्लिंथ",
      months: 1.0,
    },
    ...Array.from({ length: F }, (_, f) => ({
      key: `frame${f}`,
      en: `${FLOOR_NAMES_EN[f] ?? `Floor ${f}`}: columns, beams, slab`,
      hi: `${FLOOR_NAMES_HI[f] ?? `मंज़िल ${f}`}: कॉलम, बीम, स्लैब`,
      months: 1.0,
    })),
    {
      key: "masonry",
      en: "Walls, lintels and parapet",
      hi: "दीवारें, लिंटल और पैरापेट",
      months: round(0.4 + 0.6 * F, 1),
    },
    {
      key: "services",
      en: "Concealed electrical and plumbing pipes",
      hi: "छुपी बिजली और प्लंबिंग पाइप",
      months: 0.5,
    },
    {
      key: "plaster",
      en: "Plastering",
      hi: "प्लास्टर",
      months: round(0.3 + 0.5 * F, 1),
    },
    {
      key: "flooring",
      en: "Flooring, tiles and waterproofing",
      hi: "फ़र्श, टाइल्स और वॉटरप्रूफिंग",
      months: round(0.3 + 0.4 * F, 1),
    },
    {
      key: "doors",
      en: "Doors and windows",
      hi: "दरवाज़े और खिड़कियां",
      months: 0.5,
    },
    {
      key: "fixtures",
      en: "Sanitary fittings, railing, finishing",
      hi: "सैनिटरी फिटिंग, रेलिंग, फ़िनिशिंग",
      months: 0.4,
    },
    { key: "painting", en: "Painting", hi: "पेंटिंग", months: 0.6 },
    ...(hasExtra
      ? [
          {
            key: "external",
            en: "External works and services",
            hi: "बाहरी काम और सुविधाएं",
            months: 0.8,
          },
        ]
      : []),
  ];
  const stages: Stage[] = [];
  let t = 0;
  for (const d of defs) {
    stages.push({
      key: d.key,
      name: { en: d.en, hi: d.hi },
      start: round(t, 2),
      months: d.months,
      amount: 0,
      mat: {},
      items: [],
    });
    t += d.months;
  }
  const byKey = new Map(stages.map((s) => [s.key, s]));
  const k = r.itemsTotal ? r.grandTotal / r.itemsTotal : 1;
  const put = (
    key: string,
    share: number,
    item: BoqResult["sections"][number]["items"][number],
  ) => {
    const s = byKey.get(key) ?? byKey.get("fixtures")!;
    if (share <= 0) return;
    s.amount += item.amount * share * k;
    for (const [m, q] of Object.entries(item.mat) as [MatKey, number][])
      s.mat[m] = (s.mat[m] ?? 0) + q * share;
    if (!s.items.includes(item.code)) s.items.push(item.code);
  };
  const frames = Array.from({ length: F }, (_, f) => `frame${f}`);

  for (const sec of r.sections) {
    const title = sec.title.en;
    for (const it of sec.items) {
      if (title.startsWith("Earthwork")) put("foundation", 1, it);
      else if (title.startsWith("RCC")) {
        // split row by row: per-floor rows to that floor's frame, footing / plinth rows to foundation
        const tot = it.rows.reduce((a, x) => a + Math.abs(x.q), 0) || 1;
        for (const row of it.rows) {
          const share = Math.abs(row.q) / tot;
          const m = row.desc.match(FLOOR_RE);
          if (m) put(`frame${floorIndex(m[1] ?? m[2])}`, share, it);
          else if (/Footing|footing|Plinth|plinth/.test(row.desc))
            put("foundation", share, it);
          else for (const fk of frames) put(fk, share / F, it);
        }
      } else if (title.startsWith("Brickwork") || title.startsWith("AAC"))
        put("masonry", 1, it);
      else if (title.startsWith("Plaster")) put("plaster", 1, it);
      else if (title.startsWith("Flooring")) put("flooring", 1, it);
      else if (title.startsWith("Doors")) put("doors", 1, it);
      else if (title.startsWith("Plumbing"))
        put(
          ["cpvc", "swr110", "swr75", "riser"].includes(it.rateKey)
            ? "services"
            : "fixtures",
          1,
          it,
        );
      else if (title.startsWith("Staircase")) {
        if (it.rateKey === "st_tile") put("flooring", 1, it);
        else if (it.rateKey === "rail") put("fixtures", 1, it);
        else if (it.rateKey === "st_soffit") put("plaster", 1, it);
        else for (const fk of frames) put(fk, 1 / F, it);
      } else if (title.startsWith("Electrical"))
        put(it.rateKey === "elec" ? "services" : "painting", 1, it);
      else put("external", 1, it);
    }
  }
  for (const s of stages) s.amount = Math.round(s.amount);

  const totalMonths = Math.ceil(t);
  const months: MonthRow[] = Array.from({ length: totalMonths }, (_, m) => ({
    month: m + 1,
    spend: 0,
    cumulative: 0,
    stages: [],
  }));
  for (const s of stages) {
    const a = s.start,
      b = s.start + s.months;
    for (let m = Math.floor(a); m < Math.ceil(b) && m < totalMonths; m++) {
      const overlap = Math.min(b, m + 1) - Math.max(a, m);
      if (overlap <= 0) continue;
      months[m].spend += (s.amount * overlap) / s.months;
      if (!months[m].stages.includes(s.key)) months[m].stages.push(s.key);
    }
  }
  let cum = 0;
  for (const m of months) {
    m.spend = Math.round(m.spend);
    cum += m.spend;
    m.cumulative = cum;
  }
  return { stages, months, totalMonths };
}

export interface LoanResult {
  emi: number;
  totalInterest: number;
  totalPayable: number;
  own: number;
  /** Month by month during construction: amount disbursed so far and pre-EMI interest. */
  construction: {
    month: number;
    spend: number;
    fromOwn: number;
    fromLoan: number;
    disbursed: number;
    preEmi: number;
  }[];
  preEmiTotal: number;
}

/** Home loan: own money is spent first, then the bank disburses; interest-only pre-EMI until completion. */
export function loanPlan(
  plan: PlanResult,
  total: number,
  loan: number,
  ratePct: number,
  years: number,
): LoanResult {
  const P = Math.max(0, Math.min(loan, total));
  const rm = ratePct / 12 / 100;
  const n = Math.max(1, Math.round(years * 12));
  const emi = rm > 0 ? (P * rm * (1 + rm) ** n) / ((1 + rm) ** n - 1) : P / n;
  const own = Math.max(0, total - P);
  let ownLeft = own,
    disbursed = 0,
    preEmiTotal = 0;
  const construction = plan.months.map((m) => {
    const fromOwn = Math.min(ownLeft, m.spend);
    ownLeft -= fromOwn;
    const fromLoan = Math.min(P - disbursed, m.spend - fromOwn);
    disbursed += fromLoan;
    const preEmi = disbursed * rm;
    preEmiTotal += preEmi;
    return {
      month: m.month,
      spend: m.spend,
      fromOwn: Math.round(fromOwn),
      fromLoan: Math.round(fromLoan),
      disbursed: Math.round(disbursed),
      preEmi: Math.round(preEmi),
    };
  });
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(emi * n - P),
    totalPayable: Math.round(emi * n),
    own: Math.round(own),
    construction,
    preEmiTotal: Math.round(preEmiTotal),
  };
}
