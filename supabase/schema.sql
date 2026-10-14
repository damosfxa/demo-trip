-- Info Trip: skema database.
-- JALANKAN DI PROJECT SUPABASE KHUSUS APLIKASI INI (alamat dashboard mengandung pozxevzycumdwnagwvid (info-trip)).
-- Aman dijalankan ulang. Setelah ini jalankan supabase/seed-demo.sql untuk trip contoh.
--
-- Keamanan:
-- - Pengunjung (anon) hanya bisa membaca trip yang aktif, jadwal, dan pengumumannya.
-- - Data peserta (termasuk nomor HP) TIDAK bisa dibaca anon. Peserta mendaftar dan membaca datanya sendiri
--   lewat fungsi (RPC) dengan token rahasia yang tersimpan di HP-nya.
-- - Panitia = akun yang terdaftar di tabel staff. Peran 'owner' bisa mengubah data, 'viewer' hanya melihat
--   (untuk akun demo yang dibagikan ke calon klien).

create extension if not exists pgcrypto;

-- ===== Tabel =====
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'),
  nama text not null,
  penyelenggara text,
  tujuan text not null,
  mulai date not null,
  selesai date not null,
  zona text not null default 'Asia/Jakarta' check (zona in ('Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura')),
  titik_kumpul text,
  cover_url text check (cover_url is null or cover_url ~ '^https://'), -- foto sampul (opsional)
  maps_url text,
  wa_panitia text,
  departemen jsonb not null default '[]',
  info jsonb not null default '[]',        -- [{judul, isi}]
  checklist jsonb not null default '[]',   -- ["KTP", ...]
  faq jsonb not null default '[]',         -- [{q, a}]
  titik_absen jsonb not null default '["Titik kumpul"]', -- tempat absensi scan QR
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.agenda (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  mulai timestamptz not null,
  selesai timestamptz,
  judul text not null,
  lokasi text,
  ket text,
  zona text check (zona in ('Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura')) -- kosong = ikut zona trip
);
create index if not exists agenda_trip_idx on public.agenda (trip_id, mulai);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  nama text not null check (length(nama) between 2 and 80),
  departemen text not null check (length(departemen) between 1 and 60),
  hp text not null check (hp ~ '^08[0-9]{8,11}$'),
  bus text,
  kamar text,
  catatan text,
  created_at timestamptz not null default now(),
  unique (trip_id, hp)
);
create index if not exists participants_trip_idx on public.participants (trip_id);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  isi text not null check (length(isi) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists announcements_trip_idx on public.announcements (trip_id, created_at desc);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  titik text not null,
  created_at timestamptz not null default now(),
  unique (participant_id, titik)
);
create index if not exists checkins_trip_idx on public.checkins (trip_id);

create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'viewer'))
);

-- Kolom yang ditambahkan setelah versi pertama (aman bila sudah ada).
alter table public.trips add column if not exists zona text not null default 'Asia/Jakarta';
alter table public.trips add column if not exists cover_url text check (cover_url is null or cover_url ~ '^https://');
alter table public.agenda add column if not exists zona text check (zona in ('Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'));

-- ===== Fungsi peran =====
-- Ditaruh di schema private supaya tidak bisa dipanggil lewat API publik.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

create or replace function private.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid() and role = 'owner');
$$;

revoke all on function private.is_staff() from public;
revoke all on function private.is_owner() from public;

-- ===== RLS =====
alter table public.trips enable row level security;
alter table public.agenda enable row level security;
alter table public.participants enable row level security;
alter table public.announcements enable row level security;
alter table public.checkins enable row level security;
alter table public.staff enable row level security;

drop policy if exists "baca trip aktif" on public.trips;
create policy "baca trip aktif" on public.trips for select using (aktif or private.is_staff());
drop policy if exists "owner kelola trip" on public.trips;
create policy "owner kelola trip" on public.trips for all to authenticated using (private.is_owner()) with check (private.is_owner());

drop policy if exists "baca agenda" on public.agenda;
create policy "baca agenda" on public.agenda for select using (exists (select 1 from public.trips t where t.id = trip_id and (t.aktif or private.is_staff())));
drop policy if exists "owner kelola agenda" on public.agenda;
create policy "owner kelola agenda" on public.agenda for all to authenticated using (private.is_owner()) with check (private.is_owner());

