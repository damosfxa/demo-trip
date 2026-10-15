import type { Zona } from "./types";
import { lokal } from "./bahasa";

// Jam acara selalu ditampilkan menurut zona waktu lokasi trip, bukan zona HP peserta.

/** Zona waktu Indonesia yang paling sering dipakai, ditampilkan pertama di pilihan zona. */
export const ZONA_INDONESIA = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"];
const SINGKATAN: Record<string, string> = { "Asia/Jakarta": "WIB", "Asia/Makassar": "WITA", "Asia/Jayapura": "WIT" };

/** Nama singkat zona waktu: WIB, WITA, WIT untuk Indonesia, selain itu singkatan dari sistem (misalnya GMT+9). */
export function labelZona(zona: string) {
  if (SINGKATAN[zona]) return SINGKATAN[zona];
  try {
    const bagian = new Intl.DateTimeFormat("id-ID", { timeZone: zona, timeZoneName: "short" }).formatToParts(new Date());
    return bagian.find((b) => b.type === "timeZoneName")?.value ?? zona;
  } catch {
    return zona;
  }
}

/** Pilihan zona untuk formulir: zona Indonesia, ditambah zona yang sedang dipakai bila belum ada di daftar. */
export const opsiZona = (terpilih: string) => [...new Set([...ZONA_INDONESIA, terpilih])];

/** Selisih zona dari UTC dalam menit, pada waktu tertentu. */
function selisihMenit(zona: string, waktu: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: zona, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(waktu)
      .map((x) => [x.type, x.value]),
  );
  const sebagaiUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  return (sebagaiUtc - waktu.getTime()) / 60000;
}

export const jam = (iso: string, zona: Zona) =>
  new Intl.DateTimeFormat(lokal(), { hour: "2-digit", minute: "2-digit", timeZone: zona }).format(new Date(iso)).replace(":", ".");

export const tanggalPanjang = (iso: string, zona: Zona) =>
  new Intl.DateTimeFormat(lokal(), { weekday: "long", day: "numeric", month: "long", timeZone: zona }).format(new Date(iso));

/** Kunci hari (YYYY-MM-DD) menurut zona trip, untuk mengelompokkan jadwal. */
export const kunciHari = (iso: string, zona: Zona) =>
  new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: zona }).format(new Date(iso));

/** Tanggal (YYYY-MM-DD) + jam (HH:MM) di zona trip → ISO dengan offset yang benar. */
/** Tanggal dan jam yang diketik panitia (waktu di zona trip) diubah menjadi waktu universal (ISO). */
export function keIso(tanggal: string, jamMenit: string, zona: Zona) {
  const [y, m, d] = tanggal.split("-").map(Number);
  const [hh, mm] = jamMenit.split(":").map(Number);
  const tebakan = Date.UTC(y, m - 1, d, hh, mm);
  const selisih = selisihMenit(zona, new Date(tebakan));
  let utc = tebakan - selisih * 60000;
  const selisih2 = selisihMenit(zona, new Date(utc));
  if (selisih2 !== selisih) utc = tebakan - selisih2 * 60000;
  return new Date(utc).toISOString();
}

/** Bagian tanggal dan jam (di zona trip) dari ISO, untuk mengisi form edit. */
export function pecahIso(iso: string, zona: Zona) {
  return { tanggal: kunciHari(iso, zona), jam: jam(iso, zona).replace(".", ":") };
}

export const tanggalSingkat = (tgl: string) =>
  new Intl.DateTimeFormat(lokal(), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(tgl + "T00:00:00Z"));

export function rentangTanggal(mulai: string, selesai: string) {
  const a = new Date(mulai + "T00:00:00Z");
  const b = new Date(selesai + "T00:00:00Z");
  const f = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(lokal(), { ...o, timeZone: "UTC" }).format(d);
  if (mulai === selesai) return f(a, { day: "numeric", month: "long", year: "numeric" });
  if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()} sampai ${f(b, { day: "numeric", month: "long", year: "numeric" })}`;
  return `${f(a, { day: "numeric", month: "long" })} sampai ${f(b, { day: "numeric", month: "long", year: "numeric" })}`;
}

export const relatif = (iso: string) =>
  new Intl.DateTimeFormat(lokal(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)).replace(":", ".");

/** Nomor Indonesia ke format wa.me (62...). */
export function waLink(hp: string | null, teks = "") {
  if (!hp) return null;
  let d = hp.replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  if (d.length < 9) return null;
  return `https://wa.me/${d}${teks ? `?text=${encodeURIComponent(teks)}` : ""}`;
}
