import { dataStore, json } from "../lib/common.mjs";
const HANDLE = process.env.YOUTUBE_HANDLE || "TU1B1";
const UA = { "user-agent": "Mozilla/5.0 (compatible; TU1B-site/1.0)", "accept-language": "en" };
const dec = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
async function channelId(store) {
  if (process.env.YOUTUBE_CHANNEL_ID) return process.env.YOUTUBE_CHANNEL_ID;
  const c = await store.get("yt_channel", { type: "json" });
  if (c && c.handle === HANDLE && c.id) return c.id;
  const r = await fetch("https://www.youtube.com/@" + HANDLE, { headers: UA });
  const h = await r.text();
  const m = h.match(/"(?:externalId|channelId)":"(UC[\w-]{22})"/) || h.match(/channel\/(UC[\w-]{22})/);
  if (!m) throw new Error("no_channel");
  await store.setJSON("yt_channel", { handle: HANDLE, id: m[1] });
  return m[1];
}
export default async () => {
  const store = dataStore();
  const cached = await store.get("yt_feed", { type: "json" });
  if (cached && Date.now() - cached.t < 30 * 60e3) return json(cached.d, 200, { "cache-control": "public, max-age=600" });
  try {
    const id = await channelId(store);
    const r = await fetch("https://www.youtube.com/feeds/videos.xml?channel_id=" + id, { headers: UA });
    if (!r.ok) throw new Error("feed_" + r.status);
    const x = await r.text();
    const videos = [...x.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 9).map(([, e]) => ({
      id: (e.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/) || [])[1],
      title: dec((e.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ""),
      published: (e.match(/<published>([^<]+)<\/published>/) || [])[1] || "",
      views: +((e.match(/<media:statistics views="(\d+)"/) || [])[1] || 0),
    })).filter((v) => v.id);
    const d = { channel: "https://www.youtube.com/@" + HANDLE, videos };
    await store.setJSON("yt_feed", { t: Date.now(), d });
    return json(d, 200, { "cache-control": "public, max-age=600" });
  } catch (e) {
    if (cached) return json(cached.d);
    return json({ channel: "https://www.youtube.com/@" + HANDLE, videos: [], error: String(e.message || e) });
  }
};
export const config = { path: "/api/youtube" };
