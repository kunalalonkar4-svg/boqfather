"use client";

import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PLANS, type PlanKey } from "@/lib/pricing";
import { api, supabase } from "@/lib/supabase";
import type { Lang } from "@/lib/site";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  pro_until: string | null;
  brand_name: string | null;
  brand_logo: string | null;
}

interface Ctx {
  ready: boolean;
  /** Login is available (Supabase keys set). */
  enabled: boolean;
  user: User | null;
  profile: Profile | null;
  /** Monthly Pro active. */
  pro: boolean;
  openLogin: (then?: () => void) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  buy: (
    plan: PlanKey,
    opts?: { projectId?: string; details?: Record<string, unknown> },
  ) => Promise<boolean>;
}

const AccountCtx = createContext<Ctx | null>(null);
export const useAccount = () => {
  const c = useContext(AccountCtx);
  if (!c) throw new Error("AccountProvider missing");
  return c;
};

declare global {
  interface Window {
    Razorpay?: new (o: Record<string, unknown>) => {
      open: () => void;
      on: (e: string, f: () => void) => void;
    };
  }
}
const loadRazorpay = () =>
  new Promise<boolean>((ok) => {
    if (window.Razorpay) return ok(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => ok(true);
    s.onerror = () => ok(false);
    document.body.appendChild(s);
  });

export function AccountProvider({ children }: { children: ReactNode }) {
  const lang: Lang = usePathname()?.startsWith("/hi") ? "hi" : "en";
  const sb = supabase();
  const [ready, setReady] = useState(!sb);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [login, setLogin] = useState<null | { then?: () => void }>(null);

  const loadProfile = useCallback(
    async (u: User | null) => {
      if (!sb || !u) return setProfile(null);
      const { data } = await sb
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .maybeSingle();
      setProfile((data as Profile) ?? null);
    },
    [sb],
  );

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      loadProfile(data.session?.user ?? null).finally(() => setReady(true));
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null);
      loadProfile(s?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [sb, loadProfile]);

  const pro = !!profile?.pro_until && new Date(profile.pro_until) > new Date();

  const buy: Ctx["buy"] = async (plan, opts = {}) => {
    if (!user) {
      setLogin({});
      return false;
    }
    if (!(await loadRazorpay()) || !window.Razorpay) {
      alertBox(
        L(
          lang,
          "Could not open the payment window. Check your internet.",
          "पेमेंट विंडो नहीं खुली। इंटरनेट जांचें।",
        ),
      );
      return false;
    }
    const o = await api<{
      orderId: string;
      amount: number;
      key: string;
      name: string;
    }>("/api/pay/order", {
      plan,
      projectId: opts.projectId,
    });
    return new Promise<boolean>((resolve) => {
      const rz = new window.Razorpay!({
        key: o.key,
        order_id: o.orderId,
        amount: o.amount,
        currency: "INR",
        name: "BOQFather",
        description: lang === "hi" ? PLANS[plan].hi : PLANS[plan].en,
        prefill: { contact: user.phone ?? "", email: user.email ?? "" },
        theme: { color: "#e8a317" },
        handler: async (resp: Record<string, string>) => {
          try {
            await api("/api/pay/verify", { ...resp, details: opts.details });
            await loadProfile(user);
            resolve(true);
          } catch (e) {
            alertBox(e instanceof Error ? e.message : "Payment check failed");
            resolve(false);
          }
        },
        modal: { ondismiss: () => resolve(false) },
      });
      rz.open();
    });
  };

  const value: Ctx = {
    ready,
    enabled: !!sb,
    user,
    profile,
    pro,
    openLogin: (then) => setLogin({ then }),
    signOut: async () => {
      await sb?.auth.signOut();
    },
    refresh: () => loadProfile(user),
    buy,
  };
  return (
    <AccountCtx.Provider value={value}>
      {children}
      {login && (
        <LoginDialog
          lang={lang}
          onClose={(ok) => {
            const t = login.then;
            setLogin(null);
            if (ok && t) t();
          }}
        />
      )}
    </AccountCtx.Provider>
  );
}

