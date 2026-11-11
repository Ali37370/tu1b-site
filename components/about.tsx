"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Gamepad2, ScrollText, Trophy, Users } from "lucide-react";
import { site } from "@/lib/site";
import { useLang, useLive } from "./providers";
import { BrandIcon, GlowCard, Reveal, Section, fmt } from "./ui";

export function About() {
  const { t, lang } = useLang();
  const live = useLive();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const followers = live.followers ?? site.followersFallback;
  const wa = site.moreLinks.find((l) => l.id === "whatsapp");
  const dc = site.socials.find((l) => l.id === "discord");

  const community = [
    { icon: <ScrollText className="h-6 w-6" aria-hidden />, ...t.about.c1, href: "/tahdeer.html#find", ext: false },
    { icon: <BrandIcon id="whatsapp" className="h-6 w-6" />, ...t.about.c2, href: wa?.url || site.kickUrl, ext: true },
    { icon: <BrandIcon id="discord" className="h-6 w-6" />, ...t.about.c3, href: dc?.url || site.kickUrl, ext: true },
    { icon: <Gamepad2 className="h-6 w-6" aria-hidden />, ...t.about.c4, href: "/tahdeer.html#game", ext: false },
  ];

  return (
    <Section id="about" kicker={t.about.kicker} title={t.about.title}>
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <Reveal>
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-3 rotate-3 rounded-[2rem] bg-gradient-to-br from-primary via-secondary to-accent opacity-60 blur-sm" aria-hidden />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/10 bg-panel">
              <Image src={site.portraitImage} alt={`${site.name} — ${site.realName[lang]}`} fill sizes="(max-width: 1024px) 90vw, 440px" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                <p className="font-display text-3xl font-bold text-white" dir="ltr" style={{ textAlign: lang === "ar" ? "right" : "left" }}>{site.name}</p>
                <p className="text-neon">{site.realName[lang]} · {site.country[lang]}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-lg leading-loose text-zinc-300 md:text-xl">{site.bio[lang]}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="stat">
                <Users className="h-5 w-5 text-neon" aria-hidden />
                <b className="font-display text-2xl text-white sm:text-3xl">{fmt(followers, lang)}</b>
                <span className="text-xs text-zinc-400 sm:text-sm">{t.about.followers}</span>
              </div>
              <div className="stat">
                <ScrollText className="h-5 w-5 text-neon" aria-hidden />
                <b className="font-display text-2xl text-white sm:text-3xl">{t.about.boardsV}</b>
                <span className="text-xs text-zinc-400 sm:text-sm">{t.about.boards}</span>
              </div>
              <div className="stat">
                <BrandIcon id="kick" className="h-5 w-5 text-kick" />
                <b className="font-display text-2xl text-white sm:text-3xl">{new Set([...site.socials, ...site.moreLinks].map((l) => l.id).filter((id) => id !== "tip" && id !== "shop")).size}</b>
                <span className="text-xs text-zinc-400 sm:text-sm">{t.about.platforms}</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <h3 className="mb-5 mt-12 flex items-center gap-2 text-xl font-bold text-white"><Trophy className="h-5 w-5 text-neon" aria-hidden />{t.about.journey}</h3>
            <ol className="timeline">
              {site.achievements.map((a, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: lang === "ar" ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="timeline-item">
                  <span className="text-sm font-bold text-neon">{a.year[lang]}</span>
                  <p className="mt-1 font-semibold text-white">{a.title[lang]}</p>
                </motion.li>
              ))}
            </ol>
          </Reveal>

          {site.interests.length > 0 && (
            <Reveal delay={0.2}>
              <h3 className="mb-4 mt-10 flex items-center gap-2 text-xl font-bold text-white"><Gamepad2 className="h-5 w-5 text-neon" aria-hidden />{t.about.interests}</h3>
              <ul className="flex flex-wrap gap-2">
                {site.interests.map((g) => <li key={g.en} className="chip">{g[lang]}</li>)}
              </ul>
            </Reveal>
          )}
        </div>
      </div>

      <Reveal delay={0.1}>
        <h3 className="mb-5 mt-16 text-xl font-bold text-white">{t.about.community}</h3>
      </Reveal>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {community.map((c, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
            <a href={c.href} {...(c.ext ? { target: "_blank", rel: "noopener" } : {})} className="group block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <GlowCard className="flex h-full flex-col p-6">
                <span className="icon-tile mb-5">{c.icon}</span>
                <p className="text-lg font-bold text-white">{c.t}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{c.d}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neon">
                  {c.cta}<Arrow className="h-4 w-4 transition group-hover:translate-x-[var(--nudge)]" aria-hidden />
                </span>
              </GlowCard>
            </a>
          </motion.li>
        ))}
      </ul>
    </Section>
  );
}
