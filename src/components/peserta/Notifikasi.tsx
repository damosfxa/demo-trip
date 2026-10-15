"use client";

import { useEffect, useState } from "react";
import { aktifkanNotifikasi, statusNotifikasi, type StatusNotif } from "@/lib/notifikasi";
import { kamus, useBahasa } from "@/lib/bahasa";
import { IkonToa } from "../Ikon";

export type Kabar = { id: string; jenis: "publik" | "pribadi"; isi: string };

/** Pop-up kabar baru dari panitia, muncul dari atas layar saat aplikasi sedang dibuka. */
export function PopupKabar({ kabar, onTutup, onBuka }: { kabar: Kabar | null; onTutup: () => void; onBuka: () => void }) {
  const t = kamus(useBahasa());
  useEffect(() => {
    if (!kabar) return;
    const t = setTimeout(onTutup, 9000);
    return () => clearTimeout(t);
  }, [kabar, onTutup]);

  if (!kabar) return null;
  const pribadi = kabar.jenis === "pribadi";
  return (
    <div className="fixed inset-x-0 top-0 z-50 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div key={kabar.id} className="popup-turun mx-auto flex max-w-md gap-3 rounded-3xl bg-white p-4 shadow-2xl shadow-laut-950/25 ring-1 ring-black/5">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${pribadi ? "bg-karang-500 text-white" : "bg-laut-900 text-white"}`}>
          <IkonToa className="h-5 w-5" />
        </span>
        <button onClick={onBuka} className="min-w-0 flex-1 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-laut-700">{pribadi ? t("pesanUntukAnda") : t("pengumumanBaru")}</p>
          <p className="mt-0.5 line-clamp-3 text-[15px] leading-snug text-slate-800">{kabar.isi}</p>
        </button>
        <button onClick={onTutup} aria-label={t("tutup")} className="-mr-1 -mt-1 h-8 w-8 shrink-0 rounded-full text-xl leading-none text-slate-400">×</button>
      </div>
    </div>
  );
}

/** Kartu untuk menyalakan notifikasi HP. Hilang sendiri bila sudah aktif. */
export function NyalakanNotifikasi({ token }: { token: string }) {
  const t = kamus(useBahasa());
  const [status, setStatus] = useState<StatusNotif | null>(null);
  const [proses, setProses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aktif = true;
    statusNotifikasi().then((s) => aktif && setStatus(s));
    return () => {
      aktif = false;
    };
  }, []);

  if (!status || status === "aktif" || status === "tidak-didukung") return null;

  const nyalakan = async () => {
    setProses(true);
    setError(null);
    try {
      setStatus(await aktifkanNotifikasi(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setProses(false);
  };

  return (
    <div className="flex gap-4 rounded-3xl bg-laut-900 p-5 text-white">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-mentari-400">
        <IkonToa className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="font-bold">{t("notifJudul")}</p>
        {status === "perlu-dipasang" ? (
          <p className="mt-1 text-sm leading-relaxed text-white/80">
            {t("notifIos")}
          </p>
        ) : status === "ditolak" ? (
          <p className="mt-1 text-sm leading-relaxed text-white/80">{t("notifBlok")}</p>
        ) : (
          <>
            <p className="mt-1 text-sm leading-relaxed text-white/80">{t("notifIsi")}</p>
            <button onClick={nyalakan} disabled={proses} className="mt-3 rounded-xl bg-mentari-400 px-4 py-2 text-sm font-bold text-laut-950 disabled:opacity-60">
              {proses ? t("menyalakan") : t("nyalakanNotif")}
            </button>
          </>
        )}
        {error && <p className="mt-2 text-sm text-mentari-400">{error}</p>}
      </div>
    </div>
  );
}
