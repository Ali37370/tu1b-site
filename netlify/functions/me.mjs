import { session, roleOf, json, owners, canManagePass } from "../lib/common.mjs";
export default async (req) => {
  let user = null; try { user = session(req); } catch { return json({ error: "server_setup", user: null, role: "visitor" }); }
  const role = await roleOf(user);
  const name = user ? (user.p ? String(user.n).replace(/^team:/, "") : user.n) : null;
  return json({ user: user ? { name, avatar: user.p ? "" : user.a, via: user.p ? "pass" : "kick" } : null, role, canPass: canManagePass(user), ownerSet: owners().length > 0 });
};
export const config = { path: "/api/me" };
