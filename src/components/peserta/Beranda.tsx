"use client";

import { fase, jamAcara, statusAgenda, zonaAcara } from "@/lib/agenda";
import type { PaketTrip } from "@/lib/data-peserta";
import type { DataSaya } from "@/lib/types";
import { relatif, rentangTanggal, tanggalPanjang } from "@/lib/waktu";
import { IkonBus, IkonKasur } from "../Ikon";

export function Beranda({ paket, saya, sekarang, keKartu }: { paket: PaketTrip; saya: DataSaya | null; sekarang: number; keKartu: () => void }) {
  const { trip, agenda, pengumuman } = paket;
  const f = fase(trip.mulai, trip.selesai, trip.zona, sekarang);
  const { sedang, berikut } = statusAgenda(agenda, sekarang);

  return (
    <div className="space-y-4">
      {/* Banner perjalanan */}
      <div className="relative overflow-hidden rounded-3xl bg-sky-700 px-6 pb-6 pt-7 text-white">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute right-8 top-10 h-14 w-14 rounded-full bg-amber-300/90" />
        <div className="absolute -bottom-10 left-0 right-0 h-20 rounded-[50%] bg-sky-600/60" />
        <div className="relative">
          <p className="text-sm text-sky-100">Halo, {saya?.nama.split(" ")[0] ?? "peserta"} 👋</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{trip.tujuan}</h1>
          <p className="text-sky-100">{trip.nama} · {rentangTanggal(trip.mulai, trip.selesai)}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
            {f.jenis === "sebelum" && <span className="text-2xl font-extrabold tabular-nums">{f.angka}</span>}
            <span>{f.jenis === "sebelum" ? (f.angka === 1 ? "hari lagi, siap berangkat?" : "hari lagi menuju keberangkatan") : f.teks}</span>
          </div>
        </div>
      </div>

      {/* Bus & kamar */}
      {saya && (
        <button onClick={keKartu} className="grid w-full grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <IkonBus className="h-5 w-5 text-sky-700" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Bus</p>
            <p className="text-lg font-bold">{saya.bus ?? "Belum diatur"}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <IkonKasur className="h-5 w-5 text-sky-700" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Kamar</p>
            <p className="text-lg font-bold">{saya.kamar ?? "Belum diatur"}</p>
          </div>
        </button>
      )}

      {/* Sekarang & berikutnya */}
      {(sedang || berikut) && (
        <div className="space-y-2 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          {sedang && (
            <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Sedang berlangsung
              </p>
              <p className="mt-1 font-bold">{sedang.judul}</p>
              <p className="text-sm text-slate-600">{jamAcara(sedang.mulai, sedang, trip.zona)}{sedang.lokasi ? ` · ${sedang.lokasi}` : ""}</p>
            </div>
          )}
          {berikut && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Berikutnya</p>
              <p className="mt-1 font-bold">{berikut.judul}</p>
              <p className="text-sm text-slate-600">
                {tanggalPanjang(berikut.mulai, zonaAcara(berikut, trip.zona))}, {jamAcara(berikut.mulai, berikut, trip.zona)}{berikut.lokasi ? ` · ${berikut.lokasi}` : ""}
              </p>
              {berikut.ket && <p className="mt-1 text-sm text-slate-500">{berikut.ket}</p>}
            </div>
          )}
        </div>
      )}

      {/* Pengumuman */}
      <div className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p className="font-bold">📢 Pengumuman</p>
        {pengumuman.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada pengumuman.</p>
        ) : (
          pengumuman.map((p) => {
            const baru = sekarang - new Date(p.created_at).getTime() < 86400_000 && sekarang >= new Date(p.created_at).getTime();
            return (
              <div key={p.id} className={`rounded-2xl p-4 ${baru ? "bg-amber-50 ring-1 ring-amber-200" : "bg-slate-50"}`}>
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  {relatif(p.created_at)} {baru && <span className="rounded-full bg-amber-400 px-2 py-0.5 font-bold text-amber-950">Baru</span>}
                </p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{p.isi}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
