import { getStore } from "@netlify/blobs";
import { createHmac, timingSafeEqual, randomBytes, createHash } from "node:crypto";

export const dataStore = () => getStore({ name: "tu1b-data", consistency: "strong" });
export const imageStore = () => getStore({ name: "tu1b-images", consistency: "strong" });

export const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

export const ukey = (n) => String(n || "").trim().replace(/^@/, "").toLowerCase();
export const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
export const randomToken = (n = 32) => b64url(randomBytes(n));
export const sha256 = (s) => createHash("sha256").update(s).digest();

/* ---------- signed cookies ---------- */
function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET missing or too short");
  return s;
}
export function sign(obj) {
  const body = b64url(JSON.stringify(obj));
  const mac = b64url(createHmac("sha256", secret()).update(body).digest());
  return body + "." + mac;
}
export function verify(token) {
  if (!token || !token.includes(".")) return null;
  const [body, mac] = token.split(".");
  const want = b64url(createHmac("sha256", secret()).update(body).digest());
  const a = Buffer.from(mac), b = Buffer.from(want);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const obj = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
    if (obj.exp && Date.now() > obj.exp) return null;
    return obj;
  } catch { return null; }
}
export function getCookie(req, name) {
  const c = req.headers.get("cookie") || "";
  for (const part of c.split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i) === name) return decodeURIComponent(part.slice(i + 1));
  }
  return null;
}
export function cookie(name, value, maxAge, path = "/") {
  return `${name}=${encodeURIComponent(value)}; Path=${path}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

/* ---------- who is asking ---------- */
export function session(req) {
  try { return verify(getCookie(req, "tu1b_session")); } catch { return null; }
}
export const owners = () => (process.env.OWNER_KICK || "").split(/[,\s]+/).map(ukey).filter(Boolean);

export async function getTeam() {
  const t = await dataStore().get("team", { type: "json" });
  return { members: [], requests: [], rejected: [], ...(t || {}) };
}
export async function roleOf(user) {
  if (!user || !user.n) return "visitor";
  const k = ukey(user.n);
  if (owners().includes(k)) return "owner";
  const t = await getTeam();
  if (t.members.some((m) => m.key === k)) return "editor";
  if (t.requests.some((m) => m.key === k)) return "pending";
  if (t.rejected.some((m) => m.key === k)) return "rejected";
  return "visitor";
}
/* POSTs must come from this site (blocks cross-site form posts) */
export function sameOrigin(req) {
  const o = req.headers.get("origin");
  if (!o) return true;
  try { return new URL(o).host === new URL(req.url).host; } catch { return false; }
}
export async function requireRole(req, allowed) {
  if (req.method !== "POST") return { error: json({ error: "method" }, 405) };
  if (!sameOrigin(req)) return { error: json({ error: "origin" }, 403) };
  const user = session(req);
  const role = await roleOf(user);
  if (!allowed.includes(role)) return { error: json({ error: "forbidden", role }, user ? 403 : 401) };
  return { user, role };
}
