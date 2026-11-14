import { scryptSync, timingSafeEqual } from "node:crypto";
import { cookie, dataStore, getTeamPass, json, sameOrigin, sha256, sign } from "../lib/common.mjs";
const MAX_FAILS = 6, WINDOW = 15 * 60e3;
export default async (req) => {
  if (req.method !== "POST" || !sameOrigin(req)) return json({ error: "bad" }, 400);
  let b; try { b = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const name = String((b && b.name) || "").trim().replace(/\s+/g, " ").slice(0, 30);
  const pass = String((b && b.password) || "");
  if (name.length < 2 || !pass) return json({ error: "invalid" }, 400);
  const tp = await getTeamPass();
  if (!tp) return json({ error: "no_pass" }, 404);

  const ip = req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "?";
  const who = sha256("pass:" + ip + (process.env.SESSION_SECRET || "")).toString("hex").slice(0, 16);
  const store = dataStore();
  const tries = (await store.get("pass_tries", { type: "json" })) || {};
  const now = Date.now();
  for (const k of Object.keys(tries)) { tries[k] = tries[k].filter((t) => now - t < WINDOW); if (!tries[k].length) delete tries[k]; }
  if ((tries[who] || []).length >= MAX_FAILS) return json({ error: "rate" }, 429);

  const got = scryptSync(pass, Buffer.from(tp.salt, "hex"), 32);
  const want = Buffer.from(tp.hash, "hex");
  if (got.length !== want.length || !timingSafeEqual(got, want)) {
    tries[who] = [...(tries[who] || []), now];
    await store.setJSON("pass_tries", tries);
    return json({ error: "wrong" }, 401);
  }
  if (tries[who]) { delete tries[who]; await store.setJSON("pass_tries", tries); }
  // "team:" prefix can never match a Kick username, so this can't be mistaken for the owner
  const sess = { n: "team:" + name, p: 1, pv: tp.ver, exp: now + 30 * 864e5 };
  return json({ ok: true }, 200, { "set-cookie": cookie("tu1b_session", sign(sess), 30 * 86400) });
};
export const config = { path: "/api/auth/pass" };
