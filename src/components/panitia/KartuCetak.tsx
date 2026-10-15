"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Peserta, Trip } from "@/lib/types";
import { Kartu, tombol } from "./ui";

/** Kartu peserta siap cetak, berisi QR yang dibaca scanner absensi. Dicetak dua kolom per halaman A4. */
export function KartuCetak({ trip, peserta }: { trip: Trip; peserta: Peserta[] }) {
  const [qr, setQr] = useState<Record<string, string>>({});

  useEffect(() => {
    let aktif = true;
    Promise.all(
      peserta.map(async (p) => [p.id, await QRCode.toDataURL(`INFOTRIP:${p.id}`, { width: 240, margin: 1 })] as const),
    ).then((hasil) => aktif && setQr(Object.fromEntries(hasil)));
    return () => {
      aktif = false;
    };
  }, [peserta]);

  return (
    <div className="cetak-kartu space-y-3">
      <Kartu className="flex items-center justify-between gap-3 print:hidden">
        <div>
          <p className="font-bold">Kartu peserta siap cetak</p>
          <p className="text-sm text-slate-500">{peserta.length} kartu. Pakai ukuran kertas A4 dan skala 100 persen.</p>
        </div>
        <button onClick={() => window.print()} disabled={Object.keys(qr).length < peserta.length} className={tombol}>Cetak kartu</button>
      </Kartu>
      <div className="grid grid-cols-2 gap-3 print:gap-2">
        {peserta.map((p) => (
          <div key={p.id} className="break-inside-avoid rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 print:rounded-lg print:p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{trip.nama}</p>
            <div className="mt-2 flex items-center gap-3">
              {qr[p.id] ? <img src={qr[p.id]} alt="" className="h-24 w-24 shrink-0" /> : <span className="kerangka block h-24 w-24 shrink-0 rounded" />}
              <div className="min-w-0">
                <p className="truncate text-base font-extrabold">{p.nama}</p>
                <p className="truncate text-xs text-slate-600">{p.departemen}</p>
                <p className="mt-1 text-xs text-slate-700">Bus: <b>{p.bus ?? "-"}</b> · Kamar: <b>{p.kamar ?? "-"}</b></p>
                <p className="text-xs text-slate-500">{p.hp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
