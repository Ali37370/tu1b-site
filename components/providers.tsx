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
export type SiteData = { schedule: { d: number; t: string }[]; clips: Clip[]; loaded: boolean };
const DataContext = createContext<SiteData>({ schedule: site.schedule, clips: [], loaded: false });
export const useSiteData = () => useContext(DataContext);

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");
  const [live, setLive] = useState<LiveState>(initialLive);
  const [data, setData] = useState<SiteData>({ schedule: site.schedule, clips: [], loaded: false });

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
          clips: d && Array.isArray(d.clips) ? d.clips : [],
          loaded: true,
        });
      })
      .catch(() => setData((s) => ({ ...s, loaded: true })));
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
