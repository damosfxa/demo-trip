"use client";

import { useMemo, useRef, useState } from "react";
import { normalisasiHp, bacaCsv } from "@/lib/impor";
import { linkPeserta, unduhCsv } from "@/lib/panitia";
import { pesanError, supabase } from "@/lib/supabase";
import type { Isian, Peserta } from "@/lib/types";
import { relatif, waLink } from "@/lib/waktu";
import { IkonWa } from "../Ikon";
import type { PropsTab } from "./PanelTrip";
import { Kartu, field, tombol, tombolGaris } from "./ui";

export function TabPeserta({ data, bisaUbah, muatUlang }: PropsTab) {
  const { trip, peserta, absen, pesan = [] } = data;
  const [cari, setCari] = useState("");
  const [dept, setDept] = useState("");
  const [buka, setBuka] = useState<string | null>(null);
  const [pilih, setPilih] = useState<Set<string>>(new Set());
  const [busMassal, setBusMassal] = useState("");
  const [kamarMassal, setKamarMassal] = useState("");
  const [proses, setProses] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const berkas = useRef<HTMLInputElement>(null);

  const q = cari.trim().toLowerCase();
  const tampil = peserta.filter((p) => (!dept || p.departemen === dept) && (!q || p.nama.toLowerCase().includes(q) || p.hp.includes(q) || (p.kamar ?? "").toLowerCase() === q));

  // Peserta yang namanya sama persis (tanpa memperhatikan huruf besar dan kecil), mungkin terdaftar dua kali.
  const ganda = useMemo(() => {
    const grup = new Map<string, Peserta[]>();
    for (const p of peserta) {
      const k = p.nama.trim().toLowerCase();
      grup.set(k, [...(grup.get(k) ?? []), p]);
    }
    return [...grup.values()].filter((g) => g.length > 1);
  }, [peserta]);

  const ekspor = () =>
    unduhCsv(`peserta-${trip.slug}.csv`, [
      ["Nama", "Departemen", "No HP", "Bus", "Kamar", ...trip.isian.map((i) => i.label), "Catatan panitia", ...trip.titik_absen, "Waktu daftar"],
      ...tampil.map((p) => [
        p.nama, p.departemen, p.hp, p.bus, p.kamar, ...trip.isian.map((i) => p.isian?.[i.id] ?? ""), p.catatan,
        ...trip.titik_absen.map((t) => (absen.some((a) => a.participant_id === p.id && a.titik === t) ? "Hadir" : "")),
        relatif(p.created_at),
      ]),
    ]);

  const togol = (id: string) => setPilih((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });

  const terapkanMassal = async () => {
    if (pilih.size === 0) return;
    const ubah: { bus?: string | null; kamar?: string | null } = {};
    if (busMassal.trim()) ubah.bus = busMassal.trim();
    if (kamarMassal.trim()) ubah.kamar = kamarMassal.trim();
    if (Object.keys(ubah).length === 0) return setInfo("Isi bus atau kamar dulu.");
    setProses(true);
    const { error } = await supabase.from("participants").update(ubah).in("id", [...pilih]);
    setProses(false);
    if (error) return setInfo(pesanError(error));
    setInfo(`Bus atau kamar diperbarui untuk ${pilih.size} peserta.`);
    setPilih(new Set());
    setBusMassal("");
    setKamarMassal("");
    muatUlang();
  };

  const gabung = async (grup: Peserta[]) => {
    const [simpan, ...buang] = [...grup].sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (!confirm(`Gabungkan ${grup.length} data "${simpan.nama}" menjadi satu? Absensi dan pesan pribadi dipindahkan ke data yang paling awal.`)) return;
    setProses(true);
    for (const d of buang) {
      // Absensi: pindahkan titik yang belum ada di data yang disimpan.
      const titikSimpan = new Set(absen.filter((a) => a.participant_id === simpan.id).map((a) => a.titik));
      const pindahAbsen = [...new Set(absen.filter((a) => a.participant_id === d.id).map((a) => a.titik))].filter((t) => !titikSimpan.has(t));
      if (pindahAbsen.length) await supabase.from("checkins").insert(pindahAbsen.map((t) => ({ trip_id: trip.id, participant_id: simpan.id, titik: t })));
      await supabase.from("checkins").delete().eq("participant_id", d.id);
      // Pesan pribadi: salin ke data yang disimpan, lalu hapus yang lama.
      const pesanD = pesan.filter((m) => m.participant_id === d.id);
      if (pesanD.length) await supabase.from("pesan_pribadi").insert(pesanD.map((m) => ({ trip_id: trip.id, participant_id: simpan.id, isi: m.isi })));
      await supabase.from("pesan_pribadi").delete().eq("participant_id", d.id);
      // Bus, kamar, dan catatan yang kosong di data yang disimpan diisi dari data ganda.
      const isiKosong: Record<string, string | null> = {};
      if (!simpan.bus && d.bus) isiKosong.bus = d.bus;
      if (!simpan.kamar && d.kamar) isiKosong.kamar = d.kamar;
      if (!simpan.catatan && d.catatan) isiKosong.catatan = d.catatan;
      if (Object.keys(isiKosong).length) await supabase.from("participants").update(isiKosong).eq("id", simpan.id);
      const { error } = await supabase.from("participants").delete().eq("id", d.id);
      if (error) {
        setProses(false);
        return setInfo(pesanError(error));
      }
    }
    setProses(false);
    setInfo(`${buang.length} data ganda digabungkan ke "${simpan.nama}".`);
    muatUlang();
  };

  const impor = async (berkasPilih: File) => {
    const teks = await berkasPilih.text();
    const [judul, ...isi] = bacaCsv(teks);
    if (!judul) return setInfo("Berkas kosong.");
    const kolom = judul.map((k) => k.toLowerCase());
    const at = (nama: string[]) => kolom.findIndex((k) => nama.includes(k));
    const iNama = at(["nama", "nama lengkap"]);
    const iDept = at(["departemen", "dept"]);
    const iHp = at(["no hp", "nomor hp", "hp", "no. hp"]);
    const iBus = at(["bus"]);
    const iKamar = at(["kamar"]);
    if (iNama < 0 || iDept < 0 || iHp < 0) return setInfo("Kolom wajib: Nama, Departemen, No HP. Simpan berkas sebagai CSV, lalu coba lagi.");
    setProses(true);
    let masuk = 0;
    const gagal: string[] = [];
    for (const [n, b] of isi.entries()) {
      const nama = (b[iNama] ?? "").trim();
      const hp = normalisasiHp(b[iHp] ?? "");
      const deptAsli = trip.departemen.find((d) => d.toLowerCase() === (b[iDept] ?? "").trim().toLowerCase());
      const baris = `Baris ${n + 2}`;
      if (nama.length < 2) { gagal.push(`${baris}: nama kosong`); continue; }
      if (!hp) { gagal.push(`${baris}: nomor HP tidak valid (${nama})`); continue; }
      if (!deptAsli) { gagal.push(`${baris}: departemen "${b[iDept] ?? ""}" tidak ada di trip ini (${nama})`); continue; }
      const { error } = await supabase.from("participants").insert({
        trip_id: trip.id,
        nama,
        departemen: deptAsli,
        hp,
        bus: iBus >= 0 ? (b[iBus] || null) : null,
        kamar: iKamar >= 0 ? (b[iKamar] || null) : null,
      });
      if (error) gagal.push(`${baris}: ${pesanError(error)} (${nama})`);
      else masuk++;
    }
    setProses(false);
    setInfo(`${masuk} peserta ditambahkan.${gagal.length ? ` ${gagal.length} baris dilewati: ${gagal.slice(0, 5).join("; ")}${gagal.length > 5 ? " ..." : ""}` : ""}`);
    if (berkas.current) berkas.current.value = "";
    muatUlang();
  };

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
        {bisaUbah && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => berkas.current?.click()} disabled={proses} className={tombolGaris}>Impor dari CSV</button>
            <input ref={berkas} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && impor(e.target.files[0])} />
            {ganda.length > 0 && <span className="self-center text-sm font-semibold text-amber-700">{ganda.length} nama ganda</span>}
          </div>
        )}
        {info && <p className="rounded-xl bg-laut-50 px-3 py-2 text-sm text-laut-900">{info}</p>}
        <p className="text-xs text-slate-500">{tampil.length} dari {peserta.length} peserta. Ketuk nama untuk mengatur bus dan kamar.</p>
      </Kartu>

      {bisaUbah && ganda.length > 0 && (
        <Kartu className="space-y-2 !p-4">
          <p className="text-sm font-bold">Nama yang terdaftar lebih dari sekali</p>
          {ganda.map((g) => (
            <div key={g[0].nama} className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-3 py-2 text-sm">
              <span className="min-w-0 truncate">{g[0].nama} · {g.length} data ({g.map((p) => p.hp).join(", ")})</span>
              <button onClick={() => gabung(g)} disabled={proses} className={`${tombolGaris} shrink-0 !py-1.5`}>Gabungkan</button>
            </div>
          ))}
        </Kartu>
      )}

      {bisaUbah && pilih.size > 0 && (
        <Kartu className="sticky top-2 z-20 space-y-2 !p-4 shadow-lg">
          <p className="text-sm font-bold">{pilih.size} peserta dipilih</p>
          <div className="grid grid-cols-2 gap-2">
            <input className={field} value={busMassal} onChange={(e) => setBusMassal(e.target.value)} placeholder="Bus (contoh: Bus 1)" />
            <input className={field} value={kamarMassal} onChange={(e) => setKamarMassal(e.target.value)} placeholder="Kamar (contoh: 201)" />
          </div>
          <div className="flex justify-between gap-2">
            <button onClick={() => setPilih(new Set())} className={tombolGaris}>Batal pilih</button>
            <button onClick={terapkanMassal} disabled={proses} className={tombol}>{proses ? "Menyimpan..." : "Terapkan"}</button>
          </div>
        </Kartu>
      )}

      {tampil.map((p) => (
        <BarisPeserta
          key={p.id}
          p={p}
          trip={trip}
          isianTrip={trip.isian}
          buka={buka === p.id}
          onBuka={() => setBuka(buka === p.id ? null : p.id)}
          bisaUbah={bisaUbah}
          muatUlang={muatUlang}
          hadir={absen.filter((a) => a.participant_id === p.id).length}
          totalTitik={trip.titik_absen.length}
          terpilih={pilih.has(p.id)}
          togol={() => togol(p.id)}
        />
      ))}
    </div>
  );
}

