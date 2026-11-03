/** Pro plans (₹). Amounts are charged by Razorpay in paise. */
export const PLANS = {
  project: { inr: 199, en: "Pro project", hi: "प्रो प्रोजेक्ट", days: 0 },
  month: { inr: 499, en: "Pro monthly", hi: "प्रो मासिक", days: 30 },
  custom: {
    inr: 2999,
    en: "Custom naksha by an expert",
    hi: "एक्सपर्ट से कस्टम नक्शा",
    days: 0,
  },
} as const;
export type PlanKey = keyof typeof PLANS;

/** AI reads (plan / bill photos) allowed per user per day on Pro. */
export const AI_DAILY_LIMIT = 15;

export const supabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
