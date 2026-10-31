// Checks whether the Kick channel is live using Kick's official public API.
// Needs the environment variable KICK_CLIENT_SECRET set in Netlify (never commit it).
let token = null, expiresAt = 0;

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=0, must-revalidate",
    "netlify-cdn-cache-control": "public, durable, s-maxage=45, stale-while-revalidate=30",
  },
});

async function getToken(id, secret) {
  if (token && Date.now() < expiresAt) return token;
  const r = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
  });
  if (!r.ok) throw new Error("token_" + r.status);
  const t = await r.json();
  token = t.access_token;
  expiresAt = Date.now() + ((t.expires_in || 3600) - 120) * 1000;
  return token;
}

export default async () => {
  const id = process.env.KICK_CLIENT_ID || "01M63VT1BTE2E34A0GJJBCTF62";
  const secret = process.env.KICK_CLIENT_SECRET;
  const slug = process.env.KICK_SLUG || "tu1b";
  if (!secret) return json({ error: "missing_secret" });
  try {
    let tok = await getToken(id, secret);
    let r = await fetch("https://api.kick.com/public/v1/channels?slug=" + encodeURIComponent(slug), {
      headers: { authorization: "Bearer " + tok, accept: "application/json" },
    });
    if (r.status === 401) { token = null; tok = await getToken(id, secret);
      r = await fetch("https://api.kick.com/public/v1/channels?slug=" + encodeURIComponent(slug), {
        headers: { authorization: "Bearer " + tok, accept: "application/json" } }); }
    if (!r.ok) return json({ error: "api_" + r.status });
    const d = await r.json();
    const ch = (d.data || [])[0];
    if (!ch) return json({ error: "channel_not_found" });
    const st = ch.stream || {};
    return json({
      live: !!st.is_live,
      viewers: st.viewer_count || 0,
      title: ch.stream_title || "",
      category: (ch.category && ch.category.name) || "",
      checked: new Date().toISOString(),
    });
  } catch (e) {
    return json({ error: String(e.message || "fetch_failed") });
  }
};

export const config = { path: "/api/live" };
