# Keamanan

Dokumen ini mencatat cara data dilindungi, dan keputusan yang sengaja diambil dengan kompromi.

## Model akses

| Pelaku | Bisa apa | Cara akses |
|---|---|---|
| Pengunjung umum | Melihat trip yang aktif (nama, tujuan, tanggal, info, checklist, FAQ, jadwal, pengumuman) | Kunci anon, dibatasi RLS |
| Peserta | Mendaftar, melihat data sendiri, mencentang checklist, membaca pesan pribadi | Token acak di HP lewat fungsi RPC |
| Viewer (panitia) | Melihat semua data trip | Login Supabase Auth, terdaftar di tabel `staff` |
| Owner (panitia) | Semua yang viewer bisa, plus mengubah data | Login Supabase Auth, peran `owner` |

## Yang dilindungi

- **Nomor HP dan data peserta tidak bisa dibaca anon.** Tabel `participants`, `checkins`, dan `pesan_pribadi` hanya bisa dibaca staff. Pengunjung tidak punya jalur langsung ke tabel-tabel itu.
- **Token peserta tidak bisa ditebak.** Kolom `token` memakai `gen_random_uuid()`.
- **Fungsi peran tidak bisa dipanggil publik.** `private.is_staff()` dan `private.is_owner()` berada di schema `private`, dan hak eksekusinya dicabut dari `public`.
- **Fungsi `SECURITY DEFINER` dikunci `search_path`.** Mencegah pembajakan lewat schema lain.
- **Langganan notifikasi tidak bisa dibaca.** Tabel `push_langganan` tidak punya policy sama sekali, sehingga hanya bisa diakses lewat fungsi.
- **Kunci VAPID privat tidak disimpan di kode.** Disimpan di tabel `private.konfigurasi` yang bisa dibaca service role saja.
- **Akses ke Edge Function `kirim-kabar`** diperiksa dulu: pemanggil harus akun dengan peran owner.

## Kompromi yang disengaja

### Pemulihan token lewat nama dan nomor HP

Peserta yang ganti HP atau menghapus data browser bisa mendapatkan token lamanya lagi dengan mengisi nama dan nomor HP yang sama. Ini dibuat supaya peserta tidak perlu menghubungi panitia.

Akibatnya: siapa pun yang tahu nama dan nomor HP seseorang bisa mendapatkan token-nya, lalu membaca jadwal, kartu, dan pesan pribadi orang itu.

Penilaian: untuk trip rombongan, nama dan nomor HP biasanya sudah diketahui sesama peserta, jadi risikonya dianggap rendah. Kalau klien meminta keamanan lebih ketat, opsinya adalah kode akses dari panitia atau OTP lewat WhatsApp.

### Tidak ada rate limit pada registrasi

Fungsi `daftar_peserta` bisa dipanggil berulang kali oleh siapa saja yang tahu slug trip. Risikonya: data sampah atau spam di daftar peserta. Panitia bisa menghapus baris yang tidak dikenal dari panel.

### Kunci anon ada di browser

`NEXT_PUBLIC_SUPABASE_ANON_KEY` memang terlihat di browser. Ini aman selama RLS aktif di semua tabel. Setiap kali ada tabel atau policy baru, cek lagi bahwa anon tidak bisa membaca data sensitif.

## Yang belum diaudit

- Policy untuk bucket Storage. Aplikasi menyimpan `cover_url` dan `logo_url` sebagai URL `https://`, tapi belum dipastikan apakah itu berasal dari upload ke bucket.
- Serangan XSS pada isi pengumuman dan FAQ yang ditulis panitia. React mengescape teks secara default, tapi belum ada tes khusus.

### Nomor HP teman sekamar

Setelah `supabase/migrasi-fitur-panitia.sql` dijalankan, peserta bisa melihat nama dan nomor HP teman satu kamar di kartu mereka. Ini hanya berlaku untuk kamar yang sama, dan hanya bisa dibuka oleh peserta yang punya token. Ini kompromi yang disengaja supaya peserta bisa saling menghubungi.

### Pembaruan data peserta

Peserta bisa mengubah nomor HP dan isiannya sendiri lewat fungsi `ubah_data_saya`, dengan token di HP. Nomor HP yang sudah dipakai peserta lain di trip yang sama ditolak.

## Kredensial

- Tidak ada password atau kunci privat di repo. File `.env*.local` masuk `.gitignore`.
- Kunci service role Supabase hanya dipakai di Edge Function, lewat environment variable Supabase, bukan di kode.
- Akun demo panitia dibagikan lewat chat, tidak lewat repo.
