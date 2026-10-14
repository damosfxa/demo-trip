"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ACARA } from "@/lib/acara";
import { daftar, hpValid, useDataPeserta } from "@/lib/peserta";

const field = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20";

export default function Registrasi() {
  const router = useRouter();
  const data = useDataPeserta();
  const [nama, setNama] = useState("");
  const [departemen, setDepartemen] = useState("");
  const [hp, setHp] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Peserta yang sudah registrasi di HP ini langsung diarahkan ke halaman info.
  const sudah = !!data?.saya;
  useEffect(() => {
    if (sudah) router.replace("/info");
  }, [sudah, router]);

  if (!data || sudah) return <div className="h-80 animate-pulse rounded-3xl bg-slate-200" />;

  const kirim = (e: React.FormEvent) => {
    e.preventDefault();
    if (nama.trim().length < 3) return setError("Tulis nama lengkap Anda.");
    if (!departemen) return setError("Pilih departemen Anda.");
    if (!hpValid(hp)) return setError("Nomor HP belum benar. Contoh: 0812 3456 7890");
    daftar({ nama: nama.trim(), departemen, hp: hp.replace(/[\s-]/g, "") });
    router.push("/info");
  };

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-sky-700 p-6 text-white">
        <p className="text-sm text-sky-100">Selamat datang, peserta</p>
        <h1 className="mt-1 text-2xl font-bold">Registrasi peserta</h1>
        <p className="mt-2 text-sm leading-relaxed text-sky-100">Isi data di bawah untuk melihat jadwal, info hotel, dan pengumuman {ACARA.nama}.</p>
      </div>

      <form onSubmit={kirim} className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Nama lengkap</span>
          <input className={field} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Andi Pratama" autoComplete="name" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Departemen</span>
          <select className={field} value={departemen} onChange={(e) => setDepartemen(e.target.value)}>
            <option value="">Pilih departemen</option>
            {ACARA.departemen.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Nomor HP (WhatsApp)</span>
          <input className={field} value={hp} onChange={(e) => setHp(e.target.value)} placeholder="0812 3456 7890" inputMode="tel" autoComplete="tel" />
        </label>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button className="w-full rounded-xl bg-sky-700 py-3.5 text-base font-bold text-white hover:bg-sky-800">Daftar dan lihat info</button>
        <p className="text-center text-xs text-slate-500">Demo: data hanya tersimpan di HP ini, tidak dikirim ke mana pun.</p>
      </form>
    </section>
  );
}
