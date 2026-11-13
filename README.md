# Catatan Keuangan Pribadi

Aplikasi web pencatatan keuangan pribadi: pemasukan, pengeluaran, anggaran bulanan, laporan, dan ekspor CSV. Seluruh antarmuka berbahasa Indonesia, nominal Rupiah bulat, dan tanggal ditampilkan sebagai `13 November 2026`.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (Postgres + Auth), RLS aktif
- Deploy: Vercel Hobby, region `sin1`

## Tampilan

Gaya visual "Liquid": latar krem `#F8F6F2`, teks `#0B0B0D`, aksen oranye
`#F1370F` dan indigo `#2B23C3`, kartu kaca dengan sudut besar, serta latar
gumpalan warna yang bergerak halus. Token warna, radius, dan animasi ada di
`app/globals.css`; kartu saldo utama di
`components/dashboard/balance-overview.tsx`. Animasi dimatikan otomatis saat
`prefers-reduced-motion` atau di layar ponsel.

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi dua variabel dari project Supabase
npm run dev                  # http://localhost:3000
```

| Variabel | Contoh |
| --- | --- |
| `SUPABASE_URL` | `https://abcdefgh.supabase.co` (tanpa `/rest/v1`) |
| `SUPABASE_ANON_KEY` | publishable key `sb_publishable_...` atau anon key lama |

Keduanya hanya dibaca di sisi server (tanpa prefix `NEXT_PUBLIC_`), jadi tidak ikut ke bundle browser. Jangan memakai service role/secret key.

Skema database ada di `supabase/migrations/` — lihat `supabase/README.md` untuk urutan menjalankannya di Supabase SQL Editor. Panduan deploy lengkap ada di [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Perintah

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript tanpa emit |

## Struktur folder

```text
app/
├── (auth)/                 # login, register
├── (app)/                  # dashboard, transaksi, anggaran, laporan, pengaturan
└── api/export/             # ekspor CSV
components/
├── ui/                     # shadcn/ui
├── layout/                 # sidebar, navigasi mobile, tema, menu pengguna
├── dashboard/              # kartu saldo, grafik, transaksi terakhir
├── transactions/           # filter, daftar, form, hapus
├── categories/             # pengelolaan kategori
├── budgets/                # daftar anggaran, form, progress
├── reports/                # tab, ringkasan, grafik, ekspor
└── shared/                 # empty state, dialog konfirmasi, input nominal, filter periode
lib/
├── supabase/               # client server/browser, proxy sesi
├── actions/                # Server Action (auth, transaksi, kategori, anggaran, profil)
├── db/                     # query baca (transaksi, kategori, anggaran, laporan, dashboard)
├── validation/             # skema Zod
└── auth.ts, period.ts, format.ts, constants.ts, types.ts, csv.ts
supabase/migrations/        # 0001_schema … 0004_functions
proxy.ts                    # refresh sesi + proteksi route
vercel.json                 # region sin1
```

## Alur utama

- Pengguna baru otomatis mendapat profil dan 15 kategori default lewat trigger.
- Semua mutasi memakai Server Action dengan validasi Zod dan `requireUser()`.
- Semua query baca berjalan di Server Component; RLS membatasi data per pengguna.
- Filter, urutan, dan pagination disimpan di URL agar bisa dibagikan/di-refresh.
- Ekspor CSV mengikuti tab laporan aktif, memakai UTF-8 BOM dan nama file
  `transaksi-YYYY-MM-DD.csv`.

## Dokumen

| File | Isi |
| --- | --- |
| `PRD.md` | Kebutuhan produk, ruang lingkup, kriteria penerimaan |
| `ARCHITECTURE.md` | Stack, alur data, keamanan, konfigurasi |
| `DATABASE_SCHEMA.md` | DDL, RLS, trigger, RPC |
| `TASKS.md` | Rencana kerja per tahap |
| `DEPLOYMENT.md` | Langkah Supabase, Vercel, backup, pause, reset password |

## Backup

Free Tier tidak punya backup otomatis. Unduh CSV bulanan dari `/laporan` dan
lakukan `pg_dump` berkala. Perintah lengkap ada di `DEPLOYMENT.md` bagian 6.
