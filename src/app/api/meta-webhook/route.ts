// Meta comment bot: Instagram @eralonkar + Facebook Pages (Astik, NCSA).
// Replaces the n8n workflow "Instagram Comment Bot (@eralonkar)".
// Env (Vercel): META_ACCESS_TOKEN (system-user token, required),
//   META_VERIFY_TOKEN (optional, default below), META_APP_SECRET (optional, enables signature check),
//   GEMINI_API_KEY or ANTHROPIC_API_KEY (optional; without them a fixed polite reply is used).
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const GRAPH = "https://graph.facebook.com/v24.0";
const VERIFY = process.env.META_VERIFY_TOKEN || "96228ef7f908dc1de31730f587233fdd";
const TOKEN = process.env.META_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN || "";
const IG_ID = "17841405405723381";
const IG_USER = "eralonkar";
const PAGE_NCSA = "414948528376093";
const PAGE_ASTIK = "1018455281360345";

const GEMINI_MODELS = () =>
  [process.env.GEMINI_MODEL, "gemini-3.8-flash", "gemini-3-flash-preview", "gemini-3.8-flash-lite", "gemini-flash-latest"].filter(
    (m, i, a): m is string => !!m && a.indexOf(m) === i,
  );

type Persona = "engineer" | "devotional";
type Out = { public_reply: string; dm_text: string };

const ENGINEER = `You reply to social media comments for Er. Kunal Alonkar (Instagram @eralonkar, Facebook Page "National Civil Skills Academy"), Unique Valuer & Engineers, Chhindwara. Services: full house construction (turnkey), BOQ, cost estimation, 2D/3D floor plans (naksha) for any plot in India, property valuation. Website: https://guniyo.com (free house construction cost calculator, item-wise BOQ and house plans by plot size).
Write in the same language and script the commenter used (Hindi, Hinglish or English).
1. public_reply: a warm public reply under 150 characters. No prices or numbers. Say details are sent in DM (Instagram) or invite them to message the page (Facebook). At most one emoji. No links.
2. dm_text: a friendly private message under 650 characters. Greet them, refer to what they asked, and ask for plot size, city, number of floors and rough budget. Tell them they can get a free instant estimate and house plans at https://guniyo.com (exactly like that). Mention a free first consultation. Never promise an exact cost. Sign off as Er. Kunal Alonkar.
If the comment is only an emoji or praise, thank them warmly and make dm_text a short thank-you that invites house-construction questions and mentions https://guniyo.com.
If the comment is spam, abusive or unrelated promotion, return empty strings for both.
Return ONLY JSON: {"public_reply":"...","dm_text":"..."}`;

const DEVOTIONAL = `You reply to comments on "आस्तिक" (Aastik Bhakti), a Hindi devotional Facebook Page about Mahadev, Sanatan dharma and divine stories.
Write public_reply in the same language and script as the commenter (mostly Hindi/Hinglish): a warm, respectful bhakti reply under 140 characters, e.g. agree with their jaikara, bless them ("महादेव आपकी हर मनोकामना पूरी करें 🙏"), and sometimes invite them to follow the page for daily darshan or to write "हर हर महादेव" in the comments. At most two emojis (🙏🔱🕉️🚩). No links, no selling, no politics, never argue.
dm_text must always be an empty string.
If the comment is spam, abusive, political or unrelated promotion, return empty strings for both.
Return ONLY JSON: {"public_reply":"...","dm_text":""}`;

