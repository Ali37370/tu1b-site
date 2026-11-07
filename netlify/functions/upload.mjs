import { imageStore, json, requireRole } from "../lib/common.mjs";
import { randomUUID } from "node:crypto";
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const AUDIO = ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/ogg", "audio/wav"];
export default async (req) => {
  const g = await requireRole(req, ["owner", "editor"]); if (g.error) return g.error;
  const type = (req.headers.get("content-type") || "").split(";")[0].trim();
  if (!TYPES.includes(type) && !AUDIO.includes(type)) return json({ error: "bad_type" }, 415);
  const buf = await req.arrayBuffer();
  if (!buf.byteLength || buf.byteLength > (AUDIO.includes(type) ? 5.5 : 5) * 1024 * 1024) return json({ error: "too_big" }, 413);
  const key = Date.now().toString(36) + "-" + randomUUID().slice(0, 8);
  await imageStore().set(key, buf, { metadata: { type } });
  return json({ ok: true, key, url: "/img/" + key });
};
export const config = { path: "/api/upload" };
