# QA: Hasil Pengujian

Catatan pengujian per tanggal. Setiap baris menyebut apa yang dites, di mana, dan hasilnya. Yang belum dites juga dicatat supaya tidak terkesan sudah lengkap.

Tanggal: 16 Oktober 2026.
Lingkungan: Chrome desktop dengan emulasi viewport 375x812 (HP), localhost:3001 dan demo-trip-two.vercel.app. Database: project Supabase `pozxevzycumdwnagwvid`.

## Pemeriksaan otomatis

| Pemeriksaan | Perintah | Hasil |
|---|---|---|
| Type check | `npx tsc --noEmit` | Lulus, 0 error |
| Lint | `npm run lint` | 0 error, 3 warning `<img>` di `Ringkasan.tsx` dan `Kartu.tsx` |
| Build | `npm run build` | Belum dijalankan ulang untuk dokumen ini |

Catatan: sebelum 16 Okt, proyek tidak punya script lint. Konfigurasi `eslint.config.mjs` ditambahkan hari itu. Satu error `react-hooks/set-state-in-effect` di `PesertaApp.tsx` diberi komentar `eslint-disable` dengan alasan. Alasannya: effect membaca localStorage (sistem eksternal) setelah data dimuat.

## Alur peserta

| # | Yang dites | Hasil | Catatan |
|---|---|---|---|
| P1 | Validasi form kosong: pesan "Tulis nama lengkap Anda." | Lolos | Tidak ada request ke database |
| P2 | Validasi departemen kosong: pesan "Pilih departemen Anda." | Lolos | Tidak ada request ke database |
| P3 | Validasi ukuran kaos wajib: pesan "Ukuran kaos wajib diisi." | Lolos | Tidak ada request ke database |
| P4 | Dropdown departemen: 7 opsi bisa dipilih | Lolos | Form tidak dikirim |
| P5 | Dropdown ukuran kaos: 5 opsi (S sampai XXL) bisa dipilih | Lolos | Form tidak dikirim |
| P6 | Registrasi dengan data palsu, lalu masuk ke Beranda | Lolos | Dilakukan dua kali. Data tes pertama sudah dihapus. Data tes kedua masih ada di database |
| P7 | Beranda: hitung mundur, pengumuman, sapaan dengan nama depan | Lolos | |
| P8 | Jadwal hari 1 | Lolos | Hari 2 dan 3 belum dibuka |
| P9 | Kartu peserta: nama, departemen, status bus dan kamar "Belum diatur" | Lolos | Belum diuji dengan bus atau kamar yang sudah diatur |
| P10 | Info: titik kumpul, hotel, penerbangan, pakaian, checklist, FAQ | Lolos | FAQ belum dibuka |
| P11 | Centang checklist, lalu muat ulang halaman | Lolos | Centangan tetap ada (1/8) |
| P12 | Tautan Petunjuk arah (Maps) dan Tanya panitia (WA) | Lolos | Nomor WA masih nomor contoh |
| P13 | Token dan data peserta tersimpan di localStorage | Lolos | |
| P14 | Service worker terpasang dan cache `infotrip-v2` ada | Lolos | Ini hanya memastikan service worker aktif |
| P15 | Mode offline sungguhan | Belum dites | Browser tool tidak bisa mematikan koneksi |
| P16 | Tampilan di HP Android atau iPhone asli | Belum dites | Hanya emulasi |
| P17 | Notifikasi HP | Belum dites | Di browser, notifikasi diblokir |
| P18 | Ganti peserta dan Perbarui data | Belum dites | Ganti peserta menghapus token |

## Alur panitia

