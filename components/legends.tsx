"use client";
import { motion } from "framer-motion";
import { Crown, Medal, ScrollText } from "lucide-react";
import { useLang, useSiteData } from "./providers";
import { Reveal, Section, fmt } from "./ui";

const TIERS = [
  { cls: "tier-gold", h: "md:h-64" },
  { cls: "tier-silver", h: "md:h-52" },
  { cls: "tier-bronze", h: "md:h-44" },
];

/** Hall of fame: top attendees from the roll-call boards. Podium for the top 3, list for 4–10. */
export function Legends() {
  const { t, lang } = useLang();
  const { legends, boards, loaded } = useSiteData();
  const top = legends.slice(0, 3);
  // natural order on phones (1st first); md:order-* arranges 2nd · 1st · 3rd on wide screens
  const order = top.map((_, i) => i);

  return (
    <Section id="legends" kicker={t.legends.kicker} title={t.legends.title} lead={t.legends.lead}>
      {loaded && legends.length === 0 ? (
        <Reveal><p className="glass p-8 text-zinc-300">{t.legends.empty}</p></Reveal>
      ) : (
        <>
          <ol className="grid items-end gap-4 md:grid-cols-3">
            {order.map((idx, k) => {
              const p = top[idx];
              if (!p) return null;
              const tier = TIERS[idx];
              return (
                <motion.li
                  key={p.name}
                  className={idx === 0 ? "md:order-2" : idx === 1 ? "md:order-1" : "md:order-3"}
                  initial={{ opacity: 0, y: 60, rotateX: -30 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 * k, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{ perspective: 800 }}
                >
                  <div className={`podium ${tier.cls}`}>
                    <div className="podium-card">
                      {idx === 0 ? <Crown className="podium-icon" aria-hidden /> : <Medal className="podium-icon" aria-hidden />}
                      <span className="podium-rank">{t.legends.ranks[idx]}</span>
                      <bdi className="podium-name" dir="auto">{p.name}</bdi>
                      <span className="podium-count"><b>{fmt(p.count, lang)}</b> {t.legends.boards}{boards ? ` / ${fmt(boards, lang)}` : ""}</span>
                    </div>
                    <div className={`podium-step h-20 ${tier.h}`}><span>{idx + 1}</span></div>
                  </div>
                </motion.li>
              );
            })}
          </ol>

          {legends.length > 3 && (
            <ol className="mt-6 grid gap-2 sm:grid-cols-2" start={4}>
              {legends.slice(3).map((p, i) => (
                <motion.li key={p.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="glass flex items-center gap-4 px-5 py-3">
                  <span className="font-display text-lg font-bold text-zinc-500">{String(i + 4).padStart(2, "0")}</span>
                  <bdi className="flex-1 truncate font-semibold text-white" dir="auto">{p.name}</bdi>
                  <span className="text-sm text-zinc-400"><b className="text-neon">{fmt(p.count, lang)}</b> {t.legends.boards}</span>
                </motion.li>
              ))}
            </ol>
          )}

          <Reveal delay={0.1}>
            <a href="/tahdeer.html#find" className="btn-primary btn-lg mt-8">
              <ScrollText className="h-5 w-5" aria-hidden /> {t.legends.find}
            </a>
          </Reveal>
        </>
      )}
    </Section>
  );
}
