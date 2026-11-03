"use client";

import { useState } from "react";
import { ROOM_DEFS, ROOM_TYPES, type RoomType } from "@/engine";
import { roomsFromDxf } from "@/lib/dxf";
import type { ReadPlan } from "@/lib/planRead";
import { PLANS } from "@/lib/pricing";
import { api } from "@/lib/supabase";
import type { Lang } from "@/lib/site";
import { alertBox, useAccount } from "./Account";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const FLOOR = (i: number, lang: Lang) =>
  lang === "hi"
    ? ["ग्राउंड फ़्लोर", "पहली मंज़िल", "दूसरी मंज़िल", "तीसरी मंज़िल"][i]
    : ["Ground floor", "First floor", "Second floor", "Third floor"][i];

/** Photo → JPEG of at most 2000 px (smaller upload, still readable). */
async function shrink(file: File): Promise<{ mime: string; base64: string }> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const url = c.toDataURL("image/jpeg", 0.88);
  return { mime: "image/jpeg", base64: url.split(",")[1] };
}
const toBase64 = (file: File) =>
  new Promise<string>((ok, bad) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1]);
    r.onerror = bad;
    r.readAsDataURL(file);
  });

/**
 * Upload your own plan → rooms → estimate.
 * DXF (AutoCAD) is read on the device for free; a photo or PDF is read by AI (Pro). The user checks the rooms before using them.
 */