function BarisPeserta({ p, trip, isianTrip, buka, onBuka, bisaUbah, muatUlang, hadir, totalTitik, terpilih, togol }: { p: Peserta; trip: PropsTab["data"]["trip"]; isianTrip: Isian[]; buka: boolean; onBuka: () => void; bisaUbah: boolean; muatUlang: () => void; hadir: number; totalTitik: number; terpilih: boolean; togol: () => void }) {
  const [bus, setBus] = useState(p.bus ?? "");
  const [kamar, setKamar] = useState(p.kamar ?? "");
  const [catatan, setCatatan] = useState(p.catatan ?? "");
  const [proses, setProses] = useState(false);
  const wa = waLink(p.hp);
  const waKirimLink = waLink(p.hp, `Halo ${p.nama}, ini link info perjalanan ${trip.nama}. Silakan daftar atau buka di sini: ${linkPeserta(trip.slug)}`);

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
    <div className={`rounded-2xl bg-white shadow-sm ring-1 ${terpilih ? "ring-2 ring-laut-600" : "ring-black/5"}`}>
      <div className="flex items-center gap-3 p-4">
        {bisaUbah && (
          <input type="checkbox" checked={terpilih} onChange={togol} aria-label={`Pilih ${p.nama}`} className="h-5 w-5 shrink-0 accent-laut-700" />
        )}
        <button onClick={onBuka} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <p className="truncate font-semibold">{p.nama}</p>
            <p className="text-sm text-slate-500">{p.departemen} · {p.bus ?? "bus ?"} · kamar {p.kamar ?? "?"}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${hadir ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            {hadir}/{totalTitik} hadir
          </span>
        </button>
      </div>
      {buka && (
        <div className="space-y-2 border-t border-slate-100 p-4">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-slate-500">{p.hp}</span>
            <div className="flex gap-3">
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-semibold text-emerald-700"><IkonWa className="h-4 w-4" /> WhatsApp</a>}
              {waKirimLink && <a href={waKirimLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-laut-700">Kirim link</a>}
            </div>
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
