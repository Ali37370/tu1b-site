import { dataStore, json, session, sameOrigin, ukey } from "../lib/common.mjs";
// Aim game leaderboard: one best score per Kick account. 30-second rounds, so anything above
// MAX is not humanly possible and is refused.
const MAX = 150;
const top = (b) => Object.values(b).sort((a, c) => c.score - a.score || a.at.localeCompare(c.at)).slice(0, 10)
  .map(({ name, score }) => ({ name, score }));
export default async (req) => {
  const store = dataStore();
  const board = (await store.get("scores", { type: "json" })) || {};
  if (req.method === "GET") return json({ top: top(board) });
  if (req.method !== "POST" || !sameOrigin(req)) return json({ error: "bad" }, 400);
  const user = session(req); if (!user) return json({ error: "login" }, 401);
  let body; try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const score = Math.floor(+body.score), hits = Math.floor(+body.hits), shots = Math.floor(+body.shots);
  if (!Number.isFinite(score) || score < 1 || score > MAX || hits !== score || shots < hits || shots > 600) return json({ error: "bad_score" }, 400);
  const k = ukey(user.n), prev = board[k];
  if (!prev || score > prev.score) board[k] = { name: user.n, score, at: new Date().toISOString() };
  await store.setJSON("scores", board);
  return json({ ok: true, top: top(board), best: board[k].score });
};
export const config = { path: "/api/scores" };
