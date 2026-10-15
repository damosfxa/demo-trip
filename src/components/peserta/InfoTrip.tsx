"use client";

import { useState } from "react";
import { kunciCek } from "@/lib/data-peserta";
import { tulis, useSimpan } from "@/lib/simpan";
import type { Trip } from "@/lib/types";
import { waLink } from "@/lib/waktu";
import { IkonCentang, IkonInfo, IkonKoper, IkonLokasi, IkonPanah, IkonSalin, IkonTanya, IkonWa } from "../Ikon";

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

/** Tombol salin kecil. Menampilkan "Tersalin" sebentar setelah berhasil. */
function TombolSalin({ teks }: { teks: string }) {
  const [ok, setOk] = useState(false);
  const salin = async () => {
    try {
      await navigator.clipboard.writeText(teks);
      setOk(true);
      setTimeout(() => setOk(false), 1600);
    } catch {
      // Clipboard tidak tersedia. Tidak ada tindakan lain.
    }
  };
  return (
    <button onClick={salin} className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-laut-800 shadow-sm ring-1 ring-black/5 transition active:scale-95">
      <IkonSalin className="h-3.5 w-3.5" /> {ok ? "Tersalin" : "Salin"}
    </button>
  );
}

export function InfoTrip({ trip, nama }: { trip: Trip; nama: string }) {
  const cek = useSimpan<number[]>(kunciCek(trip.slug)) ?? [];
  const [baruDicentang, setBaruDicentang] = useState<number | null>(null);
  const [cari, setCari] = useState("");
  const toggle = (i: number) => {
    setBaruDicentang(cek.includes(i) ? null : i);
    tulis(kunciCek(trip.slug), cek.includes(i) ? cek.filter((x) => x !== i) : [...cek, i]);
  };
  const wa = waLink(trip.wa_panitia, `Halo panitia ${trip.nama}, saya ${nama}. Saya mau bertanya: `);
  const peta = trip.titik_kumpul ? `https://maps.google.com/maps?q=${encodeURIComponent(trip.titik_kumpul)}&z=15&output=embed` : null;
  const lengkap = trip.checklist.length > 0 && cek.length === trip.checklist.length;

  // Pencarian menyaring info, barang bawaan, dan tanya jawab sekaligus.
  const q = cari.trim().toLowerCase();
  const cocok = (...teks: string[]) => !q || teks.some((t) => t.toLowerCase().includes(q));
  const infoTampil = trip.info.filter((i) => cocok(i.judul, i.isi));
  const checklistTampil = trip.checklist.map((c, i) => ({ c, i })).filter(({ c }) => cocok(c));
  const faqTampil = trip.faq.filter((f) => cocok(f.q, f.a));
  const adaHasil = infoTampil.length + checklistTampil.length + faqTampil.length > 0;

  return (
    <div className="space-y-4 px-4 pt-6">
      <div style={{ "--i": 0 } as React.CSSProperties}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-laut-600">{trip.tujuan}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-laut-950">Info perjalanan</h1>
      </div>

      {(trip.info.length > 0 || trip.checklist.length > 0 || trip.faq.length > 0) && (
        <label style={{ "--i": 0 } as React.CSSProperties} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
          <span className="text-slate-400" aria-hidden>
            <IkonTanya className="h-4 w-4" />
          </span>
          <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari info, barang, atau pertanyaan" className="min-w-0 flex-1 bg-transparent text-[15px] text-laut-950 outline-none placeholder:text-slate-400" />
          {cari && (
            <button onClick={() => setCari("")} className="text-xs font-bold text-laut-700">Hapus</button>
          )}
        </label>
      )}

      {q && !adaHasil && <p className="rounded-3xl bg-white p-6 text-center text-slate-500 shadow-sm ring-1 ring-black/5">Tidak ada yang cocok dengan &ldquo;{cari}&rdquo;.</p>}

      {/* Titik kumpul dengan peta */}
      {trip.titik_kumpul && !q && (
        <div style={{ "--i": 1 } as React.CSSProperties} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
          {peta && (
            <div className="relative h-44 bg-laut-50">
              <div className="kerangka absolute inset-0" />
              <iframe src={peta} title="Peta titik kumpul" loading="lazy" className="relative h-full w-full border-0 grayscale-[30%]" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
          <div className="p-5">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-laut-600"><IkonLokasi className="h-4 w-4" /> Titik kumpul</p>
            <div className="mt-1 flex items-start justify-between gap-3">
              <p className="text-lg font-bold leading-snug text-laut-950">{trip.titik_kumpul}</p>
              <TombolSalin teks={trip.titik_kumpul} />
            </div>
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
      {infoTampil.length > 0 && (
        <div style={{ "--i": 2 } as React.CSSProperties} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="mb-3 flex items-center gap-2 font-bold text-laut-950">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-laut-100 text-laut-700"><IkonInfo className="h-4 w-4" /></span>
            Info penting
          </p>
          <div className="space-y-2.5">
            {infoTampil.map((i) => (
              <div key={i.judul} className="rounded-2xl bg-pasir-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-laut-800">{i.judul}</p>
                  <TombolSalin teks={i.isi} />
                </div>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{i.isi}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barang bawaan */}
      {checklistTampil.length > 0 && (
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
            {checklistTampil.map(({ c, i }) => {
              const ok = cek.includes(i);
              return (
                <li key={c}>
                  <button onClick={() => toggle(i)} className="flex w-full items-center gap-3 py-3 text-left">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 transition ${ok ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>
                      {ok && <IkonCentang className={`h-4 w-4 ${baruDicentang === i ? "anim-pop" : ""}`} />}
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
      {faqTampil.length > 0 && (
        <div style={{ "--i": 4 } as React.CSSProperties} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="mb-2 flex items-center gap-2 font-bold text-laut-950">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-laut-100 text-laut-700"><IkonTanya className="h-4 w-4" /></span>
            Tanya jawab
          </p>
          {faqTampil.map((f) => (
            <details key={f.q} open={!!q} className="group border-b border-slate-100 last:border-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 font-semibold text-slate-800">
                {f.q}
                <IkonPanah className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-90" />
              </summary>
              <p className="anim-pudar pb-4 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
