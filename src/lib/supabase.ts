"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/** Browser Supabase client, or null until the project keys are set. */
export function supabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client =
    url && key
      ? createClient(url, key, {
          auth: { persistSession: true, autoRefreshToken: true },
        })
      : null;
  return client;
}

/** Calls one of our API routes with the user's login token. */
export async function api<T>(path: string, body: unknown): Promise<T> {
  const sb = supabase();
  const token = sb
    ? (await sb.auth.getSession()).data.session?.access_token
    : undefined;
  const r = await fetch(path.endsWith("/") ? path : `${path}/`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j as T;
}
