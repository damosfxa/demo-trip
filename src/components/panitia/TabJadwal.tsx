"use client";

import { useState } from "react";
import { jamAcara, perHari, zonaAcara } from "@/lib/agenda";
import { pesanError, supabase } from "@/lib/supabase";
import type { Agenda, Zona } from "@/lib/types";
import { keIso, LABEL_ZONA, pecahIso, tanggalPanjang } from "@/lib/waktu";
import type { PropsTab } from "./PanelTrip";
import { Kartu, Label, field, tombol, tombolGaris } from "./ui";

type Form = { tanggal: string; mulai: string; selesai: string; judul: string; lokasi: string; ket: string; zona: Zona };

export function TabJadwal({ data, bisaUbah, muatUlang }: PropsTab) {
  const { trip, agenda } = data;
  const kosong: Form = { tanggal: trip.mulai, mulai: "08:00", selesai: "", judul: "", lokasi: "", ket: "", zona: trip.zona };
  const [form, setForm] = useState<Form | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [proses, setProses] = useState(false);
  const z = form ? LABEL_ZONA[form.zona] : "";

  const ubah = (a: Agenda) => {
    const zona = zonaAcara(a, trip.zona);
    const m = pecahIso(a.mulai, zona);
    setEditId(a.id);
    setForm({ tanggal: m.tanggal, mulai: m.jam, selesai: a.selesai ? pecahIso(a.selesai, zona).jam : "", judul: a.judul, lokasi: a.lokasi ?? "", ket: a.ket ?? "", zona });
  };

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !form.judul.trim()) return alert("Judul wajib diisi.");
    setProses(true);
    const isi = {
      trip_id: trip.id,
      mulai: keIso(form.tanggal, form.mulai, form.zona),
      selesai: form.selesai ? keIso(form.tanggal, form.selesai, form.zona) : null,
      zona: form.zona === trip.zona ? null : form.zona,
      judul: form.judul.trim(),
      lokasi: form.lokasi.trim() || null,
      ket: form.ket.trim() || null,
    };
    const { error } = editId ? await supabase.from("agenda").update(isi).eq("id", editId) : await supabase.from("agenda").insert(isi);
    setProses(false);
    if (error) return alert(pesanError(error));
    setForm(null);
    setEditId(null);
    muatUlang();
  };

  const hapus = async (a: Agenda) => {
    if (!confirm(`Hapus "${a.judul}" dari jadwal?`)) return;
    const { error } = await supabase.from("agenda").delete().eq("id", a.id);
    if (error) return alert(pesanError(error));
    muatUlang();
  };

  return (
    <div className="space-y-3">
      {bisaUbah && !form && <button onClick={() => { setEditId(null); setForm(kosong); }} className={`${tombol} w-full py-3`}>+ Tambah acara</button>}

      {form && (
        <Kartu>
          <form onSubmit={simpan} className="space-y-3">
            <p className="font-bold">{editId ? "Ubah acara" : "Acara baru"}</p>
            <Label teks="Tanggal"><input type="date" className={field} value={form.tanggal} min={trip.mulai} max={trip.selesai} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} /></Label>
            <Label teks="Zona waktu acara" catatan="Ubah bila acara ini di kota dengan zona berbeda, misalnya berangkat dari Jakarta ke Bali.">
              <select className={field} value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value as Zona })}>
                {(Object.keys(LABEL_ZONA) as Zona[]).map((x) => <option key={x} value={x}>{LABEL_ZONA[x]}</option>)}
              </select>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Label teks={`Mulai (${z})`}><input type="time" className={field} value={form.mulai} onChange={(e) => setForm({ ...form, mulai: e.target.value })} /></Label>
              <Label teks={`Selesai (${z}, opsional)`}><input type="time" className={field} value={form.selesai} onChange={(e) => setForm({ ...form, selesai: e.target.value })} /></Label>
            </div>
            <Label teks="Acara"><input className={field} value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} placeholder="Contoh: Makan malam bersama" /></Label>
            <Label teks="Lokasi (opsional)"><input className={field} value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} /></Label>
            <Label teks="Keterangan (opsional)"><input className={field} value={form.ket} onChange={(e) => setForm({ ...form, ket: e.target.value })} placeholder="Contoh: Pakaian bebas rapi" /></Label>
            <div className="flex gap-2">
              <button disabled={proses} className={tombol}>{proses ? "Menyimpan..." : "Simpan"}</button>
              <button type="button" onClick={() => { setForm(null); setEditId(null); }} className={tombolGaris}>Batal</button>
            </div>
          </form>
        </Kartu>
      )}

      {perHari(agenda, trip.zona).map((h, i) => (
        <Kartu key={h.hari} className="!p-4">
          <p className="mb-2 font-bold capitalize">Hari {i + 1} · {tanggalPanjang(h.isi[0].mulai, zonaAcara(h.isi[0], trip.zona))}</p>
          <ul className="divide-y divide-slate-100">
            {h.isi.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-bold tabular-nums text-laut-800">{jamAcara(a.mulai, a, trip.zona)}{a.selesai ? ` sampai ${jamAcara(a.selesai, a, trip.zona)}` : ""}</p>
                  <p className="font-semibold">{a.judul}</p>
                  {(a.lokasi || a.ket) && <p className="text-sm text-slate-500">{[a.lokasi, a.ket].filter(Boolean).join(" · ")}</p>}
                </div>
                {bisaUbah && (
                  <div className="flex shrink-0 gap-3 text-sm font-semibold">
                    <button onClick={() => ubah(a)} className="text-laut-700">Ubah</button>
                    <button onClick={() => hapus(a)} className="text-red-600">Hapus</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Kartu>
      ))}
      {agenda.length === 0 && <p className="text-center text-sm text-slate-500">Jadwal belum diisi.</p>}
    </div>
  );
}
