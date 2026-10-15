"use client";

import { useState } from "react";
import { KartuCetak } from "./KartuCetak";
import { unduhCsv } from "@/lib/panitia";
import type { Peserta } from "@/lib/types";
import { rentangTanggal } from "@/lib/waktu";
import type { PropsTab } from "./PanelTrip";
import { Kartu, tombol, tombolGaris } from "./ui";

// Dokumen operasional agen: rooming list (untuk hotel) dan manifest bus (untuk sopir/koordinator bus).

type Jenis = "kamar" | "bus";
const KOSONG = "Belum diatur";

function kelompokkan(peserta: Peserta[], jenis: Jenis) {
  const grup = new Map<string, Peserta[]>();
  for (const p of peserta) {
    const k = (jenis === "kamar" ? p.kamar : p.bus) ?? KOSONG;
    if (!grup.has(k)) grup.set(k, []);
    grup.get(k)!.push(p);
  }
  // Urut alami (Bus 2 sebelum Bus 10), yang belum diatur di akhir.
  return [...grup.entries()]
    .sort(([a], [b]) => (a === KOSONG ? 1 : b === KOSONG ? -1 : a.localeCompare(b, "id", { numeric: true })))
    .map(([nama, isi]) => ({ nama, isi: isi.sort((x, y) => x.nama.localeCompare(y.nama, "id")) }));
}

export function TabDokumen({ data }: PropsTab) {
  const { trip, peserta } = data;
  const [jenis, setJenis] = useState<Jenis>("kamar");
  const [denganIsian, setDenganIsian] = useState(true);
  const [kartu, setKartu] = useState(false);
  const grup = kelompokkan(peserta, jenis);
  const judul = jenis === "kamar" ? "Rooming list" : "Manifest bus";
  const isian = denganIsian ? trip.isian : [];
  const belum = grup.find((g) => g.nama === KOSONG)?.isi.length ?? 0;

  const ekspor = () =>
    unduhCsv(`${jenis === "kamar" ? "rooming-list" : "manifest-bus"}-${trip.slug}.csv`, [
      [jenis === "kamar" ? "Kamar" : "Bus", "No", "Nama", "Departemen", "No HP", ...isian.map((i) => i.label)],
      ...grup.flatMap((g) => g.isi.map((p, i) => [g.nama, i + 1, p.nama, p.departemen, p.hp, ...isian.map((f) => p.isian?.[f.id] ?? "")])),
    ]);

  return (
    <div className="space-y-3">
      <Kartu className="space-y-3 print:hidden">
        <div className="flex gap-1 rounded-xl bg-pasir-100 p-1">
          {(["kamar", "bus"] as const).map((j) => (
            <button key={j} onClick={() => setJenis(j)} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${jenis === j ? "bg-laut-900 text-white" : "text-slate-500"}`}>
              {j === "kamar" ? "Rooming list (hotel)" : "Manifest bus"}
            </button>
          ))}
        </div>
        {trip.isian.length > 0 && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={denganIsian} onChange={(e) => setDenganIsian(e.target.checked)} />
            Sertakan isian tambahan ({trip.isian.map((i) => i.label).join(", ")})
          </label>
        )}
        {belum > 0 && <p className="rounded-xl bg-mentari-400/15 px-3 py-2 text-sm text-laut-950">{belum} peserta belum diatur {jenis}. Atur di tab Peserta.</p>}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => window.print()} className={tombol}>Cetak / simpan PDF</button>
          <button onClick={ekspor} className={tombolGaris}>Unduh Excel</button>
        </div>
        <button onClick={() => setKartu((k) => !k)} className={`${tombolGaris} w-full`}>{kartu ? "Kembali ke rooming list / manifest" : "Kartu peserta dengan QR (cetak)"}</button>
      </Kartu>

      {/* Dokumen yang dicetak. Di layar tampil sebagai pratinjau kertas. */}
      {kartu && <KartuCetak trip={trip} peserta={peserta} />}
      <div className={`cetak overflow-x-auto ${kartu ? "hidden" : ""} rounded-xl bg-white p-5 text-[13px] text-slate-900 shadow-sm ring-1 ring-black/5 print:rounded-none print:p-0 print:shadow-none print:ring-0`}>
        <header className="flex items-start justify-between gap-4 border-b-2 border-slate-900 pb-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{judul}</p>
            <p className="text-lg font-bold">{trip.nama}</p>
            <p className="text-slate-600">{trip.tujuan} · {rentangTanggal(trip.mulai, trip.selesai)}{trip.penyelenggara ? ` · ${trip.penyelenggara}` : ""}</p>
          </div>
          {trip.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={trip.logo_url} alt="" className="h-10 max-w-[8rem] object-contain" />
          )}
        </header>

        {grup.length === 0 && <p className="py-6 text-center text-slate-500">Belum ada peserta.</p>}

        {grup.map((g) => (
          <section key={g.nama} className="mt-4 break-inside-avoid">
            <p className="mb-1 font-bold">
              {jenis === "kamar" && g.nama !== KOSONG ? `Kamar ${g.nama}` : g.nama} <span className="font-normal text-slate-500">({g.isi.length} orang)</span>
            </p>
            <table className="w-full min-w-[34rem] border-collapse print:min-w-0">
              <thead>
                <tr className="border-b border-slate-300 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="w-8 py-1 pr-2">No</th>
                  <th className="py-1 pr-2">Nama</th>
                  <th className="py-1 pr-2">Departemen</th>
                  <th className="py-1 pr-2">No HP</th>
                  {isian.map((i) => <th key={i.id} className="py-1 pr-2">{i.label}</th>)}
                  {jenis === "bus" && <th className="w-14 py-1">Hadir</th>}
                </tr>
              </thead>
              <tbody>
                {g.isi.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-1.5 pr-2 text-slate-500">{i + 1}</td>
                    <td className="py-1.5 pr-2 font-medium">{p.nama}</td>
                    <td className="py-1.5 pr-2">{p.departemen}</td>
                    <td className="py-1.5 pr-2 tabular-nums">{p.hp}</td>
                    {isian.map((f) => <td key={f.id} className="py-1.5 pr-2">{p.isian?.[f.id] ?? ""}</td>)}
                    {jenis === "bus" && <td className="py-1.5"><span className="inline-block h-4 w-4 border border-slate-400" /></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        <p className="mt-6 text-[11px] text-slate-400">
          Total {peserta.length} peserta · dicetak {new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date())}
        </p>
      </div>
    </div>
  );
}