async function graph(path: string, token: string, body?: unknown) {
  const res = await fetch(`${GRAPH}/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) console.error("graph error", path, JSON.stringify(json).slice(0, 400));
  return json as Record<string, unknown>;
}

const pageTokens = new Map<string, string>();
async function pageToken(pageId: string) {
  if (!pageTokens.has(pageId)) {
    const r = await graph(`${pageId}?fields=access_token`, TOKEN);
    if (typeof r.access_token === "string") pageTokens.set(pageId, r.access_token);
  }
  return pageTokens.get(pageId) || "";
}

function parseJson(text: string): Out | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const o = JSON.parse(m[0]);
    return { public_reply: String(o.public_reply || "").trim(), dm_text: String(o.dm_text || "").trim() };
  } catch {
    return null;
  }
}

async function writeReply(persona: Persona, platform: string, who: string, text: string): Promise<Out> {
  const system = persona === "devotional" ? DEVOTIONAL : ENGINEER;
  const user = `${platform} comment by ${who || "a follower"}:\n"${text}"`;
  try {
    if (process.env.GEMINI_API_KEY) {
      for (const model of GEMINI_MODELS()) {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY.trim()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: system }] },
              contents: [{ role: "user", parts: [{ text: user }] }],
              generationConfig: { temperature: 0.6, maxOutputTokens: 4096, responseMimeType: "application/json" },
            }),
          },
        );
        if (!r.ok) {
          console.error("gemini", model, r.status);
          continue;
        }
        const j = await r.json();
        const t = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
        const o = parseJson(t);
        if (o) return o;
      }
    } else if (process.env.ANTHROPIC_API_KEY) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.BOT_CLAUDE_MODEL || "claude-haiku-5-5",
          max_tokens: 700,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });
      const j = await r.json();
      const t = (j?.content || []).map((c: { text?: string }) => c.text || "").join("");
      const o = parseJson(t);
      if (o) return o;
    }
  } catch (e) {
    console.error("ai error", e);
  }
  // Fallback when no AI key / AI failed.
  if (persona === "devotional") return { public_reply: "हर हर महादेव 🙏 महादेव आपकी हर मनोकामना पूरी करें 🔱", dm_text: "" };
  return {
    public_reply: platform === "Instagram" ? "धन्यवाद 🙏 डिटेल्स आपको DM कर दी हैं।" : "धन्यवाद 🙏 अपने प्लॉट का साइज़ पेज पर मैसेज करें।",
    dm_text:
      "नमस्ते! कमेंट के लिए धन्यवाद 🙏 अपने प्लॉट का साइज़, शहर, कितनी मंज़िल और अंदाज़न बजट बताइए, मैं सही गाइड करूँगा। फ्री एस्टिमेट और नक्शे अभी देखें: https://guniyo.com — Er. Kunal Alonkar",
  };
}

async function handleInstagram(v: Record<string, any>) {
  const from = v.from || {};
  if (!v.id || !v.text || v.parent_id) return;
  if (from.id === IG_ID || String(from.username || "").toLowerCase() === IG_USER) return;
  const out = await writeReply("engineer", "Instagram", from.username ? `@${from.username}` : "", v.text);
  if (!out.public_reply) return;
  await graph(`${v.id}/replies`, TOKEN, { message: out.public_reply });
  if (out.dm_text) await graph(`${IG_ID}/messages`, TOKEN, { recipient: { comment_id: v.id }, message: { text: out.dm_text } });
}

async function handlePageComment(pageId: string, v: Record<string, any>) {
  if (v.item !== "comment" || v.verb !== "add" || !v.comment_id || !v.message) return;
  if (v.from?.id === pageId) return; // own comment
  if (v.parent_id && v.post_id && v.parent_id !== v.post_id) return; // reply inside a thread
  const persona: Persona = pageId === PAGE_ASTIK ? "devotional" : "engineer";
  if (pageId !== PAGE_ASTIK && pageId !== PAGE_NCSA) return;
  const token = await pageToken(pageId);
  if (!token) return;
  const out = await writeReply(persona, "Facebook", v.from?.name || "", v.message);
  if (!out.public_reply) return;
  await graph(`${v.comment_id}/comments`, token, { message: out.public_reply });
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  if (q.get("diag") === "1" && q.get("hub.verify_token") === VERIFY) {
    const key = process.env.GEMINI_API_KEY || "";
    const results: Record<string, string> = {};
    if (key) {
      for (const model of GEMINI_MODELS()) {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.trim()}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Say OK" }] }] }) },
        );
        results[model] = `${r.status} ${(await r.text()).slice(0, 120)}`;
      }
    }
    return Response.json({ token: !!TOKEN, gemini_key_len: key.length, key_has_space: key !== key.trim(), gemini: results });
  }
  if (q.get("hub.mode") === "subscribe" && q.get("hub.verify_token") === VERIFY)
    return new Response(q.get("hub.challenge") || "", { status: 200 });
  return new Response("forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.META_APP_SECRET;
  if (secret) {
    const sig = req.headers.get("x-hub-signature-256") || "";
    const want = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want)))
      return new Response("bad signature", { status: 401 });
  }
  let body: Record<string, any> = {};
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("ok", { status: 200 });
  }
  if (!TOKEN) {
    console.error("META_ACCESS_TOKEN missing");
    return new Response("ok", { status: 200 });
  }
  const jobs: Promise<unknown>[] = [];
  for (const entry of body.entry || []) {
    for (const ch of entry.changes || []) {
      if (body.object === "instagram" && ch.field === "comments") jobs.push(handleInstagram(ch.value || {}));
      if (body.object === "page" && ch.field === "feed") jobs.push(handlePageComment(String(entry.id), ch.value || {}));
    }
  }
  await Promise.allSettled(jobs);
  return new Response("ok", { status: 200 });
}
