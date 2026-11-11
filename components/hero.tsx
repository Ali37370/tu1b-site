"use client";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Play, ScrollText } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { site } from "@/lib/site";
import { useLang } from "./providers";
import { BrandIcon, StatusBadge } from "./ui";

const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37.7) % 100,
  top: (i * 61.3) % 100,
  size: 1 + ((i * 7) % 3),
  delay: (i % 9) * 0.6,
  dur: 6 + (i % 5) * 2,
}));

export function Hero() {
  const { t, lang } = useLang();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const nameY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section id="top" ref={ref} className="relative isolate flex min-h-[100svh] items-center overflow-hidden px-4 pb-16 pt-24 sm:px-6">
      {/* animated backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="grid-bg absolute inset-0" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        {PARTICLES.map((p, i) => (
          <span key={i} className="particle" style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-site items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
        {/* text */}
        <motion.div style={{ y: nameY }} className="order-2 text-center lg:order-1 lg:text-start">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="kicker mb-4 justify-center lg:justify-start">
            {t.hero.kicker}
          </motion.p>

          <h1 className="font-display font-bold leading-[0.85] text-white" dir="ltr">
            <span className="sr-only">{site.name} — {site.realName[lang]}</span>
            <span aria-hidden className="flex justify-center lg:justify-start">
              {site.name.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className="hero-name inline-block"
                  initial={{ opacity: 0, y: 60, rotateX: -80 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-3 font-display text-2xl font-bold text-neon sm:text-3xl">
            {site.realName[lang]} · {lang === "ar" ? site.nameAr : site.name}
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg lg:mx-0">
            {site.intro[lang]}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-6 flex justify-center lg:justify-start">
            <StatusBadge />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a href={site.kickUrl} target="_blank" rel="noopener" className="btn-primary btn-lg">
              <Play className="h-5 w-5 fill-current" aria-hidden /> {t.hero.watch}
            </a>
            <a href="/tahdeer.html#find" className="btn-ghost btn-lg">
              <ScrollText className="h-5 w-5" aria-hidden /> {t.hero.board}
            </a>
          </motion.div>

          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }} className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start" aria-label={t.nav.socials}>
            {site.socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener" aria-label={`${s.label[lang]} ${s.handle}`} className="social-dot" style={{ ["--c" as string]: s.color } as CSSProperties}>
                  <BrandIcon id={s.id} className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* portrait */}
        <motion.div style={{ y: imgY }} className="relative order-1 mx-auto w-full max-w-[560px] lg:order-2">
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }} className="portal relative aspect-square w-full">
            <div className="portal-ring" aria-hidden />
            <div className="portal-ring portal-ring-2" aria-hidden />
            <div className="portal-core" aria-hidden />
            <span className="portal-word" aria-hidden dir="ltr">{site.name}</span>
            <div className="absolute inset-x-[-6%] bottom-[6%] top-[14%]">
              <Image src={site.profileImage} alt={`${site.name} — ${site.realName[lang]}`} fill priority sizes="(max-width: 1024px) 92vw, 560px" className="object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,.7)]" />
            </div>
            <div className="portal-floor" aria-hidden />
          </motion.div>
        </motion.div>
      </div>

      <a href="#live" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-zinc-500 transition hover:text-white md:flex" aria-label={t.hero.scroll}>
        {t.hero.scroll}
        <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden />
      </a>
    </section>
  );
}
