"use client";

import { useSyncExternalStore } from "react";

// Waktu sekarang yang diperbarui tiap 30 detik, untuk hitung mundur dan penanda "sedang berlangsung".
const LANGKAH = 30_000;
const sub = (f: () => void) => {
  const t = setInterval(f, LANGKAH);
  return () => clearInterval(t);
};
const ambil = () => Math.floor(Date.now() / LANGKAH) * LANGKAH;

/** 0 saat render di server. */
export function useSekarang() {
  return useSyncExternalStore(sub, ambil, () => 0);
}

// Detik demi detik, khusus untuk hitung mundur di beranda.
const subDetik = (f: () => void) => {
  const t = setInterval(f, 1000);
  return () => clearInterval(t);
};
const ambilDetik = () => Math.floor(Date.now() / 1000) * 1000;

export function useDetik() {
  return useSyncExternalStore(subDetik, ambilDetik, () => 0);
}