/** Small message box (the site never uses browser alert dialogs). */
function alertBox(msg: string) {
  const d = document.createElement("div");
  d.textContent = msg;
  d.className =
    "fixed bottom-4 left-1/2 z-[100] max-w-[90vw] -translate-x-1/2 rounded-xl bg-ink px-4 py-3 text-[14px] text-white shadow-lg";
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 5000);
}
export { alertBox };

function LoginDialog({
  lang,
  onClose,
}: {
  lang: Lang;
  onClose: (ok: boolean) => void;
}) {
  const sb = supabase();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"start" | "code">("start");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const full = `+91${phone.replace(/\D/g, "").slice(-10)}`;
  if (!sb)
    return (
      <Modal onClose={() => onClose(false)}>
        <p className="text-[15px]">
          {L(
            lang,
            "Login is being set up and will open soon.",
            "लॉगिन तैयार हो रहा है, जल्द शुरू होगा।",
          )}
        </p>
      </Modal>
    );
  return (
    <Modal onClose={() => onClose(false)}>
      <h2 className="font-display text-[22px] font-extrabold">
        {L(lang, "Log in to BOQFather", "BOQFather में लॉगिन करें")}
      </h2>
      <p className="text-[14px] text-body">
        {L(
          lang,
          "Save projects, share links and use Pro features.",
          "प्रोजेक्ट सेव करें, लिंक शेयर करें और प्रो फ़ीचर इस्तेमाल करें।",
        )}
      </p>
      <button
        type="button"
        onClick={() =>
          sb.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.href },
          })
        }
        className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[15px] font-semibold hover:border-ink"
      >
        <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"
          />
        </svg>
        {L(lang, "Continue with Google", "Google से लॉगिन")}
      </button>
      <div className="flex items-center gap-3 text-[12px] text-muted">
        <span className="h-px flex-1 bg-line" />
        {L(lang, "or mobile number", "या मोबाइल नंबर")}
        <span className="h-px flex-1 bg-line" />
      </div>
      {step === "start" ? (
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMsg("");
            const { error } = await sb.auth.signInWithOtp({ phone: full });
            setBusy(false);
            if (error) setMsg(error.message);
            else setStep("code");
          }}
        >
          <span className="rounded-lg border border-line bg-[#f4f1ea] px-3 py-2 text-[15px]">
            +91
          </span>
          <input
            inputMode="numeric"
            autoComplete="tel-national"
            className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-[15px]"
            placeholder="98xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            pattern="[0-9 ]{10,12}"
          />
          <button
            disabled={busy}
            className="rounded-lg bg-ink px-4 py-2 text-[14px] font-semibold text-white"
          >
            {busy ? "…" : L(lang, "Get OTP", "OTP भेजें")}
          </button>
        </form>
      ) : (
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMsg("");
            const { error } = await sb.auth.verifyOtp({
              phone: full,
              token: code.trim(),
              type: "sms",
            });
            setBusy(false);
            if (error) setMsg(error.message);
            else onClose(true);
          }}
        >
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-[15px] tracking-[0.3em]"
            placeholder="OTP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button
            disabled={busy}
            className="rounded-lg bg-ink px-4 py-2 text-[14px] font-semibold text-white"
          >
            {busy ? "…" : L(lang, "Verify", "जांचें")}
          </button>
        </form>
      )}
      {msg && <p className="text-[13px] text-[#a8321f]">{msg}</p>}
    </Modal>
  );
}

export function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex w-full max-w-md flex-col gap-3 rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="self-end text-[22px] leading-none text-muted"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

/** Header button: Log in / account. */
export function AccountButton({ lang }: { lang: Lang }) {
  const a = useAccount();
  if (!a.enabled) return null;
  if (!a.user)
    return (
      <button
        type="button"
        onClick={() => a.openLogin()}
        className="rounded-lg px-3 py-2 text-[#cfcbc2] hover:text-white"
      >
        {L(lang, "Log in", "लॉगिन")}
      </button>
    );
  return (
    <a
      href={lang === "hi" ? "/hi/account/" : "/account/"}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-white"
    >
      {a.pro && (
        <span className="rounded bg-amber px-1.5 text-[11px] font-extrabold text-ink">
          PRO
        </span>
      )}
      {L(lang, "My account", "मेरा अकाउंट")}
    </a>
  );
}
