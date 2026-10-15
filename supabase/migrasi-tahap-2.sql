-- Migrasi tahap 2: pengumuman terjadwal dan tim panitia. Jalankan sekali di SQL Editor. Aman dijalankan ulang.

-- 1. Pengumuman terjadwal (termasuk pengingat H-1).
create table if not exists public.pengumuman_terjadwal (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  isi text not null check (length(isi) between 1 and 1000),
  kirim_pada timestamptz not null,
  status text not null default 'menunggu' check (status in ('menunggu', 'terkirim')),
  dibuat_pada timestamptz not null default now()
);
create index if not exists pengumuman_terjadwal_idx on public.pengumuman_terjadwal (status, kirim_pada);
alter table public.pengumuman_terjadwal enable row level security;
drop policy if exists "owner kelola terjadwal" on public.pengumuman_terjadwal;
create policy "owner kelola terjadwal" on public.pengumuman_terjadwal for all to authenticated using (private.is_owner()) with check (private.is_owner());
drop policy if exists "staff baca terjadwal" on public.pengumuman_terjadwal;
create policy "staff baca terjadwal" on public.pengumuman_terjadwal for select to authenticated using (private.is_staff());

-- Memindahkan pengumuman yang sudah waktunya ke daftar pengumuman peserta. Dipanggil terjadwal oleh pg_cron.
create or replace function public.proses_pengumuman_terjadwal()
returns integer language plpgsql security definer set search_path = public as $$
declare
  r record;
  n integer := 0;
begin
  for r in select * from public.pengumuman_terjadwal where status = 'menunggu' and kirim_pada <= now() for update loop
    insert into public.announcements (trip_id, isi) values (r.trip_id, r.isi);
    update public.pengumuman_terjadwal set status = 'terkirim' where id = r.id;
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function public.proses_pengumuman_terjadwal() from public, anon, authenticated;

-- 2. Tim panitia: owner menambahkan akun yang sudah terdaftar di Supabase Auth, berdasarkan email.
create or replace function public.tambah_staff(p_email text, p_role text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if not private.is_owner() then raise exception 'Hanya owner yang bisa menambah panitia.'; end if;
  if p_role not in ('owner', 'viewer') then raise exception 'Peran harus owner atau viewer.'; end if;
  select id into v_id from auth.users where lower(email) = lower(btrim(p_email));
  if v_id is null then raise exception 'Akun dengan email itu belum ada. Undang dulu lewat Supabase, menu Authentication, lalu Users.'; end if;
  insert into public.staff (user_id, role) values (v_id, p_role)
  on conflict (user_id) do update set role = excluded.role;
  return 'Peran diatur sebagai ' || p_role || '.';
end $$;
revoke all on function public.tambah_staff(text, text) from public, anon;
grant execute on function public.tambah_staff(text, text) to authenticated;

create or replace function public.daftar_staff()
returns table (email text, peran text) language plpgsql stable security definer set search_path = public as $$
begin
  if not private.is_owner() then raise exception 'Hanya owner yang bisa melihat tim panitia.'; end if;
  return query select u.email::text, s.role::text from public.staff s join auth.users u on u.id = s.user_id order by u.email;
end $$;
revoke all on function public.daftar_staff() from public, anon;
grant execute on function public.daftar_staff() to authenticated;

-- 3. Penjadwal (jalankan setelah extension pg_cron aktif di Supabase, menu Database, Extensions):
-- select cron.schedule('proses-pengumuman', '*/5 * * * *', $$select public.proses_pengumuman_terjadwal()$$);
