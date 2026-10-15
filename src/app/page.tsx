"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

/** Pintu masuk tanpa kode trip. Peserta datang dari link panitia, jadi halaman ini cukup singkat. */
function Perkenalan() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="relative flex-1 overflow-hidden bg-laut-900">
        <Pemandangan className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-laut-950/70 [mask-image:linear-gradient(to_top,black_40%,transparent)]" />
        <div className="relative flex h-full min-h-[70dvh] flex-col justify-end px-6 pb-10 text-white">
          <p className="anim-naik text-sm font-bold uppercase tracking-[0.25em] text-mentari-400">Info Trip</p>
          <h1 className="anim-naik mt-2 text-3xl font-extrabold leading-tight tracking-tight" style={{ animationDelay: "80ms" }}>
            Info perjalanan Anda, di satu tempat.
          </h1>
          <p className="anim-naik mt-3 text-[15px] leading-relaxed text-white/85" style={{ animationDelay: "160ms" }}>
            Buka link dari panitia untuk mendaftar dan melihat jadwal, kartu peserta, serta info perjalanan.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white px-6 py-4 text-sm">
        <span className="text-slate-500">Panitia atau agen?</span>
        <Link href="/panitia" className="font-bold text-laut-800">Masuk panel panitia</Link>
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
