"use client";
import { motion } from "framer-motion";
import { Coins, Heart } from "lucide-react";
import type { ReactNode, MouseEvent, CSSProperties } from "react";
import { BRAND_PATHS } from "@/lib/brands";
import type { Social } from "@/lib/site";
import { useLang, useLive } from "./providers";

export function BrandIcon({ id, className = "h-5 w-5" }: { id: Social["id"]; className?: string }) {
  if (id === "tip") return <Heart className={className} aria-hidden />;
  if (id === "shop") return <Coins className={className} aria-hidden />;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d={BRAND_PATHS[id]} />
    </svg>
  );
}

export function Section({ id, kicker, title, lead, children, className = "" }: {
  id: string; kicker?: string; title: string; lead?: string; children: ReactNode; className?: string;
}) {
  return (
    <section id={id} className={`relative scroll-mt-24 px-4 py-20 sm:px-6 md:py-28 ${className}`}>
      <div className="mx-auto max-w-site">
        <Reveal>
          <header className="mb-10 md:mb-14">
            {kicker && <p className="kicker mb-3">{kicker}</p>}
            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">{title}</h2>
            {lead && <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">{lead}</p>}
          </header>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Glass card whose glow follows the pointer. */
export function GlowCard({ children, className = "", glow }: { children: ReactNode; className?: string; glow?: string }) {
  function move(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }
  return (
    <div onMouseMove={move} className={`glass spot ${className}`} style={glow ? ({ ["--glow" as string]: glow } as CSSProperties) : undefined}>
      {children}
    </div>
  );
}

export function StatusBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const { t } = useLang();
  const { status } = useLive();
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";
  if (status === "live")
    return (
      <span className={`live-badge inline-flex items-center gap-2 rounded-full font-bold text-white ${pad}`} role="status">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        LIVE · {t.status.live}
      </span>
    );
  const label = status === "offline" ? t.status.offline : status === "checking" ? t.status.checking : t.status.unknown;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 font-semibold text-zinc-300 ${pad}`} role="status">
      <span className={`h-2.5 w-2.5 rounded-full ${status === "checking" ? "animate-pulse bg-zinc-400" : "bg-zinc-500"}`} />
      {status === "offline" ? "OFFLINE · " : ""}{label}
    </span>
  );
}

export const fmt = (n: number, lang: "ar" | "en") => new Intl.NumberFormat(lang === "ar" ? "ar-SA-u-nu-latn" : "en-US").format(n);
