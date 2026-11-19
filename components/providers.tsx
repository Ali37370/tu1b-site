"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { dict, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

/* ---------------- language ---------------- */
type LangCtx = { lang: Lang; t: (typeof dict)[Lang]; toggle: () => void };
const LangContext = createContext<LangCtx>({ lang: "ar", t: dict.ar, toggle: () => {} });
export const useLang = () => useContext(LangContext);

/* ---------------- live status (real Kick data only) ---------------- */
export type LiveState = {
  status: "checking" | "live" | "offline" | "unknown";
  title: string;
  category: string;
  viewers: number;
  followers: number | null;
  checked: string | null;
};
const initialLive: LiveState = { status: "checking", title: "", category: "", viewers: 0, followers: null, checked: null };
const LiveContext = createContext<LiveState>(initialLive);
export const useLive = () => useContext(LiveContext);

/* ---------------- site data saved from the dashboard ---------------- */
export type Clip = { url: string; title: string; views: number };
export type Legend = { name: string; count: number };
export type SiteData = { schedule: { d: number; t: string }[]; clips: Clip[]; legends: Legend[]; boards: number; loaded: boolean };

/** count distinct roll-call boards per name (same rule as the attendance page) */
function computeLegends(photos: unknown): { legends: Legend[]; boards: number } {
  if (!Array.isArray(photos)) return { legends: [], boards: 0 };
  const per = new Map<string, { name: string; groups: Set<string> }>();
  const groups = new Set<string>();
  photos.forEach((p: { g?: string; names?: unknown }, i: number) => {
    const g = p && p.g ? String(p.g) : "p" + i;
    groups.add(g);
    (Array.isArray(p?.names) ? p.names : []).forEach((n: unknown) => {
      const name = String(n || "").trim().replace(/^@/, "");
      const k = name.toLowerCase();
      if (!k) return;
      const e = per.get(k) || { name, groups: new Set<string>() };
      e.groups.add(g);
      per.set(k, e);
    });
  });
  const legends = [...per.values()].map((e) => ({ name: e.name, count: e.groups.size })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 10);
  return { legends, boards: groups.size };
}
const DataContext = createContext<SiteData>({ schedule: site.schedule, clips: [], legends: [], boards: 0, loaded: false });
export const useSiteData = () => useContext(DataContext);

/** dashboard clips first, then the featured defaults (no duplicates) */
function mergeClips(saved: Clip[]): Clip[] {
  const seen = new Set(saved.map((c) => c.url.split("?")[0].toLowerCase()));
  const extra = site.featuredClips.filter((c) => !seen.has(c.url.toLowerCase()));
  return [...saved, ...extra].slice(0, 40);
}

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");
  const [live, setLive] = useState<LiveState>(initialLive);
  const [data, setData] = useState<SiteData>({ schedule: site.schedule, clips: [], legends: [], boards: 0, loaded: false });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tu1b_lang");
      if (saved === "en" || saved === "ar") setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = lang === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("tu1b_lang", lang); } catch {}
  }, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === "ar" ? "en" : "ar")), []);

  // Poll Kick status through our server function. Never assume live.
  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    async function check() {
      try {
        const r = await fetch("/api/live", { cache: "no-store" });
        const d = r.ok ? await r.json() : { error: "http" };
        if (stop) return;
        if (d && typeof d.live === "boolean") {
          setLive({
            status: d.live ? "live" : "offline",
            title: d.title || "",
            category: d.category || "",
            viewers: Number(d.viewers) || 0,
            followers: typeof d.followers === "number" ? d.followers : null,
            checked: d.checked || new Date().toISOString(),
          });
        } else {
          setLive((s) => ({ ...s, status: s.status === "checking" ? "unknown" : s.status }));
        }
      } catch {
        if (!stop) setLive((s) => ({ ...s, status: s.status === "checking" ? "unknown" : s.status }));
      }
      if (!stop) timer = setTimeout(check, 60_000);
    }
    check();
    const onVis = () => { if (document.visibilityState === "visible") { clearTimeout(timer); check(); } };
    document.addEventListener("visibilitychange", onVis);
    return () => { stop = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  useEffect(() => {
    fetch("/api/data", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setData({
          schedule: d && Array.isArray(d.schedule) && d.schedule.length ? d.schedule : site.schedule,
          clips: mergeClips(d && Array.isArray(d.clips) ? d.clips : []),
          ...computeLegends(d && d.photos),
          loaded: true,
        });
      })
      .catch(() => setData((s) => ({ ...s, clips: mergeClips([]), loaded: true })));
  }, []);

  const langValue = useMemo(() => ({ lang, t: dict[lang], toggle }), [lang, toggle]);

  return (
    <MotionConfig reducedMotion="user">
      <LangContext.Provider value={langValue}>
        <LiveContext.Provider value={live}>
          <DataContext.Provider value={data}>{children}</DataContext.Provider>
        </LiveContext.Provider>
      </LangContext.Provider>
    </MotionConfig>
  );
}
