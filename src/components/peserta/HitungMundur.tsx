"use client";

import { useDetik } from "@/lib/jam";
import { kamus, useBahasa } from "@/lib/bahasa";
import type { Agenda, Trip } from "@/lib/types";
import { KerangkaHitungMundur } from "../Kerangka";

/** Hitung mundur sampai acara pertama (atau tanggal mulai), berdetak tiap detik. */
export function HitungMundur({ trip, agenda }: { trip: Trip; agenda: Agenda[] }) {
  const sekarang = useDetik();
  const t = kamus(useBahasa());
  if (!sekarang) return <KerangkaHitungMundur />;

  const target = agenda[0] ? new Date(agenda[0].mulai).getTime() : Date.parse(`${trip.mulai}T00:00:00+07:00`);
  const sisa = Math.max(0, target - sekarang);
  if (sisa === 0) return null;

  const hari = Math.floor(sisa / 86400_000);
  const jam = Math.floor((sisa % 86400_000) / 3600_000);
  const menit = Math.floor((sisa % 3600_000) / 60_000);
  const detik = Math.floor((sisa % 60_000) / 1000);

  const kotak = [
    { n: hari, l: t("hitungHari") },
    { n: jam, l: t("hitungJam") },
    { n: menit, l: t("hitungMenit") },
    { n: detik, l: t("hitungDetik") },
  ];

  return (
    <div className="rounded-3xl bg-white p-4 shadow-[0_12px_30px_-12px_rgba(6,42,61,0.35)] ring-1 ring-black/5">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-laut-700">{t("menuju")}</p>
      <div className="grid grid-cols-4 gap-2">
        {kotak.map((k) => (
          <div key={k.l} className="rounded-2xl bg-laut-50 py-2.5 text-center">
            <p className="text-2xl font-extrabold tabular-nums text-laut-900">{String(k.n).padStart(2, "0")}</p>
            <p className="text-[11px] font-medium text-laut-700/80">{k.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
