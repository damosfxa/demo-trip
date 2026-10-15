"use client";

import { useState } from "react";
import { PENANDA_DARURAT, pisahDarurat } from "@/lib/darurat";
import { kirimNotifikasi, linkPeserta } from "@/lib/panitia";
import { pesanError, supabase } from "@/lib/supabase";
import { relatif } from "@/lib/waktu";
import type { PropsTab } from "./PanelTrip";
import { PengumumanTerjadwal } from "./PengumumanTerjadwal";
import { Kartu, field, tombol } from "./ui";

type Sasaran = "semua" | "satu";

export function TabPengumuman({ data, bisaUbah, muatUlang }: PropsTab) {
  const { trip, pengumuman, pesan = [], peserta, notifAktif = 0 } = data;
  const [isi, setIsi] = useState("");
  const [sasaran, setSasaran] = useState<Sasaran>("semua");
  const [pesertaId, setPesertaId] = useState("");
  const [notif, setNotif] = useState(true);
  const [darurat, setDarurat] = useState(false);
  const [proses, setProses] = useState(false);
  const [hasil, setHasil] = useState<string | null>(null);

  const namaPeserta = (id: string) => peserta.find((p) => p.id === id)?.nama ?? "peserta";

  const kirim = async () => {
    const teks = isi.trim();
    if (!teks) return;
    if (sasaran === "satu" && !pesertaId) return alert("Pilih peserta tujuan.");
    setProses(true);
    setHasil(null);
    const tampil = sasaran === "semua" && darurat ? PENANDA_DARURAT + teks : teks;
    const { error } =
      sasaran === "semua"
        ? await supabase.from("announcements").insert({ trip_id: trip.id, isi: tampil })
        : await supabase.from("pesan_pribadi").insert({ trip_id: trip.id, participant_id: pesertaId, isi: teks });
    if (error) {
      setProses(false);
      return alert(pesanError(error));
    }

    let info = sasaran === "semua" ? "Pengumuman tampil di aplikasi semua peserta." : `Pesan tampil di aplikasi ${namaPeserta(pesertaId)}.`;
    if (notif) {
      try {
        const r = await kirimNotifikasi({
          trip_id: trip.id,
          participant_id: sasaran === "satu" ? pesertaId : null,
          judul: sasaran === "semua" ? `Pengumuman ${trip.nama}` : `Pesan untuk Anda · ${trip.nama}`,
          isi: teks,
          url: `/?t=${trip.slug}`,
        });
        info += r.total ? ` Notifikasi HP terkirim ke ${r.terkirim} dari ${r.total} HP.` : " Belum ada HP yang menyalakan notifikasi.";
      } catch (e) {
        info += ` Notifikasi HP gagal: ${pesanError(e)}`;
      }
    }
    setProses(false);
    setHasil(info);
    setIsi("");
    setDarurat(false);
    muatUlang();
  };

  const hapus = async (tabel: "announcements" | "pesan_pribadi", id: string) => {
    if (!confirm("Hapus pesan ini dari aplikasi peserta?")) return;
    const { error } = await supabase.from(tabel).delete().eq("id", id);
    if (error) return alert(pesanError(error));
    muatUlang();
  };

  const daftar = [
    ...pengumuman.map((p) => ({ ...p, tabel: "announcements" as const, untuk: null as string | null })),
    ...pesan.map((p) => ({ ...p, tabel: "pesan_pribadi" as const, untuk: namaPeserta(p.participant_id ?? "") })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="space-y-3">
      {bisaUbah && (
        <Kartu className="space-y-3">
          <p className="font-bold">Kirim kabar ke peserta</p>
          <div className="flex gap-1 rounded-xl bg-pasir-100 p-1">
            {(["semua", "satu"] as const).map((s) => (
              <button key={s} onClick={() => setSasaran(s)} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${sasaran === s ? "bg-laut-900 text-white" : "text-slate-500"}`}>
                {s === "semua" ? "Semua peserta" : "Peserta tertentu"}
              </button>
            ))}
          </div>
          {sasaran === "satu" && (
            <select className={field} value={pesertaId} onChange={(e) => setPesertaId(e.target.value)}>
              <option value="">Pilih peserta</option>
              {peserta.map((p) => <option key={p.id} value={p.id}>{p.nama} · {p.departemen}</option>)}
            </select>
          )}
          <textarea rows={4} className={field} value={isi} onChange={(e) => setIsi(e.target.value)} placeholder={sasaran === "semua" ? "Contoh: Bus 2 berangkat 15 menit lebih awal. Kumpul di lobi jam 07.45." : "Contoh: Kartu identitas Anda tertinggal di meja registrasi, silakan ambil di panitia."} />
          {sasaran === "semua" && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={darurat} onChange={(e) => setDarurat(e.target.checked)} />
              Tandai darurat (tampil sebagai banner di atas aplikasi peserta)
            </label>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notif} onChange={(e) => setNotif(e.target.checked)} />
            Kirim juga sebagai notifikasi HP ({notifAktif} peserta sudah menyalakan notifikasi)
          </label>
          <div className="flex flex-wrap gap-2">
            <button onClick={kirim} disabled={proses || !isi.trim()} className={tombol}>{proses ? "Mengirim..." : sasaran === "semua" ? "Kirim ke semua" : "Kirim pesan pribadi"}</button>
            {sasaran === "semua" && isi.trim() && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`📢 ${trip.nama}\n\n${isi.trim()}\n\nInfo lengkap: ${linkPeserta(trip.slug)}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"
              >
                Teruskan ke grup WA
              </a>
            )}
          </div>
          {hasil && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{hasil}</p>}
        </Kartu>
      )}
      <PengumumanTerjadwal trip={trip} bisaUbah={bisaUbah} />
      {daftar.map((p) => (
        <Kartu key={p.id} className="!p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {p.untuk ? <span className="rounded-full bg-karang-600 px-2 py-0.5 font-bold text-white">Untuk {p.untuk}</span> : <span className="rounded-full bg-laut-100 px-2 py-0.5 font-bold text-laut-800">Semua peserta</span>}
              {relatif(p.created_at)}
            </p>
            {bisaUbah && <button onClick={() => hapus(p.tabel, p.id)} className="text-xs font-semibold text-red-600">Hapus</button>}
          </div>
          {pisahDarurat(p.isi).darurat && <span className="mt-1 inline-block rounded-full bg-karang-600 px-2 py-0.5 text-[11px] font-bold text-white">Darurat</span>}
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{pisahDarurat(p.isi).isi}</p>
        </Kartu>
      ))}
      {daftar.length === 0 && <p className="text-center text-sm text-slate-500">Belum ada pengumuman atau pesan.</p>}
    </div>
  );
}
