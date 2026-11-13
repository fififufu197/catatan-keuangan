# Deployment

Panduan menaikkan Catatan Keuangan Pribadi ke Supabase + Vercel, termasuk
perawatan, backup, dan batasan Free Tier.

## 1. Prasyarat

- Akun [Supabase](https://supabase.com) dan [Vercel](https://vercel.com) (plan Hobby).
- Akun GitHub untuk menyimpan repositori.
- Node.js 22.x dan npm.
- Repositori ini sudah berjalan lokal (`npm run dev`) dengan dua variabel
  environment yang benar.

## 2. Supabase

### 2.1 Buat project

1. **New project** → pilih organisasi.
2. Region: **Southeast Asia (Singapore)** — paling dekat dengan pengguna Indonesia.
3. Simpan **database password** di tempat aman.
4. Tunggu provisioning selesai.

### 2.2 Catat kredensial

Buka **Project Settings → API**:

| Nilai | Dipakai sebagai |
| --- | --- |
| Project URL, contoh `https://abcdefgh.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL` |
| Publishable key (`sb_publishable_...`) atau anon key lama (`eyJ...`) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

> Jangan memakai **service role** / **secret key**. Aplikasi hanya memakai dua
> nilai publik di atas; RLS adalah penjaga data. Service role key tidak boleh
> masuk ke `.env.local`, repositori, atau environment Vercel.

URL harus tanpa akhiran `/rest/v1/`.

### 2.3 Jalankan migrasi

Di **SQL Editor**, jalankan berurutan satu per satu:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_triggers.sql`
4. `supabase/migrations/0004_functions.sql`

Detail dan cara reset ada di `supabase/README.md`.

### 2.4 Verifikasi

```sql
-- 4 tabel, semuanya rowsecurity = true
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- 15 policy
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 6 fungsi, semuanya prosecdef = false (security invoker)
select proname, prosecdef
from pg_proc
join pg_namespace n on n.oid = pg_proc.pronamespace
where n.nspname = 'public' and proname like 'get\_%';
```

Hasil yang diharapkan: `profiles` 3 policy, `categories` 4, `transactions` 4,
`budgets` 4.

### 2.5 Pengaturan Auth

Buka **Authentication**:

| Setelan | Nilai |
| --- | --- |
| **Site URL** | `https://<domain-vercel>` |
| **Redirect URLs** | `https://<domain-vercel>`, `http://localhost:3000` |
| **Confirm email** | Nonaktif (aplikasi tidak punya alur verifikasi email) |
| **Minimum password length** | 8 |
| **Allow new users to sign up** | Aktif hanya sampai akun pertama dibuat, lalu nonaktif |

Signup dibiarkan terbuka selama pengujian. Setelah akun pemilik dan akun uji
selesai dibuat, matikan **Allow new users to sign up** agar tidak ada pendaftaran
baru. Aplikasi tidak menyediakan halaman hapus akun; akun dihapus lewat
**Authentication → Users**.

## 3. Environment variables

| Variabel | Contoh | Rahasia? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abcdefgh.supabase.co` | Tidak |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` | Tidak (publik, dilindungi RLS) |

Lokal:

```bash
cp .env.example .env.local
# isi dua variabel, lalu
npm run dev
```

Vercel: **Project Settings → Environment Variables**, tambahkan keduanya untuk
**Production**, **Preview**, dan **Development**. Setelah mengubah environment
variable, lakukan **Redeploy**.

## 4. GitHub

Repositori lokal saat ini belum punya remote. Buat repositori kosong di GitHub
(tanpa README), lalu:

```bash
git remote add origin https://github.com/<username>/<repo>.git
git branch -M main
git push -u origin main
```

Pastikan `.env.local` tidak ikut ter-commit (sudah ada di `.gitignore`).

## 5. Vercel

1. **Add New → Project → Import Git Repository**, pilih repo di atas.
2. Framework preset: **Next.js** (terdeteksi otomatis).
3. Node.js: **22.x**.
4. Tambahkan dua environment variable dari bagian 3.
5. Region dikunci `sin1` lewat `vercel.json`.
6. **Deploy**. Setelah selesai, salin domain produksi.
7. Kembali ke Supabase → **Authentication → URL Configuration**, isi **Site URL**
   dan **Redirect URLs** dengan domain tersebut.
8. Jika domain berubah, perbarui Site URL/Redirect URLs lalu redeploy bila perlu.

Tidak ada cron, worker, atau database tambahan. Build memakai perintah standar
`npm run build`.

### 5.1 Uji produksi

Setelah deploy:

1. Buka domain → diarahkan ke `/login`.
2. Login dengan akun pemilik.
3. Tambah satu transaksi, cek dashboard.
4. Atur satu anggaran di `/anggaran`.
5. Buka `/laporan`, coba ketiga tab, unduh CSV dan buka di Excel.
6. Logout, pastikan tombol Back tidak membuka halaman aplikasi.
7. Matikan signup di Supabase setelah semua akun uji selesai.

## 6. Backup & pemulihan

Free Tier tidak punya backup otomatis. Lakukan dua lapis:

### 6.1 Ekspor CSV rutin

- Unduh CSV bulanan di `/laporan` setiap akhir bulan.
- CSV memuat transaksi (tanggal, jenis, kategori, nominal, metode, deskripsi).
- Anggaran tidak ikut CSV; catat manual bila perlu.
- Simpan file di luar laptop (cloud drive) dan beri nama sesuai periode.

### 6.2 `pg_dump` berkala

Ambil connection string dari **Project Settings → Database → Connection string**
(mode **Session pooler** atau **Direct connection**), lalu:

```bash
export DATABASE_URL='postgresql://postgres.<ref>:<password>@<host>:5432/postgres'

pg_dump "$DATABASE_URL" \
  --no-owner --no-privileges \
  --file "backup-catatan-keuangan-$(date +%F).sql"
```

Pemulihan ke project baru:

```bash
# Setelah migrasi 0001–0004 dijalankan pada project tujuan
psql "$DATABASE_URL" --file backup-catatan-keuangan-YYYY-MM-DD.sql
```

Simpan file dump terenkripsi; file ini memuat seluruh data pengguna.

### 6.3 Jika data terhapus

- Transaksi: pulihkan dari CSV terakhir atau dump.
- Akun pengguna: pembuatan ulang lewat halaman register (saat signup dibuka)
  atau **Authentication → Users → Add user**.
- Kategori default dibuat otomatis oleh trigger saat akun baru dibuat.

## 7. Project pause

Project Free Tier di-pause setelah **7 hari tanpa aktivitas**. Data tidak hilang.

1. Buka dashboard Supabase → pilih project.
2. Klik **Resume project**.
3. Tunggu beberapa menit sampai status **Active**.
4. Buka aplikasi; jika muncul error koneksi, muat ulang setelah project aktif.

Untuk menghindari pause, buka aplikasi minimal sekali seminggu.

## 8. Reset password

Aplikasi tidak menyediakan alur "lupa password" lewat email. Reset dilakukan
dari dashboard:

1. **Authentication → Users**.
2. Cari email pengguna → menu titik tiga → **Reset password**.
   - Opsi **Send recovery email** mengirim tautan reset.
   - Opsi **Set new password** (bila tersedia) langsung mengganti password.
3. Minta pengguna login dengan password baru.

Untuk mengganti password akun sendiri, gunakan tautan recovery tersebut, bukan
halaman pengaturan aplikasi.

## 9. Batasan Free Tier

Angka dapat berubah; cek halaman harga Supabase sebelum mengandalkan batas ini.

| Batas | Nilai |
| --- | --- |
| Database | 500 MB |
| Egress bulanan | 5 GB |
| Auth | 50.000 MAU |
| File storage | 1 GB (tidak dipakai aplikasi ini) |
| Backup otomatis | Tidak ada |
| Project pause | Setelah 7 hari tanpa aktivitas |
| Project aktif | 2 per organisasi |
| Penggunaan komersial | Tidak diizinkan (Hobby/non-komersial) |

Aplikasi ini hanya menyimpan teks dan angka; 500 MB cukup untuk puluhan ribu
transaksi. Pemakaian terbesar biasanya egress saat membuka halaman dan grafik.

## 10. Keamanan

- Hanya publishable/anon key yang dipakai; tidak ada service role di kode,
  build output, atau environment Vercel.
- RLS aktif di `profiles`, `categories`, `transactions`, `budgets`.
- Server Action memanggil `requireUser()` dan memvalidasi input dengan Zod.
- Halaman aplikasi di bawah `app/(app)` selalu memeriksa sesi lewat `proxy.ts`
  dan `requireUser()`.
- Jangan menonaktifkan RLS atau menambah policy `using (true)` saat debugging.

## 11. Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| Redirect berulang ke `/login` | `NEXT_PUBLIC_SUPABASE_URL` salah atau ada `/rest/v1/` | Perbaiki URL, restart dev server / redeploy |
| `Invalid API key` | Key salah atau sudah dirotasi | Salin ulang publishable/anon key |
| Data tidak muncul setelah login | Migrasi belum lengkap atau RLS salah | Jalankan ulang `0002_rls.sql`, cek policy |
| CSV tampil berantakan di Excel | File dibuka lewat cara lain / BOM hilang | Unduh ulang dari `/laporan`, buka langsung di Excel |
| Build Vercel gagal | Environment variable belum diisi | Tambahkan dua variabel lalu redeploy |
| Project Supabase tidak merespons | Project di-pause | Resume dari dashboard |
