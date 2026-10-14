"use client";

import { useState } from "react";
import { linkPeserta } from "@/lib/panitia";
import { pesanError, supabase } from "@/lib/supabase";
import { relatif } from "@/lib/waktu";
import type { PropsTab } from "./PanelTrip";
import { Kartu, field, tombol } from "./ui";

export function TabPengumuman({ data, bisaUbah, muatUlang }: PropsTab) {
  const { trip, pengumuman } = data;
  const [isi, setIsi] = useState("");
  const [proses, setProses] = useState(false);

  const kirim = async () => {
    if (!isi.trim()) return;
    setProses(true);
    const { error } = await supabase.from("announcements").insert({ trip_id: trip.id, isi: isi.trim() });
    setProses(false);
    if (error) return alert(pesanError(error));
    setIsi("");
    muatUlang();
  };

  const hapus = async (id: string) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return alert(pesanError(error));
    muatUlang();
  };

  return (
    <div className="space-y-3">
      {bisaUbah && (
        <Kartu className="space-y-3">
          <p className="font-bold">Pengumuman baru</p>
          <textarea rows={4} className={field} value={isi} onChange={(e) => setIsi(e.target.value)} placeholder="Contoh: Bus 2 berangkat 15 menit lebih awal. Kumpul di lobi jam 07.45." />
          <div className="flex flex-wrap gap-2">
            <button onClick={kirim} disabled={proses || !isi.trim()} className={tombol}>{proses ? "Mengirim..." : "Tampilkan ke peserta"}</button>
            {isi.trim() && (
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
          <p className="text-xs text-slate-500">Pengumuman langsung muncul di HP peserta (ditandai &quot;Baru&quot; selama 24 jam).</p>
        </Kartu>
      )}
      {pengumuman.map((p) => (
        <Kartu key={p.id} className="!p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs text-slate-500">{relatif(p.created_at)}</p>
            {bisaUbah && <button onClick={() => hapus(p.id)} className="text-xs font-semibold text-red-600">Hapus</button>}
          </div>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{p.isi}</p>
        </Kartu>
      ))}
      {pengumuman.length === 0 && <p className="text-center text-sm text-slate-500">Belum ada pengumuman.</p>}
    </div>
  );
}
