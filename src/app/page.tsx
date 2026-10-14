"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PesertaApp } from "@/components/peserta/PesertaApp";
import { siap } from "@/lib/supabase";

// Link peserta: /?t=kode-trip (kode dibuat panitia). Tanpa kode: halaman perkenalan aplikasi.

function Isi() {
  const slug = useSearchParams().get("t");
  if (!siap) return <p className="p-6 text-center text-red-600">Aplikasi belum terhubung ke database (environment belum diisi).</p>;
  if (slug) return <PesertaApp slug={slug} />;
  return <Perkenalan />;
}

function Perkenalan() {
  const fitur = [
    ["📝", "Registrasi dari HP", "Peserta mengisi nama, departemen, dan nomor HP sekali saja."],
    ["🗓️", "Jadwal yang hidup", "Penanda acara yang sedang berlangsung dan berikutnya, sesuai jam lokasi."],
    ["🎫", "Kartu peserta QR", "Nomor bus, kamar, dan teman sekamar. Panitia absen dengan scan QR."],
    ["📢", "Pengumuman", "Panitia menulis, peserta langsung melihat di HP."],
    ["📶", "Tetap jalan tanpa sinyal", "Bisa dipasang di layar HP dan dibuka saat offline."],
    ["📊", "Dashboard panitia", "Daftar peserta, kehadiran per titik, atur bus dan kamar, unduh Excel."],
  ];
  return (
    <div className="space-y-6 px-4 pb-12 pt-8">
      <div className="relative overflow-hidden rounded-3xl bg-sky-700 px-6 pb-8 pt-10 text-white">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute right-8 top-10 h-14 w-14 rounded-full bg-amber-300/90" />
        <p className="relative text-sm font-semibold text-sky-100">Info Trip</p>
        <h1 className="relative mt-1 text-3xl font-extrabold leading-tight">Semua info perjalanan rombongan, di HP peserta.</h1>
        <p className="relative mt-3 text-sky-100">Untuk agen perjalanan, panitia gathering, study tour, dan umrah.</p>
      </div>

      <div className="grid gap-3">
        {fitur.map(([ikon, judul, isi]) => (
          <div key={judul} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <span className="text-2xl">{ikon}</span>
            <div>
              <p className="font-bold">{judul}</p>
              <p className="text-sm text-slate-600">{isi}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-2">
        <Link href="/?t=family-gathering-bali" className="rounded-xl bg-sky-700 py-3.5 text-center font-bold text-white">Coba sebagai peserta</Link>
        <Link href="/panitia" className="rounded-xl bg-white py-3.5 text-center font-bold text-sky-800 ring-1 ring-slate-200">Masuk sebagai panitia</Link>
      </div>

      <p className="text-center text-sm text-slate-500">
        Dibuat oleh <a href="https://rizkyrhamadani.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700">Rizky Rhamadani</a>
      </p>
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
