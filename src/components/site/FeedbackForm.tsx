"use client";

import { useState } from "react";
import type { Lang } from "@/lib/site";

const T = {
  kind: { en: "What is this about?", hi: "यह किस बारे में है?" },
  kinds: {
    review: { en: "My review", hi: "मेरा रिव्यू" },
    error: { en: "A mistake or wrong number", hi: "कोई ग़लती या ग़लत आंकड़ा" },
    idea: { en: "An idea or missing feature", hi: "कोई सुझाव या कमी" },
    feedback: { en: "Something else", hi: "कुछ और" },
  },
  rating: { en: "Your rating (optional)", hi: "आपकी रेटिंग (वैकल्पिक)" },
  message: { en: "Your message", hi: "आपका संदेश" },
  messagePh: {
    en: "What worked, what did not, what should we fix?",
    hi: "क्या अच्छा लगा, क्या नहीं, हमें क्या सुधारना चाहिए?",
  },
  name: { en: "Your name (optional)", hi: "आपका नाम (वैकल्पिक)" },
  contact: { en: "Email or phone, only if you want a reply (optional)", hi: "ईमेल या फ़ोन, सिर्फ़ जवाब चाहिए तो (वैकल्पिक)" },
  send: { en: "Send feedback", hi: "फ़ीडबैक भेजें" },
  sending: { en: "Sending…", hi: "भेज रहे हैं…" },
  ok: {
    en: "Thank you. Your message has been saved and we read every one.",
    hi: "धन्यवाद। आपका संदेश सेव हो गया है और हम हर संदेश पढ़ते हैं।",
  },
  short: { en: "Please write a few words.", hi: "कृपया कुछ शब्द लिखें।" },
  fail: { en: "Could not send. Please try again in a minute.", hi: "भेज नहीं पाए। कृपया एक मिनट बाद फिर कोशिश करें।" },
  note: {
    en: "We use your message only to improve the site. Reviews are not published here without your permission.",
    hi: "आपका संदेश सिर्फ़ साइट सुधारने के लिए इस्तेमाल होता है। आपकी अनुमति के बिना रिव्यू यहां प्रकाशित नहीं होते।",
  },
};
type K = keyof typeof T.kinds;

export function FeedbackForm({ lang, from }: { lang: Lang; from?: string }) {
  const [kind, setKind] = useState<K>("review");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "error">("idle");
  const [err, setErr] = useState("");
  const t = <X extends { en: string; hi: string }>(x: X) => x[lang];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    if (message.trim().length < 5) {
      setState("error");
      setErr(t(T.short));
      return;
    }
    setState("busy");
    try {
      const page = from || (typeof document !== "undefined" ? document.referrer : "");
      const r = await fetch("/api/feedback/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, rating: rating || undefined, message, name, contact, page, lang, website: trap }),
      });
      if (r.ok) setState("ok");
      else {
        setState("error");
        setErr(r.status === 400 ? t(T.short) : t(T.fail));
      }
    } catch {
      setState("error");
      setErr(t(T.fail));
    }
  }

  if (state === "ok")
    return (
      <p role="status" className="rounded-[10px] border border-[#abefc6] bg-[#ecfdf3] px-5 py-4 text-[16px] font-semibold text-[#067647]">
        {t(T.ok)}
      </p>
    );

  const field =
    "w-full rounded-[4px] border border-line bg-white px-4 py-3 text-[16px] text-ink outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/25";
  return (
    <form onSubmit={submit} noValidate className="flex max-w-xl flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[14px] font-bold text-ink">{t(T.kind)}</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(T.kinds) as K[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`rounded-full border px-3.5 py-1.5 text-[14px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber ${
                kind === k ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"
              }`}
            >
              {t(T.kinds[k])}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[14px] font-bold text-ink">{t(T.rating)}</legend>
        <div className="flex gap-1" role="radiogroup" aria-label={t(T.rating)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} / 5`}
              onClick={() => setRating(rating === n ? 0 : n)}
              className="flex h-11 w-11 items-center justify-center rounded-[4px] text-[28px] leading-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber"
              style={{ color: n <= rating ? "#f5a623" : "#c9ced6" }}
            >
              <span aria-hidden="true">★</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fb-msg" className="text-[14px] font-bold text-ink">
          {t(T.message)}
        </label>
        <textarea
          id="fb-msg"
          rows={5}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t(T.messagePh)}
          aria-invalid={state === "error"}
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fb-name" className="text-[14px] font-bold text-ink">
            {t(T.name)}
          </label>
          <input id="fb-name" type="text" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fb-contact" className="text-[14px] font-bold text-ink">
            {t(T.contact)}
          </label>
          <input id="fb-contact" type="text" autoComplete="email" maxLength={200} value={contact} onChange={(e) => setContact(e.target.value)} className={field} />
        </div>
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "busy"}
          className="inline-flex h-12 items-center rounded-[4px] bg-amber px-6 text-[15px] font-bold text-white transition hover:bg-amber-dark disabled:bg-[#b4b4b4]"
        >
          {state === "busy" ? t(T.sending) : t(T.send)}
        </button>
        <p role="status" aria-live="polite" className="text-[14px] font-semibold text-[#b42318]">
          {state === "error" ? err : ""}
        </p>
      </div>
      <p className="text-[13px] leading-relaxed text-[#5a5a5a]">{t(T.note)}</p>
    </form>
  );
}
