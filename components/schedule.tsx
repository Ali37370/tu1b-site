"use client";
import { motion } from "framer-motion";
import { CalendarClock, Moon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DAYS } from "@/lib/i18n";
import { useLang, useSiteData } from "./providers";
import { Reveal, Section } from "./ui";

/** Current weekday and minutes-of-week in Saudi time (UTC+3, no DST). */
function riyadhNow() {
  const d = new Date(Date.now() + 3 * 3600e3);
  return { day: d.getUTCDay(), mins: d.getUTCDay() * 1440 + d.getUTCHours() * 60 + d.getUTCMinutes() };
}

function fmtTime(t: string, lang: "ar" | "en") {
  const [h, m] = t.split(":").map(Number);
  const h12 = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, "0");
  if (lang === "ar") return `${h12}:${mm} ${h < 12 ? "ص" : "م"}`;
  return `${h12}:${mm} ${h < 12 ? "AM" : "PM"}`;
}

export function Schedule() {
  const { t, lang } = useLang();
  const { schedule, loaded } = useSiteData();
  const [now, setNow] = useState<{ day: number; mins: number } | null>(null);

  useEffect(() => {
    setNow(riyadhNow());
    const id = setInterval(() => setNow(riyadhNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  const byDay = useMemo(() => {
    const m: string[][] = Array.from({ length: 7 }, () => []);
    for (const s of schedule) if (s.d >= 0 && s.d <= 6 && /^\d{2}:\d{2}$/.test(s.t)) m[s.d].push(s.t);
    m.forEach((a) => a.sort());
    return m;
  }, [schedule]);

  const next = useMemo(() => {
    if (!now || !schedule.length) return null;
    let best = Infinity;
    for (const s of schedule) {
      const [h, mi] = s.t.split(":").map(Number);
      let diff = s.d * 1440 + h * 60 + mi - now.mins;
      if (diff <= 0) diff += 7 * 1440;
      best = Math.min(best, diff);
    }
    return best === Infinity ? null : best;
  }, [now, schedule]);

  return (
    <Section id="schedule" kicker="SCHEDULE" title={t.schedule.title} lead={t.schedule.lead}>
      {next !== null && (
        <Reveal>
          <div className="glass mb-8 inline-flex items-center gap-3 px-5 py-3">
            <CalendarClock className="h-5 w-5 text-neon" aria-hidden />
            <span className="text-zinc-300">{t.schedule.next}</span>
            <b className="flex gap-2 font-display text-lg text-white">
              {Math.floor(next / 1440) > 0 && <span>{Math.floor(next / 1440)} {t.schedule.d}</span>}
              <span>{Math.floor((next % 1440) / 60)} {t.schedule.h}</span>
              <span>{next % 60} {t.schedule.m}</span>
            </b>
          </div>
        </Reveal>
      )}

      {loaded && schedule.length === 0 ? (
        <Reveal>
          <p className="glass p-8 text-zinc-300">{t.schedule.empty}</p>
        </Reveal>
      ) : (
        <ol className="week">
          {DAYS[lang].map((name, d) => {
            const today = now?.day === d;
            const times = byDay[d];
            return (
              <motion.li
                key={d}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: d * 0.05 }}
                className={`week-day ${today ? "is-today" : ""} ${times.length ? "" : "is-off"}`}
                aria-current={today ? "date" : undefined}
              >
                <span className="week-dot" aria-hidden />
                <div className="flex items-center justify-between gap-2 md:flex-col md:items-start">
                  <p className="font-bold text-white">{name}</p>
                  {today && <span className="rounded-full bg-gradient-to-r from-secondary to-primary px-2.5 py-0.5 text-xs font-bold text-white">{t.schedule.today}</span>}
                </div>
                <div className="mt-2 md:mt-4">
                  {times.length ? (
                    times.map((x) => (
                      <p key={x} className="font-display text-xl font-bold text-neon md:text-2xl">{fmtTime(x, lang)}</p>
                    ))
                  ) : (
                    <p className="inline-flex items-center gap-1.5 text-sm text-zinc-500"><Moon className="h-4 w-4" aria-hidden />{t.schedule.off}</p>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
    </Section>
  );
}
