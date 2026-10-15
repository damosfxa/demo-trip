# Skema Database

Database: PostgreSQL di Supabase. Skema lengkap ada di [supabase/schema.sql](supabase/schema.sql).

## Diagram relasi

```mermaid
erDiagram
  trips ||--o{ agenda : "punya"
  trips ||--o{ participants : "punya"
  trips ||--o{ announcements : "punya"
  trips ||--o{ checkins : "punya"
  trips ||--o{ pesan_pribadi : "punya"
  trips ||--o{ push_langganan : "punya"
  participants ||--o{ checkins : "absen di"
  participants ||--o{ pesan_pribadi : "menerima"
  participants ||--o{ push_langganan : "berlangganan"
  auth_users ||--o| staff : "menjadi"

  trips {
    uuid id PK
    text slug UK "huruf kecil, 3-40 karakter"
    text nama
    text penyelenggara
    text tujuan
    date mulai
    date selesai
    text zona "Asia/Jakarta, Asia/Makassar, Asia/Jayapura"
    text titik_kumpul
    text maps_url
    text wa_panitia
    jsonb departemen "daftar departemen"
    jsonb info "[judul, isi]"
    jsonb checklist
    jsonb faq "[q, a]"
    jsonb titik_absen
    jsonb isian "isian registrasi tambahan"
    text tema "laut, hutan, senja, anggur, arang"
    boolean aktif
  }
  agenda {
    uuid id PK
    uuid trip_id FK
    timestamptz mulai
    timestamptz selesai
    text judul
    text lokasi
    text ket
    text zona "kosong = ikut zona trip"
  }
  participants {
    uuid id PK
    uuid trip_id FK
    uuid token UK "rahasia, disimpan di HP peserta"
    text nama
    text departemen
    text hp "format 08..., unik per trip"
    text bus
    text kamar
    text catatan
    jsonb isian
  }
  announcements {
    uuid id PK
    uuid trip_id FK
    text isi "1-1000 karakter"
    timestamptz created_at
  }
  checkins {
    uuid id PK
    uuid trip_id FK
    uuid participant_id FK
    text titik
    timestamptz created_at
  }
  pesan_pribadi {
    uuid id PK
    uuid trip_id FK
    uuid participant_id FK
    text isi
    timestamptz created_at
  }
  push_langganan {
    uuid id PK
    uuid trip_id FK
    uuid participant_id FK
    text endpoint UK
    text p256dh
    text auth
  }
  staff {
    uuid user_id PK
    text role "owner atau viewer"
  }
```

Catatan: `auth_users` adalah tabel `auth.users` milik Supabase, bukan tabel aplikasi.

## Aturan penting

- **`participants.hp` unik per trip** (`unique (trip_id, hp)`). Nomor yang sama tidak bisa dipakai dua kali di trip yang sama.
- **`participants.token` unik dan acak.** Token ini kunci akses data peserta. Jangan dibagikan.
- **`checkins` unik per peserta per titik.** Absen ganda ditolak di database.
- **`staff.role`** hanya `owner` atau `viewer`. Viewer hanya bisa membaca.
- **Pemeriksaan format HP** di constraint `^08[0-9]{8,11}$`. Fungsi `daftar_peserta` juga menormalkan `+62` menjadi `08`.

## Kebijakan akses (RLS)

| Tabel | Anon | Authenticated (staff) | Owner |
|---|---|---|---|
| trips | baca jika `aktif` | baca semua | kelola |
| agenda | baca jika trip aktif | baca | kelola |
| announcements | baca jika trip aktif | baca | kelola |
| participants | tidak bisa | baca | ubah dan hapus |
| checkins | tidak bisa | baca | tulis dan hapus |
| pesan_pribadi | tidak bisa | baca | tulis dan hapus |
| push_langganan | tidak bisa (tanpa policy) | tidak bisa | tidak bisa |
| staff | tidak bisa | baca baris sendiri | tidak bisa |
| private.konfigurasi | tidak bisa | tidak bisa | tidak bisa (hanya service role) |

Data peserta hanya bisa diakses lewat fungsi RPC:

| Fungsi | Siapa | Fungsi |
|---|---|---|
| `daftar_peserta(slug, nama, departemen, hp, isian)` | anon, authenticated | Registrasi, atau mengembalikan token lama bila nomor dan nama cocok |
| `data_saya(token)` | anon, authenticated | Data milik satu token |
| `simpan_langganan(token, endpoint, p256dh, auth)` | anon, authenticated | Simpan langganan notifikasi peserta |
| `kunci_publik_notifikasi()` | anon, authenticated | Kunci publik VAPID untuk browser |
| `jumlah_langganan(trip)` | authenticated (staff) | Jumlah peserta yang berlangganan |
| `bahan_kirim_notifikasi(trip, peserta)` | service role | Data untuk Edge Function |
| `hapus_langganan_mati(endpoints)` | service role | Bersih-bersih langganan yang tidak aktif |

Semua fungsi `SECURITY DEFINER` memakai `set search_path = public`, supaya tidak bisa dibajak lewat schema lain.

## Catatan migrasi

- `schema.sql` aman dijalankan ulang, tapi `daftar_peserta` dan `data_saya` didefinisikan lebih dari sekali. Versi terakhir yang berlaku.
- Kolom yang ditambahkan belakangan memakai `alter table ... add column if not exists`.
- Setelah perubahan langsung di SQL Editor, sebaiknya bandingkan skema live dengan file ini supaya tidak terjadi drift.
