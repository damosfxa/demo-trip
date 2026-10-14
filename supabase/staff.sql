-- Daftarkan akun panitia. Jalankan SETELAH membuat user di Authentication → Users.
-- Ganti email di bawah sesuai akun yang dibuat.

-- Panitia utama (bisa mengubah semua data)
insert into public.staff (user_id, role)
select id, 'owner' from auth.users where email = 'ryzkirham@gmail.com'
on conflict (user_id) do update set role = excluded.role;

-- Akun demo untuk calon klien (hanya bisa melihat)
insert into public.staff (user_id, role)
select id, 'viewer' from auth.users where email = 'demo.panitia@rizkyrhamadani.com'
on conflict (user_id) do update set role = excluded.role;

-- Cek hasilnya
select u.email, s.role from public.staff s join auth.users u on u.id = s.user_id;
