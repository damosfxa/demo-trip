"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { muatDataTrip, type DataTrip } from "@/lib/panitia";
import { pesanError } from "@/lib/supabase";
import { gayaTema } from "@/lib/tema";
import { labelZona, rentangTanggal } from "@/lib/waktu";
import { KerangkaPanel } from "../Kerangka";
import { Ringkasan } from "./Ringkasan";
import { TabAbsensi } from "./TabAbsensi";
import { TabDokumen } from "./TabDokumen";
import { TabJadwal } from "./TabJadwal";
import { TabPengaturan } from "./TabPengaturan";
import { TabPengumuman } from "./TabPengumuman";
import { TabPeserta } from "./TabPeserta";

const TABS = ["Ringkasan", "Peserta", "Absensi", "Dokumen", "Pengumuman", "Jadwal", "Pengaturan"] as const;
type Tab = (typeof TABS)[number];

const kunciSalinan = (id: string) => `infotrip:panel:${id}`;
function bacaSalinan(id: string): DataTrip | null {
  try {
    return JSON.parse(sessionStorage.getItem(kunciSalinan(id)) ?? "null");
  } catch {
    return null;
  }
}

export type PropsTab = { data: DataTrip; bisaUbah: boolean; muatUlang: () => void };

export function PanelTrip({ id, bisaUbah }: { id: string; bisaUbah: boolean }) {
  const [data, setData] = useState<DataTrip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Ringkasan");
  const [sudahPindah, setSudahPindah] = useState(false);
  const [versi, setVersi] = useState(0);

  useEffect(() => {
    let aktif = true;
    muatDataTrip(id)
      .then((d) => {
        if (!aktif) return;
        setData(d);
        setError(null);
        // Salinan per tab browser (hilang saat tab ditutup), hanya untuk menggambar skeleton yang sama persis.
        try {
          sessionStorage.setItem(kunciSalinan(id), JSON.stringify(d));
        } catch {}
      })
      .catch((e) => aktif && setError(pesanError(e)));
    return () => {
      aktif = false;
    };
  }, [id, versi]);

  const muatUlang = useCallback(() => setVersi((v) => v + 1), []);

  // Perbarui otomatis tiap 20 detik, supaya registrasi dan absensi baru langsung terlihat.
  useEffect(() => {
    const t = setInterval(muatUlang, 20_000);
    return () => clearInterval(t);
  }, [muatUlang]);

  if (error && !data) return <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  // Saat memuat: gambar panel yang sama dari salinan terakhir sebagai skeleton.
  const tampil = data ?? bacaSalinan(id);
  if (!tampil) return <KerangkaPanel />;
  const kerangka = !data;

  const props: PropsTab = { data: tampil, bisaUbah: bisaUbah && !kerangka, muatUlang };

  return (
    <div className={`space-y-4 ${kerangka ? "mode-kerangka" : ""}`} aria-busy={kerangka || undefined} style={gayaTema(tampil.trip.tema)}>
      <div className="relative overflow-hidden rounded-3xl bg-laut-950 p-5 text-white shadow-lg shadow-laut-950/20">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-mentari-400/20 blur-2xl" aria-hidden />
        <Link href="/panitia" className="relative text-sm font-semibold text-mentari-400">← Semua trip</Link>
        <h1 className="relative mt-2 text-2xl font-extrabold leading-tight">{tampil.trip.nama}</h1>
        <p className="relative mt-1 text-sm text-white/75">{tampil.trip.tujuan} · {rentangTanggal(tampil.trip.mulai, tampil.trip.selesai)}{!tampil.trip.aktif && " · Ditutup"}</p>
        {tampil.trip.lokasi_nama && <p className="relative mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{tampil.trip.lokasi_nama} · {labelZona(tampil.trip.zona)}</p>}
      </div>

      <div className="tanpa-scrollbar -mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-1 rounded-2xl bg-pasir-100 p-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => { setTab(t); setSudahPindah(true); }} className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${tab === t ? "bg-laut-900 text-white shadow-sm" : "text-slate-500"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div key={tab} className={sudahPindah ? "anim-geser" : ""}>
      {tab === "Ringkasan" && <Ringkasan {...props} />}
      {tab === "Peserta" && <TabPeserta {...props} />}
      {tab === "Absensi" && <TabAbsensi {...props} />}
      {tab === "Dokumen" && <TabDokumen {...props} />}
      {tab === "Pengumuman" && <TabPengumuman {...props} />}
      {tab === "Jadwal" && <TabJadwal {...props} />}
      {tab === "Pengaturan" && <TabPengaturan {...props} />}
      </div>
    </div>
  );
}
