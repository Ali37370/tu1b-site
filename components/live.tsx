"use client";
import { motion } from "framer-motion";
import { ExternalLink, Eye, Gamepad2, Radio, Users } from "lucide-react";
import { site } from "@/lib/site";
import { useLang, useLive } from "./providers";
import { BrandIcon, Reveal, Section, StatusBadge, fmt } from "./ui";

export function LiveSection() {
  const { t, lang } = useLang();
  const live = useLive();
  const isLive = live.status === "live";
  const followers = live.followers ?? site.followersFallback;
  const time = live.checked
    ? new Date(live.checked).toLocaleTimeString(lang === "ar" ? "ar-SA-u-nu-latn" : "en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Riyadh" })
    : "";

  return (
    <Section id="live" kicker="KICK" title={t.live.title} lead={t.live.lead}>
      <Reveal>
        <div className={`glass relative overflow-hidden p-6 sm:p-8 md:p-10 ${isLive ? "live-frame" : ""}`} aria-live="polite">
          <div className="pointer-events-none absolute -top-32 end-[-10%] h-72 w-72 rounded-full bg-primary opacity-20 blur-[90px]" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <StatusBadge />
              {live.status === "checking" && (
                <div className="mt-6 space-y-3" aria-hidden>
                  <div className="h-8 w-3/4 animate-pulse rounded-lg bg-white/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                </div>
              )}
              {isLive && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="mt-5 text-2xl font-bold leading-snug text-white md:text-3xl">{live.title || site.name}</h3>
                  <ul className="mt-5 flex flex-wrap gap-3 text-sm">
                    {live.category && (
                      <li className="chip"><Gamepad2 className="h-4 w-4 text-neon" aria-hidden /><span className="sr-only">{t.live.category}: </span>{live.category}</li>
                    )}
                    <li className="chip"><Eye className="h-4 w-4 text-neon" aria-hidden />{fmt(live.viewers, lang)} {t.live.viewers}</li>
                  </ul>
                </motion.div>
              )}
              {live.status === "offline" && <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-300">{t.live.offlineMsg}</p>}
              {live.status === "unknown" && <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-300">{t.live.unknownMsg}</p>}

              <div className="mt-7 flex flex-wrap gap-3">
                <a href={site.kickUrl} target="_blank" rel="noopener" className={isLive ? "btn-live btn-lg" : "btn-primary btn-lg"}>
                  {isLive ? <Radio className="h-5 w-5" aria-hidden /> : <BrandIcon id="kick" className="h-4 w-4" />}
                  {isLive ? t.live.join : t.live.follow}
                  <ExternalLink className="h-4 w-4 opacity-70" aria-hidden />
                </a>
              </div>
              {time && <p className="mt-4 text-xs text-zinc-500">{t.live.updated}: {time}</p>}
            </div>

            <div className="relative">
              {isLive ? (
                <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                  <iframe
                    src={`https://player.kick.com/${site.kickSlug}?muted=true&autoplay=true`}
                    title={`${site.name} — Kick`}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="stat">
                    <Users className="h-5 w-5 text-neon" aria-hidden />
                    <b className="font-display text-3xl text-white md:text-4xl">{fmt(followers, lang)}</b>
                    <span className="text-sm text-zinc-400">{t.live.followers}</span>
                  </div>
                  <a href={site.kickUrl} target="_blank" rel="noopener" className="stat group transition hover:border-kick">
                    <BrandIcon id="kick" className="h-6 w-6 text-kick" />
                    <b className="font-display text-3xl text-white md:text-4xl" dir="ltr">/{site.kickSlug}</b>
                    <span className="text-sm text-zinc-400 group-hover:text-white">kick.com</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
