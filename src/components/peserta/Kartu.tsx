"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { DataSaya, Trip } from "@/lib/types";
import { relatif, rentangTanggal } from "@/lib/waktu";
import { IkonPesawat } from "../Ikon";

/** Isi QR kartu peserta. Panitia memindainya untuk absensi. */
export const isiQr = (id: string) => `INFOTRIP:${id}`;

/** Kode tiga huruf tujuan, gaya kode bandara. */
const kode = (t: string) => t.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "TRP";

export function Kartu({ trip, saya }: { trip: Trip; saya: DataSaya }) {
  const [qr, setQr] = useState<string | null>(null);
  const [besar, setBesar] = useState(false);

  useEffect(() => {
    let aktif = true;
    QRCode.toDataURL(isiQr(saya.id), { width: 640, margin: 1, color: { dark: "#062a3d", light: "#ffffff" } }).then((u) => aktif && setQr(u));
    return () => {
      aktif = false;
    };
  }, [saya.id]);

  const hadir = new Set(saya.absen.map((a) => a.titik));

  return (
    <div className="px-4 pt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-laut-600">Tiket Anda</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-laut-950">Kartu peserta</h1>

      {/* Boarding pass */}
      <div className="anim-naik mt-5 overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_40px_-20px_rgba(6,42,61,0.45)] ring-1 ring-black/5">
        <div className="kilau bg-laut-900 px-6 pb-6 pt-5 text-white">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
            <span>Boarding pass</span>
            <span>{trip.penyelenggara ?? "Peserta"}</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Rombongan</p>
              <p className="text-4xl font-extrabold">GRP</p>
            </div>
            <div className="mb-2 flex flex-1 items-center px-3 text-mentari-400">
              <span className="h-px flex-1 border-t-2 border-dashed border-white/30" />
              <IkonPesawat className="anim-melayang mx-2 h-6 w-6" />
              <span className="h-px flex-1 border-t-2 border-dashed border-white/30" />
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Tujuan</p>
              <p className="text-4xl font-extrabold">{kode(trip.tujuan)}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-white/75">{trip.nama} · {rentangTanggal(trip.mulai, trip.selesai)}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-6 py-5">
          <div className="col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Nama peserta</p>
            <p className="text-xl font-extrabold text-laut-950">{saya.nama}</p>
          </div>
          <Isian label="Departemen" nilai={saya.departemen} />
          <Isian label="Bus" nilai={saya.bus} />
          <Isian label="Kamar" nilai={saya.kamar} />
          <Isian label="Teman sekamar" nilai={saya.teman_sekamar.length ? saya.teman_sekamar.join(", ") : null} />
        </div>

        {/* Sobekan tiket */}
        <div className="relative h-6">
          <span className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-pasir-50" />
          <span className="absolute -right-3 top-0 h-6 w-6 rounded-full bg-pasir-50" />
          <span className="absolute left-5 right-5 top-3 border-t-2 border-dashed border-slate-200" />
        </div>

        <div className="flex flex-col items-center px-6 pb-6 pt-2">
          <button onClick={() => setBesar(true)} className="w-48 rounded-2xl bg-white p-2 ring-1 ring-slate-200 transition active:scale-95">
            {qr ? <img src={qr} alt="QR kartu peserta" className="anim-pudar h-full w-full" /> : <div className="kerangka aspect-square rounded-xl" />}
          </button>
          <p className="mt-3 text-center text-sm text-slate-500">Tunjukkan ke panitia saat absen. Ketuk untuk memperbesar.</p>
        </div>
      </div>

      {/* Cap absensi */}
      <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="font-bold text-laut-950">Cap kehadiran</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {trip.titik_absen.map((t, i) => {
            const a = saya.absen.find((x) => x.titik === t);
            return (
              <div key={t} className={`flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-3 text-center ${a ? "border-emerald-300 bg-emerald-50" : "border-slate-200"}`}>
                {a ? (
                  <div className="anim-pop flex flex-col items-center" style={{ transform: `rotate(${i % 2 ? 6 : -6}deg)` }}>
                    <span className="rounded-lg border-2 border-emerald-600 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700">Hadir</span>
                    <span className="mt-1 text-[11px] text-emerald-700">{relatif(a.waktu)}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Belum</span>
                )}
                <span className={`mt-1.5 text-xs font-semibold ${hadir.has(t) ? "text-laut-900" : "text-slate-500"}`}>{t}</span>
              </div>
            );
          })}
        </div>
      </div>

      {besar && qr && (
        <button onClick={() => setBesar(false)} className="anim-pudar fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white p-8">
          <img src={qr} alt="QR kartu peserta" className="anim-pop w-full max-w-sm" />
          <p className="text-2xl font-extrabold text-laut-950">{saya.nama}</p>
          <p className="text-sm text-slate-500">Naikkan kecerahan layar. Ketuk untuk menutup.</p>
        </button>
      )}
    </div>
  );
}

function Isian({ label, nilai }: { label: string; nilai: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`truncate font-bold ${nilai ? "text-laut-950" : "text-slate-400"}`}>{nilai ?? "Belum diatur"}</p>
    </div>
  );
}
