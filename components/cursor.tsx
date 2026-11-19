"use client";
import { useEffect, useRef } from "react";

/** Purple ring cursor with a star trail. Mouse/trackpad only; respects reduced motion. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce || !dot.current || !ring.current) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, lastStar = 0, stars = 0;
    const d = dot.current, r = ring.current;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      d.style.transform = `translate3d(${x}px,${y}px,0)`;
      const hot = (e.target as Element | null)?.closest?.("a,button,[role=tab],select,label,input,textarea");
      r.classList.toggle("is-hot", !!hot);
      const now = performance.now();
      if (now - lastStar > 45 && stars < 24) {
        lastStar = now; stars++;
        const s = document.createElement("span");
        s.className = "cursor-star";
        s.style.left = x + "px"; s.style.top = y + "px";
        s.style.setProperty("--dx", (Math.random() * 30 - 15).toFixed(0) + "px");
        s.style.setProperty("--dy", (Math.random() * 30 + 6).toFixed(0) + "px");
        document.body.appendChild(s);
        setTimeout(() => { s.remove(); stars--; }, 700);
      }
    };
    const down = () => r.classList.add("is-down");
    const up = () => r.classList.remove("is-down");
    const leave = () => { d.style.opacity = "0"; r.style.opacity = "0"; };
    const enter = () => { d.style.opacity = "1"; r.style.opacity = "1"; };
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      r.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
