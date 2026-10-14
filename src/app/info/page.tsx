"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { INFO, JADWAL, PENGUMUMAN } from "@/lib/acara";
import { keluar, useDataPeserta } from "@/lib/peserta";

export default function InfoPerjalanan() {
  const router = useRouter();
  const data = useDataPeserta();
  const [hari, setHari] = useState(0);

  const saya = data?.daftar.find((p) => p.id === data.saya) ?? null;
  // Belum registrasi: kembali ke halaman registrasi.
  const belum = !!data && !saya;
  useEffect(() => {
    if (belum) router.replace("/");
  }, [belum, router]);

  if (!data || !saya) return <div className="h-80 animate-pulse rounded-3xl bg-slate-200" />;

  const h = JADWAL[hari];

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-sky-700 p-6 text-white">
        <p className="text-sm text-sky-100">Halo,</p>
        <h1 className="text-2xl font-bold">{saya.nama}</h1>
        <p className="mt-1 text-sm text-sky-100">Departemen {saya.departemen} · terdaftar ✓</p>
      </div>

      {/* Pengumuman */}
      <div className="space-y-2 rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <p className="font-bold text-amber-900">📢 Pengumuman</p>
        {PENGUMUMAN.map((p) => (
          <p key={p.isi} className="text-sm leading-relaxed text-amber-900">
            <span className="font-semibold">{p.tanggal}:</span> {p.isi}
          </p>
        ))}
      </div>

      {/* Jadwal per hari */}
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="mb-3 font-bold">Jadwal acara</p>
        <div className="mb-4 flex gap-1 rounded-2xl bg-slate-100 p-1">
          {JADWAL.map((j, i) => (
            <button
              key={j.hari}
              onClick={() => setHari(i)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold ${i === hari ? "bg-white text-sky-800 shadow-sm" : "text-slate-500"}`}
            >
              {j.hari}
            </button>
          ))}
        </div>
        <p className="mb-3 text-sm font-semibold text-slate-500">{h.tanggal}</p>
        <ol className="space-y-0">
          {h.agenda.map((a, i) => (
            <li key={a.jam + a.judul} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1.5 h-3 w-3 rounded-full bg-sky-600" />
                {i < h.agenda.length - 1 && <span className="w-0.5 flex-1 bg-sky-100" />}
              </div>
              <div className="pb-4">
                <p className="text-sm font-bold tabular-nums text-sky-800">{a.jam}</p>
                <p className="font-semibold">{a.judul}</p>
                {a.ket && <p className="text-sm text-slate-500">{a.ket}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Info penting */}
      <div className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
        <p className="font-bold">Info penting</p>
        {INFO.map((i) => (
          <div key={i.judul} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">{i.judul}</p>
            <p className="text-sm leading-relaxed">{i.isi}</p>
          </div>
        ))}
      </div>

      <button onClick={() => { keluar(); router.replace("/"); }} className="w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-600">
        Bukan {saya.nama.split(" ")[0]}? Ganti peserta
      </button>
    </section>
  );
}