| # | Yang dites | Hasil | Catatan |
|---|---|---|---|
| A1 | Halaman login panel | Lolos | |
| A2 | Login dengan akun owner | Lolos | Dilakukan oleh pemilik proyek |
| A3 | Daftar trip | Lolos | |
| A4 | Ringkasan: jumlah peserta, kehadiran per titik, peserta per departemen, link dan QR | Lolos | |
| A5 | Peserta: filter departemen, 8 opsi, jumlah sesuai Ringkasan | Lolos | |
| A6 | Peserta: daftar nama dengan bus dan kamar | Lolos | Ada dua baris "RizkyRhamadani" dari data seed |
| A7 | Absensi: daftar titik absen dan jumlah hadir | Lolos | Tidak melakukan scan |
| A8 | Pengaturan: dropdown zona waktu, 3 opsi | Lolos (hanya melihat opsi) | Nilai tidak diubah |
| A9 | Dokumen: rooming list dan manifest bus, unduh CSV | Belum dites | Akan menulis file ke komputer |
| A10 | Pengumuman: tulis dan tampilkan di peserta | Belum dites | Menulis data |
| A11 | Pesan pribadi | Belum dites | Menulis data |
| A12 | Atur bus dan kamar, lalu cek di kartu peserta | Belum dites | Menulis data |
| A13 | Scan QR absensi dari HP | Belum dites | Butuh kamera |
| A14 | Jadwal: tambah, ubah, hapus, dan zona per agenda | Belum dites | |
| A15 | Akun viewer tidak bisa mengubah data | Belum dites | Butuh akun viewer |
| A16 | Pengaturan: ubah zona waktu dan tema | Belum dites | Menulis data |

A2 dilakukan oleh pemilik proyek. Pemilik juga melaporkan bahwa seluruh alur panel panitia berjalan lancar pada pengujian mandirinya.

## Live (demo-trip-two.vercel.app)

| Yang dicek | Hasil |
|---|---|
| Landing page tampil | Lolos |
| Byline "Dibuat oleh" | Sudah tidak ada setelah deploy ulang |
| Halaman login panitia | Tampil |
| Registrasi trip demo tampil dengan dropdown lengkap | Lolos |

## Keamanan

| Pemeriksaan | Hasil |
|---|---|
| Policy RLS di semua tabel publik dicek lewat `pg_policies` | Semua policy dibatasi ke role yang tepat. Tidak ada policy anon untuk tabel peserta |
| Fungsi `SECURITY DEFINER` punya `search_path` | Semua punya |
| View yang bisa melewati RLS | Tidak ada |
| Bucket Storage | Belum dicek |
| `.env.local` masuk `.gitignore` | Ya |

## Pembaruan UI dan fitur (16 Okt, sore)

| # | Yang dites | Hasil | Catatan |
|---|---|---|---|
| U1 | `tsc --noEmit` setelah perubahan UI | Lulus | |
| U2 | `npm run lint` setelah perubahan UI | 0 error, 3 warning `<img>` | Warning sama seperti sebelumnya |
| U3 | `npm run build` (ekspor statis) | Lulus, rute `/`, `/panitia`, `/manifest.webmanifest` dibuat | Folder `out/` dihasilkan |
| U4 | Manifest diakses di `/manifest.webmanifest` | Lolos | Berisi id, scope, lang, orientation, dan ikon |
| U5 | Layar muat tampil saat pembukaan (HP emulasi) | Lolos | Pesawat, bar, dan pesan berganti terlihat |
| U6 | Konsol bersih di tab baru (tanpa error hydration) | Lolos | Ada error hydration di tab lama, tapi itu log sisa sebelum perbaikan |
| U7 | Beranda: sapaan, hitung mundur, tindakan cepat, bus dan kamar, agenda berikutnya | Lolos | |
| U8 | Jadwal: hari 1 dengan tombol "Tambah ke kalender" per acara | Lolos | Tombol tidak diklik, jadi file .ics belum dibuka |
| U9 | Info: pencarian "power" hanya menampilkan "Power bank" | Lolos | |
| U10 | Info: tombol Salin di titik kumpul dan info penting | Tampil | Hasil salin belum diuji di HP asli |
| U11 | Info: peta, petunjuk arah, dan tanya panitia | Tampil | |
| U12 | Mode offline sungguhan, notifikasi, dan HP asli | Belum dites | Sama seperti sebelumnya |

## Temuan yang belum diperbaiki

1. `schema.sql` mendefinisikan `daftar_peserta` dan `data_saya` lebih dari sekali. Versi terakhir yang berlaku, tapi file ini sebaiknya dirapikan.
2. Ekspor "Unduh Excel" sebenarnya CSV. Nama tombolnya bisa menyesatkan.
3. Nomor WA panitia di seed masih nomor contoh.
4. Hotel, penerbangan, jadwal, dan checklist di trip demo masih data contoh.
5. Data tes "Peserta Tes Kedua" masih ada di database live.
