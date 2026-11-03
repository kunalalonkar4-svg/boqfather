"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CHECKLIST, CHECKLIST_COUNT, ytUrl } from "@/content/checklist";
import { Lang, langPath } from "@/lib/site";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const KEY = "boqfather-checklist-v1";

function YtIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="4" fill="#d9302c" />
      <path d="M10 8.5v7l6-3.5z" fill="#fff" />
    </svg>
  );
}

/** Tick-box checklist; ticks are kept in this browser only (a convenience, nothing is sent anywhere). */
export function Checklist({ lang }: { lang: Lang }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v) setDone(JSON.parse(v));
    } catch {
      /* storage blocked: ticks just won't be remembered */
    }
  }, []);
  const toggle = (id: string) =>
    setDone((d) => {
      const nd = { ...d, [id]: !d[id] };
      try {
        localStorage.setItem(KEY, JSON.stringify(nd));
      } catch {
        /* ignore */
      }
      return nd;
    });
  const total = Object.values(done).filter(Boolean).length;
  const share = () => {
    const lines = [
      L(
        lang,
        "My house checklist (BOQFather)",
        "मेरी घर की चेकलिस्ट (BOQFather)",
      ),
      `${total}/${CHECKLIST_COUNT} ${L(lang, "done", "पूरे")}`,
      "",
      ...CHECKLIST.flatMap((s) => [
        `*${s.title[lang]}*`,
        ...s.points.map((pt) => `${done[pt.id] ? "✅" : "⬜"} ${pt.t[lang]}`),
        "",
      ]),
    ];
    return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="sticky top-16 z-10 -mx-4 flex flex-wrap items-center gap-3 border-b border-line bg-ground/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex min-w-[180px] flex-1 flex-col gap-1">
          <span className="text-[14px] font-semibold">
            {L(
              lang,
              `${total} of ${CHECKLIST_COUNT} checked`,
              `${CHECKLIST_COUNT} में से ${total} पूरे`,
            )}
          </span>
          <span className="h-2 overflow-hidden rounded-full bg-[#e7e2d8]">
            <span
              className="block h-full rounded-full bg-amber transition-all"
              style={{ width: `${(100 * total) / CHECKLIST_COUNT}%` }}
            />
          </span>
        </div>
        <a
          href={share()}
          target="_blank"
          rel="noopener"
          className="rounded-xl bg-[#1d7a46] px-4 py-2 text-[14px] font-semibold text-white"
        >
          {L(lang, "Send on WhatsApp", "WhatsApp पर भेजें")}
        </a>
        <nav className="flex w-full flex-wrap gap-2">
          {CHECKLIST.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-line bg-white px-3 py-1 text-[12px] font-semibold hover:border-amber"
            >
              {i + 1}. {s.title[lang].split("·")[1]?.trim() ?? s.title[lang]} ·{" "}
              {s.points.filter((pt) => done[pt.id]).length}/{s.points.length}
            </a>
          ))}
        </nav>
      </div>

      {CHECKLIST.map((s) => {
        let k = CHECKLIST.slice(0, CHECKLIST.indexOf(s)).reduce(
          (t, x) => t + x.points.length,
          0,
        );
        return (
          <section
            key={s.id}
            id={s.id}
            className="flex max-w-3xl scroll-mt-40 flex-col gap-3"
          >
            <h2 className="font-display text-[22px] font-bold tracking-tight">
              {s.title[lang]}
            </h2>
            <ol className="flex flex-col gap-2">
              {s.points.map((pt) => {
                k++;
                return (
                  <li
                    key={pt.id}
                    className={
                      "flex gap-3 rounded-xl border bg-white px-4 py-3 " +
                      (done[pt.id]
                        ? "border-[#9fd0b2] bg-[#f3faf6]"
                        : "border-line")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={!!done[pt.id]}
                      onChange={() => toggle(pt.id)}
                      aria-label={pt.t[lang]}
                      className="mt-1 h-5 w-5 shrink-0 accent-[#1d7a46]"
                    />
                    <span className="flex min-w-0 flex-col gap-1.5">
                      <span className="text-[15px] leading-relaxed">
                        <span className="mr-1.5 font-bold text-muted">
                          {k}.
                        </span>
                        {pt.t[lang]}
                      </span>
                      <span className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold">
                        <a
                          href={ytUrl(pt)}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-1.5 text-[#b3261e] hover:underline"
                        >
                          <YtIcon />
                          {pt.video
                            ? L(lang, "Watch the video", "वीडियो देखें")
                            : L(
                                lang,
                                "Watch videos on YouTube",
                                "YouTube पर वीडियो देखें",
                              )}
                        </a>
                        {pt.link && (
                          <Link
                            href={langPath(lang, pt.link)}
                            className="text-steel hover:text-ink"
                          >
                            {L(lang, "Work it out →", "हिसाब निकालें →")}
                          </Link>
                        )}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
