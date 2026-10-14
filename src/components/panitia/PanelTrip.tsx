"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { muatDataTrip, type DataTrip } from "@/lib/panitia";
import { pesanError } from "@/lib/supabase";
import { gayaTema } from "@/lib/tema";
import { rentangTanggal } from "@/lib/waktu";
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

export type PropsTab = { data: DataTrip; bisaUbah: boolean; muatUlang: () => void };

export function PanelTrip({ id, bisaUbah }: { id: string; bisaUbah: boolean }) {
  const [data, setData] = useState<DataTrip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Ringkasan");
  const [versi, setVersi] = useState(0);

  useEffect(() => {
    let aktif = true;
    muatDataTrip(id)
      .then((d) => aktif && (setData(d), setError(null)))
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
  if (!data) return <KerangkaPanel />;

  const props: PropsTab = { data, bisaUbah, muatUlang };

  return (
    <div className="space-y-4" style={gayaTema(data.trip.tema)}>
      <div>
        <Link href="/panitia" className="text-sm font-semibold text-laut-700">← Semua trip</Link>
        <h1 className="mt-1 text-2xl font-extrabold">{data.trip.nama}</h1>
        <p className="text-sm text-slate-500">{data.trip.tujuan} · {rentangTanggal(data.trip.mulai, data.trip.selesai)}{!data.trip.aktif && " · Ditutup"}</p>
      </div>

      <div className="tanpa-scrollbar -mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-1 rounded-2xl bg-pasir-100 p-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${tab === t ? "bg-laut-900 text-white shadow-sm" : "text-slate-500"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div key={tab} className="anim-geser">
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
