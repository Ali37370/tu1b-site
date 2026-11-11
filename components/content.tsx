"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Film, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { useLang, useSiteData } from "./providers";
import { BrandIcon, GlowCard, Reveal, Section, fmt } from "./ui";

type Video = { id: string; title: string; published: string; views: number };

function clipSource(url: string): "kick" | "youtube" | "tiktok" {
  if (/youtu/.test(url)) return "youtube";
  if (/tiktok/.test(url)) return "tiktok";
  return "kick";
}

export function Content() {
  const { t, lang } = useLang();
  const { clips, loaded } = useSiteData();
  const [tab, setTab] = useState<"yt" | "clips">("yt");
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [channel, setChannel] = useState(site.socials.find((s) => s.id === "youtube")?.url || "https://www.youtube.com");
  const [playing, setPlaying] = useState<Video | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("/api/youtube")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.channel) setChannel(d.channel);
        setVideos(Array.isArray(d?.videos) ? d.videos : []);
      })
      .catch(() => setVideos([]));
  }, []);

  useEffect(() => {
    if (!playing) return;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && setPlaying(null);
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [playing]);

  const date = (s: string) => (s ? new Date(s).toLocaleDateString(lang === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-US", { day: "numeric", month: "short", year: "numeric" }) : "");

  return (
    <Section id="content" kicker="CONTENT" title={t.content.title} lead={t.content.lead}>
      <Reveal>
        <div role="tablist" aria-label={t.content.title} className="mb-8 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          {(["yt", "clips"] as const).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`relative min-h-[44px] rounded-full px-5 text-sm font-semibold transition ${tab === k ? "text-white" : "text-zinc-400 hover:text-white"}`}
            >
              {tab === k && <motion.span layoutId="tabpill" className="absolute inset-0 rounded-full bg-gradient-to-r from-secondary to-primary" />}
              <span className="relative inline-flex items-center gap-2">
                {k === "yt" ? <BrandIcon id="youtube" className="h-4 w-4" /> : <Film className="h-4 w-4" aria-hidden />}
                {k === "yt" ? t.content.yt : t.content.clips}
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      {tab === "yt" && (
        <div role="tabpanel">
          {videos === null ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label={t.content.loading}>
              {[0, 1, 2].map((i) => <li key={i} className="aspect-video animate-pulse rounded-3xl bg-white/5" />)}
            </ul>
          ) : videos.length === 0 ? (
            <Empty text={t.content.noYt} href={channel} cta={t.content.openChannel} />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.slice(0, 6).map((v, i) => (
                <motion.li key={v.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <button onClick={() => setPlaying(v)} className="group block w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl" aria-label={`${t.content.play}: ${v.title}`}>
                    <GlowCard className="overflow-hidden">
                      <div className="relative aspect-video overflow-hidden">
                        <Image src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 640px) 92vw, 380px" className="object-cover transition duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
                        <span className="play-btn"><Play className="h-6 w-6 fill-current" aria-hidden /></span>
                      </div>
                      <div className="p-5">
                        <p className="line-clamp-2 font-semibold leading-snug text-white">{v.title}</p>
                        <p className="mt-2 text-xs text-zinc-500">
                          {date(v.published)}{v.views ? ` · ${fmt(v.views, lang)} ${t.content.views}` : ""}
                        </p>
                      </div>
                    </GlowCard>
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
          {videos && videos.length > 0 && (
            <div className="mt-8">
              <a href={channel} target="_blank" rel="noopener" className="btn-ghost">
                <BrandIcon id="youtube" className="h-4 w-4" /> {t.content.openChannel} <ExternalLink className="h-4 w-4 opacity-60" aria-hidden />
              </a>
            </div>
          )}
        </div>
      )}

      {tab === "clips" && (
        <div role="tabpanel">
          {!loaded ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <li key={i} className="h-40 animate-pulse rounded-3xl bg-white/5" />)}
            </ul>
          ) : clips.length === 0 ? (
            <Empty text={t.content.noClips} href={`${site.kickUrl}/clips`} cta={t.content.watchKick} />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {clips.map((c, i) => {
                const src = clipSource(c.url);
                return (
                  <motion.li key={c.url} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <a href={c.url} target="_blank" rel="noopener" className="group block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <GlowCard className="clip-card flex h-full flex-col justify-between p-6">
                        <div className="flex items-center justify-between">
                          <span className="chip">
                            <BrandIcon id={src} className="h-4 w-4" />
                            {src === "kick" ? "Kick" : src === "youtube" ? "YouTube" : "TikTok"}
                          </span>
                          <span className="play-btn static h-11 w-11"><Play className="h-4 w-4 fill-current" aria-hidden /></span>
                        </div>
                        <div className="mt-10">
                          <span className="font-display text-5xl font-bold text-white/10" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                          <p className="mt-1 text-lg font-bold leading-snug text-white">{c.title || `${site.name} clip ${i + 1}`}</p>
                          {c.views > 0 && <p className="mt-1 text-sm text-zinc-500">{fmt(c.views, lang)} {t.content.views}</p>}
                        </div>
                      </GlowCard>
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <AnimatePresence>
        {playing && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPlaying(null)}
            role="dialog" aria-modal="true" aria-label={playing.title}
          >
            <motion.div initial={{ scale: 0.94 }} animate={{ scale: 1 }} exit={{ scale: 0.94 }} className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <button ref={closeRef} onClick={() => setPlaying(null)} className="absolute -top-14 end-0 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white" aria-label={t.content.close}>
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1&rel=0`}
                  title={playing.title}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
              <p className="mt-4 font-semibold text-white">{playing.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="glass flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-zinc-300">{text}</p>
      <a href={href} target="_blank" rel="noopener" className="btn-ghost shrink-0">
        {cta} <ExternalLink className="h-4 w-4 opacity-60" aria-hidden />
      </a>
    </div>
  );
}
