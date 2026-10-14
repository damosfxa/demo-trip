"use client";

import { useCallback, useEffect, useState } from "react";
import { keluar, kunciToken, muatSaya, muatTrip, type PaketTrip } from "@/lib/data-peserta";
import { useSekarang } from "@/lib/jam";
import { useSimpan } from "@/lib/simpan";
import type { DataSaya } from "@/lib/types";
import { IkonInfo, IkonKalender, IkonKartu, IkonLokasi, IkonRumah, IkonSegar, IkonSinyal } from "../Ikon";
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
    <div>
      <div className="kerangka h-[22rem]" />
      <div className="-mt-9 space-y-4 px-4">
        <div className="kerangka h-28 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="kerangka h-32 rounded-3xl" />
          <div className="kerangka h-32 rounded-3xl" />
        </div>
        <div className="kerangka h-40 rounded-3xl" />
      </div>
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
  const [memperbarui, setMemperbarui] = useState(false);

  // Data trip (publik).
  useEffect(() => {
    let aktif = true;
    muatTrip(slug).then((r) => {
      if (!aktif) return;
      setPaket(r.data);
      setOffline(r.offline);
      setError(r.error);
      setMemperbarui(false);
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
      <div className="anim-naik px-6 pt-24 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-laut-100 text-laut-700"><IkonLokasi className="h-8 w-8" /></span>
        <p className="mt-4 text-xl font-extrabold text-laut-950">{error}</p>
        <p className="mt-1 text-slate-500">Periksa kembali link dari panitia.</p>
      </div>
    );
  }
  if (!paket || token === undefined) return <Memuat />;
  if (!token) return <Registrasi trip={paket.trip} />;

  const pindah = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };
  const posisi = TABS.findIndex((t) => t.id === tab);

  return (
    <div className="pb-32">
      {offline && (
        <p className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-mentari-400 px-4 py-2 text-center text-xs font-bold text-laut-950">
          <IkonSinyal /> Sedang offline, menampilkan data terakhir
        </p>
      )}

      <div key={tab} className="anim-geser">
        {tab === "beranda" && <Beranda paket={paket} saya={saya} sekarang={sekarang} keKartu={() => pindah("kartu")} keJadwal={() => pindah("jadwal")} />}
        {tab === "jadwal" && <Jadwal trip={paket.trip} agenda={paket.agenda} sekarang={sekarang} />}
        {tab === "kartu" && (saya ? <Kartu trip={paket.trip} saya={saya} /> : <div className="kerangka m-4 h-96 rounded-[2rem]" />)}
        {tab === "info" && <InfoTrip trip={paket.trip} nama={saya?.nama ?? ""} />}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 px-4 text-sm">
        <button
          onClick={() => {
            setMemperbarui(true);
            segarkan();
          }}
          className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-semibold text-laut-700 shadow-sm ring-1 ring-black/5"
        >
          <IkonSegar className={memperbarui ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Perbarui data
        </button>
        {saya && (
          <button onClick={() => keluar(slug)} className="text-slate-400">
            Bukan {saya.nama.split(" ")[0]}? Ganti peserta
          </button>
        )}
      </div>

      {/* Menu bawah dengan penanda yang bergeser */}
      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="relative mx-auto flex max-w-md rounded-3xl bg-laut-950/90 p-1.5 shadow-2xl shadow-laut-950/30 backdrop-blur-xl">
          <span
            className="absolute bottom-1.5 top-1.5 rounded-2xl bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ width: `calc((100% - 0.75rem) / ${TABS.length})`, transform: `translateX(${posisi * 100}%)` }}
          />
          {TABS.map(({ id, label, Ikon }) => (
            <button key={id} onClick={() => pindah(id)} className={`relative z-10 flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors ${tab === id ? "text-white" : "text-white/55"}`}>
              <Ikon className={`h-[22px] w-[22px] transition-transform duration-300 ${tab === id ? "-translate-y-0.5 scale-110" : ""}`} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
