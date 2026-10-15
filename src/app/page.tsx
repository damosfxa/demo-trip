"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IkonCentang, IkonJam, IkonKalender, IkonKartu, IkonPasang, IkonPesawat, IkonToa } from "@/components/Ikon";
import { Pemandangan } from "@/components/Pemandangan";
import { PesertaApp } from "@/components/peserta/PesertaApp";
import { siap } from "@/lib/supabase";

// Link peserta: /?t=kode-trip (kode dibuat panitia). Tanpa kode: halaman perkenalan aplikasi.

function Isi() {
  const slug = useSearchParams().get("t");
  if (!siap) return <p className="p-6 text-center text-red-600">Aplikasi belum terhubung ke database (environment belum diisi).</p>;
  if (slug) return <PesertaApp slug={slug} />;
  return <Perkenalan />;
}

const FITUR = [
  { Ikon: IkonCentang, judul: "Registrasi dari HP", isi: "Peserta mengisi nama, departemen, dan nomor HP sekali saja." },
  { Ikon: IkonKalender, judul: "Jadwal yang hidup", isi: "Penanda acara yang sedang berlangsung, sesuai zona waktu tiap kota." },
  { Ikon: IkonKartu, judul: "Kartu peserta QR", isi: "Bus, kamar, dan teman sekamar. Panitia absen dengan scan QR." },
  { Ikon: IkonToa, judul: "Pengumuman langsung", isi: "Panitia menulis, peserta langsung melihat di HP." },
  { Ikon: IkonPasang, judul: "Tetap jalan tanpa sinyal", isi: "Bisa dipasang di layar HP dan dibuka saat offline." },
  { Ikon: IkonJam, judul: "Dashboard panitia", isi: "Kehadiran per titik, atur bus dan kamar, unduh Excel." },
];

function Perkenalan() {
  return (
    <div className="pb-12">
      <div className="relative h-[26rem] overflow-hidden bg-laut-900">
        <Pemandangan className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-laut-950/60 [mask-image:linear-gradient(to_top,black_45%,transparent)]" />
        <div className="relative flex h-full flex-col justify-end px-6 pb-14 text-white">
          <p className="flex items-center gap-2 text-sm font-semibold text-mentari-400"><IkonPesawat className="h-4 w-4" /> Info Trip</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-[1.1] tracking-tight">
            Semua info perjalanan rombongan, di HP peserta.
          </h1>
          <p className="mt-3 text-white/80">Untuk agen perjalanan, family gathering, study tour, dan umrah.</p>
        </div>
      </div>

      <div className="relative -mt-8 space-y-3 px-4">
        <div className="grid gap-2 rounded-[2rem] bg-white p-4 shadow-[0_20px_40px_-20px_rgba(6,42,61,0.4)] ring-1 ring-black/5">
          <Link href="/?t=family-gathering-bali" className="flex items-center justify-center gap-2 rounded-2xl bg-laut-900 py-4 font-bold text-white transition active:scale-[0.98]">
            <IkonPesawat className="h-5 w-5" /> Coba sebagai peserta
          </Link>
          <Link href="/panitia" className="rounded-2xl bg-laut-50 py-4 text-center font-bold text-laut-800 transition active:scale-[0.98]">Masuk sebagai panitia</Link>
        </div>

        <div className="grid gap-3 pt-2">
          {FITUR.map(({ Ikon, judul, isi }, i) => (
            <div key={judul} style={{ "--i": i + 3 } as React.CSSProperties} className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-laut-100 text-laut-700"><Ikon className="h-5 w-5" /></span>
              <div>
                <p className="font-bold text-laut-950">{judul}</p>
                <p className="text-sm leading-relaxed text-slate-600">{isi}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Halaman() {
  return (
    <Suspense fallback={null}>
      <Isi />
    </Suspense>
  );
}
