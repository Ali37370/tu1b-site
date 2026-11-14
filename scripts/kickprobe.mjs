import fs from "node:fs";
const urls = [
  "https://kick.com/api/v2/channels/tu1b/clips?sort=date&time=all",
  "https://kick.com/api/v2/channels/tu1b/clips?sort=view&time=all",
  "https://kick.com/api/v2/channels/tu1b",
];
const H = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36", accept: "application/json", "accept-language": "en-US,en;q=0.9", referer: "https://kick.com/tu1b" };
const out = [];
for (const u of urls) {
  try { const r = await fetch(u, { headers: H }); const t = await r.text(); out.push({ u, status: r.status, len: t.length, head: t.slice(0, 600) }); }
  catch (e) { out.push({ u, err: String(e) }); }
}
fs.mkdirSync("ci", { recursive: true });
fs.writeFileSync("ci/kickprobe.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out.map(({ u, status, len, err }) => ({ u, status, len, err }))));
