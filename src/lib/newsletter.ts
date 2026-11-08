/** Email check shared by the sign-up route and its test. Deliberately simple: one @, a dot in the domain, no spaces. */
export function cleanEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const e = raw.trim().toLowerCase();
  if (e.length < 6 || e.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return null;
  if (e.split("@")[0].length > 64) return null;
  return e;
}
