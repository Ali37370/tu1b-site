import { imageStore } from "../lib/common.mjs";
export default async (req, context) => {
  const key = context.params && context.params.key;
  if (!key || !/^[a-z0-9-]{6,40}$/.test(key)) return new Response("Not found", { status: 404 });
  const res = await imageStore().getWithMetadata(key, { type: "arrayBuffer" });
  if (!res) return new Response("Not found", { status: 404 });
  const type = (res.metadata && res.metadata.type) || "image/jpeg";
  const headers = {
    "content-type": type,
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=31536000, immutable",
    "netlify-cdn-cache-control": "public, durable, max-age=31536000, immutable",
  };
  const total = res.data.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") || "");
  if (m && (m[1] || m[2])) {
    let start = m[1] ? +m[1] : Math.max(0, total - +m[2]);
    let end = m[1] && m[2] ? Math.min(+m[2], total - 1) : total - 1;
    if (start >= total || start > end) return new Response(null, { status: 416, headers: { "content-range": `bytes */${total}` } });
    return new Response(res.data.slice(start, end + 1), { status: 206, headers: { ...headers, "content-range": `bytes ${start}-${end}/${total}`, "content-length": String(end - start + 1) } });
  }
  return new Response(res.data, { headers });
};
export const config = { path: "/img/:key" };
