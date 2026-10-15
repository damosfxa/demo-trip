"use client";

import type { Absen, Peserta, Trip } from "@/lib/types";
import { Kartu, tombol, tombolGaris } from "./ui";

/** Daftar hadir untuk ditandatangani di lokasi. Satu kolom per titik absen, dan kolom paraf kosong. */
export function DaftarHadir({ trip, peserta, absen, onTutup }: { trip: Trip; peserta: Peserta[]; absen: Absen[]; onTutup: () => void }) {
  const urut = [...peserta].sort((a, b) => a.departemen.localeCompare(b.departemen) || a.nama.localeCompare(b.nama));
  return (
    <div className="cetak-kartu space-y-3">
      <Kartu className="flex items-center justify-between gap-3 print:hidden">
        <div>
          <p className="font-bold">Daftar hadir siap cetak</p>
          <p className="text-sm text-slate-500">Cetak di kertas A4 dengan orientasi landscape.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onTutup} className={tombolGaris}>Tutup</button>
          <button onClick={() => window.print()} className={tombol}>Cetak</button>
        </div>
      </Kartu>
      <div className="rounded-xl bg-white p-5 text-[12px] text-slate-900 shadow-sm ring-1 ring-black/5 print:rounded-none print:p-0 print:shadow-none print:ring-0">
        <p className="text-base font-extrabold">{trip.nama}</p>
        <p className="mb-3 text-slate-600">Daftar hadir · {trip.tujuan}</p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 text-left">
              <th className="py-1 pr-2">No</th>
              <th className="py-1 pr-2">Nama</th>
              <th className="py-1 pr-2">Departemen</th>
              {trip.titik_absen.map((t) => <th key={t} className="py-1 pr-2 text-center">{t}</th>)}
              <th className="py-1">Paraf</th>
            </tr>
          </thead>
          <tbody>
            {urut.map((p, i) => (
              <tr key={p.id} className="border-b border-slate-300">
                <td className="py-1.5 pr-2">{i + 1}</td>
                <td className="py-1.5 pr-2 font-semibold">{p.nama}</td>
                <td className="py-1.5 pr-2">{p.departemen}</td>
                {trip.titik_absen.map((t) => (
                  <td key={t} className="py-1.5 pr-2 text-center">
                    {absen.some((a) => a.participant_id === p.id && a.titik === t) ? "✓" : ""}
                  </td>
                ))}
                <td className="w-24 py-1.5" />
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-slate-500">Total {urut.length} peserta · tanda ✓ berarti sudah tercatat di titik absen.</p>
      </div>
    </div>
  );
}
