"use client";

import { useState } from "react";
import { akhir, jamAcara, perHari, zonaAcara } from "@/lib/agenda";
import type { Agenda, Trip } from "@/lib/types";
import { kunciHari, tanggalPanjang } from "@/lib/waktu";

export function Jadwal({ trip, agenda, sekarang }: { trip: Trip; agenda: Agenda[]; sekarang: number }) {
  const hari = perHari(agenda, trip.zona);
  const hariIni = sekarang ? kunciHari(new Date(sekarang).toISOString(), trip.zona) : "";
  const awal = Math.max(0, hari.findIndex((h) => h.hari === hariIni));
  const [pilih, setPilih] = useState<number | null>(null);
  const idx = pilih ?? awal;
  const h = hari[idx];

  if (!h) return <p className="rounded-3xl bg-white p-6 text-center text-slate-500">Jadwal belum diisi panitia.</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-200/70 p-1">
        {hari.map((x, i) => (
          <button key={x.hari} onClick={() => setPilih(i)} className={`min-w-20 flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${i === idx ? "bg-white text-sky-800 shadow-sm" : "text-slate-500"}`}>
            Hari {i + 1}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p className="mb-4 text-sm font-semibold capitalize text-slate-500">{tanggalPanjang(h.isi[0].mulai, zonaAcara(h.isi[0], trip.zona))}</p>
        <ol>
          {h.isi.map((a, i) => {
            const pos = agenda.indexOf(a);
            const m = new Date(a.mulai).getTime();
            const lewat = sekarang > 0 && akhir(agenda, pos) <= sekarang;
            const sedang = sekarang > 0 && m <= sekarang && sekarang < akhir(agenda, pos);
            return (
              <li key={a.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`mt-1.5 h-3.5 w-3.5 rounded-full ring-4 ${sedang ? "bg-emerald-500 ring-emerald-100" : lewat ? "bg-slate-300 ring-transparent" : "bg-sky-600 ring-sky-50"}`} />
                  {i < h.isi.length - 1 && <span className="w-0.5 flex-1 bg-slate-100" />}
                </div>
                <div className={`flex-1 pb-5 ${lewat ? "opacity-50" : ""}`}>
                  <p className="text-sm font-bold tabular-nums text-sky-800">
                    {jamAcara(a.mulai, a, trip.zona)}
                    {a.selesai && ` sampai ${jamAcara(a.selesai, a, trip.zona)}`}
                    {sedang && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Sekarang</span>}
                  </p>
                  <p className="font-semibold">{a.judul}</p>
                  {a.lokasi && <p className="text-sm text-slate-500">📍 {a.lokasi}</p>}
                  {a.ket && <p className="text-sm text-slate-500">{a.ket}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
