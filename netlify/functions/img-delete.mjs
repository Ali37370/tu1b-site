import { imageStore, json, requireRole } from "../lib/common.mjs";
export default async (req) => {
  const g = await requireRole(req, ["owner", "editor"]); if (g.error) return g.error;
  let body; try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const key = body && body.key;
  if (!key || !/^[a-z0-9-]{6,40}$/.test(key)) return json({ error: "bad_key" }, 400);
  await imageStore().delete(key);
  return json({ ok: true });
};
export const config = { path: "/api/img-delete" };
