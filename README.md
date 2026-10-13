# Starter Aplikasi Pendataan Masyarakat

Fondasi awal untuk aplikasi internal satu kantor: Next.js App Router + TypeScript + Tailwind CSS + Supabase Auth/Postgres/Storage.

**Status:** starter pengembangan, belum siap untuk menyimpan data masyarakat nyata. Halaman awal mencakup login, dashboard, dan daftar data fiktif. Formulir input/edit, verifikasi penuh, kartu internal, laporan, uji penetrasi, dan pengujian RLS otomatis belum termasuk.

## 1. Prasyarat

- Node.js minimal 20.9 (disarankan versi LTS yang masih didukung).
- npm.
- Akun Supabase.
- Editor seperti VS Code.

## 2. Buat proyek Supabase

1. Buka https://database.new dan buat proyek baru bernama misalnya `pendataan-masyarakat`.
2. Pilih region sesuai kebutuhan latensi, kontrak, dan aturan penyimpanan data kantor. Simpan password database secara aman.
3. Setelah proyek aktif, buka bagian **Connect** atau **Project Settings → API Keys**. Ambil Project URL dan **publishable key** (`sb_publishable_...`).
4. Buka **SQL Editor** lalu jalankan seluruh isi `supabase/migrations/202610130001_initial_schema.sql` satu kali.
5. Setelah itu, jalankan `supabase/seed.sql` untuk memasukkan dua catatan fiktif.
6. Di Supabase **Authentication → Settings** (nama menu dapat berbeda), nonaktifkan pendaftaran publik/sign-ups. Akun petugas dibuat oleh admin saja.

Migrasi membuat satu kantor placeholder. Ganti namanya lewat SQL Editor sebelum penggunaan nyata, misalnya:

```sql
update public.offices
set name = 'NAMA KANTOR', region = 'WILAYAH KANTOR', updated_at = now();
```

### Buat akun administrator pertama

1. Di Supabase **Authentication → Users**, buat pengguna dengan email kantor milik admin dan kata sandi yang kuat. Konfirmasi email sesuai alur yang dipilih kantor.
2. Salin UUID user tersebut dari daftar Users.
3. Jalankan SQL berikut setelah mengganti nilai placeholder:

```sql
insert into public.user_profiles (id, office_id, full_name, role, is_active)
select
  'GANTI-DENGAN-UUID-USER-AUTH'::uuid,
  o.id,
  'Nama Administrator',
  'admin',
  true
from public.offices o
order by o.created_at
limit 1;
```

4. Simpan akun tersebut dengan aman. Profil `user_profiles` inilah yang menentukan peran dan akses aplikasi. Memiliki akun di Supabase Auth saja belum membuat seseorang menjadi petugas aplikasi.

### Tambah petugas berikutnya

Buat user lewat Supabase Authentication Dashboard, salin UUID-nya, lalu masukkan melalui SQL Editor atau halaman manajemen pengguna yang nantinya dibuat khusus admin:

```sql
insert into public.user_profiles (id, office_id, full_name, role, is_active)
select
  'GANTI-DENGAN-UUID-USER-AUTH'::uuid,
  o.id,
  'Nama Petugas',
  'operator', -- admin | operator | verifier | viewer | auditor
  true
from public.offices o
limit 1;
```

Jangan membuat fitur pendaftaran publik. Pada tahap awal, penambahan akun melalui Dashboard Supabase cukup untuk jumlah petugas terbatas. Untuk administrasi akun otomatis, buat Server Action/Route Handler yang memeriksa peran admin dan memakai secret key hanya di server; jangan pernah mengirim secret/service-role key ke browser.

## 3. Jalankan aplikasi lokal

Di terminal, masuk ke folder proyek ini:

```bash
npm install
cp .env.example .env.local
```

Pada Windows PowerShell, buat salinan env dengan:

```powershell
Copy-Item .env.example .env.local
```

