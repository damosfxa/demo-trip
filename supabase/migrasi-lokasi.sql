-- Lokasi trip di seluruh dunia: nama tempat, koordinat, dan zona waktu bebas (bukan hanya tiga zona Indonesia).
-- Jalankan sekali di SQL Editor. Aman dijalankan ulang.
alter table public.trips drop constraint if exists trips_zona_check;
alter table public.agenda drop constraint if exists agenda_zona_check;
alter table public.trips add column if not exists lokasi_nama text;
alter table public.trips add column if not exists lat double precision;
alter table public.trips add column if not exists lon double precision;
