# Proposal: Website Informasi Simple (Info Trip)

Draf penawaran untuk projects.co.id, proyek "Website informasi simple" dari mentariholidays. Teks ini dipakai sebagai isi bid, dan bagian demo sebagai bukti kerja.

## 1. Pemahaman masalah

Brief meminta website ringan yang hanya berfungsi sebagai sumber informasi bagi peserta. Alurnya: peserta membuka alamat, registrasi dengan nama, departemen, dan nomor HP, lalu melihat info perjalanan.

Dari brief, ada tiga hal yang menentukan keberhasilan:

1. **Registrasi harus cepat dan tidak membingungkan.** Peserta mengisi sekali, di HP, tanpa akun atau password. Form hanya meminta yang diminta brief, ditambah isian yang bisa diatur panitia (misalnya ukuran kaos).
2. **Info perjalanan harus mudah ditemukan saat dibutuhkan.** Jadwal yang menandai acara yang sedang berjalan, titik kumpul dengan peta, checklist barang bawaan, dan FAQ.
3. **Data peserta, terutama nomor HP, tidak boleh bisa dibaca orang lain.** Brief tidak menyebut ini, tapi nomor HP rombongan sensitif. Karena itu semua data peserta dikunci di database.

## 2. Pendekatan teknis

| Keputusan | Alasan |
|---|---|
| Next.js yang diekspor menjadi file statis | Hanya file HTML, CSS, dan JavaScript. Bisa di-host di hosting biasa milik klien. Ringan dan tidak perlu server aplikasi. |
| Supabase untuk database dan login | Keamanan data dijaga di database dengan RLS. Peserta tidak perlu akun, dan data mereka hanya bisa dibuka dengan token di HP. |
| Token acak untuk peserta | Peserta cukup mendaftar sekali. Token menggantikan login, dan tidak bisa ditebak. |
| Tampilan dibatasi lebar HP | Brief meminta "mobile only". Di desktop tetap terbaca, tapi tidak dioptimalkan. |
| Service worker | Halaman yang sudah pernah dibuka tetap bisa dilihat saat sinyal hilang. Ini penting untuk rombongan di bandara atau bus. |
| Cuaca dan jam matahari dari layanan publik (Open-Meteo) | Data cuaca dan waktu terbit serta terbenam matahari yang sebenarnya untuk lokasi trip, bukan hasil tiruan. |
| Foto sampul dari Unsplash | Foto asli tempat tujuan, dipilih otomatis dari nama lokasi, dan bisa diganti panitia dengan fotonya sendiri. |
| Terjemahan otomatis (DeepL) | Panitia menulis dalam bahasa Indonesia, peserta bisa membaca dalam English. Hasil terjemahan disimpan supaya tidak diterjemahkan ulang. |

Dokumen lengkap ada di repo: [PRD.md](PRD.md), [architecture.md](architecture.md), [database-schema.md](database-schema.md), dan [SECURITY.md](SECURITY.md).

## 3. Status pengerjaan

Ini yang sudah jalan dan sudah diuji, bukan rencana:

- Registrasi peserta dengan validasi, sampai masuk ke info perjalanan.
- Info perjalanan: titik kumpul, hotel, penerbangan, pakaian, checklist yang bisa dicentang dan tersimpan, FAQ, dan tombol WhatsApp panitia.
- Jadwal dengan penanda acara berjalan, dan tambah ke kalender HP.
- Dua bahasa (Indonesia dan English) untuk peserta, dengan terjemahan otomatis isi trip.
- Lokasi trip di seluruh dunia, dengan cuaca dan waktu matahari terbit serta terbenam yang sebenarnya.
- Foto sampul dari lokasi trip.
- Panel panitia: ringkasan, daftar peserta dengan impor CSV, atur bus dan kamar massal, gabung data ganda, cetak kartu dan daftar hadir, absensi, pengumuman dan pengumuman terjadwal, tim panitia, duplikasi trip, dan unduh CSV.
- Live di https://demo-trip-two.vercel.app/?t=family-gathering-bali

Yang diuji dan hasilnya ada di [QA.md](QA.md). Ada beberapa temuan kecil yang sudah dicatat, seperti nomor WhatsApp dan data contoh yang harus diganti dengan data klien.

Yang belum diuji di HP asli: mode offline, notifikasi, scan QR, dan pengumuman terjadwal. Ini akan diuji sebelum deal.

## 4. Timeline

Brief menulis selesai dalam 7 hari. Dengan sisa pekerjaan berikut:

- Isi konten sesuai brief dari klien (hotel, jadwal, checklist, FAQ): sehari setelah konten diterima.
- Pengujian di HP asli dan perbaikan temuan: dua hari.
- Serah terima, domain, dan hosting: sehari.

Total sisa: kira-kira 4 hari kerja, termasuk ruang untuk revisi kecil dari klien.

## 5. Pertanyaan untuk klien

1. Brief menyebut PHP atau WordPress. Apakah pendekatan Next.js dengan database Supabase bisa diterima? Atau klien memerlukan PHP murni dengan database di hosting mereka?
2. Berapa perkiraan peserta per trip? Ini menentukan apakah panel panitia cukup dengan satu akun, atau perlu beberapa.
3. Siapa yang mengisi konten (jadwal, hotel, checklist)? Lewat panel admin langsung, atau dikirim ke kami untuk diisikan?
4. Apakah peserta perlu mengubah data sendiri (misalnya nomor HP atau ukuran kaos) setelah mendaftar?
5. Apakah ada fitur yang sudah wajib di versi pertama, dan mana yang boleh menyusul?
6. Domain dan hosting dikelola klien. Apakah klien punya akun Supabase sendiri, atau perlu kami bantu membuatkannya?
7. Apakah ada batas berapa lama data peserta disimpan setelah trip selesai?

## 6. Demo

- Halaman peserta: https://demo-trip-two.vercel.app/?t=family-gathering-bali
- Daftar dengan nama, departemen, dan nomor HP palsu, lalu lihat info perjalanannya.
- Panel panitia: https://demo-trip-two.vercel.app/panitia/ (akun demo dibagikan terpisah.)
