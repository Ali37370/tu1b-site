"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, Menu, Play, X } from "lucide-react";
import { site } from "@/lib/site";
import { useLang, useLive } from "./providers";

export function Nav() {
  const { t, toggle } = useLang();
  const { status } = useLive();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);

  const links = [
    { href: "#live", label: t.nav.live },
    { href: "#socials", label: t.nav.socials },
    { href: "#about", label: t.nav.about },
    { href: "#content", label: t.nav.content },
    { href: "#schedule", label: t.nav.schedule },
    { href: "#sponsor", label: t.nav.sponsor },
  ];

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/10 bg-ink/70 backdrop-blur-xl" : "bg-transparent"}`}>
        <nav className="mx-auto flex h-16 max-w-site items-center justify-between gap-4 px-4 sm:px-6" aria-label="Main">
          <a href="#top" className="flex items-center gap-2 font-display text-xl font-bold tracking-wide text-white" aria-label={site.name}>
            <span className="logo-mark">{site.name}</span>
            {status === "live" && <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" aria-hidden />}
          </a>
          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-full px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white">{l.label}</a>
              </li>
            ))}
            <li>
              <a href="/tahdeer.html" className="rounded-full px-3 py-2 text-sm font-medium text-neon transition hover:bg-white/5">{t.nav.board}</a>
            </li>
          </ul>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-200 transition hover:border-primary hover:text-white" aria-label={t.lang}>
              <Languages className="h-4 w-4" aria-hidden />
              <span>{t.lang}</span>
            </button>
            <a href={site.kickUrl} target="_blank" rel="noopener" className="btn-primary hidden min-h-[44px] sm:inline-flex">
              <Play className="h-4 w-4 fill-current" aria-hidden />
              {t.hero.watch}
            </a>
            <button onClick={() => setOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden" aria-label={t.nav.menu} aria-expanded={open}>
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] bg-ink/95 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            role="dialog" aria-modal="true" aria-label={t.nav.menu}
          >
            <div className="flex h-16 items-center justify-between px-4">
              <span className="logo-mark font-display text-xl font-bold">{site.name}</span>
              <button onClick={() => setOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white" aria-label={t.nav.close} autoFocus>
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ul className="px-6 pt-6">
              {[...links, { href: "/tahdeer.html", label: t.nav.board }].map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="border-b border-white/10">
                  <a href={l.href} onClick={() => setOpen(false)} className="flex items-center justify-between py-4 font-display text-2xl font-bold text-white">
                    {l.label}
                    <span className="text-sm font-medium text-primary">{String(i + 1).padStart(2, "0")}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="px-6 pt-8">
              <a href={site.kickUrl} target="_blank" rel="noopener" className="btn-primary w-full justify-center">
                <Play className="h-4 w-4 fill-current" aria-hidden /> {t.hero.watch}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
