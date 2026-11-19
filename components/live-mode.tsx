"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { site } from "@/lib/site";
import { useLang, useLive } from "./providers";
import { fmt } from "./ui";

/** When TU1B is live: the whole site shifts to red neon and a LIVE ticker runs under the header. */
export function LiveMode() {
  const { t, lang } = useLang();
  const live = useLive();
  const on = live.status === "live";

  useEffect(() => {
    document.documentElement.classList.toggle("is-live", on);
  }, [on]);

  const item = `● LIVE NOW · ${t.ticker.live}${live.title ? " · " + live.title : ""} · ${fmt(live.viewers, lang)} ${t.ticker.viewers} · ${t.ticker.join} ↗`;
  return (
    <AnimatePresence>
      {on && (
        <motion.a
          href={site.kickUrl}
          target="_blank"
          rel="noopener"
          className="live-ticker"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          aria-label={`${t.ticker.live}: ${live.title || site.name} — ${t.ticker.join}`}
        >
          <span className="live-ticker-track" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => <span key={i}>{item}</span>)}
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
