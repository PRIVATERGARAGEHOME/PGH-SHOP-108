# PGH 3D Store dengan Supabase

Website ini merupakan versi database dari website PGH lama. Pengunjung dapat melihat produk tanpa login. Pemilik mengelola produk melalui halaman `/admin/`.

## Fitur

- 75 produk lama sudah dimigrasikan.
- 47 produk premium dan 28 produk gratis.
- Tambah, edit, hapus, publish, dan draft produk.
- Upload beberapa gambar dari dashboard.
- Gambar baru otomatis dioptimalkan menjadi WebP.
- Filter kategori, filter jenis, dan pencarian produk.
- Keranjang dan checkout WhatsApp.
- Login admin menggunakan Supabase Auth.
- Row Level Security membatasi perubahan hanya untuk admin yang terdaftar.

## Urutan pemasangan

Ikuti urutan ini. Jangan melakukan deploy sebelum langkah 1 sampai 5 selesai.

### 1. Membuat tabel dan keamanan

1. Buka proyek Supabase.
2. Pilih **SQL Editor** pada menu kiri.
3. Klik **New query**.
4. Buka file `supabase/01-schema.sql` dari folder proyek ini.
5. Salin seluruh isinya ke SQL Editor.
6. Klik **Run**.

### 2. Memasukkan 75 produk lama

1. Masih di **SQL Editor**, klik **New query**.
2. Buka file `supabase/02-seed-products.sql`.
3. Salin seluruh isinya ke SQL Editor.
4. Klik **Run**.

File seed aman dijalankan ulang. Produk lama tidak akan digandakan.

### 3. Membuat akun login admin

1. Buka **Authentication > Users**.
2. Klik **Add user**.
3. Pilih opsi membuat user baru jika tersedia.
4. Masukkan email dan password yang hanya diketahui pemilik.
5. Aktifkan konfirmasi otomatis jika opsi tersebut tersedia.

Jika dashboard hanya menampilkan opsi undangan, pilih **Send invitation**, buka email undangan, lalu buat password.

### 4. Memberi hak admin

1. Buka file `supabase/03-add-admin.sql`.
2. Ganti `EMAIL_ADMIN_BOS` dengan email yang dibuat pada langkah 3.
3. Salin seluruh SQL ke **SQL Editor**.
4. Klik **Run**.

Contoh bagian yang perlu diganti:

```sql
where lower(email) = lower('emailanda@gmail.com')
```

### 5. Memeriksa hasil

1. Buka file `supabase/04-check-installation.sql`.
2. Jalankan melalui **SQL Editor**.
3. Hasil yang benar:

| Pemeriksaan | Hasil |
| --- | ---: |
| total_products | 75 |
| premium_products | 47 |
| free_products | 28 |
| total_admins | 1 |

### 6. Menonaktifkan pendaftaran umum

Buka pengaturan **Authentication** dan nonaktifkan opsi **Allow new users to sign up**. Website publik tetap dapat dibuka tanpa akun. Pengaturan ini mencegah pembuatan akun baru yang tidak diperlukan.

Walaupun pendaftaran belum dinonaktifkan, kebijakan database tetap memeriksa tabel `admin_users`. Akun biasa tidak dapat mengubah produk.

## Menjalankan website di VS Code

Gunakan ekstensi **Live Server**, lalu buka `index.html`. Alternatif melalui terminal:

```bash
py -m http.server 5500
```

Kemudian buka:

```text
http://localhost:5500
```

Dashboard admin:

```text
http://localhost:5500/admin/
```

Jangan membuka `index.html` dengan alamat `file:///`. Gunakan Live Server atau HTTP server agar seluruh fitur berjalan konsisten.

## Deploy ke GitHub dan Vercel

Jika repository GitHub sudah ada:

```bash
git status
git add .
git commit -m "Tambah database dan dashboard admin"
git push origin main
```

Jika memakai repository GitHub baru:

```bash
git init
git add .
git commit -m "Website PGH 3D Store"
git branch -M main
git remote add origin URL_REPOSITORY_GITHUB
git push -u origin main
```

Jika repository sudah tersambung ke Vercel, deployment akan berjalan setelah push.

## Alamat dashboard

Setelah deploy:

```text
https://DOMAIN-ANDA/admin/
```

Pengunjung tidak perlu login untuk membuka halaman utama. Login hanya diperlukan pada dashboard admin.

## Catatan keamanan

- `js/config.js` hanya berisi Project URL dan Publishable Key.
- Jangan pernah memasukkan `sb_secret`, `service_role`, password database, atau connection string ke proyek.
- Jangan menyimpan file model premium pada bucket publik.
- Gambar produk boleh berada pada bucket publik.
- Gunakan password admin yang kuat dan unik.

## Struktur penting

```text
admin/                 Dashboard admin
css/                   Tampilan website publik
data/products.json     Arsip data hasil migrasi
images/                Gambar produk lama yang sudah dioptimalkan
js/config.js            Konfigurasi publik Supabase
js/app.js               Logika website publik
supabase/               File SQL pemasangan
vendor/                 Supabase JavaScript client
```

