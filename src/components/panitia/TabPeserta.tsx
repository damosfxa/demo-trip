"use client";

import { useState } from "react";
import { unduhCsv } from "@/lib/panitia";
import { pesanError, supabase } from "@/lib/supabase";
import type { Isian, Peserta } from "@/lib/types";
import { relatif, waLink } from "@/lib/waktu";
import { IkonWa } from "../Ikon";
import type { PropsTab } from "./PanelTrip";
import { Kartu, field, tombol, tombolGaris } from "./ui";

export function TabPeserta({ data, bisaUbah, muatUlang }: PropsTab) {
  const { trip, peserta, absen } = data;
  const [cari, setCari] = useState("");
  const [dept, setDept] = useState("");
  const [buka, setBuka] = useState<string | null>(null);

  const q = cari.trim().toLowerCase();
  const tampil = peserta.filter((p) => (!dept || p.departemen === dept) && (!q || p.nama.toLowerCase().includes(q) || p.hp.includes(q) || (p.kamar ?? "").toLowerCase() === q));

  const ekspor = () =>
    unduhCsv(`peserta-${trip.slug}.csv`, [
      ["Nama", "Departemen", "No HP", "Bus", "Kamar", ...trip.isian.map((i) => i.label), "Catatan panitia", ...trip.titik_absen, "Waktu daftar"],
      ...tampil.map((p) => [
        p.nama, p.departemen, p.hp, p.bus, p.kamar, ...trip.isian.map((i) => p.isian?.[i.id] ?? ""), p.catatan,
        ...trip.titik_absen.map((t) => (absen.some((a) => a.participant_id === p.id && a.titik === t) ? "Hadir" : "")),
        relatif(p.created_at),
      ]),
    ]);

  return (
    <div className="space-y-3">
      <Kartu className="space-y-2 !p-4">
        <input className={field} value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama, nomor HP, atau nomor kamar" />
        <div className="flex gap-2">
          <select className={field} value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">Semua departemen</option>
            {trip.departemen.map((d) => <option key={d}>{d}</option>)}
          </select>
          <button onClick={ekspor} className={`${tombol} shrink-0 bg-emerald-600 hover:bg-emerald-700`}>Unduh Excel</button>
        </div>
        <p className="text-xs text-slate-500">{tampil.length} dari {peserta.length} peserta. Ketuk nama untuk mengatur bus dan kamar.</p>
      </Kartu>

      {tampil.map((p) => (
        <BarisPeserta key={p.id} p={p} isianTrip={trip.isian} buka={buka === p.id} onBuka={() => setBuka(buka === p.id ? null : p.id)} bisaUbah={bisaUbah} muatUlang={muatUlang} hadir={absen.filter((a) => a.participant_id === p.id).length} totalTitik={trip.titik_absen.length} />
      ))}
    </div>
  );
}

function BarisPeserta({ p, isianTrip, buka, onBuka, bisaUbah, muatUlang, hadir, totalTitik }: { p: Peserta; isianTrip: Isian[]; buka: boolean; onBuka: () => void; bisaUbah: boolean; muatUlang: () => void; hadir: number; totalTitik: number }) {
  const [bus, setBus] = useState(p.bus ?? "");
  const [kamar, setKamar] = useState(p.kamar ?? "");
  const [catatan, setCatatan] = useState(p.catatan ?? "");
  const [proses, setProses] = useState(false);
  const wa = waLink(p.hp);

  const simpan = async () => {
    setProses(true);
    const { error } = await supabase.from("participants").update({ bus: bus.trim() || null, kamar: kamar.trim() || null, catatan: catatan.trim() || null }).eq("id", p.id);
    setProses(false);
    if (error) return alert(pesanError(error));
    onBuka();
    muatUlang();
  };

  const hapus = async () => {
    if (!confirm(`Hapus ${p.nama} dari daftar peserta? Data absensinya ikut terhapus.`)) return;
    const { error } = await supabase.from("participants").delete().eq("id", p.id);
    if (error) return alert(pesanError(error));
    muatUlang();
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <button onClick={onBuka} className="flex w-full items-center justify-between gap-3 p-4 text-left">
        <div className="min-w-0">
          <p className="truncate font-semibold">{p.nama}</p>
          <p className="text-sm text-slate-500">{p.departemen} · {p.bus ?? "bus ?"} · kamar {p.kamar ?? "?"}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${hadir ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {hadir}/{totalTitik} hadir
        </span>
      </button>
      {buka && (
        <div className="space-y-2 border-t border-slate-100 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{p.hp}</span>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-semibold text-emerald-700"><IkonWa className="h-4 w-4" /> WhatsApp</a>}
          </div>
          {isianTrip.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-xl bg-pasir-50 p-3 text-sm">
              {isianTrip.map((i) => (
                <div key={i.id} className="min-w-0">
                  <dt className="truncate text-xs text-slate-500">{i.label}</dt>
                  <dd className="font-semibold text-laut-950">{p.isian?.[i.id] || "-"}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="grid grid-cols-2 gap-2">
            <input className={field} value={bus} onChange={(e) => setBus(e.target.value)} placeholder="Bus (contoh: Bus 1)" disabled={!bisaUbah} />
            <input className={field} value={kamar} onChange={(e) => setKamar(e.target.value)} placeholder="Kamar (contoh: 201)" disabled={!bisaUbah} />
          </div>
          <input className={field} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan panitia (alergi, ukuran kaos, dll)" disabled={!bisaUbah} />
          {bisaUbah && (
            <div className="flex justify-between gap-2">
              <button onClick={hapus} className="text-sm font-semibold text-red-600">Hapus</button>
              <div className="flex gap-2">
                <button onClick={onBuka} className={tombolGaris}>Batal</button>
                <button onClick={simpan} disabled={proses} className={tombol}>{proses ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
