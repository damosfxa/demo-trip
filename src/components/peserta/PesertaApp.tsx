"use client";

import { useCallback, useEffect, useState } from "react";
import { SAYA_CONTOH } from "@/lib/contoh";
import { keluar, kunciToken, kunciTrip, muatSaya, muatTrip, type PaketTrip } from "@/lib/data-peserta";
import { useSekarang } from "@/lib/jam";
import { baca, tulis, useSimpan } from "@/lib/simpan";
import { gayaTema } from "@/lib/tema";
import type { DataSaya } from "@/lib/types";
import { IkonInfo, IkonKalender, IkonKartu, IkonLokasi, IkonRumah, IkonSinyal } from "../Ikon";
import { pisahDarurat } from "@/lib/darurat";
import { Beranda } from "./Beranda";
import { InfoTrip } from "./InfoTrip";
import { Jadwal } from "./Jadwal";
import { Kartu } from "./Kartu";
import { LayarMuat } from "./LayarMuat";
import { NyalakanNotifikasi, PopupKabar, type Kabar } from "./Notifikasi";
import { Registrasi } from "./Registrasi";

type Tab = "beranda" | "jadwal" | "kartu" | "info";
const KUNCI_GELAP = "infotrip:mode-gelap";
const TABS: { id: Tab; label: string; Ikon: typeof IkonRumah }[] = [
  { id: "beranda", label: "Beranda", Ikon: IkonRumah },
  { id: "jadwal", label: "Jadwal", Ikon: IkonKalender },
  { id: "kartu", label: "Kartu", Ikon: IkonKartu },
  { id: "info", label: "Info", Ikon: IkonInfo },
];

export function PesertaApp({ slug }: { slug: string }) {
  const token = useSimpan<string>(kunciToken(slug));
  // Salinan trip terakhir di HP ini (kosong di server, jadi tidak menimbulkan ketidakcocokan saat hydrate).
  const lama = useSimpan<PaketTrip>(kunciTrip(slug));
  const sekarang = useSekarang();
  const [paket, setPaket] = useState<PaketTrip | null>(null);
  const [saya, setSaya] = useState<DataSaya | null>(null);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("beranda");
  const [sudahPindah, setSudahPindah] = useState(false);
  const [muat, setMuat] = useState(0);
  const [kabar, setKabar] = useState<Kabar | null>(null);
  // Mode malam disimpan di HP ini saja.
  const gelap = useSimpan<boolean>(KUNCI_GELAP) === true;

  // Data trip (publik).
  useEffect(() => {
    let aktif = true;
    muatTrip(slug).then((r) => {
      if (!aktif) return;
      setPaket(r.data);
      setOffline(r.offline);
      setError(r.error);
    });
    return () => {
      aktif = false;
    };
  }, [slug, muat]);

  // Data peserta sendiri (perlu token dari registrasi).
  useEffect(() => {
    if (!token) return;
    let aktif = true;
    muatSaya(slug, token).then((r) => {
      if (!aktif) return;
      // Token tidak dikenal lagi (misalnya peserta dihapus panitia): kembali ke registrasi.
      if (!r.data && !r.error && !r.offline) keluar(slug);
      setSaya(r.data);
    });
    return () => {
      aktif = false;
    };
  }, [slug, token, muat]);

  // Muat ulang saat aplikasi dibuka kembali, supaya pengumuman terbaru langsung terlihat.
  const segarkan = useCallback(() => setMuat((x) => x + 1), []);
  useEffect(() => {
    const h = () => document.visibilityState === "visible" && segarkan();
    document.addEventListener("visibilitychange", h);
    window.addEventListener("online", segarkan);
    return () => {
      document.removeEventListener("visibilitychange", h);
      window.removeEventListener("online", segarkan);
    };
  }, [segarkan]);

  // Periksa kabar baru tiap 30 detik selama aplikasi terbuka.
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === "visible" && segarkan(), 30_000);
    return () => clearInterval(t);
  }, [segarkan]);

  // Kabar yang belum pernah dilihat di HP ini muncul sebagai pop-up. Pada pembukaan pertama,
  // semua kabar lama dianggap sudah dilihat supaya tidak muncul beruntun.
  useEffect(() => {
    if (!paket || !token) return;
    const semua: Kabar[] = [
      ...(saya?.pesan ?? []).map((p) => ({ id: p.id, jenis: "pribadi" as const, isi: p.isi, waktu: p.created_at })),
      ...paket.pengumuman.map((p) => ({ id: p.id, jenis: "publik" as const, isi: p.isi, waktu: p.created_at })),
    ].sort((a, b) => b.waktu.localeCompare(a.waktu));
    const kunci = `infotrip:dilihat:${slug}`;
    const dilihat = baca<string[]>(kunci);
    if (dilihat) {
      const baru = semua.filter((k) => !dilihat.includes(k.id));
      // Membaca localStorage (sistem eksternal) setelah data dimuat, jadi setState di effect memang disengaja.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (baru.length) setKabar(baru[0]);
    }
    tulis(kunci, semua.map((k) => k.id).slice(0, 200));
  }, [paket, saya, token, slug]);

  if (error && !paket) {
    return (
      <div className="px-6 pt-24 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-laut-100 text-laut-700"><IkonLokasi className="h-8 w-8" /></span>
        <p className="mt-4 text-xl font-extrabold text-laut-950">{error}</p>
        <p className="mt-1 text-slate-500">Periksa kembali link dari panitia.</p>
      </div>
    );
  }
  // Layar muat yang hidup selama data dimuat, dengan nama trip dari salinan terakhir di HP ini bila ada.
  if (!paket || token === undefined) {
    return <LayarMuat nama={lama?.trip.nama} tujuan={lama?.trip.tujuan} tema={lama?.trip.tema} />;
  }
  // Warna mengikuti tema agen yang dipilih panitia.
  if (!token) return <div className="anim-pudar" style={gayaTema(paket.trip.tema)}><Registrasi trip={paket.trip} /></div>;

  const pindah = (t: Tab) => {
    setTab(t);
    setSudahPindah(true);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className={`anim-pudar ${gelap ? "mode-gelap" : ""}`} style={gayaTema(paket.trip.tema)}>
      <Tampilan
        gelap={gelap}
        onGelap={() => tulis(KUNCI_GELAP, !gelap)}
        paket={paket}
        saya={saya}
        sekarang={sekarang}
        tab={tab}
        offline={offline}
        token={token}
        animasi={sudahPindah}
        onPindah={pindah}
        onSegarkan={segarkan}
        onKeluar={() => keluar(slug)}
        notifikasi={<NyalakanNotifikasi token={token} />}
      />
      <PopupKabar kabar={kabar} onTutup={() => setKabar(null)} onBuka={() => { setKabar(null); pindah("beranda"); }} />
    </div>
  );
}

