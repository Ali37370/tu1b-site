"use client";
import { CalendarHeart, CheckCircle2, Loader2, Mail, Megaphone, Send, Smartphone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { useLang } from "./providers";
import { GlowCard, Reveal, Section } from "./ui";

export function Sponsor() {
  const { t } = useLang();
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err" | "rate">("idle");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    setState("sending");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (r.status === 429) return setState("rate");
      if (!r.ok) throw new Error();
      form.reset();
      setState("ok");
    } catch {
      setState("err");
    }
  }

  const offers = [
    { icon: <Megaphone className="h-6 w-6" aria-hidden />, ...t.sponsor.o1 },
    { icon: <Smartphone className="h-6 w-6" aria-hidden />, ...t.sponsor.o2 },
    { icon: <CalendarHeart className="h-6 w-6" aria-hidden />, ...t.sponsor.o3 },
  ];

  return (
    <Section id="sponsor" kicker={t.sponsor.kicker} title={t.sponsor.title} lead={t.sponsor.lead}>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          {offers.map((o, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <GlowCard className="flex items-start gap-4 p-5">
                <span className="icon-tile shrink-0">{o.icon}</span>
                <div>
                  <p className="font-bold text-white">{o.t}</p>
                  <p className="mt-1 text-sm text-zinc-400">{o.d}</p>
                </div>
              </GlowCard>
            </Reveal>
          ))}
          {site.businessEmail && (
            <Reveal delay={0.2}>
              <a href={`mailto:${site.businessEmail}?subject=${encodeURIComponent(`${site.name} — Partnership`)}`} className="btn-primary btn-lg mt-2 w-full justify-center sm:w-auto">
                <Mail className="h-5 w-5" aria-hidden /> {t.sponsor.email}
              </a>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1}>
          <form onSubmit={submit} className="glass grid gap-4 p-6 sm:grid-cols-2 sm:p-8" noValidate={false}>
            {site.businessEmail && <p className="text-sm text-zinc-400 sm:col-span-2">{t.sponsor.form}</p>}
            <label className="field">
              <span>{t.sponsor.name}</span>
              <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
            </label>
            <label className="field">
              <span>{t.sponsor.mail}</span>
              <input name="email" type="email" required maxLength={120} autoComplete="email" dir="ltr" />
            </label>
            <label className="field">
              <span>{t.sponsor.company}</span>
              <input name="company" maxLength={100} autoComplete="organization" />
            </label>
            <label className="field">
              <span>{t.sponsor.type}</span>
              <select name="type" defaultValue="sponsor">
                {(Object.keys(t.sponsor.types) as (keyof typeof t.sponsor.types)[]).map((k) => (
                  <option key={k} value={k}>{t.sponsor.types[k]}</option>
                ))}
              </select>
            </label>
            <label className="field sm:col-span-2">
              <span>{t.sponsor.message}</span>
              <textarea name="message" required minLength={10} maxLength={2000} rows={5} />
            </label>
            <label className="hidden" aria-hidden>
              Website <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
              <button type="submit" disabled={state === "sending"} className="btn-primary btn-lg disabled:opacity-60">
                {state === "sending" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Send className="h-5 w-5" aria-hidden />}
                {state === "sending" ? t.sponsor.sending : t.sponsor.send}
              </button>
              <p role="status" aria-live="polite" className={`text-sm ${state === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
                {state === "ok" && <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" aria-hidden />{t.sponsor.ok}</span>}
                {state === "err" && t.sponsor.err}
                {state === "rate" && t.sponsor.rate}
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
