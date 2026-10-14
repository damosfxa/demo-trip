"use client";

import { fase, jamAcara, statusAgenda, zonaAcara } from "@/lib/agenda";
import type { PaketTrip } from "@/lib/data-peserta";
import type { DataSaya } from "@/lib/types";
import { relatif, rentangTanggal, tanggalPanjang } from "@/lib/waktu";
import { IkonBus, IkonJam, IkonKalender, IkonKasur, IkonLokasi, IkonPanah, IkonToa } from "../Ikon";
import { Hero } from "./Hero";
import { HitungMundur } from "./HitungMundur";

export function Beranda({ paket, saya, sekarang, keKartu, keJadwal, notifikasi }: { paket: PaketTrip; saya: DataSaya | null; sekarang: number; keKartu: () => void; keJadwal: () => void; notifikasi?: React.ReactNode }) {
  const { trip, agenda } = paket;
  // Pengumuman publik dan pesan pribadi peserta ini, terbaru di atas.
  const pengumuman = [
    ...paket.pengumuman.map((p) => ({ ...p, pribadi: false })),
    ...(saya?.pesan ?? []).map((p) => ({ ...p, pribadi: true })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const f = fase(trip.mulai, trip.selesai, trip.zona, sekarang);
  const { sedang, berikut } = statusAgenda(agenda, sekarang);

  return (
    <div>
      <Hero trip={trip} sekarang={sekarang}>
        <p className="text-sm font-medium text-white/85">Halo, {saya?.nama.split(" ")[0] ?? "peserta"}</p>
        <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-sm">{trip.tujuan}</h1>
        <p className="mt-1 font-medium text-white/90">{trip.nama}</p>
        <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold backdrop-blur-md">
          <IkonKalender className="h-4 w-4" /> {rentangTanggal(trip.mulai, trip.selesai)}
        </div>
      </Hero>

      <div className="relative -mt-9 space-y-4 px-4">
        {f.jenis === "sebelum" && <div style={{ "--i": 0 } as React.CSSProperties}><HitungMundur trip={trip} agenda={agenda} /></div>}
        {f.jenis !== "sebelum" && (
          <div style={{ "--i": 0 } as React.CSSProperties} className="rounded-3xl bg-white p-5 text-center shadow-[0_12px_30px_-12px_rgba(6,42,61,0.35)] ring-1 ring-black/5">
            <p className="text-lg font-bold text-laut-900">{f.teks}</p>
          </div>
        )}

        {/* Bus dan kamar */}
        {saya && (
          <button onClick={keKartu} style={{ "--i": 1 } as React.CSSProperties} className="grid w-full grid-cols-2 gap-3 text-left">
            {[
              { Ikon: IkonBus, label: "Bus", nilai: saya.bus, warna: "bg-laut-100 text-laut-700" },
              { Ikon: IkonKasur, label: "Kamar", nilai: saya.kamar, warna: "bg-pasir-200 text-karang-600" },
            ].map(({ Ikon, label, nilai, warna }) => (
              <div key={label} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition active:scale-[0.98]">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${warna}`}><Ikon className="h-5 w-5" /></span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <p className={nilai ? "text-lg font-bold text-laut-950" : "mt-0.5 text-sm font-semibold text-slate-400"}>{nilai ?? "Menunggu panitia"}</p>
              </div>
            ))}
          </button>
        )}

        {/* Sedang berlangsung / berikutnya */}
        {(sedang || berikut) && (
          <button onClick={keJadwal} style={{ "--i": 2 } as React.CSSProperties} className="block w-full space-y-3 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5">
            {sedang && (
              <div className="flex gap-3">
                <span className="anim-denyut mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Sedang berlangsung</p>
                  <p className="text-lg font-bold text-laut-950">{sedang.judul}</p>
                  <p className="flex items-center gap-1 text-sm text-slate-500"><IkonJam className="h-4 w-4" /> {jamAcara(sedang.mulai, sedang, trip.zona)}{sedang.lokasi && <> · <IkonLokasi className="h-4 w-4" /> {sedang.lokasi}</>}</p>
                </div>
              </div>
            )}
            {berikut && (
              <div className={`flex items-center gap-3 ${sedang ? "border-t border-slate-100 pt-3" : ""}`}>
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-laut-900 text-white">
                  <span className="text-[10px] font-semibold uppercase text-white/70">{tanggalPanjang(berikut.mulai, zonaAcara(berikut, trip.zona)).split(",")[0].slice(0, 3)}</span>
                  <span className="text-xl font-extrabold leading-none">{new Intl.DateTimeFormat("id-ID", { day: "numeric", timeZone: zonaAcara(berikut, trip.zona) }).format(new Date(berikut.mulai))}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-laut-600">Agenda berikutnya</p>
                  <p className="truncate text-base font-bold text-laut-950">{berikut.judul}</p>
                  <p className="truncate text-sm text-slate-500">{jamAcara(berikut.mulai, berikut, trip.zona)}{berikut.lokasi ? ` · ${berikut.lokasi}` : ""}</p>
                </div>
                <IkonPanah className="h-5 w-5 shrink-0 text-slate-300" />
              </div>
            )}
          </button>
        )}

        {notifikasi}

        {/* Pengumuman */}
        <div style={{ "--i": 3 } as React.CSSProperties} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="mb-3 flex items-center gap-2 font-bold text-laut-950">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-karang-500/15 text-karang-600"><IkonToa className="h-4 w-4" /></span>
            Pengumuman
          </p>
          {pengumuman.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada pengumuman dari panitia.</p>
          ) : (
            <ul className="space-y-3">
              {pengumuman.map((p) => {
                const umur = sekarang - new Date(p.created_at).getTime();
                const baru = umur >= 0 && umur < 86400_000;
                return (
                  <li key={p.id} className={`relative rounded-2xl p-4 ${p.pribadi ? "bg-karang-500/10 ring-1 ring-karang-500/30" : baru ? "bg-mentari-400/15 ring-1 ring-mentari-400/50" : "bg-pasir-50"}`}>
                    <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      {p.pribadi && <span className="rounded-full bg-karang-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Untuk Anda</span>}
                      {relatif(p.created_at)}
                      {baru && <span className="rounded-full bg-karang-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Baru</span>}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-slate-800">{p.isi}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