type PropsTampilan = {
  paket: PaketTrip;
  saya: DataSaya | null;
  sekarang: number;
  tab: Tab;
  offline?: boolean;
  animasi?: boolean;
  onPindah?: (t: Tab) => void;
  onSegarkan?: () => void;
  token?: string;
  gelap?: boolean;
  onGelap?: () => void;
  onKeluar?: () => void;
  notifikasi?: React.ReactNode;
};

/** Tampilan aplikasi peserta. Dipakai untuk isi asli maupun skeleton (tanpa aksi). */
function Tampilan({ paket, saya, sekarang, tab, offline, animasi, onPindah = () => {}, onSegarkan, onKeluar, notifikasi, token, gelap, onGelap }: PropsTampilan) {
  const posisi = TABS.findIndex((t) => t.id === tab);
  // Pengumuman darurat terbaru tampil sebagai banner di atas, sampai panitia menggantinya.
  const darurat = paket.pengumuman
    .filter((p) => pisahDarurat(p.isi).darurat)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  return (
    <div className="pb-32">
      {offline && (
        <p className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-mentari-400 px-4 py-2 text-center text-xs font-bold text-laut-950">
          <IkonSinyal /> Sedang offline, menampilkan data terakhir
        </p>
      )}

      {darurat && (
        <div role="alert" className="anim-naik mx-4 mt-4 flex gap-3 rounded-2xl bg-karang-600 p-4 text-white shadow-lg shadow-karang-600/30">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-extrabold">!</span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-white/85">Pengumuman darurat</p>
            <p className="mt-0.5 whitespace-pre-line text-[15px] font-semibold leading-snug">{pisahDarurat(darurat.isi).isi}</p>
          </div>
        </div>
      )}

      <div key={tab} className={animasi ? "anim-geser" : ""}>
        {tab === "beranda" && <Beranda paket={paket} saya={saya} sekarang={sekarang} keKartu={() => onPindah("kartu")} keJadwal={() => onPindah("jadwal")} keInfo={() => onPindah("info")} notifikasi={notifikasi} />}
        {tab === "jadwal" && <Jadwal trip={paket.trip} agenda={paket.agenda} sekarang={sekarang} />}
        {tab === "kartu" &&
          (saya ? (
            <Kartu trip={paket.trip} saya={saya} />
          ) : (
            <div className="mode-kerangka" aria-busy="true"><Kartu trip={paket.trip} saya={SAYA_CONTOH} /></div>
          ))}
        {tab === "info" && <InfoTrip trip={paket.trip} nama={saya?.nama ?? ""} token={token} isianSaya={saya?.isian} onSegarkan={onSegarkan} gelap={gelap} onGelap={onGelap} />}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 px-4 text-sm">
        {saya && (
          <button onClick={onKeluar} className="text-slate-400">
            Bukan {saya.nama.split(" ")[0]}? Ganti peserta
          </button>
        )}
      </div>

      {/* Menu bawah dengan penanda yang bergeser */}
      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="relative mx-auto flex max-w-md rounded-3xl bg-laut-950/90 p-1.5 shadow-2xl shadow-laut-950/30 backdrop-blur-xl">
          <span
            className="absolute bottom-1.5 top-1.5 rounded-2xl bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ width: `calc((100% - 0.75rem) / ${TABS.length})`, transform: `translateX(${posisi * 100}%)` }}
          />
          {TABS.map(({ id, label, Ikon }) => (
            <button key={id} onClick={() => onPindah(id)} className={`relative z-10 flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors ${tab === id ? "text-white" : "text-white/55"}`}>
              <Ikon className={`h-[22px] w-[22px] transition-transform duration-300 ${tab === id ? "-translate-y-0.5 scale-110" : ""}`} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
