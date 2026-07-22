-- Sebelum menjalankan file ini:
-- 1. Buka Authentication > Users.
-- 2. Buat satu akun admin menggunakan email dan password Bos.
-- 3. Ganti tulisan EMAIL_ADMIN_BOS di bawah dengan email tersebut.

do $$
declare
  target_user_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where lower(email) = lower('EMAIL_ADMIN_BOS')
  limit 1;

  if target_user_id is null then
    raise exception 'Akun tidak ditemukan. Buat akun pada Authentication > Users terlebih dahulu.';
  end if;

  insert into public.admin_users (user_id)
  values (target_user_id)
  on conflict (user_id) do nothing;
end;
$$;

