"use client";

import { useCallback, useEffect, useState } from "react";
import { keluar, kunciToken, muatSaya, muatTrip, type PaketTrip } from "@/lib/data-peserta";
import { useSekarang } from "@/lib/jam";
import { useSimpan } from "@/lib/simpan";
import type { DataSaya } from "@/lib/types";
import { IkonInfo, IkonKalender, IkonKartu, IkonRumah, IkonSinyal } from "../Ikon";
import { Beranda } from "./Beranda";
import { InfoTrip } from "./InfoTrip";
import { Jadwal } from "./Jadwal";
import { Kartu } from "./Kartu";
import { Registrasi } from "./Registrasi";

type Tab = "beranda" | "jadwal" | "kartu" | "info";
const TABS: { id: Tab; label: string; Ikon: typeof IkonRumah }[] = [
  { id: "beranda", label: "Beranda", Ikon: IkonRumah },
  { id: "jadwal", label: "Jadwal", Ikon: IkonKalender },
  { id: "kartu", label: "Kartu", Ikon: IkonKartu },
  { id: "info", label: "Info", Ikon: IkonInfo },
];

function Memuat() {
  return (
    <div className="space-y-4 px-4 pt-6">
      <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
      <div className="h-24 animate-pulse rounded-3xl bg-slate-200" />
      <div className="h-40 animate-pulse rounded-3xl bg-slate-200" />
    </div>
  );
}

export function PesertaApp({ slug }: { slug: string }) {
  const token = useSimpan<string>(kunciToken(slug));
  const sekarang = useSekarang();
  const [paket, setPaket] = useState<PaketTrip | null>(null);
  const [saya, setSaya] = useState<DataSaya | null>(null);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("beranda");
  const [muat, setMuat] = useState(0);

  // Data trip (publik).
  useEffect(() => {
    let aktif = true;
    muatTrip(slug).then((r) => {
      if (!aktif) return;
      setPaket(r.data);
      setOffline(r.offline);
      setError(r.error);
    });
    return () => {
      aktif = false;
    };
  }, [slug, muat]);

  // Data peserta sendiri (perlu token dari registrasi).
  useEffect(() => {
    if (!token) return;
    let aktif = true;
    muatSaya(slug, token).then((r) => {
      if (!aktif) return;
      // Token tidak dikenal lagi (misalnya peserta dihapus panitia): kembali ke registrasi.
      if (!r.data && !r.error && !r.offline) keluar(slug);
      setSaya(r.data);
    });
    return () => {
      aktif = false;
    };
  }, [slug, token, muat]);

  // Muat ulang saat aplikasi dibuka kembali, supaya pengumuman terbaru langsung terlihat.
  const segarkan = useCallback(() => setMuat((x) => x + 1), []);
  useEffect(() => {
    const h = () => document.visibilityState === "visible" && segarkan();
    document.addEventListener("visibilitychange", h);
    window.addEventListener("online", segarkan);
    return () => {
      document.removeEventListener("visibilitychange", h);
      window.removeEventListener("online", segarkan);
    };
  }, [segarkan]);

  if (error && !paket) {
    return (
      <div className="px-4 pt-16 text-center">
        <p className="text-4xl">🧭</p>
        <p className="mt-3 text-lg font-bold">{error}</p>
        <p className="mt-1 text-sm text-slate-500">Periksa kembali link dari panitia.</p>
      </div>
    );
  }
  if (!paket || token === undefined) return <Memuat />;
  if (!token) return <Registrasi trip={paket.trip} />;

  return (
    <div className="pb-28">
      {offline && (
        <p className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900">
          <IkonSinyal /> Sedang offline, menampilkan data terakhir
        </p>
      )}
      <div className="px-4 pt-5">
        {tab === "beranda" && <Beranda paket={paket} saya={saya} sekarang={sekarang} keKartu={() => setTab("kartu")} />}
        {tab === "jadwal" && <Jadwal trip={paket.trip} agenda={paket.agenda} sekarang={sekarang} />}
        {tab === "kartu" && (saya ? <Kartu trip={paket.trip} saya={saya} /> : <Memuat />)}
        {tab === "info" && <InfoTrip trip={paket.trip} nama={saya?.nama ?? ""} />}

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <button onClick={segarkan} className="font-semibold text-sky-700">Perbarui data</button>
          {saya && (
            <button onClick={() => keluar(slug)} className="text-slate-400">
              Bukan {saya.nama.split(" ")[0]}? Ganti peserta
            </button>
          )}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-md">
          {TABS.map(({ id, label, Ikon }) => (
            <button key={id} onClick={() => { setTab(id); window.scrollTo({ top: 0 }); }} className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${tab === id ? "text-sky-700" : "text-slate-400"}`}>
              <Ikon className="h-6 w-6" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
