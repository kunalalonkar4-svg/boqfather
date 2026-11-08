"use client";

import Link from "next/link";
import { useState } from "react";

export interface NewsletterLabels {
  title: string;
  text: string;
  email: string;
  placeholder: string;
  subscribe: string;
  sending: string;
  consent: string;
  privacy: string;
  privacyHref: string;
  success: string;
  already: string;
  invalid: string;
  failed: string;
  consentNeeded: string;
  off: string;
}

/**
 * Newsletter sign-up. `enabled` comes from NEXT_PUBLIC_NEWSLETTER_READY: until the table, the sender and the flag are all set up,
 * the form stays disabled and says so. Success is shown only after the server confirms the row is saved.
 */
export function Newsletter({ enabled, labels }: { enabled: boolean; labels: NewsletterLabels }) {
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "already" | "error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!enabled || state === "busy") return;
    setErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setState("error");
      setErr(labels.invalid);
      return;
    }
    if (!agree) {
      setState("error");
      setErr(labels.consentNeeded);
      return;
    }
    setState("busy");
    try {
      const r = await fetch("/api/newsletter/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent: agree, website: trap }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.status === "subscribed") setState("ok");
      else if (r.ok && j.status === "already") setState("already");
      else {
        setState("error");
        setErr(r.status === 400 ? labels.invalid : labels.failed);
      }
    } catch {
      setState("error");
      setErr(labels.failed);
    }
  }

  const done = state === "ok" || state === "already";
  return (
    <section className="bg-white">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div>
          <h2 className="font-display text-[26px] font-extrabold leading-[1.15] tracking-tight [text-wrap:balance] sm:text-[32px]">{labels.title}</h2>
          <p className="mt-3 max-w-md text-[16px] leading-relaxed text-body">{labels.text}</p>
        </div>
        <form onSubmit={submit} noValidate className="flex flex-col gap-3">
          <label htmlFor="nl-email" className="text-[14px] font-bold text-ink">
            {labels.email}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="nl-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              disabled={!enabled || done}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={labels.placeholder}
              aria-invalid={state === "error"}
              aria-describedby="nl-msg"
              className="h-12 min-w-0 flex-1 rounded-[4px] border border-line bg-white px-4 text-[16px] text-ink outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/25 disabled:bg-[#f5f5f5] disabled:text-muted"
            />
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
            <button
              type="submit"
              disabled={!enabled || done || state === "busy"}
              className="inline-flex h-12 items-center justify-center rounded-[4px] bg-amber px-6 text-[15px] font-bold text-white transition hover:bg-amber-dark disabled:cursor-not-allowed disabled:bg-[#b4b4b4]"
            >
              {state === "busy" ? labels.sending : labels.subscribe}
            </button>
          </div>
          <label className="flex items-start gap-2.5 text-[13px] leading-snug text-[#5a5a5a]">
            <input
              type="checkbox"
              checked={agree}
              disabled={!enabled || done}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#146ef5]"
            />
            <span>
              {labels.consent}{" "}
              <Link href={labels.privacyHref} className="font-semibold text-ink underline underline-offset-2">
                {labels.privacy}
              </Link>
            </span>
          </label>
          <p id="nl-msg" role="status" aria-live="polite" className={`min-h-[1.25rem] text-[14px] font-semibold ${state === "error" ? "text-[#b42318]" : "text-[#067647]"}`}>
            {!enabled ? <span className="font-medium text-[#5a5a5a]">{labels.off}</span> : state === "ok" ? labels.success : state === "already" ? labels.already : state === "error" ? err : ""}
          </p>
        </form>
      </div>
    </section>
  );
}
