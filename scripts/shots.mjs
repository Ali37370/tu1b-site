// CI preview: screenshots + basic checks against `next start` (mocked APIs are test-only).
import { chromium } from "playwright";
import fs from "node:fs";
const BASE = process.env.BASE || "http://localhost:3000";
const OUT = "ci";
fs.mkdirSync(OUT, { recursive: true });
const report = {};
const sched = { schedule: [{ d: 0, t: "21:00" }, { d: 2, t: "21:00" }, { d: 4, t: "22:30" }, { d: 5, t: "20:00" }], clips: [{ url: "https://kick.com/tu1b/clips/test1", title: "TEST clip one", views: 1200 }, { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "TEST clip two", views: 0 }] };
const yt = { channel: "https://www.youtube.com/@TU1B1", videos: [{ id: "dQw4w9WgXcQ", title: "TEST video one", published: "2026-10-01T00:00:00Z", views: 1000 }, { id: "9bZkp7q19f0", title: "TEST video two", published: "2026-09-01T00:00:00Z", views: 0 }, { id: "kJQP7kiw5Fk", title: "TEST video three", published: "2026-08-01T00:00:00Z", views: 0 }] };
const scenarios = [
  { name: "desk_ar_live", w: 1440, h: 900, lang: "ar", live: { live: true, viewers: 312, title: "TEST — live title", category: "Just Chatting", followers: 13600, checked: new Date().toISOString() }, data: sched, yt },
  { name: "mob_ar_off", w: 390, h: 844, lang: "ar", live: { live: false, viewers: 0, title: "", category: "", followers: 13600, checked: new Date().toISOString() }, data: sched, yt },
  { name: "mob_en_noapi", w: 390, h: 844, lang: "en" },
  { name: "tab_ar_off", w: 820, h: 1180, lang: "ar", live: { live: false, viewers: 0, title: "", category: "", followers: null, checked: new Date().toISOString() }, data: { schedule: [], clips: [] }, yt: { channel: yt.channel, videos: [] } },
];
const b = await chromium.launch();
for (const s of scenarios) {
  const ctx = await b.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
  const errs = [];
  if (s.live) await ctx.route("**/api/live", (r) => r.fulfill({ json: s.live }));
  if (s.data) await ctx.route("**/api/data", (r) => r.fulfill({ json: s.data }));
  if (s.yt) await ctx.route("**/api/youtube", (r) => r.fulfill({ json: s.yt }));
  await ctx.route("https://player.kick.com/**", (r) => r.fulfill({ body: "<body style='background:#111;color:#fff;display:grid;place-items:center;height:100vh;margin:0;font:20px sans-serif'>Kick player (mocked)</body>", contentType: "text/html" }));
  await ctx.addInitScript((lang) => { try { localStorage.setItem("tu1b_lang", lang); } catch {} }, s.lang);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  p.on("console", (m) => { if (m.type() === "error" || /hydrat/i.test(m.text())) errs.push("console: " + m.text().slice(0, 300)); });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/${s.name}_hero.png` });
  // scroll through to trigger reveals
  const H = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += Math.floor(s.h * 0.7)) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(250); }
  await p.waitForTimeout(800);
  for (const id of ["live", "socials", "about", "content", "schedule", "sponsor"]) {
    const el = p.locator("#" + id);
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    await el.screenshot({ path: `${OUT}/${s.name}_${id}.png` });
  }
  await p.locator("footer").scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/${s.name}_footer.png` });
  const r = {
    overflowX: await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    dir: await p.evaluate(() => document.documentElement.dir),
    status: await p.locator("#live [role=status]").first().textContent(),
    weekToday: await p.locator(".week-day.is-today").count(),
    ytCards: await p.locator("#content [role=tabpanel] li").count(),
  };
  // clips tab
  await p.locator("#content [role=tab]").nth(1).click(); await p.waitForTimeout(500);
  await p.locator("#content").screenshot({ path: `${OUT}/${s.name}_clips.png` });
  // contact form validation (empty submit should be blocked by the browser)
  if (s.name === "desk_ar_live") {
    await ctx.route("**/api/contact", (rt) => rt.fulfill({ json: { ok: true } }));
    await p.fill('input[name=name]', "Test Brand"); await p.fill('input[name=email]', "test@example.com"); await p.fill('textarea[name=message]', "Test partnership inquiry message.");
    await p.click('#sponsor button[type=submit]'); await p.waitForTimeout(700);
    r.form = await p.locator("#sponsor [role=status]").textContent();
    await p.locator("#sponsor").screenshot({ path: `${OUT}/${s.name}_sponsor_sent.png` });
    // open first YouTube video modal
    await p.locator("#content [role=tab]").nth(0).click(); await p.waitForTimeout(300);
    await p.locator("#content [role=tabpanel] button").first().click(); await p.waitForTimeout(800);
    r.modal = await p.locator("[role=dialog]").count();
    await p.screenshot({ path: `${OUT}/${s.name}_modal.png` });
    await p.keyboard.press("Escape");
  }
  if (s.w < 500) {
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(400);
    await p.locator('header button[aria-expanded]').click(); await p.waitForTimeout(700);
    await p.screenshot({ path: `${OUT}/${s.name}_menu.png` });
    r.menuOpen = await p.locator("[role=dialog]").count();
  }
  r.errors = errs;
  report[s.name] = r;
  await ctx.close();
}
// old features page still served
const p2 = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const res = await p2.goto(BASE + "/tahdeer.html");
report.tahdeer = { status: res && res.status(), title: await p2.title() };
await p2.waitForTimeout(1500); await p2.screenshot({ path: `${OUT}/tahdeer.png` });
await b.close();
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