export function PlanImport({
  lang,
  onApply,
}: {
  lang: Lang;
  onApply: (p: ReadPlan) => void;
}) {
  const a = useAccount();
  const [plan, setPlan] = useState<ReadPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [needPro, setNeedPro] = useState(false);

  const pick = async (file: File) => {
    setNeedPro(false);
    setPlan(null);
    if (/\.dxf$/i.test(file.name)) {
      const p = roomsFromDxf(await file.text());
      if (!p.floors.length)
        alertBox(
          L(
            lang,
            "No rooms found. Rooms must be closed polylines with the room name written inside.",
            "कोई कमरा नहीं मिला। कमरे बंद पॉलीलाइन हों और उनके अंदर कमरे का नाम लिखा हो।",
          ),
        );
      else setPlan(p);
      return;
    }
    if (!a.enabled)
      return alertBox(
        L(
          lang,
          "Photo and PDF reading opens soon. Use a DXF file for now.",
          "फ़ोटो और PDF पढ़ना जल्द शुरू होगा। अभी DXF फ़ाइल इस्तेमाल करें।",
        ),
      );
    if (!a.user) return a.openLogin(() => void pick(file));
    setBusy(true);
    try {
      const f =
        file.type === "application/pdf"
          ? { mime: "application/pdf", base64: await toBase64(file) }
          : await shrink(file);
      const projectId =
        new URLSearchParams(window.location.search).get("project") ?? undefined;
      setPlan(await api<ReadPlan>("/api/read-plan", { file: f, projectId }));
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      if (/Pro feature/i.test(m)) setNeedPro(true);
      else alertBox(m || "Could not read the plan");
    } finally {
      setBusy(false);
    }
  };

  const edit = (
    fi: number,
    ri: number,
    patch: Partial<ReadPlan["floors"][number][number]>,
  ) =>
    setPlan(
      (p) =>
        p && {
          ...p,
          floors: p.floors.map((f, i) =>
            i !== fi ? f : f.map((r, j) => (j === ri ? { ...r, ...patch } : r)),
          ),
        },
    );
  const inp = "w-16 rounded border border-line px-1.5 py-1 text-[13px]";

  return (
    <details className="group rounded-xl border-2 border-dashed border-steel/40 bg-[#f3f6f9] p-3">
      <summary className="cursor-pointer list-none text-[14px] font-extrabold text-steel">
        📄{" "}
        {L(
          lang,
          "Have a plan already? Upload it — get the estimate",
          "नक्शा पहले से है? अपलोड करें — एस्टिमेट पाएं",
        )}
      </summary>
      <div className="mt-3 flex flex-col gap-3">
        <p className="text-[13px] leading-relaxed text-body">
          {L(
            lang,
            "AutoCAD DXF: read on your phone or computer, free. Photo or PDF of the plan: read by AI (Pro). You check every room before it is used.",
            "AutoCAD की DXF फ़ाइल: आपके फ़ोन / कंप्यूटर पर ही पढ़ी जाती है, फ़्री। नक्शे की फ़ोटो या PDF: AI से पढ़ी जाती है (प्रो)। इस्तेमाल से पहले आप हर कमरा जांचते हैं।",
          )}
        </p>
        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-steel px-4 py-2.5 text-[14px] font-semibold text-white">
          {busy
            ? L(lang, "Reading the plan…", "नक्शा पढ़ा जा रहा है…")
            : L(lang, "Choose DXF / photo / PDF", "DXF / फ़ोटो / PDF चुनें")}
          <input
            type="file"
            accept=".dxf,image/*,application/pdf"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void pick(f);
            }}
          />
        </label>
        {needPro && (
          <div className="flex flex-col gap-2 rounded-lg border border-amber bg-amber-tint p-3 text-[13px]">
            {L(
              lang,
              "Reading plan photos and PDFs is part of Pro.",
              "नक्शे की फ़ोटो और PDF पढ़ना प्रो में है।",
            )}
            <button
              type="button"
              className="w-fit rounded-lg bg-ink px-3 py-2 font-semibold text-white"
              onClick={async () => {
                const ok = await a.buy("month").catch(() => false);
                if (ok) setNeedPro(false);
              }}
            >
              {L(
                lang,
                `Get Pro · ₹${PLANS.month.inr}/month`,
                `प्रो लें · ₹${PLANS.month.inr}/महीना`,
              )}
            </button>
          </div>
        )}
        {plan && (
          <div className="flex flex-col gap-3">
            <p className="rounded-lg bg-warn-tint px-3 py-2 text-[13px] text-[#4a3b12]">
              {L(
                lang,
                "Check the rooms and sizes (feet) — fix anything read wrong, then use them.",
                "कमरे और साइज़ (फ़ीट) जांचें — जो ग़लत पढ़ा गया हो ठीक करें, फिर इस्तेमाल करें।",
              )}
              {plan.notes ? ` ${plan.notes}` : ""}
            </p>
            {plan.floors.map((f, fi) => (
              <div key={fi} className="overflow-x-auto">
                <p className="mb-1 text-[13px] font-bold">{FLOOR(fi, lang)}</p>
                <table className="min-w-[420px] text-[13px]">
                  <tbody>
                    {f.map((r, ri) => (
                      <tr key={ri}>
                        <td className="py-0.5 pr-2">
                          <select
                            className="rounded border border-line px-1 py-1"
                            value={r.type}
                            onChange={(e) =>
                              edit(fi, ri, { type: e.target.value as RoomType })
                            }
                          >
                            {ROOM_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {ROOM_DEFS[t].name[lang]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="pr-1">
                          <input
                            className={inp}
                            type="number"
                            step="0.5"
                            value={r.L}
                            onChange={(e) =>
                              edit(fi, ri, { L: +e.target.value })
                            }
                          />
                        </td>
                        <td className="pr-1">×</td>
                        <td className="pr-2">
                          <input
                            className={inp}
                            type="number"
                            step="0.5"
                            value={r.B}
                            onChange={(e) =>
                              edit(fi, ri, { B: +e.target.value })
                            }
                          />
                        </td>
                        <td className="text-muted">ft</td>
                        <td className="pl-2">
                          <button
                            type="button"
                            aria-label="Remove"
                            className="text-[#a8321f]"
                            onClick={() =>
                              setPlan(
                                (p) =>
                                  p && {
                                    ...p,
                                    floors: p.floors.map((x, i) =>
                                      i === fi
                                        ? x.filter((_, j) => j !== ri)
                                        : x,
                                    ),
                                  },
                              )
                            }
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <button
              type="button"
              className="w-fit rounded-lg bg-ink px-4 py-2.5 text-[14px] font-semibold text-white"
              onClick={() => {
                onApply(plan);
                setPlan(null);
              }}
            >
              {L(
                lang,
                "Use these rooms → estimate",
                "ये कमरे इस्तेमाल करें → एस्टिमेट",
              )}
            </button>
          </div>
        )}
      </div>
    </details>
  );
}
