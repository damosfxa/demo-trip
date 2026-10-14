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

  useEffect(() => {
    let aktif = true;
    QRCode.toDataURL(link, { width: 800, margin: 2, color: { dark: "#0c4a6e", light: "#ffffff" } }).then((u) => aktif && setQr(u));
    return () => {
      aktif = false;
    };
  }, [link]);

  const per = trip.departemen.map((d) => ({ d, n: peserta.filter((p) => p.departemen === d).length }));
  const tanpaBus = peserta.filter((p) => !p.bus).length;
  const tanpaKamar = peserta.filter((p) => !p.kamar).length;
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
        {qr && (
          <div className="flex items-center gap-4 rounded-2xl bg-pasir-50 p-3">
            <img src={qr} alt="QR link peserta" className="h-24 w-24 rounded-lg bg-white" />
            <div className="text-sm">
              <p className="font-semibold">QR untuk poster atau slide</p>
              <p className="text-slate-500">Peserta cukup memindai untuk registrasi.</p>
              <a href={qr} download={`qr-${trip.slug}.png`} className="mt-1 inline-block font-semibold text-laut-700">Unduh QR</a>
            </div>
          </div>
        )}
      </Kartu>
    </div>
  );
}
