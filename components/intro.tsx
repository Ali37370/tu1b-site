"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { useLang } from "./providers";

/** First-visit intro: TU1B assembles in 3D with a load counter, then opens like a camera iris. Once per session. */
export function Intro() {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let seen = false;
    try { seen = !!sessionStorage.getItem("tu1b_intro2"); } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
    document.documentElement.style.overflow = "hidden";
    const t0 = performance.now();
    let loaded = document.readyState === "complete";
    const onLoad = () => { loaded = true; };
    window.addEventListener("load", onLoad);
    const cap = setTimeout(() => { loaded = true; }, 3500);
    let p = 0, raf = 0;
    const tick = (now: number) => {
      const target = loaded ? 100 : Math.min(90, (now - t0) / 18);
      p += Math.max(0.5, (target - p) * 0.08);
      if (p > target) p = target;
      setPct(Math.round(p));
      if (p >= 100 && now - t0 > 1600) {
        try { sessionStorage.setItem("tu1b_intro2", "1"); } catch {}
        setShow(false);
        document.documentElement.style.overflow = "";
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(cap); window.removeEventListener("load", onLoad); document.documentElement.style.overflow = ""; };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="intro3d"
          aria-hidden
          initial={{ clipPath: "circle(150% at 50% 50%)" }}
          exit={{ clipPath: "circle(0% at 50% 50%)", transition: { duration: 0.9, ease: [0.7, 0, 0.3, 1] } }}
        >
          <div className="intro3d-grid" />
          <div className="intro3d-word" dir="ltr">
            {site.name.split("").map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, rotateY: i % 2 ? 120 : -120, rotateX: 40, z: -600, y: i % 2 ? 80 : -80 }}
                animate={{ opacity: 1, rotateY: 0, rotateX: 0, z: 0, y: 0 }}
                transition={{ delay: 0.15 + i * 0.14, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
          <div className="intro3d-bar"><i style={{ width: pct + "%" }} /></div>
          <div className="intro3d-num" dir="ltr">{pct}<small>%</small></div>
          <div className="intro3d-label">{t.intro.loading}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
