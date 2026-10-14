"use client";

import { kunciCek } from "@/lib/data-peserta";
import { tulis, useSimpan } from "@/lib/simpan";
import type { Trip } from "@/lib/types";
import { waLink } from "@/lib/waktu";
import { IkonCentang, IkonLokasi, IkonWa } from "../Ikon";
import { PasangAplikasi } from "./PasangAplikasi";

export function InfoTrip({ trip, nama }: { trip: Trip; nama: string }) {
  const cek = useSimpan<number[]>(kunciCek(trip.slug)) ?? [];
  const toggle = (i: number) => tulis(kunciCek(trip.slug), cek.includes(i) ? cek.filter((x) => x !== i) : [...cek, i]);
  const wa = waLink(trip.wa_panitia, `Halo panitia ${trip.nama}, saya ${nama}. Saya mau bertanya: `);

  return (
    <div className="space-y-4">
      {/* Titik kumpul & kontak */}
      <div className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        {trip.titik_kumpul && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Titik kumpul</p>
            <p className="font-bold">{trip.titik_kumpul}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {trip.maps_url && (
            <a href={trip.maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-sky-50 py-3 text-sm font-bold text-sky-800">
              <IkonLokasi className="h-4 w-4" /> Buka peta
            </a>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white">
              <IkonWa className="h-4 w-4" /> Tanya panitia
            </a>
          )}
        </div>
      </div>

      {/* Info penting */}
      {trip.info.length > 0 && (
        <div className="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="font-bold">Info penting</p>
          {trip.info.map((i) => (
            <div key={i.judul} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-sky-800">{i.judul}</p>
              <p className="text-sm leading-relaxed text-slate-700">{i.isi}</p>
            </div>
          ))}
        </div>
      )}

      {/* Checklist barang bawaan */}
      {trip.checklist.length > 0 && (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold">Barang bawaan</p>
            <p className="text-sm font-semibold text-slate-500">{cek.length}/{trip.checklist.length}</p>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(cek.length / trip.checklist.length) * 100}%` }} />
          </div>
          <ul className="space-y-1">
            {trip.checklist.map((c, i) => {
              const ok = cek.includes(i);
              return (
                <li key={c}>
                  <button onClick={() => toggle(i)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-slate-50">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 ${ok ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>
                      {ok && <IkonCentang />}
                    </span>
                    <span className={ok ? "text-slate-400 line-through" : ""}>{c}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* FAQ */}
      {trip.faq.length > 0 && (
        <div className="space-y-2 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="font-bold">Pertanyaan yang sering ditanyakan</p>
          {trip.faq.map((f) => (
            <details key={f.q} className="group rounded-2xl bg-slate-50 px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                {f.q}
                <span className="text-slate-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      )}

      <PasangAplikasi />
    </div>
  );
}
