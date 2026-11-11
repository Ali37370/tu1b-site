"use client";
import { useEffect, useState } from "react";

type Item = { id: string; at: string; name: string; email: string; company: string; type: string; message: string };

export default function Inquiries() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [state, setState] = useState<"loading" | "login" | "ok" | "error">("loading");

  useEffect(() => {
    document.title = "طلبات الشراكة | TU1B";
    fetch("/api/inquiries", { method: "POST", headers: { "x-requested-with": "tu1b" } })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) return setState("login");
        if (!r.ok) throw new Error();
        const d = await r.json();
        setItems(d.items || []);
        setState("ok");
      })
      .catch(() => setState("error"));
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-16">
      <a href="/" className="text-sm text-neon">← TU1B</a>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">طلبات الشراكة</h1>
      {state === "loading" && <p className="mt-6 text-zinc-400">نحمّل…</p>}
      {state === "error" && <p className="mt-6 text-rose-400">صار خطأ، جرّب مرة ثانية.</p>}
      {state === "login" && (
        <div className="glass mt-6 p-6">
          <p className="text-zinc-300">هذي الصفحة للمالك بس. سجّل دخول بحساب كيك.</p>
          <a href="/api/auth/login?next=/inquiries" className="btn-primary mt-4">دخول بكيك</a>
        </div>
      )}
      {state === "ok" && items && (
        <ul className="mt-8 space-y-4">
          {items.length === 0 && <li className="text-zinc-400">ما فيه طلبات للحين.</li>}
          {items.map((x) => (
            <li key={x.id} className="glass p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <b className="text-white">{x.name}{x.company ? ` · ${x.company}` : ""}</b>
                <span className="text-xs text-zinc-500">{new Date(x.at).toLocaleString("ar-SA-u-nu-latn-ca-gregory")}</span>
              </div>
              <a href={`mailto:${x.email}`} dir="ltr" className="mt-1 block text-sm text-neon">{x.email}</a>
              <p className="mt-1 text-xs text-zinc-500">{x.type}</p>
              <p className="mt-3 whitespace-pre-wrap text-zinc-300">{x.message}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
