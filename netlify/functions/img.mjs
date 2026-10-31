import { imageStore } from "../lib/common.mjs";
export default async (req, context) => {
  const key = context.params && context.params.key;
  if (!key || !/^[a-z0-9-]{6,40}$/.test(key)) return new Response("Not found", { status: 404 });
  const res = await imageStore().getWithMetadata(key, { type: "arrayBuffer" });
  if (!res) return new Response("Not found", { status: 404 });
  return new Response(res.data, {
    headers: {
      "content-type": (res.metadata && res.metadata.type) || "image/jpeg",
      "cache-control": "public, max-age=31536000, immutable",
      "netlify-cdn-cache-control": "public, durable, max-age=31536000, immutable",
    },
  });
};
export const config = { path: "/img/:key" };
