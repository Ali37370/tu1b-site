"use client";
import { motion } from "framer-motion";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import { site } from "@/lib/site";
import { useLang } from "./providers";
import { BrandIcon, GlowCard, Reveal, Section } from "./ui";

export function Socials() {
  const { t, lang } = useLang();
  const Arrow = lang === "ar" ? ArrowUpLeft : ArrowUpRight;
  return (
    <Section id="socials" kicker="SOCIAL" title={t.socials.title} lead={t.socials.lead}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {site.socials.map((s, i) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ delay: i * 0.06, duration: 0.6 }}
          >
            <a href={s.url} target="_blank" rel="noopener" className="group block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <GlowCard glow={s.color} className="social-card h-full p-6">
                <div className="flex items-start justify-between">
                  <span className="brand-tile" style={{ ["--c" as string]: s.color } as CSSProperties}>
                    <BrandIcon id={s.id} className="h-7 w-7" />
                  </span>
                  <Arrow className="h-5 w-5 text-zinc-500 transition duration-300 group-hover:-translate-y-1 group-hover:text-white" aria-hidden />
                </div>
                <p className="mt-8 text-sm font-medium text-zinc-400">{s.label[lang]}</p>
                <p className="mt-1 font-display text-2xl font-bold text-white" dir="ltr" style={{ textAlign: lang === "ar" ? "right" : "left" }}>{s.handle}</p>
                <span className="sr-only"> — {t.socials.open}</span>
              </GlowCard>
            </a>
          </motion.li>
        ))}
      </ul>

      <Reveal delay={0.1}>
        <h3 className="mb-4 mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">{t.socials.more}</h3>
        <ul className="flex flex-wrap gap-3">
          {site.moreLinks.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener" className="pill" style={{ ["--c" as string]: s.color } as CSSProperties}>
                <BrandIcon id={s.id} className="h-4 w-4" />
                <span className="font-semibold text-white">{s.label[lang]}</span>
                <span className="text-zinc-400" dir="ltr">{s.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
