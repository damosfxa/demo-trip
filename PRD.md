# PRD: Info Trip

Dokumen ini menjelaskan apa yang dibangun, untuk siapa, dan batasannya. Setiap requirement diberi asal (brief atau usulan) supaya bisa ditelusuri.

Sumber:
- **[B]** Brief klien (proyek freelance projects.co.id, "Website informasi simple", dipublikasikan 13 Okt 2026).
- **[U]** Usulan tim, di luar brief. Ditandai supaya jelas bukan permintaan klien.

## 1. Problem statement

Agen perjalanan, panitia family gathering, study tour, dan umrah sering membagikan info perjalanan lewat grup WhatsApp. Info cepat tertimbun, peserta sulit menemukan jadwal, titik kumpul, dan checklist, sementara panitia kewalahan menjawab pertanyaan yang sama berulang kali. Brief meminta website ringan yang hanya berfungsi sebagai sumber informasi bagi peserta, dengan registrasi sekali di awal [B].

## 2. Goals

Diurutkan dari yang paling menentukan bagi klien:
1. Peserta bisa mendaftar dari HP dengan nama, departemen, dan nomor HP, lalu langsung melihat info perjalanan [B].
2. Info perjalanan lengkap: jadwal, titik kumpul, hotel, penerbangan, checklist, dan FAQ [B: "info perjalanan dan lain lain"].
3. Tampilan ringan dan nyaman di HP, dipakai tanpa latihan [B: "mobile only", "ringan"].
4. Panitia bisa mengelola isi tanpa bantuan developer [U].
5. Domain dan hosting dikelola klien, bukan tim [B].

## 3. Target user

- **Peserta:** karyawan atau anggota rombongan. Pengguna HP, sebagian tidak selalu punya sinyal. Tidak perlu akun atau password.
- **Panitia (owner):** staf agen atau perusahaan yang menyiapkan trip. Memakai laptop atau HP untuk mengelola data.
- **Viewer:** akun demo yang dibagikan ke calon klien. Hanya bisa melihat [U].

## 4. User stories

Peserta:
- Sebagai peserta, saya mendaftar sekali dengan nama, departemen, dan nomor HP supaya bisa melihat info perjalanan [B].
- Sebagai peserta, saya melihat jadwal dan penanda acara yang sedang berjalan sesuai zona waktu kota tujuan [U].
- Sebagai peserta, saya melihat kartu QR berisi bus, kamar, dan teman sekamar [U].
- Sebagai peserta, saya mencentang checklist barang bawaan dan centangannya tersimpan di HP [U].
- Sebagai peserta, saya membaca pengumuman dan pesan pribadi dari panitia [U].
- Sebagai peserta, saya membuka info tanpa sinyal setelah pernah dibuka [U].
- Sebagai peserta, saya menghubungi panitia lewat WhatsApp dan membuka petunjuk arah ke titik kumpul [U].

Panitia:
- Sebagai panitia, saya membuat trip baru dan mengatur data dasarnya [U].
- Sebagai panitia, saya menulis jadwal, info, checklist, dan FAQ [B: "info perjalanan"].
- Sebagai panitia, saya menulis pengumuman dan mengirim notifikasi ke HP peserta [U].
- Sebagai panitia, saya mengatur bus dan kamar tiap peserta [U].
- Sebagai panitia, saya mencatat kehadiran dengan scan QR di tiap titik absen [U].
- Sebagai panitia, saya mengunduh daftar peserta, rooming list, dan manifest bus [U].
- Sebagai panitia, saya membagikan link dan QR untuk peserta [U].

## 5. Functional requirements

Status per 16 Okt 2026. Lihat [QA.md](QA.md) untuk hasil tes.

