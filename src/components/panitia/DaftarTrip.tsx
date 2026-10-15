"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { slugDari } from "@/lib/panitia";
import { pesanError, supabase } from "@/lib/supabase";
import type { Trip, Zona } from "@/lib/types";
import { LABEL_ZONA, rentangTanggal } from "@/lib/waktu";
import { KerangkaDaftarTrip } from "../Kerangka";
import { TimPanitia } from "./TimPanitia";
import { Kartu, Label, field, tombol, tombolGaris } from "./ui";

type TripRingkas = Trip & { jumlah: number };
const SALINAN = "infotrip:daftar-trip";
function bacaSalinan(): TripRingkas[] | null {
  try {
    return JSON.parse(sessionStorage.getItem(SALINAN) ?? "null");
  } catch {
    return null;
  }
}

/** Kode acak pendek untuk membedakan slug trip salinan. */
const kodeAcak = () => Math.random().toString(36).slice(2, 6);

const DEPT_AWAL = ["Keuangan", "HRD", "Marketing", "Operasional", "IT", "Lainnya"];

export function DaftarTrip({ bisaUbah }: { bisaUbah: boolean }) {
  const [trips, setTrips] = useState<TripRingkas[] | null>(null);
  const [baru, setBaru] = useState(false);
  const [muat, setMuat] = useState(0);

  useEffect(() => {
    let aktif = true;
    supabase
      .from("trips")
      .select("*, participants(count)")
      .order("mulai", { ascending: false })
      .then(({ data, error }) => {
        if (!aktif) return;
        if (error) alert(pesanError(error));
        const hasil = ((data ?? []) as (Trip & { participants: { count: number }[] })[]).map((t) => ({ ...t, jumlah: t.participants?.[0]?.count ?? 0 }));
        setTrips(hasil);
        try {
          sessionStorage.setItem(SALINAN, JSON.stringify(hasil));
        } catch {}
      });
    return () => {
      aktif = false;
    };
  }, [muat]);

  // Salin trip sebagai titik awal: jadwal, info, checklist, FAQ, dan isian ikut disalin. Peserta tidak ikut.
  const duplikat = async (t: TripRingkas) => {
    const mulaiBaru = prompt(`Tanggal mulai trip baru (YYYY-MM-DD). Jadwal akan digeser sesuai selisihnya.`, t.mulai);
    if (!mulaiBaru || !/^\d{4}-\d{2}-\d{2}$/.test(mulaiBaru)) return;
    const selisihHari = Math.round((Date.parse(mulaiBaru + "T00:00:00Z") - Date.parse(t.mulai + "T00:00:00Z")) / 86400_000);
    const geser = (iso: string) => new Date(Date.parse(iso) + selisihHari * 86400_000).toISOString();
    const { data: asal, error: e1 } = await supabase.from("trips").select("*").eq("id", t.id).single();
    if (e1) return alert(pesanError(e1));
    const salin: Record<string, unknown> = { ...(asal as Record<string, unknown>) };
    delete salin.id;
    delete salin.created_at;
    const { data: baru, error: e2 } = await supabase
      .from("trips")
      .insert({
        ...salin,
        slug: `${slugDari(t.nama)}-${kodeAcak()}`,
        nama: `${t.nama} (salinan)`,
        mulai: mulaiBaru,
        selesai: new Date(Date.parse(t.selesai + "T00:00:00Z") + selisihHari * 86400_000).toISOString().slice(0, 10),
        aktif: true,
      })
      .select("id")
      .single();
    if (e2) return alert(pesanError(e2));
    const { data: agendaAsal } = await supabase.from("agenda").select("*").eq("trip_id", t.id);
    if (agendaAsal && agendaAsal.length) {
      const { error: e3 } = await supabase.from("agenda").insert(
        agendaAsal.map((a) => ({
          judul: a.judul,
          lokasi: a.lokasi,
          ket: a.ket,
          zona: a.zona,
          trip_id: baru.id,
          mulai: geser(a.mulai),
          selesai: a.selesai ? geser(a.selesai) : null,
        })),
      );
      if (e3) return alert(pesanError(e3));
    }
    setMuat((x) => x + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Trip</h1>
        {bisaUbah && !baru && <button onClick={() => setBaru(true)} className={tombol}>+ Trip baru</button>}
      </div>

      {bisaUbah && !baru && <TimPanitia />}

      {baru && <FormTripBaru onBatal={() => setBaru(false)} onSelesai={() => { setBaru(false); setMuat((x) => x + 1); }} />}

      {!trips ? (
        // Skeleton: daftar yang sama dari salinan terakhir, atau bentuk umum pada kunjungan pertama.
        bacaSalinan()?.length ? <div className="mode-kerangka space-y-4" aria-busy="true">{bacaSalinan()!.map((t) => <BarisTrip key={t.id} t={t} bisaUbah={false} onDuplikat={() => {}} />)}</div> : <KerangkaDaftarTrip />
      ) : trips.length === 0 ? (
        <Kartu><p className="text-center text-slate-500">Belum ada trip.</p></Kartu>
      ) : (
        trips.map((t) => <BarisTrip key={t.id} t={t} bisaUbah={bisaUbah} onDuplikat={() => duplikat(t)} />)
      )}
    </div>
  );
}

function BarisTrip({ t, bisaUbah, onDuplikat }: { t: TripRingkas; bisaUbah: boolean; onDuplikat: () => void }) {
  return (
    <div className="space-y-2">
    <Link href={`/panitia?trip=${t.id}`} className="block rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:ring-laut-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{t.nama}</p>
          <p className="text-sm text-slate-500">{t.tujuan} · {rentangTanggal(t.mulai, t.selesai)}</p>
        </div>
        {!t.aktif && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">Ditutup</span>}
      </div>
      <p className="mt-3 text-sm"><span className="text-2xl font-extrabold text-laut-700">{t.jumlah}</span> peserta terdaftar</p>
    </Link>
    {bisaUbah && (
      <div className="flex justify-end">
        <button onClick={onDuplikat} className="text-sm font-semibold text-laut-700">Duplikat sebagai trip baru</button>
      </div>
    )}
    </div>
  );
}

function FormTripBaru({ onBatal, onSelesai }: { onBatal: () => void; onSelesai: () => void }) {
  const [nama, setNama] = useState("");
  const [slug, setSlug] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [mulai, setMulai] = useState("");
  const [selesai, setSelesai] = useState("");
  const [zona, setZona] = useState<Zona>("Asia/Jakarta");
  const [proses, setProses] = useState(false);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !tujuan || !mulai || !selesai) return alert("Nama, tujuan, dan tanggal wajib diisi.");
    if (selesai < mulai) return alert("Tanggal selesai tidak boleh sebelum tanggal mulai.");
    setProses(true);
    const { error } = await supabase.from("trips").insert({
      nama, tujuan, mulai, selesai, zona, slug: slug || slugDari(nama), departemen: DEPT_AWAL, titik_absen: ["Titik kumpul"],
    });
    setProses(false);
    if (error) return alert(pesanError(error));
    onSelesai();
  };

  return (
    <Kartu>
      <form onSubmit={simpan} className="space-y-3">
        <p className="font-bold">Trip baru</p>
        <Label teks="Nama acara"><input className={field} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Study Tour SMA 1 Malang" /></Label>
        <Label teks="Kode link" catatan={`Link peserta: .../?t=${slug || slugDari(nama) || "kode-link"}`}>
          <input className={field} value={slug} onChange={(e) => setSlug(slugDari(e.target.value))} placeholder={slugDari(nama) || "study-tour-malang"} />
        </Label>
        <Label teks="Tujuan"><input className={field} value={tujuan} onChange={(e) => setTujuan(e.target.value)} placeholder="Contoh: Yogyakarta" /></Label>
        <div className="grid grid-cols-2 gap-3">
          <Label teks="Mulai"><input type="date" className={field} value={mulai} onChange={(e) => setMulai(e.target.value)} /></Label>
          <Label teks="Selesai"><input type="date" className={field} value={selesai} onChange={(e) => setSelesai(e.target.value)} /></Label>
        </div>
        <Label teks="Zona waktu lokasi">
          <select className={field} value={zona} onChange={(e) => setZona(e.target.value as Zona)}>
            {(Object.keys(LABEL_ZONA) as Zona[]).map((z) => <option key={z} value={z}>{LABEL_ZONA[z]}</option>)}
          </select>
        </Label>
        <div className="flex gap-2 pt-1">
          <button disabled={proses} className={tombol}>{proses ? "Menyimpan..." : "Buat trip"}</button>
          <button type="button" onClick={onBatal} className={tombolGaris}>Batal</button>
        </div>
        <p className="text-xs text-slate-500">Jadwal, info, checklist, dan lainnya diisi setelah trip dibuat.</p>
      </form>
    </Kartu>
  );
}
