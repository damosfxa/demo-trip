"use client";

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
