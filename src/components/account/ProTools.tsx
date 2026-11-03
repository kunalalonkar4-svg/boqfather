"use client";

import { useEffect, useRef, useState } from "react";
import { PLANS } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import type { Lang } from "@/lib/site";
import { alertBox, useAccount } from "./Account";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const token = () =>
  Array.from(
    crypto.getRandomValues(new Uint8Array(12)),
    (b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32],
  ).join("");

export interface ExportOptions {
  watermark: boolean;
  brand?: string;
}

/**
 * Save / share / download bar of the BOQ tool.
 * Free: downloads carry a "free version" mark. Pro (₹199 this project or ₹499 a month): clean reports with your name.
 */
export function ProTools({
  lang,
  kind,
  title,
  snapshot,
  restore,
  onExport,
  busy,
}: {
  lang: Lang;
  kind: string;
  title: string;
  snapshot: () => unknown;
  restore: (data: unknown) => void;
  onExport: (k: "pdf" | "xls", o: ExportOptions) => void;
  busy: string;
}) {
  const a = useAccount();
  const sb = supabase();
  const [proj, setProj] = useState<{
    id: string;
    name: string;
    pro: boolean;
    share: string | null;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);
  const loaded = useRef(false);

  // open a saved project (?project=id) or a shared one (?share=token)
  useEffect(() => {
    if (!sb || loaded.current) return;
    const q = new URLSearchParams(window.location.search);
    const id = q.get("project"),
      share = q.get("share");
    if (share) {
      loaded.current = true;
      sb.rpc("shared_project", { token: share }).then(({ data }) => {
        const row = Array.isArray(data) ? data[0] : null;
        if (row?.data) {
          restore(row.data);
          setShared(true);
        } else
          alertBox(
            L(
              lang,
              "This shared link has expired.",
              "यह शेयर लिंक अब नहीं चलता।",
            ),
          );
      });
    } else if (id && a.user) {
      loaded.current = true;
      sb.from("projects")
        .select("id,name,pro,share_token,data")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data) {
            restore(data.data);
            setProj({
              id: data.id,
              name: data.name,
              pro: data.pro,
              share: data.share_token,
            });
          }
        });
    }
  }, [sb, a.user, lang, restore]);

  const isPro = a.pro || !!proj?.pro;

  const save = async (): Promise<string | null> => {
    if (!sb) return null;
    if (!a.user) {
      a.openLogin(() => void save());
      return null;
    }
    setSaving(true);
    try {
      const data = snapshot();
      if (proj) {
        const { error } = await sb
          .from("projects")
          .update({
            data,
            name: proj.name,
            updated_at: new Date().toISOString(),
          })
          .eq("id", proj.id);
        if (error) throw error;
        alertBox(L(lang, "Saved", "सेव हो गया"));
        return proj.id;
      }
      const { data: row, error } = await sb
        .from("projects")
        .insert({ user_id: a.user.id, name: title || "My house", kind, data })
        .select("id,name,pro,share_token")
        .single();
      if (error) throw error;
      setProj({
        id: row.id,
        name: row.name,
        pro: row.pro,
        share: row.share_token,
      });
      const u = new URL(window.location.href);
      u.searchParams.set("project", row.id);
      window.history.replaceState(null, "", u.toString());
      alertBox(
        L(lang, "Saved to My projects", "मेरे प्रोजेक्ट में सेव हो गया"),
      );
      return row.id;
    } catch (e) {
      alertBox(e instanceof Error ? e.message : "Could not save");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const share = async () => {
    const id = await save();
    if (!id || !sb) return;
    let t = proj?.share ?? null;
    if (!t) {
      t = token();
      await sb.from("projects").update({ share_token: t }).eq("id", id);
      setProj((p) => (p ? { ...p, share: t } : p));
    }
    const link = `${window.location.origin}${lang === "hi" ? "/hi" : ""}/house-boq-estimate/?share=${t}`;
    try {
      await navigator.clipboard.writeText(link);
      alertBox(
        L(
          lang,
          "Link copied — anyone with it can view this estimate",
          "लिंक कॉपी हो गया — जिसके पास लिंक है वो यह एस्टिमेट देख सकता है",
        ),
      );
    } catch {
      alertBox(link);
    }
  };

  const upgrade = async (plan: "project" | "month") => {
    if (!a.user) return a.openLogin();
    let projectId: string | undefined;
    if (plan === "project") projectId = (await save()) ?? undefined;
    if (plan === "project" && !projectId) return;
    const ok = await a.buy(plan, { projectId }).catch((e) => {
      alertBox(e instanceof Error ? e.message : "Payment failed");
      return false;
    });
    if (ok) {
      if (plan === "project") setProj((p) => (p ? { ...p, pro: true } : p));
      alertBox(
        L(
          lang,
          "Pro unlocked — download a clean report now",
          "प्रो चालू — अब बिना वॉटरमार्क रिपोर्ट डाउनलोड करें",
        ),
      );
    }
  };

  const btn =
    "inline-flex h-11 items-center justify-center rounded-lg px-4 text-[14px] font-bold disabled:opacity-60";
  const exportOpts = (): ExportOptions => ({
    watermark: a.enabled && !isPro,
    brand: isPro ? a.profile?.brand_name || undefined : undefined,
  });
  return (
    <div className="no-print flex flex-col gap-3">
      {shared && (
        <p className="rounded-lg bg-amber-tint px-3 py-2 text-[13px]">
          {L(
            lang,
            "You are viewing a shared estimate. Changes you make are not saved to it.",
            "आप शेयर किया एस्टिमेट देख रहे हैं। आपके बदलाव उसमें सेव नहीं होंगे।",
          )}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onExport("xls", exportOpts())}
          disabled={!!busy}
          className={
            btn + " bg-amber font-extrabold text-ink hover:brightness-105"
          }
        >
          {busy === "xls" ? "…" : L(lang, "Download Excel", "Excel डाउनलोड")}
        </button>
        <button
          type="button"
          onClick={() => onExport("pdf", exportOpts())}
          disabled={!!busy}
          className={btn + " border border-ink bg-white"}
        >
          {busy === "pdf"
            ? "…"
            : L(lang, "PDF (abstract + MB)", "PDF (एब्स्ट्रैक्ट + MB)")}
        </button>
        {a.enabled && !shared && (
          <>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className={btn + " border border-line bg-white"}
            >
              {saving
                ? "…"
                : proj
                  ? L(lang, "Save", "सेव करें")
                  : L(lang, "Save project", "प्रोजेक्ट सेव करें")}
            </button>
            <button
              type="button"
              onClick={() => void share()}
              className={btn + " border border-line bg-white"}
            >
              {L(lang, "Share link", "शेयर लिंक")}
            </button>
          </>
        )}
      </div>
      {a.enabled && !isPro && (
        <div className="flex flex-col gap-2 rounded-xl border border-amber bg-amber-tint p-3">
          <p className="text-[13px] leading-relaxed">
            <strong>
              {L(
                lang,
                "Free reports carry a BOQFather mark.",
                "फ़्री रिपोर्ट पर BOQFather का निशान रहता है।",
              )}
            </strong>{" "}
            {L(
              lang,
              "Pro gives clean PDF / Excel with your firm's name, AI reading of plan and bill photos, and saved projects.",
              "प्रो में बिना निशान PDF / Excel आपके नाम के साथ, नक्शे और बिल की फ़ोटो AI से पढ़ना, और सेव प्रोजेक्ट मिलते हैं।",
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void upgrade("project")}
              className={btn + " h-10 bg-ink text-white"}
            >
              {L(
                lang,
                `This project · ₹${PLANS.project.inr}`,
                `यह प्रोजेक्ट · ₹${PLANS.project.inr}`,
              )}
            </button>
            <button
              type="button"
              onClick={() => void upgrade("month")}
              className={btn + " h-10 border border-ink bg-white"}
            >
              {L(
                lang,
                `Pro monthly · ₹${PLANS.month.inr}`,
                `प्रो मासिक · ₹${PLANS.month.inr}`,
              )}
            </button>
          </div>
        </div>
      )}
      {isPro && (
        <p className="text-[12px] font-semibold text-[#1d7a46]">
          ✓ {L(lang, "Pro: clean reports", "प्रो: बिना निशान रिपोर्ट")}
          {a.profile?.brand_name ? ` · ${a.profile.brand_name}` : ""}
        </p>
      )}
    </div>
  );
}
