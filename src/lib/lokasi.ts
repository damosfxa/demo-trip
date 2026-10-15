"use client";

import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "./supabase";

export type HasilLokasi = { nama: string; lat: number; lon: number; zona: string; negara: string };

/** Cari tempat di seluruh dunia lewat Open-Meteo (gratis, tanpa kunci). Hasilnya sudah membawa zona waktu tempat itu. */
export async function cariLokasi(q: string): Promise<HasilLokasi[]> {
  if (q.trim().length < 2) return [];
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=6&language=id&format=json`);
  if (!res.ok) return [];
  const j = (await res.json()) as { results?: { name: string; latitude: number; longitude: number; timezone: string; country?: string; admin1?: string }[] };
  return (j.results ?? []).map((r) => ({
    nama: [r.name, r.admin1].filter(Boolean).join(", "),
    lat: r.latitude,
    lon: r.longitude,
    zona: r.timezone,
    negara: r.country ?? "",
  }));
}

/** Foto asli sebuah tempat dari Unsplash, lewat Edge Function. Null bila tidak ada atau layanan belum diatur. */
export async function fotoTempat(query: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("foto-tempat", { body: { query } });
    if (error || !data?.foto) return null;
    return data.foto as string;
  } catch {
    return null;
  }
}

const latarMemo = new Map<string, string | null>();
const latarPendengar = new Set<() => void>();
let latarVersi = 0;

/**
 * Foto gunung asli untuk latar pemandangan, diambil dari Unsplash sesuai kata kunci.
 * Hasilnya disimpan di HP ini supaya tidak diminta ulang setiap kali halaman dibuka.
 */
export function useLatar(query: string | null): string | null {
  useSyncExternalStore(
    (f) => {
      latarPendengar.add(f);
      return () => latarPendengar.delete(f);
    },
    () => latarVersi,
    () => 0,
  );
  useEffect(() => {
    if (!query || latarMemo.has(query)) return;
    const kunci = `infotrip:latar:${query}`;
    try {
      const simpanan = localStorage.getItem(kunci);
      if (simpanan) {
        latarMemo.set(query, simpanan);
        latarVersi++;
        latarPendengar.forEach((f) => f());
        return;
      }
    } catch {
      // Penyimpanan HP tidak tersedia: tetap ambil dari layanan.
    }
    fotoTempat(query).then((url) => {
      latarMemo.set(query, url);
      if (url) {
        try {
          localStorage.setItem(kunci, url);
        } catch {
          // Tidak apa-apa, hanya tidak tersimpan.
        }
      }
      latarVersi++;
      latarPendengar.forEach((f) => f());
    });
  }, [query]);
  return query ? latarMemo.get(query) ?? null : null;
}
