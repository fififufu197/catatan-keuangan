# Catatan Keuangan Pribadi

Aplikasi web pencatatan keuangan pribadi: pemasukan, pengeluaran, anggaran bulanan, laporan, dan ekspor CSV.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (Postgres + Auth), RLS aktif
- Deploy: Vercel Hobby, region `sin1`

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi dua variabel dari project Supabase
npm run dev                  # http://localhost:3000
```

Skema database ada di `supabase/migrations/` — lihat `supabase/README.md`
untuk urutan menjalankannya di Supabase SQL Editor.

## Perintah

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript tanpa emit |

## Dokumen

| File | Isi |
| --- | --- |
| `PRD.md` | Kebutuhan produk, ruang lingkup, kriteria penerimaan |
| `ARCHITECTURE.md` | Stack, alur data, keamanan, konfigurasi |
| `DATABASE_SCHEMA.md` | DDL, RLS, trigger, RPC |
| `TASKS.md` | Rencana kerja per tahap |
