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
