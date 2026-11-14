import { dataStore, json } from "../lib/common.mjs";
const HANDLES = { main: process.env.YOUTUBE_HANDLE || "TU1B1", shorts: process.env.YOUTUBE_SHORTS_HANDLE || "TU1BShorts" };
const UA = { "user-agent": "Mozilla/5.0 (compatible; TU1B-site/1.0)", "accept-language": "en" };
const dec = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const ENV_IDS = { main: process.env.YOUTUBE_CHANNEL_ID, shorts: process.env.YOUTUBE_SHORTS_CHANNEL_ID };
async function channelId(store, which, handle) {
  if (ENV_IDS[which]) return ENV_IDS[which];
  const c = await store.get("yt_ch_v2_" + handle, { type: "json" });
  if (c && c.id) return c.id;
  const r = await fetch("https://www.youtube.com/@" + handle, { headers: UA });
  const h = await r.text();
  // Only the page's OWN id: the RSS <link> in <head>, the metadata externalId, or the canonical URL.
  // (A generic "channelId" can belong to a linked channel, e.g. the Shorts channel.)
  const m =
    h.match(/<link[^>]+type="application\/rss\+xml"[^>]+href="[^"]*channel_id=(UC[\w-]{22})"/) ||
    h.match(/"channelMetadataRenderer":\{[\s\S]{0,4000}?"externalId":"(UC[\w-]{22})"/) ||
    h.match(/"externalId":"(UC[\w-]{22})"/) ||
    h.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/);
  if (!m) throw new Error("no_channel");
  await store.setJSON("yt_ch_v2_" + handle, { id: m[1] });
  return m[1];
}
export default async (req) => {
  const which = new URL(req.url).searchParams.get("ch") === "shorts" ? "shorts" : "main";
  const handle = HANDLES[which];
  const store = dataStore();
  const key = "yt_feed_v2_" + handle;
  const cached = await store.get(key, { type: "json" });
  if (cached && Date.now() - cached.t < 30 * 60e3) return json(cached.d, 200, { "cache-control": "public, max-age=600" });
  try {
    const id = await channelId(store, which, handle);
    const r = await fetch("https://www.youtube.com/feeds/videos.xml?channel_id=" + id, { headers: UA });
    if (!r.ok) throw new Error("feed_" + r.status);
    const x = await r.text();
    const videos = [...x.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 9).map(([, e]) => ({
      id: (e.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/) || [])[1],
      title: dec((e.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ""),
      published: (e.match(/<published>([^<]+)<\/published>/) || [])[1] || "",
      views: +((e.match(/<media:statistics views="(\d+)"/) || [])[1] || 0),
    })).filter((v) => v.id);
    const d = { channel: "https://www.youtube.com/@" + handle, kind: which, videos };
    await store.setJSON(key, { t: Date.now(), d });
    return json(d, 200, { "cache-control": "public, max-age=600" });
  } catch (e) {
    if (cached) return json(cached.d);
    return json({ channel: "https://www.youtube.com/@" + handle, kind: which, videos: [], error: String(e.message || e) });
  }
};
export const config = { path: "/api/youtube" };
