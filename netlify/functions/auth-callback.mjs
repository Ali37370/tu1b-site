import { verify, sign, cookie, getCookie } from "../lib/common.mjs";
const safeNext = (n) => (typeof n === "string" && /^\/[a-z0-9\-\/]*$/i.test(n) && !n.startsWith("//") ? n : null);
const back = (origin, why, extra = [], next = null) => {
  const n = safeNext(next);
  const loc = n ? origin + n + (why && why !== "ok" ? "?login=" + why : "") : origin + "/tahdeer.html" + (why ? "?login=" + why : "") + "#find";
  const h = new Headers({ location: loc, "cache-control": "no-store" });
  h.append("set-cookie", cookie("tu1b_oauth", "", 0, "/api/auth"));
  extra.forEach((c) => h.append("set-cookie", c));
  return new Response(null, { status: 302, headers: h });
};
export default async (req) => {
  const u = new URL(req.url), origin = u.origin;
  const st = verify(getCookie(req, "tu1b_oauth"));
  const code = u.searchParams.get("code");
  if (u.searchParams.get("error")) return back(origin, "cancel");
  if (!st || !code || u.searchParams.get("state") !== st.s) return back(origin, "expired");
  try {
    const tr = await fetch("https://id.kick.com/oauth/token", {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code", code, redirect_uri: origin + "/api/auth/callback",
        client_id: process.env.KICK_CLIENT_ID || "01M63VT1BTE2E34A0GJJBCTF62",
        client_secret: process.env.KICK_CLIENT_SECRET || "", code_verifier: st.v,
      }),
    });
    if (!tr.ok) return back(origin, "token");
    const tok = await tr.json();
    const ur = await fetch("https://api.kick.com/public/v1/users", { headers: { authorization: "Bearer " + tok.access_token, accept: "application/json" } });
    if (!ur.ok) return back(origin, "user");
    const d = await ur.json();
    const me = (d.data && d.data[0]) || d.data || d;
    const name = me.name || me.username || me.slug;
    if (!name) return back(origin, "user");
    const sess = { n: String(name), u: me.user_id || me.id || null, a: me.profile_picture || "", exp: Date.now() + 30 * 864e5 };
    // the Kick access token is used once and thrown away; only the username is kept
    return back(origin, "ok", [cookie("tu1b_session", sign(sess), 30 * 86400)], st.n);
  } catch { return back(origin, "error"); }
};
export const config = { path: "/api/auth/callback" };
