import { session, roleOf, json, owners } from "../lib/common.mjs";
export default async (req) => {
  let user = null; try { user = session(req); } catch { return json({ error: "server_setup", user: null, role: "visitor" }); }
  const role = await roleOf(user);
  return json({ user: user ? { name: user.n, avatar: user.a } : null, role, ownerSet: owners().length > 0 });
};
export const config = { path: "/api/me" };
