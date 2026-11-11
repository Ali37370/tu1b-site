"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { site } from "@/lib/site";
import { useLang } from "./providers";
import { BrandIcon } from "./ui";

export function Footer() {
  const { t, lang } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const top = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 px-4 pb-10 pt-20 sm:px-6">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-secondary opacity-25 blur-[120px]" aria-hidden />
      <div className="relative mx-auto max-w-site">
        <a href="#top" className="footer-logo block text-center font-display font-bold" dir="ltr" aria-label={site.name}>
          {site.name.split("").map((c, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.15}s` }}>{c}</span>
          ))}
        </a>

        <ul className="mt-10 flex flex-wrap justify-center gap-3" aria-label={t.nav.socials}>
          {[...site.socials, ...site.moreLinks.filter((l) => l.id === "snapchat" || l.id === "whatsapp")].map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener" aria-label={`${s.label[lang]} ${s.handle}`} className="social-dot" style={{ ["--c" as string]: s.color } as CSSProperties}>
                <BrandIcon id={s.id} className="h-[18px] w-[18px]" />
              </a>
            </li>
          ))}
        </ul>

        <nav className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-400" aria-label="Footer">
          <a href="#live" className="hover:text-white">{t.nav.live}</a>
          <a href="#about" className="hover:text-white">{t.nav.about}</a>
          <a href="#content" className="hover:text-white">{t.nav.content}</a>
          <a href="#schedule" className="hover:text-white">{t.nav.schedule}</a>
          <a href="#sponsor" className="hover:text-white">{t.nav.sponsor}</a>
          <a href="/tahdeer.html" className="text-neon hover:text-white">{t.nav.board}</a>
        </nav>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. {t.footer.rights}.</p>
          <p>{t.footer.by} <span className="font-bold text-zinc-300">ALI</span></p>
        </div>
      </div>

      <AnimatePresence>
        {show && (
          <motion.button
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            onClick={top}
            className="fixed bottom-5 end-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary text-white shadow-[0_10px_30px_rgba(124,58,237,.5)] transition hover:scale-105"
            aria-label={t.footer.top}
          >
            <ArrowUp className="h-5 w-5" aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}
