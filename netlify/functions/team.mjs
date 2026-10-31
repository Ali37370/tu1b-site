import { dataStore, getTeam, json, owners, requireRole, session, ukey, sameOrigin } from "../lib/common.mjs";
const save = (t) => dataStore().setJSON("team", t);
const clean = (n) => String(n || "").trim().replace(/^@/, "").slice(0, 40);
export default async (req) => {
  // GET: owner sees the team
  if (req.method === "GET") {
    const user = session(req);
    if (!user || !owners().includes(ukey(user.n))) return json({ error: "forbidden" }, 403);
    return json(await getTeam());
  }
  if (req.method !== "POST" || !sameOrigin(req)) return json({ error: "bad" }, 400);
  let body; try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const action = body && body.action;

  // any signed-in Kick user can ask to join (or cancel their own request)
  if (action === "request" || action === "cancel") {
    const user = session(req); if (!user) return json({ error: "login" }, 401);
    const k = ukey(user.n); if (owners().includes(k)) return json({ ok: true });
    const t = await getTeam();
    if (t.members.some((m) => m.key === k)) return json({ ok: true });
    t.requests = t.requests.filter((m) => m.key !== k);
    t.rejected = t.rejected.filter((m) => m.key !== k);
    if (action === "request") t.requests.push({ name: clean(user.n), key: k, avatar: user.a || "", at: new Date().toISOString() });
    await save(t); return json({ ok: true });
  }

  // owner-only actions
  const g = await requireRole(req, ["owner"]); if (g.error) return g.error;
  const name = clean(body.name), k = ukey(name);
  if (!k || !/^[a-z0-9_.-]{2,40}$/.test(k)) return json({ error: "bad_name" }, 400);
  const t = await getTeam();
  const drop = (list) => list.filter((m) => m.key !== k);
  const req0 = t.requests.find((m) => m.key === k);
  if (action === "approve" || action === "add") {
    t.requests = drop(t.requests); t.rejected = drop(t.rejected);
    if (!t.members.some((m) => m.key === k)) t.members.push({ name: req0 ? req0.name : name, key: k, avatar: req0 ? req0.avatar : "", by: g.user.n, at: new Date().toISOString() });
  } else if (action === "reject") {
    t.requests = drop(t.requests); t.members = drop(t.members);
    if (!t.rejected.some((m) => m.key === k)) t.rejected.push({ name: req0 ? req0.name : name, key: k, at: new Date().toISOString() });
  } else if (action === "remove") {
    t.members = drop(t.members); t.rejected = drop(t.rejected); t.requests = drop(t.requests);
  } else return json({ error: "bad_action" }, 400);
  await save(t); return json(t);
};
export const config = { path: "/api/team" };
