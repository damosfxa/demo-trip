-- Trip contoh untuk demo dan portofolio. Semua nama dan nomor fiktif.
-- Jalankan setelah schema.sql. Menjalankan ulang akan MENGHAPUS lalu membuat ulang trip contoh ini saja.

delete from public.trips where slug = 'family-gathering-bali';

with t as (
  insert into public.trips (slug, nama, penyelenggara, tujuan, mulai, selesai, zona, titik_kumpul, maps_url, wa_panitia, departemen, info, checklist, faq, titik_absen)
  values (
    'family-gathering-bali',
    'Family Gathering 2026',
    'PT Contoh Sejahtera',
    'Bali',
    '2026-11-20', '2026-11-22',
    'Asia/Makassar',
    'Bandara Soekarno-Hatta Terminal 3, pintu 4',
    'https://maps.google.com/?q=Terminal+3+Bandara+Soekarno-Hatta',
    '081200000000',
    '["Keuangan","HRD","Marketing","Operasional","IT","Gudang","Lainnya"]',
    '[{"judul":"Hotel","isi":"Hotel Contoh Indah, Kuta. Nomor kamar muncul di halaman ini setelah diatur panitia."},{"judul":"Penerbangan","isi":"Berangkat 07.30 WIB, tiba 10.30 WITA. Bagasi 20 kg per orang."},{"judul":"Pakaian","isi":"Hari 2 pakai kaos acara (dibagikan saat check in). Gala dinner: batik atau kemeja rapi."}]',
    '["KTP asli","Obat pribadi","Baju ganti 3 hari","Baju renang","Topi dan kacamata hitam","Sandal","Power bank","Batik untuk gala dinner"]',
    '[{"q":"Boleh membawa keluarga?","a":"Boleh, maksimal 1 orang. Daftarkan ke panitia paling lambat 10 November."},{"q":"Bagaimana kalau terlambat ke titik kumpul?","a":"Hubungi panitia lewat tombol WhatsApp. Pesawat tidak bisa menunggu."},{"q":"Apakah ada uang saku?","a":"Tidak ada. Semua makan sudah disediakan sesuai jadwal."}]',
    '["Bandara berangkat","Bus hari 2","Gala dinner","Bandara pulang"]'
  )
  returning id
),
a as (
  insert into public.agenda (trip_id, mulai, selesai, judul, lokasi, ket)
  select t.id, x.mulai::timestamptz, x.selesai::timestamptz, x.judul, x.lokasi, x.ket from t, (values
    ('2026-11-20 05:00+07', '2026-11-20 07:00+07', 'Kumpul dan absen', 'Terminal 3, pintu 4', 'Tunjukkan kartu QR di halaman ini ke panitia.'),
    ('2026-11-20 07:30+07', '2026-11-20 10:30+08', 'Penerbangan ke Bali', null, null),
    ('2026-11-20 11:00+08', '2026-11-20 13:00+08', 'Bus ke hotel dan makan siang', null, 'Nomor bus ada di kartu Anda.'),
    ('2026-11-20 13:00+08', '2026-11-20 18:00+08', 'Check in dan acara bebas', 'Hotel Contoh Indah', null),
    ('2026-11-20 19:00+08', '2026-11-20 21:00+08', 'Makan malam bersama', 'Restoran hotel', 'Pakaian bebas rapi.'),
    ('2026-11-21 07:00+08', '2026-11-21 08:00+08', 'Sarapan', 'Restoran hotel', null),
    ('2026-11-21 08:30+08', '2026-11-21 12:30+08', 'Games dan outbound per departemen', 'Pantai Kuta', 'Pakai kaos acara.'),
    ('2026-11-21 13:00+08', '2026-11-21 14:00+08', 'Makan siang', null, null),
    ('2026-11-21 15:00+08', '2026-11-21 18:00+08', 'Wisata pantai', 'Pantai Melasti', null),
    ('2026-11-21 19:00+08', '2026-11-21 22:00+08', 'Gala dinner dan doorprize', 'Ballroom hotel', 'Batik atau kemeja rapi.'),
    ('2026-11-22 07:00+08', '2026-11-22 09:00+08', 'Sarapan dan check out', null, null),
    ('2026-11-22 09:30+08', '2026-11-22 12:00+08', 'Belanja oleh-oleh', 'Pusat oleh-oleh Sukawati', null),
    ('2026-11-22 12:45+08', '2026-11-22 13:00+08', 'Kumpul pulang', 'Lobi hotel', 'Bus tidak menunggu lebih dari 15 menit.'),
    ('2026-11-22 15:00+08', '2026-11-22 16:30+07', 'Penerbangan ke Jakarta, acara selesai', null, null)
  ) as x(mulai, selesai, judul, lokasi, ket)
  returning 1
),
n as (
  insert into public.announcements (trip_id, isi, created_at)
  select t.id, x.isi, now() - x.lalu from t, (values
    ('Batas registrasi peserta 15 November. Pastikan nama sesuai KTP.', interval '3 days'),
    ('Kaos acara dibagikan saat check in. Ukuran sesuai data dari HRD.', interval '3 hours')
  ) as x(isi, lalu)
  returning 1
)
insert into public.participants (trip_id, nama, departemen, hp, bus, kamar)
select t.id, x.nama, x.dept, x.hp, x.bus, x.kamar from t, (values
  ('Andi Pratama', 'Keuangan', '081200000101', 'Bus 1', '201'),
  ('Budi Santoso', 'Gudang', '081200000102', 'Bus 1', '201'),
  ('Siti Rahma', 'HRD', '081200000103', 'Bus 2', '305'),
  ('Dewi Lestari', 'Marketing', '081200000104', 'Bus 2', '305'),
  ('Rudi Hartono', 'Operasional', '081200000105', 'Bus 1', '202'),
  ('Maya Putri', 'IT', '081200000106', null, null)
) as x(nama, dept, hp, bus, kamar);

-- Absensi contoh supaya dashboard panitia tidak kosong.
-- Acara di Jakarta memakai WIB, sisanya WITA (zona trip).
update public.agenda a set zona = 'Asia/Jakarta'
from public.trips t
where t.id = a.trip_id and t.slug = 'family-gathering-bali' and a.judul in ('Kumpul dan absen', 'Penerbangan ke Bali');

insert into public.checkins (trip_id, participant_id, titik)
select p.trip_id, p.id, 'Bandara berangkat' from public.participants p
join public.trips t on t.id = p.trip_id
where t.slug = 'family-gathering-bali' and p.nama in ('Andi Pratama', 'Siti Rahma', 'Rudi Hartono');
