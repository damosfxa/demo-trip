"use client";

import { useEffect, useState } from "react";
import { PENANDA_DARURAT } from "@/lib/darurat";
import { pesanError, supabase } from "@/lib/supabase";
import type { Trip } from "@/lib/types";
import { keIso, pecahIso, tanggalSingkat } from "@/lib/waktu";
import { Kartu, field, tombol, tombolGaris } from "./ui";

type Terjadwal = { id: string; isi: string; kirim_pada: string; status: "menunggu" | "terkirim" };

/** Pengumuman yang dikirim otomatis pada waktu tertentu, termasuk pengingat H-1. */
export function PengumumanTerjadwal({ trip, bisaUbah }: { trip: Trip; bisaUbah: boolean }) {
  const [daftar, setDaftar] = useState<Terjadwal[]>([]);
  const [muat, setMuat] = useState(0);
  const [isi, setIsi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("19:00");
  const [darurat, setDarurat] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let aktif = true;
    supabase
      .from("pengumuman_terjadwal")
      .select("id, isi, kirim_pada, status")
      .eq("trip_id", trip.id)
      .order("kirim_pada", { ascending: true })
      .then(({ data }) => aktif && setDaftar((data ?? []) as Terjadwal[]));
    return () => {
      aktif = false;
    };
  }, [trip.id, muat]);

  // Isi pengingat H-1: sehari sebelum keberangkatan, pukul 19.00 waktu trip.
  const pengingatH1 = () => {
    const sehari = new Date(Date.parse(trip.mulai + "T00:00:00Z") - 86400_000).toISOString().slice(0, 10);
    setTanggal(sehari);
    setJam("19:00");
    setIsi(`Besok ${trip.nama} berangkat. Kumpul di ${trip.titik_kumpul ?? "titik kumpul"} sesuai jadwal di aplikasi. Jangan lupa KTP asli dan barang bawaan.`);
  };

  const jadwalkan = async () => {
    const teks = isi.trim();
    if (!teks || !tanggal || !jam) return setInfo("Isi pesan, tanggal, dan jam dulu.");
    const kapan = keIso(tanggal, jam, trip.zona);
    if (Date.parse(kapan) <= Date.now()) return setInfo("Waktu pengiriman sudah lewat.");
    const { error } = await supabase.from("pengumuman_terjadwal").insert({
      trip_id: trip.id,
      isi: darurat ? PENANDA_DARURAT + teks : teks,
      kirim_pada: kapan,
    });
    if (error) return setInfo(pesanError(error));
    setInfo("Pengumuman dijadwalkan.");
    setIsi("");
    setDarurat(false);
    setMuat((x) => x + 1);
  };

  const hapus = async (id: string) => {
    if (!confirm("Batalkan pengumuman terjadwal ini?")) return;
    const { error } = await supabase.from("pengumuman_terjadwal").delete().eq("id", id);
    if (error) return setInfo(pesanError(error));
    setMuat((x) => x + 1);
  };

  return (
    <Kartu className="space-y-3">
      <p className="font-bold">Pengumuman terjadwal</p>
      <p className="text-sm text-slate-500">Pengumuman otomatis tampil di aplikasi peserta pada waktu yang dipilih, sesuai zona waktu trip.</p>
      {bisaUbah && (
        <div className="space-y-2">
          <button onClick={pengingatH1} className={`${tombolGaris} w-full`}>Isi pengingat H-1 (sehari sebelum berangkat, pukul 19.00)</button>
          <textarea rows={3} className={field} value={isi} onChange={(e) => setIsi(e.target.value)} placeholder="Tulis pengumuman yang akan dikirim otomatis" />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className={field} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            <input type="time" className={field} value={jam} onChange={(e) => setJam(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={darurat} onChange={(e) => setDarurat(e.target.checked)} /> Tandai darurat
          </label>
          <button onClick={jadwalkan} disabled={!isi.trim()} className={`${tombol} w-full`}>Jadwalkan</button>
        </div>
      )}
      {info && <p className="rounded-xl bg-laut-50 px-3 py-2 text-sm text-laut-900">{info}</p>}
      <ul className="divide-y divide-slate-100">
        {daftar.map((t) => {
          const { tanggal: tgl, jam: j } = pecahIso(t.kirim_pada, trip.zona);
          return (
            <li key={t.id} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  {t.status === "terkirim" ? "Sudah terkirim" : "Menunggu"} · {tanggalSingkat(tgl)} pukul {j.replace(":", ".")}
                </p>
                <p className="whitespace-pre-line text-sm">{t.isi.replace(PENANDA_DARURAT, "")}</p>
              </div>
              {bisaUbah && t.status === "menunggu" && <button onClick={() => hapus(t.id)} className="shrink-0 text-xs font-semibold text-red-600">Batalkan</button>}
            </li>
          );
        })}
        {daftar.length === 0 && <li className="py-3 text-center text-sm text-slate-500">Belum ada pengumuman terjadwal.</li>}
      </ul>
    </Kartu>
  );
}
