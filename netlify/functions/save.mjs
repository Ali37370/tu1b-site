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
  await dataStore().setJSON("state", { photos, schedule, updated: new Date().toISOString(), by: g.user.n });
  return json({ ok: true });
};
export const config = { path: "/api/save" };