| ID | Requirement | Asal | Prioritas | Status |
|---|---|---|---|---|
| FR-1 | Registrasi peserta: nama lengkap, departemen (dari daftar), nomor HP | [B] | P0 | Ada, tes lolos |
| FR-2 | Isian tambahan registrasi yang diatur panitia, dengan pilihan dan wajib/opsional | [U] | P1 | Ada, sebagian tes |
| FR-3 | Setelah registrasi, peserta melihat info perjalanan tanpa login | [B] | P0 | Ada, tes lolos |
| FR-4 | Info perjalanan: titik kumpul, peta, hotel, penerbangan, pakaian, checklist, FAQ | [B] | P0 | Ada, tes lolos |
| FR-5 | Jadwal dengan penanda acara berjalan sesuai zona waktu trip | [U] | P1 | Ada, hari 1 tes lolos |
| FR-6 | Kartu peserta dengan QR, bus, kamar, dan teman sekamar | [U] | P1 | Ada, tes lolos |
| FR-7 | Pengumuman publik dan pesan pribadi dari panitia | [U] | P1 | Ada, tes sebagian |
| FR-8 | Notifikasi HP (Web Push) ke peserta yang berlangganan | [U] | P2 | Ada, belum tes di HP asli |
| FR-9 | Absensi scan QR per titik, daftar hadir per titik | [U] | P2 | Ada, belum tes kamera |
| FR-10 | Dashboard panitia: ringkasan, kehadiran per titik, peserta per departemen | [U] | P1 | Ada, tes lolos |
| FR-11 | Atur bus dan kamar per peserta | [U] | P1 | Ada, tes sebagian |
| FR-12 | Unduh daftar peserta, rooming list, dan manifest bus (CSV, bisa dibuka Excel) | [U] | P1 | Ada, belum buka file |
| FR-13 | Bagikan link trip dan QR poster, kirim ke grup WhatsApp | [U] | P1 | Ada, tes lolos |
| FR-14 | Checklist barang bawaan tersimpan di HP | [U] | P1 | Ada, tes lolos |
| FR-15 | Bisa dipasang di layar HP dan tetap terbuka tanpa sinyal | [U] | P2 | Ada, offline belum diuji di HP |
| FR-16 | Login panitia dengan akun terdaftar, peran owner dan viewer | [U] | P0 | Ada, tes lolos |
| FR-17 | Tema warna per trip dan logo | [U] | P2 | Ada, belum dites |
| FR-18 | Pengaturan zona waktu trip | [U] | P1 | Ada, dites user |
| FR-19 | Layar muat yang hidup: pemandangan bergerak, pesawat melayang, bar berjalan, dan pesan yang berganti | [U] | P1 | Ada, tampil dan hydrate tanpa error |
| FR-20 | Tindakan cepat di beranda: Kartu, Jadwal, Info, Bagikan, Panitia (WhatsApp), Arah (petunjuk arah) | [U] | P1 | Ada, tampil di HP emulasi |
| FR-21 | Bagikan tautan trip lewat menu bagikan HP, atau salin tautan kalau menu tidak ada | [U] | P1 | Ada, belum diuji di HP asli |
| FR-22 | Tambah setiap acara ke kalender HP lewat file .ics | [U] | P1 | Ada, file belum dibuka di kalender |
| FR-23 | Pencarian di info, barang bawaan, dan tanya jawab sekaligus | [U] | P1 | Ada, tes lolos (kata "power") |
| FR-24 | Salin titik kumpul dan info penting dengan satu ketukan | [U] | P2 | Ada, belum tes di HP asli |
| FR-25 | Bisa dipasang sebagai aplikasi: manifest lengkap, service worker menyimpan kerangka aplikasi sejak kunjungan pertama | [U] | P0 | Ada, build statis lulus |
| FR-26 | Jadwal dengan label "Hari ini" dan tombol tambah ke kalender per acara | [U] | P1 | Ada, tampil |

## 6. Non-functional requirements

- **Ringan:** halaman utama dibuat sebagai file statis (Next.js export) sehingga bisa di-host di mana saja [B: "ringan"].
- **Mobile first:** lebar konten dibatasi `max-w-md` dan dirancang untuk layar HP [B: "mobile only"]. Tampilan di desktop tetap terbaca, tapi tidak dioptimalkan.
- **Keamanan data peserta:** nomor HP dan data pribadi tidak bisa dibaca publik. Peserta mengakses datanya dengan token di HP. Detail ada di [SECURITY.md](SECURITY.md).
- **Kualitas kode:** `tsc --noEmit` dan `npm run lint` harus lolos tanpa error.
- **Bahasa:** seluruh antarmuka berbahasa Indonesia.
- **Akses offline:** halaman yang pernah dibuka tetap bisa dilihat tanpa sinyal (service worker) [U].

## 7. Scope

**In scope (sudah dibangun):** semua FR di atas.

**Out of scope:**
- Pembayaran, pemesanan tiket, dan integrasi hotel atau maskapai. Brief tidak memintanya [B].
- Hosting dan domain. Dikelola klien [B].
- Aplikasi native. Cukup web yang bisa dipasang di layar HP [U].
- Multi-bahasa. Hanya Bahasa Indonesia [U].

**Catatan interpretasi:**
- Brief menyebut "PHP atau WordPress". Implementasi memakai Next.js dengan Supabase. Ini keputusan tim, perlu dikonfirmasi ke klien sebelum deal [U]. Lihat pertanyaan di [PROPOSAL.md](PROPOSAL.md).
- Brief menyebut "mobile only". Tampilan dibatasi lebar HP, sehingga di desktop tampil seperti kolom HP di tengah layar.

## 8. Standar hasil akhir (Definition of Done)

- Alur registrasi sampai info perjalanan berjalan tanpa error di Chrome Android dan Safari iOS [U].
- Tidak ada placeholder, TODO, atau tombol mati di halaman yang dilihat peserta [U].
- Data tes dihapus dari database sebelum diserahkan ke klien [U].
- `tsc` dan `lint` lulus, dan tes manual di HP sudah dicatat di [QA.md](QA.md).

## 9. Risiko

- **Keputusan stack:** brief meminta PHP atau WordPress. Jika klien menolak Next.js, pekerjaan perlu dinegosiasikan ulang [U].
- **Notifikasi HP:** butuh izin browser dan kunci VAPID yang dibuat sendiri. Belum diuji di HP asli.
- **Tenggat:** brief menulis 7 hari. Dengan tanggal post 13 Okt, sisa waktu dihitung dari hari ini [B].
