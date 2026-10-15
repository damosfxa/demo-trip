"use client";

import { useState } from "react";
import { pesanError, supabase } from "@/lib/supabase";
import { TEMA } from "@/lib/tema";
import type { Isian, Tema, Trip, Zona } from "@/lib/types";
import { LABEL_ZONA } from "@/lib/waktu";
import type { PropsTab } from "./PanelTrip";
import { Kartu, Label, field, tombol } from "./ui";

// Daftar diisi satu baris per item supaya mudah untuk panitia (tanpa form bertingkat).
const baris = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);

// Isian tambahan ditulis satu per baris:  Label* | Pilihan A, Pilihan B   (bintang = wajib, tanpa pilihan = teks bebas).
const isianKeTeks = (list: Isian[]) => list.map((i) => `${i.label}${i.wajib ? "*" : ""}${i.pilihan.length ? ` | ${i.pilihan.join(", ")}` : ""}`).join("\n");

function teksKeIsian(teks: string, lama: Isian[]): Isian[] {
  const dipakai = new Set<string>();
  return baris(teks)
    .map((b) => {
      const [kiri, ...kanan] = b.split("|");
      const wajib = kiri.trim().endsWith("*");
      const label = kiri.replace(/\*\s*$/, "").trim();
      const pilihan = kanan.join("|").split(",").map((x) => x.trim()).filter(Boolean);
      // Pertahankan id lama untuk label yang sama, supaya jawaban peserta yang sudah ada tidak hilang.
      let id = lama.find((x) => x.label.toLowerCase() === label.toLowerCase())?.id ?? (label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "isian");
      while (dipakai.has(id)) id += "-2";
      dipakai.add(id);
      return { id, label, pilihan, wajib };
    })
    .filter((x) => x.label);
}

function keForm(t: Trip) {
  return {
    nama: t.nama,
    penyelenggara: t.penyelenggara ?? "",
    tujuan: t.tujuan,
    mulai: t.mulai,
    selesai: t.selesai,
    zona: t.zona,
    titik_kumpul: t.titik_kumpul ?? "",
    cover_url: t.cover_url ?? "",
    logo_url: t.logo_url ?? "",
    tema: t.tema,
    isian: isianKeTeks(t.isian),
    maps_url: t.maps_url ?? "",
    wa_panitia: t.wa_panitia ?? "",
    departemen: t.departemen.join("\n"),
    titik_absen: t.titik_absen.join("\n"),
    checklist: t.checklist.join("\n"),
    info: t.info.map((i) => `${i.judul}: ${i.isi}`).join("\n"),
    faq: t.faq.map((f) => `${f.q} | ${f.a}`).join("\n"),
    aktif: t.aktif,
    kapasitas_bus: String(t.kapasitas_bus ?? 40),
    kapasitas_kamar: String(t.kapasitas_kamar ?? 2),
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
    const kapBus = Number(f.kapasitas_bus);
    const kapKamar = Number(f.kapasitas_kamar);
    if (!Number.isInteger(kapBus) || kapBus < 1 || !Number.isInteger(kapKamar) || kapKamar < 1) return alert("Kapasitas bus dan kamar harus angka minimal 1.");
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
        cover_url: f.cover_url.trim() || null,
        logo_url: f.logo_url.trim() || null,
        tema: f.tema,
        isian: teksKeIsian(f.isian, data.trip.isian),
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
        kapasitas_bus: kapBus,
        kapasitas_kamar: kapKamar,
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
        <Label teks="Foto sampul (opsional)" catatan="Link gambar yang diawali https://. Kosongkan untuk memakai ilustrasi pemandangan bergerak."><input className={field} value={f.cover_url} onChange={set("cover_url")} placeholder="https://..." disabled={d} /></Label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={f.aktif} onChange={(e) => setF({ ...f, aktif: e.target.checked })} disabled={d} />
          Trip aktif (bisa dibuka dan registrasi)
        </label>
      </Kartu>

      <Kartu className="space-y-3">
        <p className="font-bold">Identitas agen</p>
        <Label teks="Logo agen (opsional)" catatan="Link gambar logo yang diawali https://. Tampil di sampul dan kartu peserta.">
          <input className={field} value={f.logo_url} onChange={set("logo_url")} placeholder="https://..." disabled={d} />
        </Label>
        <div className="space-y-1.5">
          <span className="text-sm font-semibold">Warna tema</span>
          <div className="grid grid-cols-5 gap-1">
            {(Object.keys(TEMA) as Tema[]).map((k) => (
              <button key={k} type="button" disabled={d} onClick={() => setF({ ...f, tema: k })} className={`flex flex-col items-center gap-1 rounded-xl p-2 text-xs font-semibold ${f.tema === k ? "bg-pasir-100 ring-2 ring-laut-700" : ""}`}>
                <span className="h-8 w-8 rounded-full" style={{ background: TEMA[k].palet[900], boxShadow: `inset 0 0 0 4px ${TEMA[k].palet[500]}` }} />
                {TEMA[k].nama}
              </button>
            ))}
          </div>
        </div>
      </Kartu>

      <Kartu className="space-y-3">
        <p className="font-bold">Kumpul & kontak</p>
        <Label teks="Titik kumpul"><input className={field} value={f.titik_kumpul} onChange={set("titik_kumpul")} disabled={d} /></Label>
        <Label teks="Link Google Maps" catatan="Buka lokasi di Google Maps, ketuk Bagikan, lalu salin link."><input className={field} value={f.maps_url} onChange={set("maps_url")} disabled={d} /></Label>
        <Label teks="WhatsApp panitia"><input className={field} value={f.wa_panitia} onChange={set("wa_panitia")} placeholder="08xxxxxxxxxx" inputMode="tel" disabled={d} /></Label>
      </Kartu>

      <Kartu className="space-y-3">
        <p className="font-bold">Isian dan absensi</p>
        <div className="grid grid-cols-2 gap-3">
          <Label teks="Kapasitas per bus (orang)"><input type="number" min={1} className={field} value={f.kapasitas_bus} onChange={set("kapasitas_bus")} disabled={d} /></Label>
          <Label teks="Kapasitas per kamar (orang)"><input type="number" min={1} className={field} value={f.kapasitas_kamar} onChange={set("kapasitas_kamar")} disabled={d} /></Label>
        </div>
        <Label teks="Isian registrasi tambahan" catatan="Satu per baris, format  Label* | Pilihan A, Pilihan B . Tanda * berarti wajib. Tanpa pilihan berarti isian teks bebas.">
          <textarea rows={4} className={field} value={f.isian} onChange={set("isian")} placeholder={"Ukuran kaos* | S, M, L, XL\nKontak darurat*\nAlergi makanan"} disabled={d} />
        </Label>
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
