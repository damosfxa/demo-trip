export type Zona = "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura";

export type Trip = {
  id: string;
  slug: string;
  nama: string;
  penyelenggara: string | null;
  tujuan: string;
  mulai: string;
  selesai: string;
  zona: Zona;
  titik_kumpul: string | null;
  maps_url: string | null;
  wa_panitia: string | null;
  departemen: string[];
  info: { judul: string; isi: string }[];
  checklist: string[];
  faq: { q: string; a: string }[];
  titik_absen: string[];
  aktif: boolean;
  created_at: string;
};

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
  teman_sekamar: string[];
  absen: { titik: string; waktu: string }[];
};
