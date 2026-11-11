import { dataStore, json, requireRole } from "../lib/common.mjs";
export default async (req) => {
  const g = await requireRole(req, ["owner"]); if (g.error) return g.error;
  const list = (await dataStore().get("inquiries", { type: "json" })) || [];
  return json({ items: list.map(({ who, ...x }) => x) });
};
export const config = { path: "/api/inquiries" };
