"use client";

import { useState } from "react";
import { fase, jamAcara, statusAgenda, zonaAcara } from "@/lib/agenda";
import type { PaketTrip } from "@/lib/data-peserta";
import type { DataSaya } from "@/lib/types";
import { relatif, rentangTanggal, tanggalPanjang, waLink } from "@/lib/waktu";
import { IkonBagi, IkonBus, IkonInfo, IkonJam, IkonKalender, IkonKartu, IkonKasur, IkonLokasi, IkonPanah, IkonToa, IkonWa } from "../Ikon";
import { pisahDarurat } from "@/lib/darurat";
import { kamus, useBahasa } from "@/lib/bahasa";
import { useTerjemahan } from "@/lib/terjemah";
import { Hero } from "./Hero";
import { HitungMundur } from "./HitungMundur";
import { PasangAplikasi } from "./PasangAplikasi";

type Props = {
  paket: PaketTrip;
  saya: DataSaya | null;
  sekarang: number;
  keKartu: () => void;
  keJadwal: () => void;
  keInfo: () => void;
  notifikasi?: React.ReactNode;
};

export function Beranda({ paket, saya, sekarang, keKartu, keJadwal, keInfo, notifikasi }: Props) {
  const { trip, agenda } = paket;
  // Pengumuman publik dan pesan pribadi peserta ini, terbaru di atas.
  const pengumuman = [
    ...paket.pengumuman.map((p) => ({ ...p, pribadi: false })),
    ...(saya?.pesan ?? []).map((p) => ({ ...p, pribadi: true })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const f = fase(trip.mulai, trip.selesai, trip.zona, sekarang);
  const { sedang, berikut } = statusAgenda(agenda, sekarang);
  const bahasa = useBahasa();
  const t = kamus(bahasa);
  const tr = useTerjemahan(
    [...pengumuman.map((p) => pisahDarurat(p.isi).isi), sedang?.judul ?? "", berikut?.judul ?? "", sedang?.lokasi ?? "", berikut?.lokasi ?? ""],
    bahasa === "en",
  );
  const nama = saya?.nama.split(" ")[0] ?? t("peserta");
  const teksFase =
    f.jenis === "sebelum" ? (f.angka === 1 ? t("berangkatBesok") : t("berangkatHari", { n: f.angka })) : f.jenis === "berlangsung" ? t("hariKe", { n: f.angka }) : t("selesaiTrip");

  // Tautan cepat: WhatsApp panitia dan petunjuk arah ke titik kumpul.
  const tanyaPanitia = waLink(trip.wa_panitia, `Halo panitia ${trip.nama}, saya ${saya?.nama ?? "peserta"}. Saya mau bertanya: `);
  const arah = trip.maps_url ?? (trip.titik_kumpul ? `https://maps.google.com/?q=${encodeURIComponent(trip.titik_kumpul)}` : null);

  return (
    <div>
      <Hero trip={trip} sekarang={sekarang} tinggi="h-[21rem]">
        <p className="anim-naik text-sm font-semibold text-white/85">{t("halo", { nama })}</p>
        <h1 className="anim-naik mt-1 text-5xl font-extrabold tracking-tight drop-shadow-sm" style={{ animationDelay: "80ms" }}>{trip.tujuan}</h1>
        <p className="anim-naik mt-1 font-medium text-white/90" style={{ animationDelay: "140ms" }}>{trip.nama}</p>
        <div className="anim-naik mt-3 flex flex-wrap items-center gap-2" style={{ animationDelay: "200ms" }}>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold backdrop-blur-md">
            <IkonKalender className="h-4 w-4" /> {rentangTanggal(trip.mulai, trip.selesai)}
          </span>
        </div>
      </Hero>

      <div className="relative -mt-9 space-y-4 px-4 pb-4">
        {/* Status perjalanan: hitung mundur sebelum berangkat, lalu keterangan hari ke-n */}
        {f.jenis === "sebelum" ? (
          <div style={{ "--i": 0 } as React.CSSProperties}><HitungMundur trip={trip} agenda={agenda} /></div>
        ) : (
          <div style={{ "--i": 0 } as React.CSSProperties} className="rounded-3xl bg-white p-5 text-center shadow-[0_12px_30px_-12px_rgba(6,42,61,0.35)] ring-1 ring-black/5">
            <p className="text-lg font-bold text-laut-900">{teksFase}</p>
          </div>
        )}

        {/* Tindakan cepat */}
        <div style={{ "--i": 1 } as React.CSSProperties} className="grid grid-cols-3 gap-2 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-black/5">
          <AksiCepat label={t("aksiKartu")} onClick={keKartu} Ikon={IkonKartu} />
          <AksiCepat label={t("aksiJadwal")} onClick={keJadwal} Ikon={IkonKalender} />
          <AksiCepat label={t("aksiInfo")} onClick={keInfo} Ikon={IkonInfo} />
          <AksiBagikan trip={trip.nama} t={t} />
          {tanyaPanitia && <AksiTautan label={t("aksiPanitia")} href={tanyaPanitia} Ikon={IkonWa} warna="bg-emerald-600 text-white" />}
          {arah && <AksiTautan label={t("aksiArah")} href={arah} Ikon={IkonLokasi} />}
        </div>

        {/* Bus dan kamar */}
        {saya && (
          <button onClick={keKartu} style={{ "--i": 2 } as React.CSSProperties} className="grid w-full grid-cols-2 gap-3 text-left">
            {[
              { Ikon: IkonBus, label: t("bus"), nilai: saya.bus, warna: "text-laut-700" },
              { Ikon: IkonKasur, label: t("kamar"), nilai: saya.kamar, warna: "text-karang-600" },
            ].map(({ Ikon, label, nilai, warna }) => (
              <div key={label} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition active:scale-[0.98]">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${warna}`}><Ikon className="h-5 w-5" /></span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <p className={nilai ? "text-lg font-bold text-laut-950" : "mt-0.5 text-sm font-semibold text-slate-400"}>{nilai ?? t("menungguPanitia")}</p>
              </div>
            ))}
          </button>
        )}

        {/* Sedang berlangsung dan agenda berikutnya */}
        {(sedang || berikut) && (
          <button onClick={keJadwal} style={{ "--i": 3 } as React.CSSProperties} className="block w-full space-y-3 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5 transition active:scale-[0.99]">
            {sedang && (
              <div className="flex gap-3">
                <span className="anim-denyut mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{t("sedangBerlangsung")}</p>
                  <p className="text-lg font-bold text-laut-950">{tr(sedang.judul)}</p>
                  <p className="flex flex-wrap items-center gap-1 text-sm text-slate-500"><IkonJam className="h-4 w-4" /> {jamAcara(sedang.mulai, sedang, trip.zona)}{sedang.lokasi && <><span>·</span><IkonLokasi className="h-4 w-4" /> {sedang.lokasi}</>}</p>
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
                  <p className="text-xs font-bold uppercase tracking-wider text-laut-600">{t("agendaBerikut")}</p>
                  <p className="truncate text-base font-bold text-laut-950">{tr(berikut.judul)}</p>
                  <p className="truncate text-sm text-slate-500">{jamAcara(berikut.mulai, berikut, trip.zona)}{berikut.lokasi ? ` · ${berikut.lokasi}` : ""}</p>
                </div>
                <IkonPanah className="h-5 w-5 shrink-0 text-slate-300" />
              </div>
            )}
          </button>
        )}

        {notifikasi}

        {/* Pengumuman */}
        <div style={{ "--i": 4 } as React.CSSProperties} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="mb-3 flex items-center gap-2 font-bold text-laut-950">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-karang-600"><IkonToa className="h-4 w-4" /></span>
            {t("pengumuman")}
          </p>
          {pengumuman.length === 0 ? (
            <p className="text-sm text-slate-500">{t("belumPengumuman")}</p>
          ) : (
            <ul className="space-y-3">
              {pengumuman.map((p) => {
                const umur = sekarang - new Date(p.created_at).getTime();
                const baru = umur >= 0 && umur < 86400_000;
                return (
                  <li key={p.id} className={`relative rounded-2xl p-4 ${p.pribadi ? "bg-karang-500/10 ring-1 ring-karang-500/30" : baru ? "bg-mentari-400/15 ring-1 ring-mentari-400/50" : "bg-pasir-50"}`}>
                    <p className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                      {p.pribadi && <span className="rounded-full bg-karang-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{t("untukAnda")}</span>}
                      {relatif(p.created_at)}
                      {baru && <span className="rounded-full bg-karang-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{t("baru")}</span>}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-slate-800">{tr(pisahDarurat(p.isi).isi)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div style={{ "--i": 5 } as React.CSSProperties}>
          <PasangAplikasi />
        </div>
      </div>
    </div>
  );
}

const AKSI = "flex flex-col items-center gap-1.5 rounded-2xl py-2.5 text-[11px] font-semibold text-laut-900 transition active:scale-95";
const LINGKARAN = "flex h-11 w-11 items-center justify-center rounded-2xl text-laut-700";

function AksiCepat({ label, onClick, Ikon }: { label: string; onClick: () => void; Ikon: typeof IkonKartu }) {
  return (
    <button onClick={onClick} className={AKSI}>
      <span className={LINGKARAN}><Ikon className="h-5 w-5" /></span>
      {label}
    </button>
  );
}

function AksiTautan({ label, href, Ikon, warna }: { label: string; href: string; Ikon: typeof IkonKartu; warna?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={AKSI}>
      <span className={warna ? `${LINGKARAN.replace("bg-laut-50 text-laut-700", "")} ${warna}` : LINGKARAN}><Ikon className="h-5 w-5" /></span>
      {label}
    </a>
  );
}

/** Bagikan tautan trip ke keluarga atau grup. Memakai menu bagikan HP bila ada, kalau tidak menyalin tautan. */
function AksiBagikan({ trip, t }: { trip: string; t: ReturnType<typeof kamus> }) {
  const [disalin, setDisalin] = useState(false);
  const bagikan = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: trip, text: `Info perjalanan ${trip}`, url });
        return;
      } catch {
        // Dibatalkan pengguna. Tidak perlu tindakan lain.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setDisalin(true);
      setTimeout(() => setDisalin(false), 2000);
    } catch {
      // Clipboard tidak tersedia (misalnya bukan HTTPS). Tombol tetap tidak menimbulkan error.
    }
  };
  return (
    <button onClick={bagikan} className={AKSI}>
      <span className={LINGKARAN}><IkonBagi className="h-5 w-5" /></span>
      {disalin ? t("tersalin") : t("bagikan")}
    </button>
  );
}
