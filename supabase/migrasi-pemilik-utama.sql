-- Pemilik utama (owner yang akunnya paling lama) tidak bisa dihapus atau diturunkan perannya oleh owner lain.
-- Berguna saat akun demo diberi peran owner: klien bisa mencoba semua fitur tanpa bisa mengunci pemilik aplikasi.

create or replace function private.pemilik_utama()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select s.user_id
  from public.staff s
  join auth.users u on u.id = s.user_id
  where s.role = 'owner'
  order by u.created_at
  limit 1;
$$;

create or replace function public.tambah_staff(p_email text, p_role text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not private.is_owner() then raise exception 'Hanya owner yang bisa menambah panitia.'; end if;
  if p_role not in ('owner', 'viewer') then raise exception 'Peran harus owner atau viewer.'; end if;
  select id into v_id from auth.users where lower(email) = lower(btrim(p_email));
  if v_id is null then raise exception 'Akun dengan email itu belum ada. Undang dulu lewat Supabase, menu Authentication, lalu Users.'; end if;
  if v_id = private.pemilik_utama() and v_id <> auth.uid() then raise exception 'Peran pemilik utama tidak bisa diubah.'; end if;
  insert into public.staff (user_id, role) values (v_id, p_role)
  on conflict (user_id) do update set role = excluded.role;
  return 'Peran diatur sebagai ' || p_role || '.';
end $$;

create or replace function public.hapus_staff(p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not private.is_owner() then raise exception 'Hanya owner yang bisa menghapus panitia.'; end if;
  select id into v_id from auth.users where lower(email) = lower(btrim(p_email));
  if v_id is null then raise exception 'Akun dengan email itu tidak ditemukan.'; end if;
  if v_id = auth.uid() then raise exception 'Akun Anda sendiri tidak bisa dihapus dari panel.'; end if;
  if v_id = private.pemilik_utama() then raise exception 'Pemilik utama tidak bisa dihapus.'; end if;
  delete from public.staff where user_id = v_id;
  return 'Akses panitia sudah dihapus.';
end $$;

revoke all on function private.pemilik_utama() from public, anon, authenticated;