Isi `.env.local` dengan nilai proyek Supabase:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
```

Jangan mengunggah `.env.local` ke GitHub. Tidak ada secret/service-role key yang diperlukan oleh starter ini.

Lalu jalankan:

```bash
npm run dev
```

Buka http://localhost:3000 dan masuk menggunakan akun admin. Sebelum dicoba, pastikan profil `user_profiles` admin sudah dibuat.

Pemeriksaan kode:

```bash
npm run typecheck
npm run build
```

## 4. Ringkasan tabel dan kebijakan

- `offices`: kantor placeholder; petugas hanya membaca kantor tempat profilnya terdaftar.
- `user_profiles`: metadata petugas, peran, status aktif, dan relasi ke Auth. Petugas hanya dapat membaca profil sendiri; admin dapat membaca/mengelola profil di kantornya.
- `residents`: data daftar minimum yang digunakan untuk pencarian internal seperti kode, nama, wilayah umum, dan status. RLS membatasi akses ke kantor sendiri. Penghapusan langsung tidak diberikan; gunakan status arsip.
- `resident_private_data`: NIK, jenis kelamin, alamat, RT/RW, pekerjaan, kewarganegaraan, tempat/tanggal lahir, agama, status perkawinan, golongan darah, dan path foto. Hanya admin/operator/verifikator yang dapat membaca/menulis tabel ini; viewer tidak mendapat akses ke tabel tersebut.
- `audit_logs`: catatan aksi/kolom berubah tanpa menyimpan nilai NIK/alamat/foto. Admin dan auditor boleh membaca; INSERT dilakukan trigger.
- bucket `resident-photos`: privat, file maksimal 5 MB, hanya JPEG/PNG/WebP. Folder foto harus memakai UUID record sebagai komponen pertama, misalnya `<resident-uuid>/foto-random.jpg`.

Peran saat ini:

| Peran | Melihat daftar | Mengubah data | Data privat/foto | Audit | Mengelola petugas |
|---|---:|---:|---:|---:|---:|
| admin | Ya | Ya | Ya | Ya | Ya |
| operator | Ya | Ya | Ya | Tidak | Tidak |
| verifier | Ya | Ya | Ya | Tidak | Tidak |
| viewer | Ya (data daftar minimum) | Tidak | Tidak | Tidak | Tidak |
| auditor | Tidak | Tidak | Tidak | Ya | Tidak |

Pada migrasi awal, pengubahan status record hanya boleh dilakukan admin/verifikator melalui trigger. Penghapusan data masyarakat dan file tidak diberikan lewat API.

## 5. Checklist pengujian sebelum data nyata

1. Login gagal untuk kredensial salah; halaman dashboard mengharuskan sesi valid.
2. Auth user tanpa baris `user_profiles` tidak dapat memakai aplikasi.
3. Profil `is_active = false` tidak dapat mengakses aplikasi atau data.
4. `viewer` dapat membaca daftar tetapi gagal menambah/mengubah data.
5. `operator` gagal membaca `resident_private_data` jika kebijakannya dicabut atau perannya diubah ke `viewer`; uji peran yang dipakai sesuai matriks di atas.
6. `auditor` dapat membaca log tetapi tidak daftar penduduk.
7. Permintaan dari role `anon` ditolak.
8. Foto tidak bisa dibuka lewat URL publik.
9. Perubahan data menghasilkan audit log hanya berisi nama kolom, bukan nilainya.
10. Salinan cadangan dan pemulihan sudah diuji.

RLS dan GRANT adalah lapisan keamanan inti. Jangan hanya menyembunyikan tombol di antarmuka; uji kebijakan dengan akun berbeda dan permintaan API langsung. Kebijakan ini adalah baseline awal yang wajib ditinjau lagi sebelum produksi.

## 6. Catatan sebelum produksi

- Pastikan kantor punya kewenangan dan dasar pemrosesan yang sah atas setiap kolom yang dikumpulkan.
- Jangan masukkan NIK, foto, atau alamat nyata selama pengembangan; gunakan catatan fiktif `DEMO-0001` dan `DEMO-0002`.
- Tambahkan pembatasan percobaan login, MFA untuk administrator, pemulihan backup, retensi, prosedur koreksi/penghapusan, dan penanganan insiden.
- Terapkan pemeriksaan tipe/ukuran file sisi server serta validasi konten, bukan hanya ekstensi.
- Tambahkan pengujian RLS otomatis (misalnya pgTAP/Supabase CLI) sebelum rilis.
- Audit konfigurasi region, domain, HTTPS, email auth, kebijakan kata sandi, log, dan backup.
- Kartu yang dibuat pada tahap lanjutan harus berupa **kartu data internal** yang jelas ditandai bukan identitas resmi, bukan tiruan KTP-el.

## Referensi resmi

- Next.js instalasi: https://nextjs.org/docs/app/getting-started/installation
- Supabase Auth + Next.js: https://supabase.com/docs/guides/auth/quickstarts/nextjs
- Supabase SSR client: https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
