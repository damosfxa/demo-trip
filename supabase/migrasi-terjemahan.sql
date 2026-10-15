-- Cache terjemahan (Indonesia ke English) untuk isi yang ditulis panitia. Jalankan sekali di SQL Editor.
create table if not exists public.terjemahan (
  sumber_hash text primary key,
  sumber text not null,
  isi_en text not null,
  dibuat timestamptz not null default now()
);
-- Tanpa policy: hanya diakses lewat Edge Function terjemahkan (service role).
alter table public.terjemahan enable row level security;
