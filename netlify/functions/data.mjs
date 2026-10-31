import { dataStore, json } from "../lib/common.mjs";
export default async () => {
  const state = await dataStore().get("state", { type: "json" });
  return state ? json(state) : json({ empty: true });
};
export const config = { path: "/api/data" };
