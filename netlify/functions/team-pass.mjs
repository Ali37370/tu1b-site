import { randomBytes, scryptSync } from "node:crypto";
import { dataStore, getTeamPass, json, requireRole } from "../lib/common.mjs";
export default async (req) => {
  const g = await requireRole(req, ["owner"]); if (g.error) return g.error;
  let b; try { b = await req.json(); } catch { b = {}; }
  const store = dataStore();
  if (b.action === "set") {
    const pass = String(b.password || "");
    if (pass.length < 6 || pass.length > 64) return json({ error: "length" }, 400);
    const salt = randomBytes(16);
    await store.setJSON("team_pass", { salt: salt.toString("hex"), hash: scryptSync(pass, salt, 32).toString("hex"), ver: randomBytes(6).toString("hex"), updated: new Date().toISOString() });
  } else if (b.action === "clear") {
    await store.delete("team_pass");
  }
  const tp = await getTeamPass();
  return json({ set: !!tp, updated: tp ? tp.updated : null });
};
export const config = { path: "/api/team-pass" };
