"use client";

import { kunciCek } from "@/lib/data-peserta";
import { tulis, useSimpan } from "@/lib/simpan";
import type { Trip } from "@/lib/types";
import { waLink } from "@/lib/waktu";
import { IkonCentang, IkonInfo, IkonKoper, IkonLokasi, IkonPanah, IkonTanya, IkonWa } from "../Ikon";
import { PasangAplikasi } from "./PasangAplikasi";

function Cincin({ nilai, total }: { nilai: number; total: number }) {
  const r = 22;
  const keliling = 2 * Math.PI * r;
  const persen = total ? nilai / total : 0;
  return (
    <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#e8f1f5" strokeWidth="6" />
      <circle cx="28" cy="28" r={r} fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeDasharray={keliling} strokeDashoffset={keliling * (1 - persen)} style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.2,0.8,0.2,1)" }} />
    </svg>
  );
}

export function InfoTrip({ trip, nama }: { trip: Trip; nama: string }) {
  const cek = useSimpan<number[]>(kunciCek(trip.slug)) ?? [];
  const toggle = (i: number) => tulis(kunciCek(trip.slug), cek.includes(i) ? cek.filter((x) => x !== i) : [...cek, i]);
  const wa = waLink(trip.wa_panitia, `Halo panitia ${trip.nama}, saya ${nama}. Saya mau bertanya: `);
  const peta = trip.titik_kumpul ? `https://maps.google.com/maps?q=${encodeURIComponent(trip.titik_kumpul)}&z=15&output=embed` : null;
  const lengkap = trip.checklist.length > 0 && cek.length === trip.checklist.length;

  return (
    <div className="bertahap space-y-4 px-4 pt-6">
      <div style={{ "--i": 0 } as React.CSSProperties}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-laut-600">{trip.tujuan}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-laut-950">Info perjalanan</h1>
      </div>

      {/* Titik kumpul dengan peta */}
      {trip.titik_kumpul && (
        <div style={{ "--i": 1 } as React.CSSProperties} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
          {peta && (
            <div className="relative h-44 bg-laut-50">
              <div className="kerangka absolute inset-0" />
              <iframe src={peta} title="Peta titik kumpul" loading="lazy" className="relative h-full w-full border-0 grayscale-[30%]" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
          <div className="p-5">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-laut-600"><IkonLokasi className="h-4 w-4" /> Titik kumpul</p>
            <p className="mt-1 text-lg font-bold text-laut-950">{trip.titik_kumpul}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {trip.maps_url && (
                <a href={trip.maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-laut-50 py-3 text-sm font-bold text-laut-800 transition active:scale-95">
                  <IkonLokasi className="h-4 w-4" /> Petunjuk arah
                </a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white transition active:scale-95">
                  <IkonWa className="h-4 w-4" /> Tanya panitia
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info penting */}
      {trip.info.length > 0 && (
        <div style={{ "--i": 2 } as React.CSSProperties} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="mb-3 flex items-center gap-2 font-bold text-laut-950">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-laut-100 text-laut-700"><IkonInfo className="h-4 w-4" /></span>
            Info penting
          </p>
          <div className="space-y-2.5">
            {trip.info.map((i) => (
              <div key={i.judul} className="rounded-2xl bg-pasir-50 p-4">
                <p className="text-sm font-bold text-laut-800">{i.judul}</p>
                <p className="mt-0.5 text-[15px] leading-relaxed text-slate-700">{i.isi}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barang bawaan */}
      {trip.checklist.length > 0 && (
        <div style={{ "--i": 3 } as React.CSSProperties} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="flex items-center gap-2 font-bold text-laut-950">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-pasir-200 text-karang-600"><IkonKoper className="h-4 w-4" /></span>
                Barang bawaan
              </p>
              <p className="mt-1 text-sm text-slate-500">{lengkap ? "Semua siap. Selamat jalan!" : `${trip.checklist.length - cek.length} barang lagi`}</p>
            </div>
            <div className="relative">
              <Cincin nilai={cek.length} total={trip.checklist.length} />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-laut-900">{cek.length}/{trip.checklist.length}</span>
            </div>
          </div>
          <ul className="divide-y divide-slate-100">
            {trip.checklist.map((c, i) => {
              const ok = cek.includes(i);
              return (
                <li key={c}>
                  <button onClick={() => toggle(i)} className="flex w-full items-center gap-3 py-3 text-left">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 transition ${ok ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>
                      {ok && <IkonCentang className="anim-pop h-4 w-4" />}
                    </span>
                    <span className={`transition ${ok ? "text-slate-400 line-through" : "text-slate-800"}`}>{c}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Tanya jawab */}
      {trip.faq.length > 0 && (
        <div style={{ "--i": 4 } as React.CSSProperties} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="mb-2 flex items-center gap-2 font-bold text-laut-950">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-laut-100 text-laut-700"><IkonTanya className="h-4 w-4" /></span>
            Tanya jawab
          </p>
          {trip.faq.map((f) => (
            <details key={f.q} className="group border-b border-slate-100 last:border-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 font-semibold text-slate-800">
                {f.q}
                <IkonPanah className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-90" />
              </summary>
              <p className="anim-pudar pb-4 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      )}

      <div style={{ "--i": 5 } as React.CSSProperties}>
        <PasangAplikasi />
      </div>
    </div>
  );
}
