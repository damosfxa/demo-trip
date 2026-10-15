"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Zona } from "./types";

/**
 * Cuaca dan waktu matahari terbit serta terbenam yang sebenarnya, dari Open-Meteo (gratis, tanpa kunci).
 * Lokasi mengikuti zona trip: Bali (WITA), Jakarta (WIB), atau Jayapura (WIT).
 */
export type Cuaca = {
  suhu: number;
  kode: number;
  awan: number;
  terbit: number; // jam desimal di zona trip
  terbenam: number;
};

const KOTA: Record<Zona, { lat: number; lon: number }> = {
  "Asia/Makassar": { lat: -8.65, lon: 115.22 },
  "Asia/Jakarta": { lat: -6.2, lon: 106.85 },
  "Asia/Jayapura": { lat: -2.53, lon: 140.72 },
};

const TTL = 30 * 60 * 1000;
const cache = new Map<Zona, { waktu: number; data: Cuaca }>();
const pendengar = new Set<() => void>();
let versi = 0;
const langganan = (f: () => void) => {
  pendengar.add(f);
  return () => pendengar.delete(f);
};
const ambilVersi = () => versi;

const jamDesimal = (iso: string, zona: Zona) => {
  const bagian = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: zona }).formatToParts(new Date(iso));
  return Number(bagian.find((b) => b.type === "hour")?.value ?? 0) + Number(bagian.find((b) => b.type === "minute")?.value ?? 0) / 60;
};

async function ambil(zona: Zona) {
  const { lat, lon } = KOTA[zona];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,cloud_cover&daily=sunrise,sunset&timezone=${encodeURIComponent(zona)}&forecast_days=1`;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const j = await res.json();
    const data: Cuaca = {
      suhu: Math.round(j.current.temperature_2m),
      kode: j.current.weather_code,
      awan: j.current.cloud_cover,
      terbit: jamDesimal(j.daily.sunrise[0], zona),
      terbenam: jamDesimal(j.daily.sunset[0], zona),
    };
    cache.set(zona, { waktu: Date.now(), data });
    versi++;
    pendengar.forEach((f) => f());
  } catch {
    // Tidak tersambung: tampilkan pemandangan tanpa data cuaca.
  }
}

/** Cuaca untuk zona trip. Null bila belum terambil atau tidak tersambung. */
export function useCuaca(zona: Zona): Cuaca | null {
  useSyncExternalStore(langganan, ambilVersi, () => 0);
  useEffect(() => {
    const ada = cache.get(zona);
    if (!ada || Date.now() - ada.waktu > TTL) ambil(zona);
    const t = setInterval(() => ambil(zona), TTL);
    return () => clearInterval(t);
  }, [zona]);
  return cache.get(zona)?.data ?? null;
}

/** Teks singkat dari kode cuaca WMO. */
export function teksCuaca(kode: number) {
  if (kode === 0) return "Cerah";
  if (kode <= 3) return "Berawan";
  if (kode <= 48) return "Berkabut";
  if (kode <= 67 || (kode >= 80 && kode <= 82)) return "Hujan";
  if (kode <= 77 || kode >= 85) return "Hujan";
  return "Badai";
}
