"use client";

import { useEffect, useState } from "react";
import { kamus, useBahasa } from "@/lib/bahasa";
import { IkonPasang } from "../Ikon";

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

  const t = kamus(useBahasa());
  if (terpasang) return null;

  return (
    <div className="flex gap-4 rounded-3xl bg-laut-900 p-5 text-white">
      <span className="anim-melayang flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-mentari-400">
        <IkonPasang className="h-6 w-6" />
      </span>
      <div className="flex-1">
        <p className="font-bold">{t("simpanLayar")}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-white/75">{t("simpanTerbuka")}</p>
        {evt ? (
          <button onClick={() => evt.prompt().then(() => setEvt(null))} className="mt-3 rounded-xl bg-mentari-400 px-4 py-2 text-sm font-bold text-laut-950 transition active:scale-95">
            {t("simpanLayar")}
          </button>
        ) : (
          <p className="mt-2 text-sm text-white/85">
            {ios ? t("diSafari") : t("diChrome")}
          </p>
        )}
      </div>
    </div>
  );
}
