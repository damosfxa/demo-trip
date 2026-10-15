"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { DataSaya, Trip } from "@/lib/types";
import { relatif, rentangTanggal } from "@/lib/waktu";
import { IkonPesawat } from "../Ikon";
import { kamus, useBahasa } from "@/lib/bahasa";
import { useTerjemahan } from "@/lib/terjemah";

/** Isi QR kartu peserta. Panitia memindainya untuk absensi. */
export const isiQr = (id: string) => `INFOTRIP:${id}`;

/** Kode tiga huruf tujuan, gaya kode bandara. */
const kode = (t: string) => t.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "TRP";

export function Kartu({ trip, saya }: { trip: Trip; saya: DataSaya }) {
  const [qr, setQr] = useState<string | null>(null);
  const [besar, setBesar] = useState(false);
  const bahasa = useBahasa();
  const t = kamus(bahasa);
  const tr = useTerjemahan(trip.titik_absen, bahasa === "en");

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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-laut-600">{t("tiketAnda")}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-laut-950">{t("kartuJudul")}</h1>

      {/* Boarding pass */}
      <div className="mt-5 overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_40px_-20px_rgba(6,42,61,0.45)] ring-1 ring-black/5">
        <div className="kilau bg-laut-900 px-6 pb-6 pt-5 text-white">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
            {trip.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={trip.logo_url} alt="" className="h-7 max-w-[7rem] rounded-md bg-white object-contain p-1" />
            ) : (
              <span>Boarding pass</span>
            )}
            <span>{trip.penyelenggara ?? t("peserta")}</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{t("rombongan")}</p>
              <p className="text-4xl font-extrabold">GRP</p>
            </div>
            <div className="mb-2 flex flex-1 items-center px-3 text-mentari-400">
              <span className="h-px flex-1 border-t-2 border-dashed border-white/30" />
              <IkonPesawat className="anim-melayang mx-2 h-6 w-6" />
              <span className="h-px flex-1 border-t-2 border-dashed border-white/30" />
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{t("tujuan")}</p>
              <p className="text-4xl font-extrabold">{kode(trip.tujuan)}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-white/75">{trip.nama} · {rentangTanggal(trip.mulai, trip.selesai)}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-6 py-5">
          <div className="col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t("namaPeserta")}</p>
            <p className="text-xl font-extrabold text-laut-950">{saya.nama}</p>
          </div>
          <Isian label={t("departemen")} nilai={saya.departemen} belum={t("belumDiatur")} />
          <Isian label={t("bus")} nilai={saya.bus} belum={t("belumDiatur")} />
          <Isian label={t("kamar")} nilai={saya.kamar} belum={t("belumDiatur")} />
          <Isian label={t("tekanTeman")} nilai={saya.teman_sekamar.length ? saya.teman_sekamar.join(", ") : null} belum={t("belumDiatur")} />
          {saya.teman_kontak && saya.teman_kontak.length > 0 && (
            <div className="space-y-1.5 px-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("hubungiTeman")}</p>
              {saya.teman_kontak.map((tm) => (
                <a key={tm.hp} href={`tel:${tm.hp}`} className="flex items-center justify-between rounded-xl bg-laut-50 px-3 py-2 text-sm font-semibold text-laut-800">
                  <span className="truncate">{tm.nama}</span>
                  <span className="shrink-0 text-laut-600">{tm.hp}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Sobekan tiket */}
        <div className="relative h-6">
          <span className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-pasir-50" />
          <span className="absolute -right-3 top-0 h-6 w-6 rounded-full bg-pasir-50" />
          <span className="absolute left-5 right-5 top-3 border-t-2 border-dashed border-slate-200" />
        </div>

        <div className="flex flex-col items-center px-6 pb-6 pt-2">
          <button onClick={() => setBesar(true)} className="w-48 rounded-2xl bg-white p-2 ring-1 ring-slate-200 transition active:scale-95">
            {qr ? <img src={qr} alt={t("qrAlt")} className="h-full w-full" /> : <div className="kerangka aspect-square rounded-xl" />}
          </button>
          <p className="mt-3 text-center text-sm text-slate-500">{t("tunjukkan")}</p>
        </div>
      </div>

      {/* Cap absensi */}
 <div className="mt-5 rounded-3xl p-5 ">
        <p className="font-bold text-laut-950">{t("capKehadiran")}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {trip.titik_absen.map((titik, i) => {
            const a = saya.absen.find((x) => x.titik === titik);
            return (
              <div key={titik} className={`flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-3 text-center ${a ? "border-emerald-300 bg-emerald-50" : "border-slate-200"}`}>
                {a ? (
                  <div className="flex flex-col items-center" style={{ transform: `rotate(${i % 2 ? 6 : -6}deg)` }}>
                    <span className="rounded-lg border-2 border-emerald-600 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700">{t("hadir")}</span>
                    <span className="mt-1 text-[11px] text-emerald-700">{relatif(a.waktu)}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">{t("belum")}</span>
                )}
                <span className={`mt-1.5 text-xs font-semibold ${hadir.has(titik) ? "text-laut-900" : "text-slate-500"}`}>{tr(titik)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {besar && qr && (
        <button onClick={() => setBesar(false)} className="anim-pudar fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white p-8">
          <img src={qr} alt={t("qrAlt")} className="anim-pop w-full max-w-sm" />
          <p className="text-2xl font-extrabold text-laut-950">{saya.nama}</p>
          <p className="text-sm text-slate-500">{t("naikkan")}</p>
        </button>
      )}
    </div>
  );
}

function Isian({ label, nilai, belum }: { label: string; nilai: string | null; belum: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`truncate font-bold ${nilai ? "text-laut-950" : "text-slate-400"}`}>{nilai ?? belum}</p>
    </div>
  );
}
