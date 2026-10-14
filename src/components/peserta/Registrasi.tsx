"use client";

import { useState } from "react";
import { daftar } from "@/lib/data-peserta";
import type { Trip } from "@/lib/types";
import { rentangTanggal } from "@/lib/waktu";

const field = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20";

export function Registrasi({ trip }: { trip: Trip }) {
  const [nama, setNama] = useState("");
  const [departemen, setDepartemen] = useState("");
  const [hp, setHp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [kirim, setKirim] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (nama.trim().length < 2) return setError("Tulis nama lengkap Anda.");
    if (!departemen) return setError("Pilih departemen Anda.");
    setKirim(true);
    try {
      await daftar(trip.slug, nama, departemen, hp);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setKirim(false);
    }
  };

  return (
    <div className="space-y-5 px-4 pb-10 pt-6">
      <div className="overflow-hidden rounded-3xl bg-sky-700 text-white">
        <div className="relative px-6 pb-6 pt-8">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute right-10 top-16 h-12 w-12 rounded-full bg-amber-300/80" />
          <p className="text-sm font-medium text-sky-100">{trip.penyelenggara}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{trip.nama}</h1>
          <p className="mt-2 text-sky-100">{trip.tujuan} · {rentangTanggal(trip.mulai, trip.selesai)}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div>
          <h2 className="text-lg font-bold">Registrasi peserta</h2>
          <p className="text-sm text-slate-500">Isi sekali saja. Setelah itu jadwal, kartu peserta, dan info perjalanan langsung terbuka.</p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Nama lengkap (sesuai KTP)</span>
          <input className={field} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Andi Pratama" autoComplete="name" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Departemen</span>
          <select className={field} value={departemen} onChange={(e) => setDepartemen(e.target.value)}>
            <option value="">Pilih departemen</option>
            {trip.departemen.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Nomor HP (WhatsApp)</span>
          <input className={field} value={hp} onChange={(e) => setHp(e.target.value)} placeholder="0812 3456 7890" inputMode="tel" autoComplete="tel" />
        </label>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button disabled={kirim} className="w-full rounded-xl bg-sky-700 py-3.5 text-base font-bold text-white hover:bg-sky-800 disabled:opacity-60">
          {kirim ? "Mendaftarkan..." : "Daftar"}
        </button>
        <p className="text-center text-xs leading-relaxed text-slate-500">
          Sudah pernah daftar di HP lain? Isi nama dan nomor HP yang sama, data Anda akan muncul kembali.
        </p>
      </form>
    </div>
  );
}
