# Info Trip

Aplikasi web untuk rombongan perjalanan (agen travel, family gathering, study tour, umrah).

**Peserta** membuka link dari panitia, registrasi sekali (nama, departemen, nomor HP), lalu mendapat:
jadwal dengan penanda acara yang sedang berlangsung, kartu peserta ber-QR (bus, kamar, teman sekamar),
pengumuman, info penting, checklist barang bawaan, dan tanya jawab. Bisa dipasang di layar HP dan tetap
terbuka saat sinyal hilang.

**Panitia** login untuk melihat ringkasan, mengelola peserta (bus, kamar, catatan, unduh Excel),
absensi scan QR per titik, pengumuman, jadwal, dan pengaturan trip. Satu aplikasi bisa dipakai untuk banyak trip.

## Teknologi
Next.js (ekspor statis, jadi bisa diunggah ke hosting biasa), TypeScript, Tailwind CSS, Supabase (PostgreSQL + RLS).

## Menjalankan
1. Buat project Supabase, jalankan `supabase/schema.sql`, lalu `supabase/seed-demo.sql` (trip contoh).
2. Buat user panitia di Authentication → Users, lalu jalankan `supabase/staff.sql`.
3. Salin `.env.example` ke `.env.local` dan isi URL serta anon key Supabase.
4. `npm install` lalu `npm run dev`.

`npm run build` menghasilkan folder `out/` berisi file statis yang bisa diunggah ke hosting mana pun.

## Keamanan
- Data peserta (termasuk nomor HP) tidak bisa dibaca publik. Peserta mengakses datanya lewat token rahasia.
- Hanya akun di tabel `staff` yang bisa membuka panel panitia. Peran `viewer` hanya bisa melihat.

Dibuat oleh [Rizky Rhamadani](https://rizkyrhamadani.com).
