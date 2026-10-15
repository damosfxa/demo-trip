"use client";

import { useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import { pesanError, supabase } from "@/lib/supabase";
import type { Peserta } from "@/lib/types";
import { relatif } from "@/lib/waktu";
import type { PropsTab } from "./PanelTrip";
import { DaftarHadir } from "./DaftarHadir";
import { Kartu, field, tombol, tombolGaris } from "./ui";

type Hasil = { ok: boolean; judul: string; isi: string };

export function TabAbsensi({ data, bisaUbah, muatUlang }: PropsTab) {
  const { trip, peserta, absen } = data;
  const [titik, setTitik] = useState(trip.titik_absen[0] ?? "Titik kumpul");
  const [scan, setScan] = useState(false);
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [cari, setCari] = useState("");
  const [lihat, setLihat] = useState<"belum" | "hadir">("belum");
  const [cetak, setCetak] = useState(false);

  const hadirIds = new Set(absen.filter((a) => a.titik === titik).map((a) => a.participant_id));
  const hadir = peserta.filter((p) => hadirIds.has(p.id));
  const belum = peserta.filter((p) => !hadirIds.has(p.id));

  const absenkan = async (p: Peserta) => {
    if (hadirIds.has(p.id)) return setHasil({ ok: true, judul: `${p.nama} sudah absen`, isi: `Sudah tercatat di ${titik}.` });
    const { error } = await supabase.from("checkins").insert({ trip_id: trip.id, participant_id: p.id, titik });
    if (error) return setHasil({ ok: false, judul: "Gagal absen", isi: pesanError(error) });
    setHasil({ ok: true, judul: `✓ ${p.nama}`, isi: `${p.departemen} · ${p.bus ?? "bus belum diatur"} · kamar ${p.kamar ?? "belum diatur"}` });
    muatUlang();
  };

  const saatScan = (teks: string) => {
    const id = teks.startsWith("INFOTRIP:") ? teks.slice(9) : "";
    const p = peserta.find((x) => x.id === id);
    if (!p) return setHasil({ ok: false, judul: "QR tidak dikenal", isi: "Bukan kartu peserta trip ini." });
    absenkan(p);
  };

  const q = cari.trim().toLowerCase();
  const daftar = (lihat === "belum" ? belum : hadir).filter((p) => !q || p.nama.toLowerCase().includes(q));

  return (
    <div className="space-y-3">
      <Kartu className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Titik absen</span>
          <select className={field} value={titik} onChange={(e) => setTitik(e.target.value)}>
            {trip.titik_absen.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <div className="flex items-center justify-between rounded-2xl bg-laut-900 px-4 py-3 text-white">
          <p className="text-sm font-semibold text-white/75">Hadir di titik ini</p>
          <p className="text-3xl font-extrabold tabular-nums">{hadir.length}<span className="text-lg font-semibold text-white/50"> / {peserta.length}</span></p>
        </div>
        {bisaUbah ? (
          <button onClick={() => { setHasil(null); setScan((s) => !s); }} className={`${tombol} w-full py-3`}>
            {scan ? "Tutup kamera" : "Scan kartu peserta"}
          </button>
        ) : (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Akun demo hanya bisa melihat. Scan absensi untuk akun panitia.</p>
        )}
        {scan && <Pemindai onHasil={saatScan} />}
        <button onClick={() => setCetak((c) => !c)} className={`${tombolGaris} w-full`}>{cetak ? "Tutup daftar hadir" : "Cetak daftar hadir (tanda tangan)"}</button>
        {hasil && (
          <div className={`rounded-2xl p-4 ${hasil.ok ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-red-50 ring-1 ring-red-200"}`}>
            <p className={`text-lg font-bold ${hasil.ok ? "text-emerald-800" : "text-red-700"}`}>{hasil.judul}</p>
            <p className="text-sm text-slate-600">{hasil.isi}</p>
          </div>
        )}
      </Kartu>

      {cetak && <DaftarHadir trip={trip} peserta={peserta} absen={absen} onTutup={() => setCetak(false)} />}

      <Kartu className={`space-y-3 !p-4 ${cetak ? "hidden" : ""}`}>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {(["belum", "hadir"] as const).map((k) => (
            <button key={k} onClick={() => setLihat(k)} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${lihat === k ? "bg-white shadow-sm" : "text-slate-500"}`}>
              {k === "belum" ? `Belum hadir (${belum.length})` : `Hadir (${hadir.length})`}
            </button>
          ))}
        </div>
        <input className={field} value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama (untuk absen tanpa scan)" />
        <ul className="divide-y divide-slate-100">
          {daftar.map((p) => {
            const a = absen.find((x) => x.participant_id === p.id && x.titik === titik);
            return (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.nama}</p>
                  <p className="text-xs text-slate-500">{p.departemen} · {p.bus ?? "bus ?"}{a ? ` · ${relatif(a.created_at)}` : ""}</p>
                </div>
                {lihat === "belum" && bisaUbah && <button onClick={() => absenkan(p)} className={`${tombolGaris} shrink-0 !py-1.5`}>Hadir</button>}
              </li>
            );
          })}
          {daftar.length === 0 && <li className="py-6 text-center text-sm text-slate-500">{lihat === "belum" ? "Semua sudah hadir" : "Belum ada yang hadir."}</li>}
        </ul>
      </Kartu>
    </div>
  );
}

/** Kamera pemindai QR. Setelah satu QR terbaca, jeda 2 detik supaya tidak terbaca berulang. */
function Pemindai({ onHasil }: { onHasil: (teks: string) => void }) {
  const ref = useRef<Html5Qrcode | null>(null);
  const terakhir = useRef<{ teks: string; waktu: number }>({ teks: "", waktu: 0 });
  const cb = useRef(onHasil);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cb.current = onHasil;
  }, [onHasil]);

  useEffect(() => {
    let aktif = true;
    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (!aktif) return;
      const s = new Html5Qrcode("pemindai-qr", { verbose: false });
      ref.current = s;
      s.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        (teks) => {
          const now = Date.now();
          if (teks === terakhir.current.teks && now - terakhir.current.waktu < 2500) return;
          terakhir.current = { teks, waktu: now };
          navigator.vibrate?.(80);
          cb.current(teks);
        },
        () => {},
      ).catch(() => aktif && setError("Kamera tidak bisa dibuka. Izinkan akses kamera di browser, atau absen lewat daftar nama di bawah."));
    });
    return () => {
      aktif = false;
      const s = ref.current;
      if (s?.isScanning) s.stop().then(() => s.clear()).catch(() => {});
    };
  }, []);

  return (
    <div className="space-y-2">
      <div id="pemindai-qr" className="overflow-hidden rounded-2xl bg-black" />
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
