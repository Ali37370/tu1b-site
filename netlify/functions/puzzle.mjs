import { dataStore, json, session, sameOrigin, ukey } from "../lib/common.mjs";
// Photo puzzle leaderboard: fastest solve per Kick account, one board per size (4x4, 6x6, 9x9).
// Times below MIN_MS are not humanly possible for a shuffled board and are refused.
const SIZES = [4, 6, 9], MIN_MS = { 4: 8000, 6: 20000, 9: 45000 }, MIN_MOVES = { 4: 5, 6: 12, 9: 30 };
const top = (b) => Object.values(b).sort((a, c) => a.ms - c.ms || a.moves - c.moves).slice(0, 10)
  .map(({ name, ms, moves }) => ({ name, ms, moves }));
export default async (req) => {
  const url = new URL(req.url), store = dataStore();
  if (req.method === "GET") {
    const all = (await store.get("puzzle", { type: "json" })) || {};
    return json({ tops: Object.fromEntries(SIZES.map((n) => [n, top(all[n] || {})])) });
  }
  if (req.method !== "POST" || !sameOrigin(req)) return json({ error: "bad" }, 400);
  const user = session(req); if (!user) return json({ error: "login" }, 401);
  let body; try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const size = Math.floor(+body.size), ms = Math.floor(+body.ms), moves = Math.floor(+body.moves);
  if (!SIZES.includes(size) || !Number.isFinite(ms) || ms < MIN_MS[size] || ms > 3600e3 || !Number.isFinite(moves) || moves < MIN_MOVES[size] || moves > 2000)
    return json({ error: "bad_score" }, 400);
  const all = (await store.get("puzzle", { type: "json" })) || {};
  const b = all[size] || (all[size] = {});
  const k = ukey(user.n), prev = b[k];
  if (!prev || ms < prev.ms || (ms === prev.ms && moves < prev.moves)) b[k] = { name: user.n, ms, moves, at: new Date().toISOString() };
  await store.setJSON("puzzle", all);
  return json({ ok: true, tops: Object.fromEntries(SIZES.map((n) => [n, top(all[n] || {})])) });
};
export const config = { path: "/api/puzzle" };
