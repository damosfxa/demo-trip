"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { DataSaya, Trip } from "@/lib/types";
import { relatif, rentangTanggal } from "@/lib/waktu";
import { IkonBus, IkonCentang, IkonKasur } from "../Ikon";

/** Isi QR kartu peserta. Panitia memindainya untuk absensi. */
export const isiQr = (id: string) => `INFOTRIP:${id}`;

export function Kartu({ trip, saya }: { trip: Trip; saya: DataSaya }) {
  const [qr, setQr] = useState<string | null>(null);
  const [besar, setBesar] = useState(false);

  useEffect(() => {
    let aktif = true;
    QRCode.toDataURL(isiQr(saya.id), { width: 640, margin: 1, color: { dark: "#0c4a6e", light: "#ffffff" } }).then((u) => aktif && setQr(u));
    return () => {
      aktif = false;
    };
  }, [saya.id]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="bg-sky-700 px-5 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">Kartu peserta</p>
          <p className="font-bold">{trip.nama}</p>
          <p className="text-sm text-sky-100">{trip.tujuan} · {rentangTanggal(trip.mulai, trip.selesai)}</p>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <p className="text-2xl font-extrabold">{saya.nama}</p>
            <p className="text-slate-500">{saya.departemen}</p>
          </div>
          <button onClick={() => setBesar(true)} className="mx-auto block w-56 rounded-2xl bg-white p-2 ring-1 ring-slate-200">
            {qr ? <img src={qr} alt="QR kartu peserta" className="h-full w-full" /> : <div className="aspect-square animate-pulse rounded-xl bg-slate-100" />}
          </button>
          <p className="text-center text-sm text-slate-500">Tunjukkan QR ini ke panitia saat absen. Ketuk untuk memperbesar.</p>
          {/* Sobekan tiket */}
          <div className="relative -mx-5 border-t-2 border-dashed border-slate-200">
            <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-slate-50" />
            <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-slate-50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <IkonBus className="h-5 w-5 text-sky-700" />
              <p className="mt-1 text-xs font-semibold uppercase text-slate-400">Bus</p>
              <p className="font-bold">{saya.bus ?? "Belum diatur"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <IkonKasur className="h-5 w-5 text-sky-700" />
              <p className="mt-1 text-xs font-semibold uppercase text-slate-400">Kamar</p>
              <p className="font-bold">{saya.kamar ?? "Belum diatur"}</p>
            </div>
          </div>
          {saya.teman_sekamar.length > 0 && (
            <p className="text-sm text-slate-600"><span className="font-semibold">Teman sekamar:</span> {saya.teman_sekamar.join(", ")}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p className="font-bold">Riwayat absensi</p>
        {trip.titik_absen.map((t) => {
          const a = saya.absen.find((x) => x.titik === t);
          return (
            <div key={t} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <span className="font-medium">{t}</span>
              {a ? (
                <span className="flex items-center gap-1 font-semibold text-emerald-700"><IkonCentang /> {relatif(a.waktu)}</span>
              ) : (
                <span className="text-slate-400">Belum</span>
              )}
            </div>
          );
        })}
      </div>

      {besar && qr && (
        <button onClick={() => setBesar(false)} className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white p-6">
          <img src={qr} alt="QR kartu peserta" className="w-full max-w-sm" />
          <p className="text-xl font-bold">{saya.nama}</p>
          <p className="text-sm text-slate-500">Naikkan kecerahan layar. Ketuk untuk menutup.</p>
        </button>
      )}
    </div>
  );
}
