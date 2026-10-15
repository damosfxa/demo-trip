-- Migrasi fitur panitia dan peserta. Jalankan sekali di SQL Editor project Info Trip. Aman dijalankan ulang.

-- 1. Kapasitas bus dan kamar per trip (dipakai untuk peringatan di ringkasan).
alter table public.trips add column if not exists kapasitas_bus int not null default 40 check (kapasitas_bus > 0);
alter table public.trips add column if not exists kapasitas_kamar int not null default 2 check (kapasitas_kamar > 0);

-- 2. Panitia (owner) boleh menambah peserta, misalnya lewat impor CSV.
drop policy if exists "owner tambah peserta" on public.participants;
create policy "owner tambah peserta" on public.participants for insert to authenticated with check (private.is_owner());

-- 3. Peserta mengubah nomor HP dan isiannya sendiri, lewat token di HP.
create or replace function public.ubah_data_saya(p_token uuid, p_hp text, p_isian jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_p public.participants;
  v_t public.trips;
  v_hp text := regexp_replace(coalesce(p_hp, ''), '[^0-9]', '', 'g');
  f jsonb;
  v text;
  v_isian jsonb := '{}';
begin
  select * into v_p from public.participants where token = p_token;
  if not found then raise exception 'Data tidak ditemukan.'; end if;
  select * into v_t from public.trips where id = v_p.trip_id;
  if v_hp !~ '^08[0-9]{8,11}$' then raise exception 'Nomor HP belum benar. Contoh: 0812 3456 7890'; end if;
  for f in select * from jsonb_array_elements(v_t.isian) loop
    v := btrim(coalesce(p_isian ->> (f ->> 'id'), ''));
    if v = '' and coalesce((f ->> 'wajib')::boolean, false) then raise exception '% wajib diisi.', f ->> 'label'; end if;
    if v <> '' then v_isian := v_isian || jsonb_build_object(f ->> 'id', left(v, 200)); end if;
  end loop;
  update public.participants set hp = v_hp, isian = v_isian where id = v_p.id;
  return true;
exception when unique_violation then
  raise exception 'Nomor HP itu sudah dipakai peserta lain di trip ini.';
end $$;
revoke all on function public.ubah_data_saya(uuid, text, jsonb) from public;
grant execute on function public.ubah_data_saya(uuid, text, jsonb) to anon, authenticated;

-- 4. data_saya menambahkan kontak teman sekamar (nama dan nomor HP), supaya peserta bisa saling menghubungi.
create or replace function public.data_saya(p_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', p.id, 'trip_slug', t.slug, 'nama', p.nama, 'departemen', p.departemen, 'bus', p.bus, 'kamar', p.kamar, 'isian', p.isian,
    'teman_sekamar', coalesce((select jsonb_agg(x.nama order by x.nama) from public.participants x
      where x.trip_id = p.trip_id and p.kamar is not null and x.kamar = p.kamar and x.id <> p.id), '[]'::jsonb),
    'teman_kontak', coalesce((select jsonb_agg(jsonb_build_object('nama', x.nama, 'hp', x.hp) order by x.nama) from public.participants x
      where x.trip_id = p.trip_id and p.kamar is not null and x.kamar = p.kamar and x.id <> p.id), '[]'::jsonb),
    'absen', coalesce((select jsonb_agg(jsonb_build_object('titik', c.titik, 'waktu', c.created_at) order by c.created_at)
      from public.checkins c where c.participant_id = p.id), '[]'::jsonb),
    'pesan', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'isi', m.isi, 'created_at', m.created_at) order by m.created_at desc)
      from (select * from public.pesan_pribadi where participant_id = p.id order by created_at desc limit 30) m), '[]'::jsonb)
  )
  from public.participants p join public.trips t on t.id = p.trip_id
  where p.token = p_token;
$$;
grant execute on function public.data_saya(uuid) to anon, authenticated;