drop policy if exists "baca pengumuman" on public.announcements;
create policy "baca pengumuman" on public.announcements for select using (exists (select 1 from public.trips t where t.id = trip_id and (t.aktif or private.is_staff())));
drop policy if exists "owner kelola pengumuman" on public.announcements;
create policy "owner kelola pengumuman" on public.announcements for all to authenticated using (private.is_owner()) with check (private.is_owner());

-- Peserta & absensi: hanya panitia. Anon sama sekali tidak punya policy di sini.
drop policy if exists "staff baca peserta" on public.participants;
create policy "staff baca peserta" on public.participants for select to authenticated using (private.is_staff());
drop policy if exists "owner ubah peserta" on public.participants;
create policy "owner ubah peserta" on public.participants for update to authenticated using (private.is_owner()) with check (private.is_owner());
drop policy if exists "owner hapus peserta" on public.participants;
create policy "owner hapus peserta" on public.participants for delete to authenticated using (private.is_owner());

drop policy if exists "staff baca absen" on public.checkins;
create policy "staff baca absen" on public.checkins for select to authenticated using (private.is_staff());
drop policy if exists "owner tulis absen" on public.checkins;
create policy "owner tulis absen" on public.checkins for insert to authenticated with check (private.is_owner());
drop policy if exists "owner hapus absen" on public.checkins;
create policy "owner hapus absen" on public.checkins for delete to authenticated using (private.is_owner());

drop policy if exists "lihat peran sendiri" on public.staff;
create policy "lihat peran sendiri" on public.staff for select to authenticated using (user_id = auth.uid());

-- ===== Fungsi untuk peserta (tanpa login) =====

-- Registrasi. Bila nomor HP sudah terdaftar di trip yang sama DAN namanya cocok, token lama dikembalikan
-- (peserta ganti HP / hapus data browser). Bila nama tidak cocok, ditolak supaya data orang lain aman.
create or replace function public.daftar_peserta(p_slug text, p_nama text, p_departemen text, p_hp text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_trip public.trips;
  v_hp text := regexp_replace(regexp_replace(coalesce(p_hp, ''), '[^0-9+]', '', 'g'), '^\+62', '0');
  v_nama text := btrim(regexp_replace(coalesce(p_nama, ''), '\s+', ' ', 'g'));
  v_lama public.participants;
  v_token uuid;
begin
  select * into v_trip from public.trips where slug = p_slug and aktif;
  if not found then raise exception 'Trip tidak ditemukan atau sudah ditutup.'; end if;
  if length(v_nama) < 2 then raise exception 'Tulis nama lengkap Anda.'; end if;
  if v_hp !~ '^08[0-9]{8,11}$' then raise exception 'Nomor HP belum benar. Contoh: 0812 3456 7890'; end if;
  if not (v_trip.departemen ? p_departemen) then raise exception 'Pilih departemen dari daftar.'; end if;

  select * into v_lama from public.participants where trip_id = v_trip.id and hp = v_hp;
  if found then
    if lower(v_lama.nama) = lower(v_nama) then return v_lama.token; end if;
    raise exception 'Nomor HP ini sudah terdaftar dengan nama lain. Hubungi panitia.';
  end if;

  insert into public.participants (trip_id, nama, departemen, hp)
  values (v_trip.id, v_nama, p_departemen, v_hp) returning token into v_token;
  return v_token;
end $$;

-- Data milik peserta sendiri (berdasarkan token): profil, teman sekamar, dan status absensi.
create or replace function public.data_saya(p_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', p.id,
    'trip_slug', t.slug,
    'nama', p.nama,
    'departemen', p.departemen,
    'bus', p.bus,
    'kamar', p.kamar,
    'teman_sekamar', coalesce((
      select jsonb_agg(x.nama order by x.nama) from public.participants x
      where x.trip_id = p.trip_id and p.kamar is not null and x.kamar = p.kamar and x.id <> p.id
    ), '[]'::jsonb),
    'absen', coalesce((
      select jsonb_agg(jsonb_build_object('titik', c.titik, 'waktu', c.created_at) order by c.created_at)
      from public.checkins c where c.participant_id = p.id
    ), '[]'::jsonb)
  )
  from public.participants p join public.trips t on t.id = p.trip_id
  where p.token = p_token;
$$;

revoke all on function public.daftar_peserta(text, text, text, text) from public;
revoke all on function public.data_saya(uuid) from public;
grant execute on function public.daftar_peserta(text, text, text, text) to anon, authenticated;
grant execute on function public.data_saya(uuid) to anon, authenticated;
grant execute on function private.is_staff() to anon, authenticated;
grant execute on function private.is_owner() to anon, authenticated;
