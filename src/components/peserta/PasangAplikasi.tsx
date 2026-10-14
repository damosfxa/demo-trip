"use client";

import { useEffect, useState } from "react";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Ajakan memasang halaman ini di layar utama HP, supaya terbuka seperti aplikasi (dan tetap jalan offline). */
export function PasangAplikasi() {
  const [evt, setEvt] = useState<PromptEvent | null>(null);
  const [ios] = useState(() => typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent));
  const [terpasang] = useState(() => typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches);

  useEffect(() => {
    const h = (e: Event) => {
      e.preventDefault();
      setEvt(e as PromptEvent);
    };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  if (terpasang) return null;

  return (
    <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
      <p className="font-bold text-sky-900">📲 Simpan di layar HP</p>
      <p className="mt-1 text-sm leading-relaxed text-sky-900/80">
        Buka seperti aplikasi tanpa mencari link lagi, dan tetap bisa dilihat walau sinyal hilang.
      </p>
      {evt ? (
        <button onClick={() => evt.prompt().then(() => setEvt(null))} className="mt-3 w-full rounded-xl bg-sky-700 py-3 text-sm font-bold text-white">
          Pasang sekarang
        </button>
      ) : (
        <p className="mt-2 text-sm text-sky-900/80">
          {ios ? "Di Safari: ketuk tombol Bagikan, lalu pilih \"Tambah ke Layar Utama\"." : "Di Chrome: ketuk menu titik tiga, lalu pilih \"Tambahkan ke layar utama\"."}
        </p>
      )}
    </div>
  );
}
