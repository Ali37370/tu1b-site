"use client";
import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { site } from "@/lib/site";
import { useLang } from "./providers";
import { SplitTitle } from "./ui";

const Trophy3D = dynamic(() => import("./trophy3d"), { ssr: false });
const HUES = [0, 0.62, 0.78, 0.9];

/** Pinned section: milestones slide sideways as you scroll, a 3D trophy spins beside them. */
export function Journey() {
  const { t, lang } = useLang();
  const ref = useRef<HTMLElement>(null);
  const items = site.achievements;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const dir = lang === "ar" ? 1 : -1;
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(items.length - 1, Math.max(0, Math.round(v * (items.length - 1))))));

  return (
    <section id="journey" ref={ref} className="relative scroll-mt-16" style={{ height: `${items.length * 85 + 40}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden px-4 sm:px-6">
        <div className="mx-auto w-full max-w-site">
          <p className="kicker mb-3">{t.journey.kicker}</p>
          <SplitTitle text={t.journey.title} className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl" />
          <p className="mt-3 max-w-2xl text-zinc-400">{t.journey.lead}</p>

          <div className="mt-8 grid items-center gap-6 md:mt-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="relative mx-auto aspect-square w-full max-w-[260px] md:max-w-[380px]">
              <div className="absolute inset-[12%] rounded-full bg-primary opacity-25 blur-[60px]" aria-hidden />
              <Trophy3D hue={HUES[active % HUES.length]} />
              <span className="journey-year" aria-hidden>{items[active].year[lang]}</span>
            </div>
            <div className="overflow-hidden">
              <motion.ol className="flex w-full" animate={{ x: `${dir * active * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }}>
                {items.map((a, i) => (
                  <li key={i} className="w-full shrink-0 px-1">
                    <div className={`glass p-6 transition-opacity duration-500 md:p-8 ${i === active ? "opacity-100" : "opacity-40"}`}>
                      <span className="font-display text-sm font-bold uppercase tracking-widest text-neon">{String(i + 1).padStart(2, "0")} · {a.year[lang]}</span>
                      <p className="mt-3 text-2xl font-bold leading-snug text-white md:text-3xl">{a.title[lang]}</p>
                    </div>
                  </li>
                ))}
              </motion.ol>
              <div className="mt-5 flex gap-2" aria-hidden>
                {items.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-10 bg-primary" : "w-4 bg-white/15"}`} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
