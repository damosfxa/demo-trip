# Info Trip

Info perjalanan rombongan di HP peserta. Untuk agen perjalanan, family gathering, study tour, dan umrah.

**Demo langsung:** https://demo-trip-two.vercel.app/?t=family-gathering-bali
(Trip contoh "Family Gathering 2026". Daftar dengan nama, departemen, dan nomor HP palsu, lalu lihat info perjalanannya.)

**Panel panitia:** https://demo-trip-two.vercel.app/panitia/
(Akun demo panitia dibagikan terpisah. Tidak dicantumkan di repo.)

## Masalah yang diselesaikan

Info perjalanan biasanya dibagikan lewat grup WhatsApp. Jadwal, titik kumpul, dan checklist cepat tertimbun, dan panitia menjawab pertanyaan yang sama berulang kali. Info Trip menyatukan semuanya dalam satu link. Peserta mendaftar sekali, lalu mendapatkan jadwal, kartu peserta, checklist, pengumuman, dan FAQ di HP mereka.

## Fitur utama

**Untuk peserta**
- Registrasi dengan nama, departemen, dan nomor HP, plus isian tambahan dari panitia (misalnya ukuran kaos).
- Jadwal dengan penanda acara yang sedang berjalan, sesuai zona waktu kota tujuan.
- Kartu peserta dengan QR, bus, kamar, dan teman sekamar.
- Info perjalanan: titik kumpul dengan peta, hotel, penerbangan, pakaian, checklist, dan tanya jawab.
- Pengumuman dan pesan pribadi dari panitia.
- Layar pembuka yang hidup saat aplikasi dibuka.
- Tindakan cepat di beranda: kartu, jadwal, info, bagikan trip, hubungi panitia, dan petunjuk arah.
- Tambah setiap acara ke kalender HP (file .ics).
- Pencarian di info, barang bawaan, dan tanya jawab.
- Salin titik kumpul dan info penting dengan satu ketukan.
- Bisa dipasang sebagai aplikasi di layar HP dan tetap terbuka tanpa sinyal setelah pernah dibuka.

**Untuk panitia**
- Ringkasan trip: jumlah peserta, kehadiran per titik, dan peserta per departemen.
- Kelola peserta: filter departemen, atur bus dan kamar, unduh daftar peserta, rooming list, dan manifest bus.
- Absensi dengan scan QR per titik.
- Tulis pengumuman, pesan pribadi, dan kirim notifikasi ke HP peserta.
- Atur jadwal, info, checklist, FAQ, dan isian registrasi.
- Bagikan link dan QR poster, atau kirim ke grup WhatsApp.

Daftar lengkap dan status tiap fitur ada di [PRD.md](PRD.md). Hasil tes ada di [QA.md](QA.md).

## Tech stack dan alasan

- **Next.js 16 (ekspor statis):** halaman dibuat menjadi file statis di folder `out/`. File ini bisa di-host di hosting biasa, dan tidak butuh server Node.js. Cocok dengan permintaan "ringan".
- **TypeScript:** kesalahan tipe ketahuan saat build, bukan saat dipakai peserta.
- **Tailwind CSS:** tampilan konsisten dan kecil ukuran CSS-nya.
- **Supabase (PostgreSQL + RLS):** database dan login panitia. Keamanan data dijaga di database, bukan hanya di aplikasi. Peserta tidak punya akun dan tidak bisa membaca tabel peserta langsung.
- **Web Push + Edge Function:** notifikasi HP untuk pengumuman dan pesan pribadi.
- **html5-qrcode, qrcode:** scan QR untuk absensi dan pembuatan QR kartu peserta.
- **Service worker:** halaman dan aset disimpan di browser supaya tetap terbuka tanpa sinyal.

## Cara install dan jalankan

Persyaratan: Node.js 20 atau lebih baru, dan project Supabase.

1. Buat project Supabase baru.
2. Jalankan `supabase/schema.sql` di SQL Editor, lalu `supabase/seed-demo.sql` untuk trip contoh.
3. Buat akun panitia di Authentication, lalu jalankan `supabase/staff.sql` dengan email akun tersebut.
4. Salin `.env.example` menjadi `.env.local`, lalu isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Jalankan:

```bash
npm install
```

```bash
npm run dev
```

Buka http://localhost:3000.

Untuk membuat file statis yang siap di-host:

```bash
npm run build
```

Hasilnya ada di folder `out/`.

Untuk notifikasi HP, buat kunci VAPID dan simpan ke tabel `private.konfigurasi` seperti dijelaskan di `supabase/schema.sql`, lalu deploy Edge Function `supabase/functions/kirim-kabar`.

## Lisensi dan atribusi

Kode ini dibuat untuk klien. Lisensi belum ditentukan.
