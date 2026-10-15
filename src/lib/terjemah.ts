"use client";

import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "./supabase";

/**
 * Terjemahan isi trip (Indonesia ke English) untuk peserta. Hasil disimpan di memori halaman ini,
 * dan di server (tabel terjemahan) lewat Edge Function. Kalau gagal, teks asli tetap tampil.
 */
const cache = new Map<string, string>();
const sedang = new Set<string>();
const pendengar = new Set<() => void>();
let versi = 0;

const langganan = (f: () => void) => {
  pendengar.add(f);
  return () => pendengar.delete(f);
};
const ambilVersi = () => versi;

async function ambil(butuh: string[]) {
  butuh.forEach((t) => sedang.add(t));
  try {
    const { data, error } = await supabase.functions.invoke("terjemahkan", { body: { texts: butuh } });
    if (error || !data?.hasil) return;
    for (const [asli, en] of Object.entries(data.hasil as Record<string, string>)) cache.set(asli, en);
    versi++;
    pendengar.forEach((f) => f());
  } catch {
    // Tidak tersambung atau layanan belum diatur: biarkan teks asli.
  } finally {
    butuh.forEach((t) => sedang.delete(t));
  }
}

/** Hook: mengembalikan fungsi yang memberi teks English bila mode English aktif dan terjemahannya sudah ada. */
export function useTerjemahan(teks: string[], aktif: boolean) {
  useSyncExternalStore(langganan, ambilVersi, () => 0);
  const kunci = teks.join("\u0001");
  useEffect(() => {
    if (!aktif) return;
    const butuh = [...new Set(teks.filter((t) => t && t.trim() && !cache.has(t) && !sedang.has(t)))];
    if (butuh.length) ambil(butuh.slice(0, 50));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktif, kunci]);
  return (t: string) => (aktif ? cache.get(t) ?? t : t);
}
