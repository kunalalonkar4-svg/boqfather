import "server-only";
import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

/** Server-side Supabase with the service key (bypasses row security — use only after checking the user). */
export function adminDb(): SupabaseClient {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new HttpError(503, "Login is not set up yet");
  admin = createClient(url, key, { auth: { persistSession: false } });
  return admin;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** The logged-in user from the request's bearer token. */
export async function requireUser(req: Request): Promise<User> {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) throw new HttpError(401, "Please log in");
  const { data, error } = await adminDb().auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "Please log in again");
  return data.user;
}

/** Pro if the monthly plan is active, or the given project is unlocked. */
export async function isPro(
  userId: string,
  projectId?: string,
): Promise<boolean> {
  const db = adminDb();
  const { data: p } = await db
    .from("profiles")
    .select("pro_until")
    .eq("id", userId)
    .single();
  if (p?.pro_until && new Date(p.pro_until) > new Date()) return true;
  if (projectId) {
    const { data: pr } = await db
      .from("projects")
      .select("pro")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();
    if (pr?.pro) return true;
  }
  return false;
}

export function errorResponse(e: unknown) {
  const status = e instanceof HttpError ? e.status : 500;
  const msg = e instanceof Error ? e.message : "Something went wrong";
  if (status === 500) console.error(e);
  return Response.json({ error: msg }, { status });
}
