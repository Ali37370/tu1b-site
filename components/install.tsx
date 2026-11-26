"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { useLang } from "./providers";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const TXT = {
  ar: {
    btn: "ثبّت التطبيق",
    title: "ثبّت تطبيق TU1B",
    ios1: "اضغط زر المشاركة تحت في سفاري",
    ios2: "اختر «إضافة إلى الشاشة الرئيسية»",
    ios3: "اضغط «إضافة»، وبيطلع لك تطبيق TU1B",
    other: "من قائمة المتصفح اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».",
    close: "إغلاق",
  },
  en: {
    btn: "Install app",
    title: "Install the TU1B app",
    ios1: "Tap the Share button in Safari",
    ios2: "Choose “Add to Home Screen”",
    ios3: "Tap “Add” — the TU1B app appears on your home screen",
    other: "From your browser menu, choose “Install app” or “Add to Home Screen”.",
    close: "Close",
  },
};

/** Registers the service worker and offers installing the site as a phone app. */
export function InstallApp() {
  const { lang } = useLang();
  const x = TXT[lang];
  const [prompt, setPrompt] = useState<BIP | null>(null);
  const [standalone, setStandalone] = useState(true);
  const [ios, setIos] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && location.hostname !== "localhost") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const sa = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setStandalone(sa);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as BIP); };
    const onInstalled = () => { setPrompt(null); setStandalone(true); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open]);

  if (standalone) return null;
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1024px)").matches;
  if (!prompt && !ios && !mobile) return null;

  async function install() {
    if (prompt) {
      await prompt.prompt();
      await prompt.userChoice.catch(() => null);
      setPrompt(null);
    } else setOpen(true);
  }

  return (
    <>
      <button onClick={install} className="install-btn" aria-haspopup={prompt ? undefined : "dialog"}>
        <Download className="h-4 w-4" aria-hidden />
        <span>{x.btn}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={x.title}>
            <motion.div className="glass w-full max-w-sm p-6" initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} onClick={(e) => e.stopPropagation()}>
              <div className="mb-5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-192.png" alt="" width={52} height={52} className="rounded-2xl" />
                <p className="flex-1 text-lg font-bold text-white">{x.title}</p>
                <button onClick={() => setOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white" aria-label={x.close} autoFocus>
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              {ios ? (
                <ol className="space-y-3 text-zinc-200">
                  <li className="flex items-center gap-3"><span className="icon-tile !h-10 !w-10 shrink-0"><Share className="h-5 w-5" aria-hidden /></span>{x.ios1}</li>
                  <li className="flex items-center gap-3"><span className="icon-tile !h-10 !w-10 shrink-0"><SquarePlus className="h-5 w-5" aria-hidden /></span>{x.ios2}</li>
                  <li className="flex items-center gap-3"><span className="icon-tile !h-10 !w-10 shrink-0 font-bold">✓</span>{x.ios3}</li>
                </ol>
              ) : (
                <p className="text-zinc-300">{x.other}</p>
              )}
              <p className="mt-5 text-center text-xs text-zinc-500" dir="ltr">{site.name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
