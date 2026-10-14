"use client";

import { useState } from "react";
import { pesanError, supabase } from "@/lib/supabase";
import type { Trip, Zona } from "@/lib/types";
import { LABEL_ZONA } from "@/lib/waktu";
import type { PropsTab } from "./PanelTrip";
import { Kartu, Label, field, tombol } from "./ui";

// Daftar diisi satu baris per item supaya mudah untuk panitia (tanpa form bertingkat).
const baris = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);

function keForm(t: Trip) {
  return {
    nama: t.nama,
    penyelenggara: t.penyelenggara ?? "",
    tujuan: t.tujuan,
    mulai: t.mulai,
    selesai: t.selesai,
    zona: t.zona,
    titik_kumpul: t.titik_kumpul ?? "",
    maps_url: t.maps_url ?? "",
    wa_panitia: t.wa_panitia ?? "",
    departemen: t.departemen.join("\n"),
    titik_absen: t.titik_absen.join("\n"),
    checklist: t.checklist.join("\n"),
    info: t.info.map((i) => `${i.judul}: ${i.isi}`).join("\n"),
    faq: t.faq.map((f) => `${f.q} | ${f.a}`).join("\n"),
    aktif: t.aktif,
  };
}

export function TabPengaturan({ data, bisaUbah, muatUlang }: PropsTab) {
  const [f, setF] = useState(() => keForm(data.trip));
  const [proses, setProses] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.selesai < f.mulai) return alert("Tanggal selesai tidak boleh sebelum tanggal mulai.");
    const departemen = baris(f.departemen);
    const titik = baris(f.titik_absen);
    if (!departemen.length || !titik.length) return alert("Departemen dan titik absen minimal satu.");
    setProses(true);
    const { error } = await supabase
      .from("trips")
      .update({
        nama: f.nama.trim(),
        penyelenggara: f.penyelenggara.trim() || null,
        tujuan: f.tujuan.trim(),
        mulai: f.mulai,
        selesai: f.selesai,
        zona: f.zona,
        titik_kumpul: f.titik_kumpul.trim() || null,
        maps_url: f.maps_url.trim() || null,
        wa_panitia: f.wa_panitia.replace(/\D/g, "") || null,
        departemen,
        titik_absen: titik,
        checklist: baris(f.checklist),
        info: baris(f.info).map((x) => {
          const i = x.indexOf(":");
          return i > 0 ? { judul: x.slice(0, i).trim(), isi: x.slice(i + 1).trim() } : { judul: "Info", isi: x };
        }),
        faq: baris(f.faq).map((x) => {
          const [q, ...a] = x.split("|");
          return { q: q.trim(), a: a.join("|").trim() };
        }).filter((x) => x.q && x.a),
        aktif: f.aktif,
      })
      .eq("id", data.trip.id);
    setProses(false);
    if (error) return alert(pesanError(error));
    setTersimpan(true);
    setTimeout(() => setTersimpan(false), 2000);
    muatUlang();
  };

  const d = !bisaUbah;
  return (
    <form onSubmit={simpan} className="space-y-3">
      <Kartu className="space-y-3">
        <p className="font-bold">Acara</p>
        <Label teks="Nama acara"><input className={field} value={f.nama} onChange={set("nama")} disabled={d} /></Label>
        <Label teks="Penyelenggara"><input className={field} value={f.penyelenggara} onChange={set("penyelenggara")} disabled={d} /></Label>
        <Label teks="Tujuan"><input className={field} value={f.tujuan} onChange={set("tujuan")} disabled={d} /></Label>
        <div className="grid grid-cols-2 gap-3">
          <Label teks="Mulai"><input type="date" className={field} value={f.mulai} onChange={set("mulai")} disabled={d} /></Label>
          <Label teks="Selesai"><input type="date" className={field} value={f.selesai} onChange={set("selesai")} disabled={d} /></Label>
        </div>
        <Label teks="Zona waktu lokasi">
          <select className={field} value={f.zona} onChange={(e) => setF({ ...f, zona: e.target.value as Zona })} disabled={d}>
            {(Object.keys(LABEL_ZONA) as Zona[]).map((z) => <option key={z} value={z}>{LABEL_ZONA[z]}</option>)}
          </select>
        </Label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={f.aktif} onChange={(e) => setF({ ...f, aktif: e.target.checked })} disabled={d} />
          Trip aktif (bisa dibuka dan registrasi)
        </label>
      </Kartu>

      <Kartu className="space-y-3">
        <p className="font-bold">Kumpul & kontak</p>
        <Label teks="Titik kumpul"><input className={field} value={f.titik_kumpul} onChange={set("titik_kumpul")} disabled={d} /></Label>
        <Label teks="Link Google Maps" catatan="Buka lokasi di Google Maps, ketuk Bagikan, lalu salin link."><input className={field} value={f.maps_url} onChange={set("maps_url")} disabled={d} /></Label>
        <Label teks="WhatsApp panitia"><input className={field} value={f.wa_panitia} onChange={set("wa_panitia")} placeholder="08xxxxxxxxxx" inputMode="tel" disabled={d} /></Label>
      </Kartu>

      <Kartu className="space-y-3">
        <p className="font-bold">Isian dan absensi</p>
        <Label teks="Pilihan departemen" catatan="Satu baris satu pilihan."><textarea rows={5} className={field} value={f.departemen} onChange={set("departemen")} disabled={d} /></Label>
        <Label teks="Titik absen" catatan="Tempat panitia scan kartu peserta, satu per baris."><textarea rows={4} className={field} value={f.titik_absen} onChange={set("titik_absen")} disabled={d} /></Label>
      </Kartu>

      <Kartu className="space-y-3">
        <p className="font-bold">Isi halaman Info</p>
        <Label teks="Info penting" catatan="Satu per baris, format  Judul: isi"><textarea rows={5} className={field} value={f.info} onChange={set("info")} disabled={d} /></Label>
        <Label teks="Barang bawaan" catatan="Satu barang per baris."><textarea rows={5} className={field} value={f.checklist} onChange={set("checklist")} disabled={d} /></Label>
        <Label teks="Tanya jawab" catatan="Satu per baris, format  Pertanyaan | Jawaban"><textarea rows={5} className={field} value={f.faq} onChange={set("faq")} disabled={d} /></Label>
      </Kartu>

      {bisaUbah && (
        <button disabled={proses} className={`${tombol} sticky bottom-4 w-full py-3 shadow-lg`}>
          {proses ? "Menyimpan..." : tersimpan ? "Tersimpan ✓" : "Simpan pengaturan"}
        </button>
      )}
    </form>
  );
}
