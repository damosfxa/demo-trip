import type { Agenda, Zona } from "./types";
import { jam, kunciHari, labelZona } from "./waktu";

/** Zona waktu sebuah acara: miliknya sendiri, atau ikut zona trip. */
export const zonaAcara = (a: Agenda, zonaTrip: Zona): Zona => a.zona ?? zonaTrip;

/** Jam acara lengkap dengan label zonanya, misalnya "05.00 WIB". */
export const jamAcara = (iso: string, a: Agenda, zonaTrip: Zona) => `${jam(iso, zonaAcara(a, zonaTrip))} ${labelZona(zonaAcara(a, zonaTrip))}`;

/** Selesai sebuah agenda: kolom selesai, atau awal agenda berikutnya, atau 1 jam setelah mulai. */
export function akhir(list: Agenda[], i: number) {
  const a = list[i];
  if (a.selesai) return new Date(a.selesai).getTime();
  const next = list[i + 1];
  return next ? new Date(next.mulai).getTime() : new Date(a.mulai).getTime() + 3600_000;
}

export function statusAgenda(list: Agenda[], sekarang: number) {
  let sedang: Agenda | null = null;
  let berikut: Agenda | null = null;
  list.forEach((a, i) => {
    const m = new Date(a.mulai).getTime();
    if (!sedang && m <= sekarang && sekarang < akhir(list, i)) sedang = a;
    if (!berikut && m > sekarang) berikut = a;
  });
  return { sedang: sedang as Agenda | null, berikut: berikut as Agenda | null };
}

export function perHari(list: Agenda[], zona: Zona) {
  const grup = new Map<string, Agenda[]>();
  for (const a of list) {
    const k = kunciHari(a.mulai, zonaAcara(a, zona));
    if (!grup.has(k)) grup.set(k, []);
    grup.get(k)!.push(a);
  }
  return [...grup.entries()].map(([hari, isi]) => ({ hari, isi }));
}

/** Status perjalanan untuk hitung mundur di beranda. */
export function fase(mulai: string, selesai: string, zona: Zona, sekarang: number) {
  const hariIni = kunciHari(new Date(sekarang).toISOString(), zona);
  if (hariIni < mulai) {
    const sisa = Math.round((Date.parse(mulai + "T00:00:00Z") - Date.parse(hariIni + "T00:00:00Z")) / 86400_000);
    return { jenis: "sebelum" as const, teks: sisa === 1 ? "Berangkat besok" : `Berangkat ${sisa} hari lagi`, angka: sisa };
  }
  if (hariIni <= selesai) {
    const ke = Math.round((Date.parse(hariIni + "T00:00:00Z") - Date.parse(mulai + "T00:00:00Z")) / 86400_000) + 1;
    return { jenis: "berlangsung" as const, teks: `Hari ke-${ke} perjalanan`, angka: ke };
  }
  return { jenis: "selesai" as const, teks: "Perjalanan sudah selesai. Terima kasih!", angka: 0 };
}
