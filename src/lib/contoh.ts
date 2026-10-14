import type { PaketTrip } from "./data-peserta";
import type { DataSaya } from "./types";

// Data contoh berukuran wajar, khusus untuk menggambar skeleton pada kunjungan pertama
// (saat belum ada salinan data di HP). Tidak pernah ditampilkan sebagai isi sungguhan.

const besok = (hari: number, jam: number) => new Date(Date.now() + hari * 86400_000 + jam * 3600_000).toISOString();

export const PAKET_CONTOH: PaketTrip = {
  diambil: new Date(0).toISOString(),
  trip: {
    id: "contoh",
    slug: "contoh",
    nama: "Family Gathering 2026",
    penyelenggara: "PT Contoh Sejahtera",
    tujuan: "Bali",
    mulai: besok(30, 0).slice(0, 10),
    selesai: besok(32, 0).slice(0, 10),
    zona: "Asia/Jakarta",
    titik_kumpul: "Bandara Soekarno-Hatta Terminal 3, pintu 4",
    cover_url: null,
    maps_url: "https://maps.google.com",
    wa_panitia: "081200000000",
    departemen: ["Keuangan", "HRD", "Marketing"],
    info: [
      { judul: "Hotel", isi: "Hotel Contoh Indah, Kuta. Nomor kamar muncul di halaman ini setelah diatur panitia." },
      { judul: "Penerbangan", isi: "Berangkat 07.30 WIB, tiba 10.30 WITA. Bagasi 20 kg per orang." },
    ],
    checklist: ["KTP asli", "Obat pribadi", "Baju ganti 3 hari", "Baju renang", "Power bank"],
    faq: [
      { q: "Boleh membawa keluarga?", a: "-" },
      { q: "Bagaimana kalau terlambat ke titik kumpul?", a: "-" },
    ],
    titik_absen: ["Bandara berangkat", "Bus hari 2", "Gala dinner", "Bandara pulang"],
    aktif: true,
    isian: [
      { id: "a", label: "Ukuran kaos", pilihan: ["M"], wajib: true },
      { id: "b", label: "Kontak darurat (nama dan nomor)", pilihan: [], wajib: true },
    ],
    logo_url: null,
    tema: "laut",
    created_at: new Date(0).toISOString(),
  },
  agenda: [
    { id: "a1", trip_id: "contoh", mulai: besok(30, 5), selesai: besok(30, 7), judul: "Kumpul dan absen", lokasi: "Terminal 3, pintu 4", ket: "Tunjukkan kartu QR di halaman ini ke panitia.", zona: null },
    { id: "a2", trip_id: "contoh", mulai: besok(30, 8), selesai: null, judul: "Penerbangan ke Bali", lokasi: null, ket: null, zona: null },
  ],
  pengumuman: [
    { id: "p1", trip_id: "contoh", isi: "Kaos acara dibagikan saat check in. Ukuran sesuai data dari HRD.", created_at: new Date(0).toISOString() },
    { id: "p2", trip_id: "contoh", isi: "Batas registrasi peserta 15 November. Pastikan nama sesuai KTP.", created_at: new Date(0).toISOString() },
  ],
};

export const SAYA_CONTOH: DataSaya = {
  id: "contoh",
  trip_slug: "contoh",
  nama: "Andi Pratama",
  departemen: "Keuangan",
  bus: "Bus 1",
  kamar: "201",
  isian: {},
  teman_sekamar: ["Budi Santoso"],
  absen: [],
  pesan: [],
};
