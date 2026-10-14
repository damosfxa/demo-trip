"use client";

import { useSyncExternalStore } from "react";

// Data peserta disimpan di localStorage browser, tanpa server atau database (khusus demo).

export type Peserta = { id: string; nama: string; departemen: string; hp: string; waktu: string };

const KUNCI_DAFTAR = "demo-trip:peserta";
const KUNCI_SAYA = "demo-trip:saya";

type Data = { daftar: Peserta[]; saya: string | null };

let cache: Data | null = null;
const pendengar = new Set<() => void>();

// Beberapa peserta contoh supaya halaman panitia tidak kosong.
function contoh(): Peserta[] {
  const t = (jamLalu: number) => new Date(Date.now() - jamLalu * 3600_000).toISOString();
  return [
    { id: "c1", nama: "Andi Pratama", departemen: "Keuangan", hp: "0812xxxx1201", waktu: t(30) },
    { id: "c2", nama: "Siti Rahma", departemen: "HRD", hp: "0813xxxx4410", waktu: t(26) },
    { id: "c3", nama: "Budi Santoso", departemen: "Gudang", hp: "0857xxxx7731", waktu: t(5) },
  ];
}

function baca(): Data {
  if (cache) return cache;
  let daftar: Peserta[] | null = null;
  let saya: string | null = null;
  try {
    const isi = JSON.parse(localStorage.getItem(KUNCI_DAFTAR) ?? "null");
    if (Array.isArray(isi)) daftar = isi as Peserta[];
    saya = localStorage.getItem(KUNCI_SAYA);
  } catch {
    // Storage diblokir atau rusak: pakai data contoh di memori
  }
  cache = { daftar: daftar ?? contoh(), saya };
  return cache;
}

function simpan(data: Data) {
  cache = data;
  try {
    localStorage.setItem(KUNCI_DAFTAR, JSON.stringify(data.daftar));
    if (data.saya) localStorage.setItem(KUNCI_SAYA, data.saya);
    else localStorage.removeItem(KUNCI_SAYA);
  } catch {
    // Mode privat: demo tetap jalan dari memori
  }
  pendengar.forEach((f) => f());
}

function langganan(f: () => void) {
  pendengar.add(f);
  const saatStorage = (e: StorageEvent) => {
    if (e.key === KUNCI_DAFTAR || e.key === KUNCI_SAYA) {
      cache = null;
      f();
    }
  };
  window.addEventListener("storage", saatStorage);
  return () => {
    pendengar.delete(f);
    window.removeEventListener("storage", saatStorage);
  };
}

/** null saat render di server (belum ada localStorage). */
export function useDataPeserta(): Data | null {
  return useSyncExternalStore(langganan, baca, () => null);
}

export function daftar(input: Omit<Peserta, "id" | "waktu">) {
  const d = baca();
  const id = `p${Date.now()}`;
  simpan({ daftar: [{ ...input, id, waktu: new Date().toISOString() }, ...d.daftar], saya: id });
}

export function keluar() {
  simpan({ ...baca(), saya: null });
}

export function resetContoh() {
  simpan({ daftar: contoh(), saya: null });
}

/** Nomor HP Indonesia: 08xx atau +628xx, 10 sampai 13 digit. */
export function hpValid(hp: string) {
  const d = hp.replace(/[\s-]/g, "").replace(/^\+62/, "0");
  return /^08\d{8,11}$/.test(d);
}
