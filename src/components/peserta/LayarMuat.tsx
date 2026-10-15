"use client";

import { useEffect, useState } from "react";
import { gayaTema } from "@/lib/tema";
import type { Tema } from "@/lib/types";
import { IkonPesawat } from "../Ikon";
import { Pemandangan, suasanaDari } from "../Pemandangan";

const PESAN = ["Menyiapkan jadwal Anda", "Mengecek titik kumpul", "Menyiapkan kartu peserta", "Hampir siap"];

/** Layar pembuka saat aplikasi peserta dibuka. Menampilkan pemandangan yang bergerak, pesawat, dan pesan yang berganti. */
export function LayarMuat({ nama, tujuan, tema }: { nama?: string; tujuan?: string; tema?: Tema }) {
  const [i, setI] = useState(0);
  const [suasana] = useState(() => suasanaDari(new Date().getHours()));

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % PESAN.length), 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div role="status" aria-live="polite" aria-label="Memuat aplikasi" style={gayaTema(tema)} className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-laut-900">
      <div className="absolute inset-0">
        <Pemandangan suasana={suasana} className="h-full w-full" />
        <div className="absolute inset-0 bg-linear-to-b from-laut-950/10 via-transparent to-laut-950/60" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center text-white">
        <div className="anim-muncul relative flex h-28 w-28 items-center justify-center">
          <span className="anim-cincin absolute inset-0 rounded-full border-2 border-white/60" />
          <span className="anim-cincin absolute inset-0 rounded-full border-2 border-white/40" style={{ animationDelay: "0.9s" }} />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-laut-700 shadow-2xl shadow-laut-950/40">
            <IkonPesawat className="anim-terbang h-10 w-10" />
          </span>
        </div>

        <p className="anim-naik mt-8 text-xs font-bold uppercase tracking-[0.25em] text-mentari-400" style={{ animationDelay: "120ms" }}>
          Info Trip
        </p>
        <h1 className="anim-naik mt-2 text-3xl font-extrabold leading-tight tracking-tight drop-shadow" style={{ animationDelay: "220ms" }}>
          {nama ?? "Selamat datang"}
        </h1>
        {tujuan && (
          <p className="anim-naik mt-1 text-base font-medium text-white/85" style={{ animationDelay: "320ms" }}>
            {tujuan}
          </p>
        )}

        <div className="mt-10 h-1.5 w-48 overflow-hidden rounded-full bg-white/20">
          <span className="anim-bar block h-full w-1/2 rounded-full bg-mentari-400" />
        </div>

        <p key={i} className="anim-pudar mt-4 h-5 text-sm font-medium text-white/85">
          {PESAN[i]}
          <span className="anim-titik" aria-hidden>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>
    </div>
  );
}
