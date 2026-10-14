import type { Zona } from "./types";

// Jam acara selalu ditampilkan menurut zona waktu lokasi trip, bukan zona HP peserta.

export const LABEL_ZONA: Record<Zona, string> = { "Asia/Jakarta": "WIB", "Asia/Makassar": "WITA", "Asia/Jayapura": "WIT" };
const OFFSET: Record<Zona, string> = { "Asia/Jakarta": "+07:00", "Asia/Makassar": "+08:00", "Asia/Jayapura": "+09:00" };

export const jam = (iso: string, zona: Zona) =>
  new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: zona }).format(new Date(iso)).replace(":", ".");

export const tanggalPanjang = (iso: string, zona: Zona) =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: zona }).format(new Date(iso));

/** Kunci hari (YYYY-MM-DD) menurut zona trip, untuk mengelompokkan jadwal. */
export const kunciHari = (iso: string, zona: Zona) =>
  new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: zona }).format(new Date(iso));

/** Tanggal (YYYY-MM-DD) + jam (HH:MM) di zona trip → ISO dengan offset yang benar. */
export const keIso = (tanggal: string, jamMenit: string, zona: Zona) => `${tanggal}T${jamMenit}:00${OFFSET[zona]}`;

/** Bagian tanggal dan jam (di zona trip) dari ISO, untuk mengisi form edit. */
export function pecahIso(iso: string, zona: Zona) {
  return { tanggal: kunciHari(iso, zona), jam: jam(iso, zona).replace(".", ":") };
}

export const tanggalSingkat = (tgl: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(tgl + "T00:00:00Z"));

export function rentangTanggal(mulai: string, selesai: string) {
  const a = new Date(mulai + "T00:00:00Z");
  const b = new Date(selesai + "T00:00:00Z");
  const f = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("id-ID", { ...o, timeZone: "UTC" }).format(d);
  if (mulai === selesai) return f(a, { day: "numeric", month: "long", year: "numeric" });
  if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()} sampai ${f(b, { day: "numeric", month: "long", year: "numeric" })}`;
  return `${f(a, { day: "numeric", month: "long" })} sampai ${f(b, { day: "numeric", month: "long", year: "numeric" })}`;
}

export const relatif = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)).replace(":", ".");

/** Nomor Indonesia ke format wa.me (62...). */
export function waLink(hp: string | null, teks = "") {
  if (!hp) return null;
  let d = hp.replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  if (d.length < 9) return null;
  return `https://wa.me/${d}${teks ? `?text=${encodeURIComponent(teks)}` : ""}`;
}
