-- Owner bisa menghapus akses panitia lewat panel. Jalankan sekali di SQL Editor. Aman dijalankan ulang.
create or replace function public.hapus_staff(p_email text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if not private.is_owner() then raise exception 'Hanya owner yang bisa menghapus panitia.'; end if;
  select id into v_id from auth.users where lower(email) = lower(btrim(p_email));
  if v_id is null then raise exception 'Akun dengan email itu tidak ditemukan.'; end if;
  if v_id = auth.uid() then raise exception 'Akun Anda sendiri tidak bisa dihapus dari panel.'; end if;
  delete from public.staff where user_id = v_id;
  return 'Akses panitia sudah dihapus.';
end $$;
revoke all on function public.hapus_staff(text) from public, anon;
grant execute on function public.hapus_staff(text) to authenticated;
