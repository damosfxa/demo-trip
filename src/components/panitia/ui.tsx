"use client";

import { useEffect, useRef, useState } from "react";

// Komponen kecil yang dipakai di halaman panitia.

export const field =
  "w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-laut-950 outline-none transition focus:border-laut-600 focus:ring-4 focus:ring-laut-500/15 disabled:bg-pasir-50";
export const tombol = "rounded-2xl bg-laut-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-laut-800 active:scale-[0.98] disabled:opacity-50";
export const tombolGaris = "rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-laut-900 transition hover:bg-pasir-50 active:scale-[0.98] disabled:opacity-50";

export function Kartu({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div style={style} className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 ${className}`}>{children}</div>;
}

export function Label({ teks, children, catatan }: { teks: string; children: React.ReactNode; catatan?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-laut-950">{teks}</span>
      {children}
      {catatan && <span className="block text-xs text-slate-500">{catatan}</span>}
    </label>
  );
}

/** Angka yang naik perlahan dari 0 saat pertama tampil. */
export function Angka({ nilai, className = "" }: { nilai: number; className?: string }) {
  const [tampil, setTampil] = useState(0);
  const awal = useRef(0);

  useEffect(() => {
    const dari = awal.current;
    const mulai = performance.now();
    let raf = 0;
    const langkah = (t: number) => {
      const p = Math.min(1, (t - mulai) / 700);
      const v = Math.round(dari + (nilai - dari) * (1 - Math.pow(1 - p, 3)));
      setTampil(v);
      if (p < 1) raf = requestAnimationFrame(langkah);
      else awal.current = nilai;
    };
    raf = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(raf);
  }, [nilai]);

  return <span className={`tabular-nums ${className}`}>{tampil}</span>;
}

export function Batang({ label, nilai, total, warna = "bg-laut-600" }: { label: string; nilai: number; total: number; warna?: string }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-semibold tabular-nums text-laut-950">{nilai}{total ? <span className="text-slate-400"> / {total}</span> : ""}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-pasir-100">
        <div className={`anim-isi h-full rounded-full ${warna}`} style={{ width: `${total ? Math.min(100, (nilai / total) * 100) : 0}%` }} />
      </div>
    </div>
  );
}
