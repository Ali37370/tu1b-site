import { dataStore, json, requireRole } from "../lib/common.mjs";
const str = (v, max) => (typeof v === "string" && v.length <= max ? v : null);
export default async (req) => {
  const g = await requireRole(req, ["owner", "editor"]); if (g.error) return g.error;
  let body; try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  if (!body || !Array.isArray(body.photos) || body.photos.length > 400) return json({ error: "bad_shape" }, 400);
  const photos = [];
  for (const p of body.photos) {
    const full = str(p && p.full, 300), thumb = str(p && p.thumb, 300);
    if (!full || !thumb || !/^(\/img\/|[pt]\d+\.jpg$)/.test(full) || !/^(\/img\/|[pt]\d+\.jpg$)/.test(thumb)) return json({ error: "bad_photo" }, 400);
    const names = (Array.isArray(p.names) ? p.names : []).map((n) => str(n, 60)).filter(Boolean).slice(0, 300);
    const o = { full, thumb, names };
    for (const k of ["id", "tid", "g"]) if (str(p[k], 80)) o[k] = p[k];
    photos.push(o);
  }
  const schedule = (Array.isArray(body.schedule) ? body.schedule : [])
    .filter((s) => s && Number.isInteger(s.d) && s.d >= 0 && s.d <= 6 && /^\d{2}:\d{2}$/.test(s.t)).map((s) => ({ d: s.d, t: s.t }));
  const subs = [...new Set((Array.isArray(body.subs) ? body.subs : []).map((n) => str(n, 60)).filter(Boolean))].slice(0, 3000);
  const emotes = (Array.isArray(body.emotes) ? body.emotes : []).slice(0, 80)
    .filter((e) => e && str(e.url, 300) && /^\/img\/[a-z0-9-]{6,40}$/.test(e.url))
    .map((e) => ({ url: e.url, id: str(e.id, 80) || "", name: str(e.name, 40) || "" }));
  const clips = (Array.isArray(body.clips) ? body.clips : []).slice(0, 30)
    .filter((c) => c && str(c.url, 400) && /^https:\/\/(www\.)?(kick\.com|youtube\.com|youtu\.be|tiktok\.com|vm\.tiktok\.com)\//.test(c.url))
    .map((c) => ({ url: c.url, title: str(c.title, 80) || "", views: Number.isFinite(+c.views) ? Math.max(0, Math.floor(+c.views)) : 0 }));
  const g0 = body.goal || {};
  const goal = { followers: Math.max(0, Math.floor(+g0.followers || 0)), target: Math.max(0, Math.floor(+g0.target || 0)) };
  const g1 = body.games || {};
  const games = { aim: g1.aim !== false, puzzle: g1.puzzle !== false, xo: g1.xo !== false };
  await dataStore().setJSON("state", { photos, schedule, subs, emotes, clips, goal, games, updated: new Date().toISOString(), by: g.user.n });
  return json({ ok: true });
};
export const config = { path: "/api/save" };
