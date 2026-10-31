import { cookie, json, sameOrigin } from "../lib/common.mjs";
export default async (req) => {
  if (req.method !== "POST" || !sameOrigin(req)) return json({ error: "bad" }, 400);
  return json({ ok: true }, 200, { "set-cookie": cookie("tu1b_session", "", 0) });
};
export const config = { path: "/api/auth/logout" };
