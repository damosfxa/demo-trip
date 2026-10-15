"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { linkPeserta } from "@/lib/panitia";
import type { PropsTab } from "./PanelTrip";
import { Angka, Batang, Kartu, tombol, tombolGaris } from "./ui";

export function Ringkasan({ data }: PropsTab) {
  const { trip, peserta, absen } = data;
  const link = linkPeserta(trip.slug);
  const [qr, setQr] = useState<string | null>(null);
  const [tersalin, setTersalin] = useState(false);
  const [salinRangkuman, setSalinRangkuman] = useState(false);

  useEffect(() => {
    let aktif = true;
    QRCode.toDataURL(link, { width: 800, margin: 2, color: { dark: "#0c4a6e", light: "#ffffff" } }).then((u) => aktif && setQr(u));
    return () => {
      aktif = false;
    };
  }, [link]);

  const per = trip.departemen.map((d) => ({ d, n: peserta.filter((p) => p.departemen === d).length }));
  const tanpaBus = peserta.filter((p) => !p.bus).length;
  // Peringatan kalau bus atau kamar sudah melebihi kapasitas yang diisi panitia.
  const kapBus = trip.kapasitas_bus ?? 40;
  const kapKamar = trip.kapasitas_kamar ?? 2;
  const jumlahBus = new Map<string, number>();
  const jumlahKamar = new Map<string, number>();
  for (const p of peserta) {
    if (p.bus) jumlahBus.set(p.bus, (jumlahBus.get(p.bus) ?? 0) + 1);
    if (p.kamar) jumlahKamar.set(p.kamar, (jumlahKamar.get(p.kamar) ?? 0) + 1);
  }
  const busPenuh = [...jumlahBus].filter(([, n]) => n > kapBus);
  const kamarPenuh = [...jumlahKamar].filter(([, n]) => n > kapKamar);
  const tanpaKamar = peserta.filter((p) => !p.kamar).length;
  // Rangkuman singkat untuk ditempel ke grup WhatsApp panitia.
  const rangkuman = [
    `Rangkuman ${trip.nama} (${new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: trip.zona })})`,
    `Terdaftar: ${peserta.length} peserta`,
    `Belum ada bus: ${peserta.filter((p) => !p.bus).length}, belum ada kamar: ${peserta.filter((p) => !p.kamar).length}`,
    "",
    "Kehadiran per titik:",
    ...trip.titik_absen.map((t) => `- ${t}: ${absen.filter((a) => a.titik === t).length} dari ${peserta.length}`),
  ].join("\n");
  const ajakan = `Halo peserta ${trip.nama}! Silakan registrasi dan lihat jadwal, kartu peserta, serta info perjalanan di sini:\n${link}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Kartu className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Terdaftar</p>
          <p className="text-4xl font-extrabold text-laut-900"><Angka nilai={peserta.length} /></p>
        </Kartu>
        <Kartu className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Belum ada bus / kamar</p>
          <p className="text-4xl font-extrabold text-karang-600"><Angka nilai={tanpaBus} /> <span className="text-xl text-slate-300">/</span> <Angka nilai={tanpaKamar} /></p>
        </Kartu>
      </div>

      {(busPenuh.length > 0 || kamarPenuh.length > 0) && (
        <Kartu className="space-y-2 !p-4 ring-amber-300">
          <p className="text-sm font-bold text-amber-800">Melebihi kapasitas</p>
          {busPenuh.map(([b, n]) => <p key={b} className="text-sm text-amber-900">{b}: {n} peserta (kapasitas {kapBus})</p>)}
          {kamarPenuh.map(([k, n]) => <p key={k} className="text-sm text-amber-900">Kamar {k}: {n} orang (kapasitas {kapKamar})</p>)}
        </Kartu>
      )}

      <Kartu className="space-y-3">
        <p className="font-bold">Kehadiran per titik absen</p>
        {trip.titik_absen.map((t) => (
          <Batang key={t} label={t} nilai={absen.filter((a) => a.titik === t).length} total={peserta.length} warna="bg-emerald-500" />
        ))}
      </Kartu>

      <Kartu className="space-y-3">
        <p className="font-bold">Peserta per departemen</p>
        {per.map((x) => <Batang key={x.d} label={x.d} nilai={x.n} total={peserta.length} />)}
      </Kartu>

      <Kartu className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-bold">Rangkuman untuk grup panitia</p>
          <button onClick={async () => { await navigator.clipboard.writeText(rangkuman); setSalinRangkuman(true); setTimeout(() => setSalinRangkuman(false), 1500); }} className={tombolGaris}>
            {salinRangkuman ? "Tersalin ✓" : "Salin rangkuman"}
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-xl bg-pasir-50 px-3 py-2 font-sans text-sm text-slate-700">{rangkuman}</pre>
      </Kartu>

      <Kartu className="space-y-3">
        <p className="font-bold">Bagikan ke peserta</p>
        <p className="break-all rounded-xl bg-pasir-50 px-3 py-2 font-mono text-sm">{link}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(link);
              setTersalin(true);
              setTimeout(() => setTersalin(false), 1500);
            }}
            className={tombolGaris}
          >
            {tersalin ? "Tersalin ✓" : "Salin link"}
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(ajakan)}`} target="_blank" rel="noopener noreferrer" className={`${tombol} bg-emerald-600 text-center hover:bg-emerald-700`}>
            Kirim ke grup WA
          </a>
        </div>
        {(
          <div className="flex items-center gap-4 rounded-2xl bg-pasir-50 p-3">
            {qr ? <img src={qr} alt="QR link peserta" className="h-24 w-24 rounded-lg bg-white" /> : <span className="kerangka block h-24 w-24 rounded-lg" />}
            <div className="text-sm">
              <p className="font-semibold">QR untuk poster atau slide</p>
              <p className="text-slate-500">Peserta cukup memindai untuk registrasi.</p>
              <a href={qr ?? "#"} download={`qr-${trip.slug}.png`} className="mt-1 inline-block font-semibold text-laut-700">Unduh QR</a>
            </div>
          </div>
        )}
      </Kartu>
    </div>
  );
}
