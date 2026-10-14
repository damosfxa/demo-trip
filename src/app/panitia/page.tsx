"use client";

import { useState } from "react";
import { ACARA } from "@/lib/acara";
import { resetContoh, useDataPeserta, type Peserta } from "@/lib/peserta";

const waktu = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Unduh daftar peserta sebagai CSV (bisa dibuka di Excel). */
function unduhCsv(daftar: Peserta[]) {
  const baris = [["Nama", "Departemen", "No HP", "Waktu daftar"], ...daftar.map((p) => [p.nama, p.departemen, p.hp, waktu(p.waktu)])];
  const csv = baris.map((b) => b.map((x) => `"${x.replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "peserta.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Panitia() {
  const data = useDataPeserta();
  const [filter, setFilter] = useState("");

  if (!data) return <div className="h-80 animate-pulse rounded-3xl bg-slate-200" />;

  const per = ACARA.departemen.map((d) => ({ d, n: data.daftar.filter((p) => p.departemen === d).length })).filter((x) => x.n > 0);
  const tampil = data.daftar.filter((p) => !filter || p.departemen === filter);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        Halaman panitia. Coba registrasi di tab Peserta, lalu kembali ke sini: nama Anda muncul di daftar.
      </div>

      <div className="rounded-3xl bg-sky-700 p-6 text-white">
        <p className="text-sm text-sky-100">Peserta terdaftar</p>
        <p className="text-4xl font-bold">{data.daftar.length}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {per.map((x) => (
            <span key={x.d} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{x.d}: {x.n}</span>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <select className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Semua departemen</option>
            {ACARA.departemen.map((d) => <option key={d}>{d}</option>)}
          </select>
          <button onClick={() => unduhCsv(tampil)} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white">Unduh Excel</button>
        </div>
        {tampil.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Belum ada peserta di departemen ini.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tampil.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.nama}{p.id === data.saya && <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800">Anda</span>}</p>
                  <p className="text-sm text-slate-500">{p.departemen} · {p.hp}</p>
                </div>
                <p className="shrink-0 text-xs text-slate-400">{waktu(p.waktu)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={resetContoh} className="w-full text-center text-sm font-semibold text-slate-500 underline">Kembalikan data contoh</button>
    </section>
  );
}
