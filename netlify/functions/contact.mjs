import { dataStore, json, sameOrigin, sha256 } from "../lib/common.mjs";
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const TYPES = ["sponsor", "ad", "event", "other"];
export default async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  let b; try { b = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  if (str(b.website, 100)) return json({ ok: true }); // honeypot
  const name = str(b.name, 80), email = str(b.email, 120), company = str(b.company, 100), message = str(b.message, 2000);
  const type = TYPES.includes(b.type) ? b.type : "other";
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 10) return json({ error: "invalid" }, 400);
  const ip = req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "?";
  const who = sha256(ip + (process.env.SESSION_SECRET || "")).toString("hex").slice(0, 16);
  const store = dataStore();
  const list = (await store.get("inquiries", { type: "json" })) || [];
  const recent = list.filter((x) => x.who === who && Date.now() - Date.parse(x.at) < 10 * 60e3);
  if (recent.length >= 3) return json({ error: "rate" }, 429);
  list.unshift({ id: Date.now().toString(36), at: new Date().toISOString(), name, email, company, type, message, who });
  await store.setJSON("inquiries", list.slice(0, 300));
  return json({ ok: true });
};
export const config = { path: "/api/contact" };
