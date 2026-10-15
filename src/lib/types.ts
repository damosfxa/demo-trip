/** Zona waktu IANA, misalnya "Asia/Jakarta" atau "Asia/Tokyo". */
export type Zona = string;

export type Trip = {
  id: string;
  slug: string;
  nama: string;
  penyelenggara: string | null;
  tujuan: string;
  mulai: string;
  selesai: string;
  zona: Zona;
  lokasi_nama?: string | null;
  lat?: number | null;
  lon?: number | null;
  titik_kumpul: string | null;
  cover_url: string | null;
  maps_url: string | null;
  wa_panitia: string | null;
  departemen: string[];
  info: { judul: string; isi: string }[];
  checklist: string[];
  faq: { q: string; a: string }[];
  titik_absen: string[];
  aktif: boolean;
  isian: Isian[];
  logo_url: string | null;
  tema: Tema;
  kapasitas_bus?: number;
  kapasitas_kamar?: number;
  created_at: string;
};

/** Isian registrasi tambahan yang diatur panitia. Pilihan kosong = isian teks bebas. */
export type Isian = { id: string; label: string; pilihan: string[]; wajib: boolean };
export type Tema = "laut" | "hutan" | "senja" | "anggur" | "arang";

export type Agenda = { id: string; trip_id: string; mulai: string; selesai: string | null; judul: string; lokasi: string | null; ket: string | null; zona: Zona | null };
export type Pengumuman = { id: string; trip_id: string; isi: string; created_at: string };

export type Peserta = {
  id: string;
  trip_id: string;
  nama: string;
  departemen: string;
  hp: string;
  bus: string | null;
  kamar: string | null;
  catatan: string | null;
  isian: Record<string, string>;
  created_at: string;
};

export type Absen = { id: string; trip_id: string; participant_id: string; titik: string; created_at: string };

/** Hasil fungsi data_saya: data milik peserta sendiri. */
export type DataSaya = {
  id: string;
  trip_slug: string;
  nama: string;
  departemen: string;
  bus: string | null;
  kamar: string | null;
  isian: Record<string, string>;
  teman_sekamar: string[];
  teman_kontak?: { nama: string; hp: string }[];
  absen: { titik: string; waktu: string }[];
  pesan: PesanPribadi[];
};

/** Pesan dari panitia untuk satu peserta. */
export type PesanPribadi = { id: string; isi: string; created_at: string; participant_id?: string; trip_id?: string };
