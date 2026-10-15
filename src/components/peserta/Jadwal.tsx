"use client";

import { useState } from "react";
import { akhir, jamAcara, perHari, zonaAcara } from "@/lib/agenda";
import type { Agenda, Trip } from "@/lib/types";
import { kunciHari, tanggalPanjang } from "@/lib/waktu";
import { IkonKalender, IkonLokasi } from "../Ikon";
import { kamus, lokal, useBahasa } from "@/lib/bahasa";

// Format iCalendar (UTC, tanpa milidetik).
const stempel = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escIcs = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Unduh satu acara sebagai file kalender (.ics), bisa dibuka di kalender HP mana pun. */
function unduhIcs(a: Agenda, selesai: number, trip: Trip) {
  const teks = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Info Trip//ID",
    "BEGIN:VEVENT",
    `UID:${a.id}@infotrip`,
    `DTSTAMP:${stempel(new Date().toISOString())}`,
    `DTSTART:${stempel(a.mulai)}`,
    `DTEND:${stempel(new Date(selesai).toISOString())}`,
    `SUMMARY:${escIcs(a.judul)}`,
    `LOCATION:${escIcs(a.lokasi ?? trip.titik_kumpul ?? "")}`,
    `DESCRIPTION:${escIcs(`${trip.nama}${a.ket ? `\n${a.ket}` : ""}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([teks], { type: "text/calendar;charset=utf-8" }));
  const el = document.createElement("a");
  el.href = url;
  el.download = `${a.judul.replace(/[^\w\s-]/g, "").trim() || "agenda"}.ics`;
  el.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Jadwal({ trip, agenda, sekarang }: { trip: Trip; agenda: Agenda[]; sekarang: number }) {
  const t = kamus(useBahasa());
  const hari = perHari(agenda, trip.zona);
  const hariIni = sekarang ? kunciHari(new Date(sekarang).toISOString(), trip.zona) : "";
  const awal = Math.max(0, hari.findIndex((h) => h.hari === hariIni));
  const [pilih, setPilih] = useState<number | null>(null);
  const idx = pilih ?? awal;
  const h = hari[idx];

  return (
    <div className="px-4 pt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-laut-600">{trip.tujuan}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-laut-950">{t("jadwalJudul")}</h1>

      {!h ? (
        <p className="mt-6 rounded-3xl bg-white p-6 text-center text-slate-500">{t("jadwalBelum")}</p>
      ) : (
        <>
          {/* Pilihan hari, menempel di atas saat digulir */}
          <div className="sticky top-0 z-20 -mx-4 mt-4 bg-pasir-50/90 px-4 py-2 backdrop-blur-md">
            <div className="tanpa-scrollbar flex gap-2 overflow-x-auto">
              {hari.map((x, i) => {
                const z = zonaAcara(x.isi[0], trip.zona);
                const tgl = new Date(x.isi[0].mulai);
                return (
                  <button
                    key={x.hari}
                    onClick={() => setPilih(i)}
                    className={`flex min-w-[4.5rem] flex-col items-center rounded-2xl px-3 py-2 transition ${i === idx ? "bg-laut-900 text-white shadow-lg shadow-laut-900/25" : "bg-white text-slate-600 ring-1 ring-black/5"}`}
                  >
                    <span className="text-[11px] font-semibold uppercase opacity-75">{x.hari === hariIni ? t("hariIni") : t("hari", { n: i + 1 })}</span>
                    <span className="text-xl font-extrabold leading-tight">{new Intl.DateTimeFormat(lokal(), { day: "numeric", timeZone: z }).format(tgl)}</span>
                    <span className="text-[11px] font-medium opacity-75">{new Intl.DateTimeFormat(lokal(), { month: "short", timeZone: z }).format(tgl)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p key={`t${idx}`} className="mb-4 mt-3 text-sm font-semibold capitalize text-slate-500">{tanggalPanjang(h.isi[0].mulai, zonaAcara(h.isi[0], trip.zona))}</p>

          <ol key={idx} className="relative space-y-3 pb-4">
            {/* Garis waktu */}
            <span className="absolute bottom-6 left-[19px] top-4 w-0.5 rounded bg-laut-100" aria-hidden />
            {h.isi.map((a, i) => {
              const pos = agenda.indexOf(a);
              const m = new Date(a.mulai).getTime();
              const lewat = sekarang > 0 && akhir(agenda, pos) <= sekarang;
              const sedang = sekarang > 0 && m <= sekarang && sekarang < akhir(agenda, pos);
              return (
                <li key={a.id} style={{ "--i": i } as React.CSSProperties} className="relative flex gap-4">
                  <span
                    className={`relative z-10 mt-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-4 ring-pasir-50 ${
                      sedang ? "anim-denyut bg-emerald-500 text-white" : lewat ? "bg-slate-200 text-slate-500" : "bg-laut-900 text-white"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className={`flex-1 rounded-3xl bg-white p-4 shadow-sm ring-1 transition ${sedang ? "ring-2 ring-emerald-400" : "ring-black/5"} ${lewat ? "opacity-55" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold tabular-nums text-laut-700">
                        {jamAcara(a.mulai, a, trip.zona)}
                        {a.selesai && <span className="font-medium text-slate-400"> {t("sampai")} {jamAcara(a.selesai, a, trip.zona)}</span>}
                      </p>
                      {sedang && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">{t("sekarang")}</span>}
                    </div>
                    <p className="mt-0.5 text-[17px] font-bold text-laut-950">{a.judul}</p>
                    {a.lokasi && <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><IkonLokasi className="h-4 w-4 shrink-0" /> {a.lokasi}</p>}
                    {a.ket && <p className="mt-1 text-sm leading-relaxed text-slate-600">{a.ket}</p>}
                    <button onClick={() => unduhIcs(a, akhir(agenda, pos), trip)} className="mt-3 flex items-center gap-1.5 rounded-xl bg-laut-50 px-3 py-1.5 text-xs font-bold text-laut-800 transition active:scale-95">
                      <IkonKalender className="h-3.5 w-3.5" /> {t("tambahKalender")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
