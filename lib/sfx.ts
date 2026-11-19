/** Tiny synthesized UI sounds (no audio files). Off by default; the visitor turns them on. */
let ctx: AudioContext | null = null;
let enabled = false;
let last = 0;

export function sfxEnabled() { return enabled; }
export function setSfx(on: boolean) {
  enabled = on;
  try { localStorage.setItem("tu1b_sfx", on ? "1" : "0"); } catch {}
  if (on) { audio(); play("click"); }
}
export function loadSfxPref() {
  try { enabled = localStorage.getItem("tu1b_sfx") === "1"; } catch { enabled = false; }
  return enabled;
}
function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}
export function play(kind: "hover" | "click" | "open") {
  if (!enabled) return;
  const now = performance.now();
  if (kind === "hover" && now - last < 70) return;
  last = now;
  const a = audio(); if (!a) return;
  const t = a.currentTime;
  const g = a.createGain();
  g.connect(a.destination);
  if (kind === "hover") {
    // soft airy whoosh: filtered noise burst
    const len = Math.floor(a.sampleRate * 0.12);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1.2;
    f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.12);
    g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(f); f.connect(g); src.start(t); src.stop(t + 0.13);
  } else {
    const o = a.createOscillator(); o.type = "sine";
    const f0 = kind === "open" ? 520 : 760;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.6, t + 0.08);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); o.start(t); o.stop(t + 0.17);
  }
}
/** Hook every link/button on the page (delegated, so new elements work too). */
export function wireSfx() {
  const over = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest?.("a,button");
    if (!el) return;
    const from = (e.relatedTarget as Element | null)?.closest?.("a,button");
    if (from !== el) play("hover");
  };
  const click = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest?.("a,button,[role=tab]");
    if (el) play(el.getAttribute("aria-expanded") === "false" ? "open" : "click");
  };
  document.addEventListener("mouseover", over, { passive: true });
  document.addEventListener("click", click, { capture: true });
  return () => { document.removeEventListener("mouseover", over); document.removeEventListener("click", click, { capture: true }); };
}
