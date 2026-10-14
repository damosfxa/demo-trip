"use client";

import { useSyncExternalStore } from "react";

// Penyimpanan kecil di localStorage yang bisa dipakai sebagai state React (dan sinkron antar tab).
// Dipakai untuk token peserta, checklist, dan salinan data supaya tetap terbuka saat sinyal hilang.

const pendengar = new Map<string, Set<() => void>>();
const cache = new Map<string, string | null>();

function bacaMentah(kunci: string): string | null {
  if (cache.has(kunci)) return cache.get(kunci)!;
  let v: string | null = null;
  try {
    v = localStorage.getItem(kunci);
  } catch {
    // Storage diblokir (mode privat): tetap jalan dari memori
  }
  cache.set(kunci, v);
  return v;
}

export function tulis(kunci: string, nilai: unknown) {
  const v = nilai === null || nilai === undefined ? null : JSON.stringify(nilai);
  cache.set(kunci, v);
  try {
    if (v === null) localStorage.removeItem(kunci);
    else localStorage.setItem(kunci, v);
  } catch {
    // abaikan
  }
  pendengar.get(kunci)?.forEach((f) => f());
}

export function baca<T>(kunci: string): T | null {
  const v = bacaMentah(kunci);
  if (v === null) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

function langganan(kunci: string, f: () => void) {
  if (!pendengar.has(kunci)) pendengar.set(kunci, new Set());
  pendengar.get(kunci)!.add(f);
  const saatStorage = (e: StorageEvent) => {
    if (e.key === kunci) {
      cache.delete(kunci);
      f();
    }
  };
  window.addEventListener("storage", saatStorage);
  return () => {
    pendengar.get(kunci)?.delete(f);
    window.removeEventListener("storage", saatStorage);
  };
}

const parsed = new Map<string, { raw: string | null; val: unknown }>();

/** Nilai di localStorage sebagai state. undefined = belum di browser (render server). */
export function useSimpan<T>(kunci: string): T | null | undefined {
  return useSyncExternalStore(
    (f) => langganan(kunci, f),
    () => {
      const raw = bacaMentah(kunci);
      const lama = parsed.get(kunci);
      if (lama && lama.raw === raw) return lama.val as T | null;
      const val = raw === null ? null : baca<T>(kunci);
      parsed.set(kunci, { raw, val });
      return val;
    },
    () => undefined,
  );
}
