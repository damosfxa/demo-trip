// Data acara contoh. Semua fiktif; di versi asli diisi panitia lewat halaman admin.

export const ACARA = {
  nama: "Family Gathering 2026",
  penyelenggara: "PT Contoh Sejahtera",
  tujuan: "Bali",
  tanggal: "20 sampai 22 November 2026",
  departemen: ["Keuangan", "HRD", "Marketing", "Operasional", "IT", "Gudang", "Lainnya"],
};

export type Agenda = { jam: string; judul: string; ket?: string };
export type Hari = { hari: string; tanggal: string; agenda: Agenda[] };

export const JADWAL: Hari[] = [
  {
    hari: "Hari 1",
    tanggal: "Jumat, 20 November",
    agenda: [
      { jam: "05.00", judul: "Kumpul di Bandara Soekarno-Hatta", ket: "Terminal 3, pintu 4. Bawa KTP." },
      { jam: "07.30", judul: "Berangkat ke Bali" },
      { jam: "10.30", judul: "Tiba di Bali, naik bus ke hotel" },
      { jam: "13.00", judul: "Check in dan istirahat" },
      { jam: "19.00", judul: "Makan malam bersama", ket: "Restoran hotel, pakaian bebas rapi." },
    ],
  },
  {
    hari: "Hari 2",
    tanggal: "Sabtu, 21 November",
    agenda: [
      { jam: "07.00", judul: "Sarapan" },
      { jam: "08.30", judul: "Games dan outbound per departemen", ket: "Pakai kaos acara yang dibagikan saat check in." },
      { jam: "13.00", judul: "Makan siang" },
      { jam: "15.00", judul: "Wisata pantai" },
      { jam: "19.00", judul: "Gala dinner dan pembagian doorprize" },
    ],
  },
  {
    hari: "Hari 3",
    tanggal: "Minggu, 22 November",
    agenda: [
      { jam: "07.00", judul: "Sarapan dan check out" },
      { jam: "09.00", judul: "Belanja oleh-oleh" },
      { jam: "13.00", judul: "Berangkat ke bandara" },
      { jam: "16.30", judul: "Tiba di Jakarta, acara selesai" },
    ],
  },
];

export const INFO = [
  { judul: "Hotel", isi: "Hotel Contoh Indah, Kuta. Pembagian kamar diumumkan saat check in." },
  { judul: "Barang bawaan", isi: "KTP, obat pribadi, baju ganti 3 hari, baju renang, topi, dan sandal." },
  { judul: "Titik kumpul pulang", isi: "Lobi hotel, Minggu jam 12.45. Bus tidak menunggu lebih dari 15 menit." },
];

export const PENGUMUMAN = [
  { tanggal: "10 Nov", isi: "Kaos acara dibagikan saat check in. Ukuran sesuai data pendaftaran." },
  { tanggal: "5 Nov", isi: "Batas registrasi peserta 15 November." },
];
