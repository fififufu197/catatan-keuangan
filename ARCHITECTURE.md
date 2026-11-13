# ARCHITECTURE — Catatan Keuangan Pribadi

## 1. Prinsip arsitektur

1. **Tanpa server yang menyala terus.** Semua pekerjaan terjadi saat request: render halaman, server action, atau route handler.
2. **Database dan auth di Supabase.** Aplikasi tidak menyimpan data di filesystem Vercel.
3. **RLS sebagai batas keamanan utama.** Aplikasi tidak pernah memakai service role key.
4. **Sesedikit mungkin dependency.** Komponen UI secukupnya, tanpa state manager, tanpa ORM tambahan.
5. **Server-first.** Data dibaca di Server Component; mutasi lewat Server Action; browser hanya untuk interaksi.

## 2. Stack dan versi

| Bagian | Pilihan | Versi acuan | Alasan |
| --- | --- | --- | --- |
| Framework | Next.js App Router | 16.4.6 | Rilis stabil terbaru, deploy native di Vercel |
| Bahasa | TypeScript | 5.x | Wajib sesuai brief |
| UI | Tailwind CSS + shadcn/ui | Tailwind 4.3.5 | Ringan, komponen milik sendiri di repo |
| Ikon | lucide-react | 1.72.0 | Bawaan shadcn/ui |
| Auth & DB client | `@supabase/ssr` + `@supabase/supabase-js` | 0.12.7 / 2.119.0 | Pola resmi Supabase untuk App Router |
| Validasi | Zod | 4.6.7 | Validasi server action & form |
| Chart | Recharts | 3.10.1 | Sesuai brief, deklaratif, cukup ringan |
| Tema | next-themes | 0.4.6 | Dark mode tanpa flicker |
| Database | Supabase PostgreSQL | PG 15+ | Free tier, RLS, Auth terintegrasi |
| Hosting | Vercel Hobby | — | Gratis, non-komersial |

Catatan Next.js 16: file `middleware.ts` diganti `proxy.ts` dengan fungsi `proxy()`. Refresh sesi Supabase ditempatkan di sana.

### Yang sengaja tidak dipakai

- **Prisma / koneksi Postgres langsung.** Vercel serverless butuh pooling khusus dan menambah kompleksitas. Semua akses lewat HTTPS PostgREST memakai anon key + JWT pengguna, sehingga RLS otomatis berlaku.
- **SQLite.** Tidak ada disk permanen di Vercel.
- **React Query / Redux / Zustand.** Data berasal dari Server Components; state UI memakai URL dan `useState` lokal.
- **React Hook Form.** Form memakai Server Action + `useActionState`; dependensi lebih sedikit.
- **Cron / queue / worker.** Tidak diizinkan oleh batasan gratis dan tidak diperlukan.
- **Supabase Storage.** Tidak ada unggahan file.

## 3. Alur data

```
Browser
  │  HTTPS (cookie sesi Supabase)
  ▼
Vercel — Next.js (region sin1)
  ├─ proxy.ts            → refresh cookie sesi
  ├─ Server Component    → requireUser() → query Supabase
  ├─ Server Action       → requireUser() → Zod → mutasi → revalidatePath()
  └─ Route Handler       → /api/export CSV
        │  HTTPS + anon key + JWT pengguna
        ▼
Supabase (region ap-southeast-1)
  ├─ PostgREST  → tabel + RPC agregat (RLS aktif)
  └─ Auth       → login/register/logout
```

- Tidak ada koneksi database langsung dari browser.
- Browser hanya memegang anon key (memang publik) dan cookie sesi yang dikelola `@supabase/ssr`.
- Semua query agregat berat (saldo, total periode, seri harian/bulanan, kategori) dijalankan sebagai fungsi SQL `security invoker`, sehingga RLS tetap berlaku.

## 4. Autentikasi dan sesi

- `lib/supabase/server.ts` — `createServerClient` dengan cookie dari `cookies()`; dipakai Server Component, Server Action, dan Route Handler.
- `lib/supabase/client.ts` — `createBrowserClient`; hanya jika komponen client butuh auth (tidak direncanakan).
- `proxy.ts` — memanggil `updateSession()` untuk memperbarui cookie; tidak melakukan otorisasi bisnis.
- `app/(app)/layout.tsx` — `requireUser()`: memanggil `supabase.auth.getUser()` (validasi ke server Auth, bukan `getSession()`), redirect ke `/login` bila tidak ada sesi.
- Setiap Server Action memanggil `requireUser()` lagi. Otorisasi tidak bergantung pada proxy atau UI.
- Alur:
  - Register: `signUp({ email, password, options: { data: { full_name } } })` → trigger DB membuat profil + kategori default.
  - Login: `signInWithPassword` lalu redirect `/dashboard`.
  - Logout: `signOut` lalu redirect `/login`.
- Konfirmasi email dimatikan di Supabase; `signUp` langsung mengembalikan sesi.
- Redirect URL Supabase diisi domain Vercel dan `http://localhost:3000` (untuk pengembangan).

## 5. Lapisan kode

```
lib/
├── supabase/
│   ├── server.ts        # createServerClient + cookie adapter
│   ├── client.ts        # createBrowserClient (bila diperlukan)
│   └── proxy.ts         # updateSession untuk proxy.ts
├── auth.ts              # requireUser(), getUserOrNull()
├── db/
│   ├── transactions.ts  # query daftar, detail, recent
│   ├── categories.ts    # query kategori
│   ├── budgets.ts       # query anggaran + aktual
│   ├── dashboard.ts     # RPC agregat dashboard
│   └── reports.ts       # RPC agregat laporan
├── actions/
│   ├── auth.ts          # login, register, logout
│   ├── transactions.ts  # create, update, delete
│   ├── categories.ts    # create, rename, archive, delete
│   ├── budgets.ts       # upsert, delete
│   └── profile.ts       # update nama
├── validation/
│   ├── transaction.ts
│   ├── category.ts
│   ├── budget.ts
│   └── profile.ts
├── format.ts            # rupiah, tanggal, bulan, persen, angka ringkas
├── period.ts            # bulan/tahun berjalan WIB, rentang tanggal
├── constants.ts         # metode pembayaran, label, batas
└── types.ts             # tipe baris DB + DTO
```

Aturan:

- Query hanya di `lib/db/*`; komponen tidak memanggil Supabase langsung.
- Mutasi hanya di `lib/actions/*`, selalu melalui Zod dan `requireUser()`.
- Format angka/tanggal hanya di `lib/format.ts` agar konsisten.
- Fungsi menerima parameter bertipe; tidak ada `any`.

## 6. Routing dan struktur folder

```
catatan-keuangan/
├── app/
│   ├── layout.tsx                 # html, font, ThemeProvider, Toaster
│   ├── globals.css
│   ├── page.tsx                   # redirect ke /dashboard
│   ├── not-found.tsx
│   ├── (auth)/
│   │   ├── layout.tsx             # layout tanpa sidebar
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx             # requireUser + sidebar + bottom nav
│   │   ├── dashboard/page.tsx
│   │   ├── transaksi/page.tsx
│   │   ├── anggaran/page.tsx
│   │   ├── laporan/page.tsx
│   │   └── pengaturan/page.tsx
│   └── api/export/route.ts        # CSV
├── components/
│   ├── ui/                        # komponen shadcn
│   ├── layout/                    # sidebar, mobile nav, theme toggle, page header
│   ├── dashboard/                 # stat cards, daily chart, category donut, recent list, period filter
│   ├── transactions/              # table/cards, filters, form dialog, delete dialog
│   ├── categories/                # manager, form dialog
│   ├── budgets/                   # list, form dialog, progress
│   ├── reports/                   # tabs, trend chart, category report, export button
│   └── shared/                    # empty state, confirm dialog, money input
├── lib/                           # lihat bagian 5
├── supabase/migrations/           # 0001_schema.sql ... 0004_functions.sql
├── proxy.ts
├── next.config.ts
├── .env.example
├── .env.local                     # tidak di-commit
├── PRD.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── TASKS.md
├── DEPLOYMENT.md                  # dibuat pada Tahap 5
└── README.md                      # dibuat pada Tahap 5
```

Rute memakai Bahasa Indonesia agar URL konsisten dengan UI. Filter disimpan sebagai query string, contoh:

```
/transaksi?q=makan&dari=2026-11-01&sampai=2026-11-30&kategori=<uuid>&jenis=expense&urut=terbaru&halaman=1
/dashboard?tahun=2026&bulan=11
/laporan?tab=bulanan&tahun=2026&bulan=11
```

## 7. Keamanan

| Lapis | Implementasi |
| --- | --- |
| Isolasi data | RLS `user_id = auth.uid()` pada semua tabel; policy `with check` juga memverifikasi kepemilikan kategori |
| Autentikasi | `getUser()` di layout dan setiap Server Action; redirect bila tidak ada sesi |
| Kunci | Hanya `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`; service role key tidak dipakai sama sekali |
| Validasi | Zod di server: tipe, panjang, rentang tanggal, nominal integer, enum jenis/metode, UUID kategori |
| Otorisasi objek | Setiap update/delete memakai `id` + filter `user_id`; RLS menolak baris milik pengguna lain |
| Integritas | Foreign key komposit `(category_id, kind)` mencegah kategori pemasukan dipakai untuk pengeluaran |
| XSS | Tidak ada `dangerouslySetInnerHTML`; deskripsi dirender sebagai teks |
| Header | `next.config.ts`: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` |
| Secret | `.env.local` masuk `.gitignore`; `.env.example` hanya berisi nama variabel |
| CSV | Escape tanda kutip/koma/newline; `Content-Disposition: attachment` |

Catatan: anon key memang dirancang publik. Yang melindungi data adalah RLS, bukan kerahasiaan anon key.

## 8. Performa

- **Region berpasangan:** Supabase `ap-southeast-1` (Singapura), Vercel function region `sin1`.
- **Render dinamis** karena semua halaman aplikasi membaca cookie; tidak ada cache data lintas pengguna.
- **Agregat di database** lewat RPC (bukan menarik semua baris ke Vercel).
- **Index** sesuai `DATABASE_SCHEMA.md` (tanggal, jenis, kategori, periode anggaran).
- **Query daftar** memakai `range()` untuk pagination 25 baris dan `count: "exact"`.
- **Recharts** hanya di komponen client yang memuat grafik; halaman lain tidak ikut membundelnya.
- **Revalidasi** setelah mutasi: `revalidatePath` untuk halaman yang terdampak (dashboard, transaksi, anggaran, laporan).
- **Tidak ada polling/realtime.** Data berubah saat pengguna melakukan aksi atau membuka halaman.

## 9. Konfigurasi Vercel

- Framework preset: Next.js; build `next build`; Node.js 22.x.
- Environment Variables (Production, Preview, Development):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `vercel.json`: `{ "regions": ["sin1"] }` (Hobby: satu region).
- Tidak ada `crons`, tidak ada queue, tidak ada function dengan durasi panjang.
- Domain: `*.vercel.app` cukup; domain kustom opsional dan gratis.
- Plan: Hobby (non-komersial).
- Konsekuensi: cold start beberapa ratus ms pada request pertama; tidak masalah untuk aplikasi pribadi.

## 10. Konfigurasi Supabase

1. Buat project, region **Southeast Asia (Singapore)**.
2. Jalankan migrasi SQL berurutan di SQL Editor.
3. Authentication:
   - Matikan **Confirm email**.
   - Site URL: `https://<domain-vercel>`; tambahkan `http://localhost:3000` pada Redirect URLs.
   - Minimum password length: 8.
   - Biarkan **Allow new users to sign up** aktif hanya sampai akun pertama dibuat, lalu matikan.
4. Ambil **Project URL** dan **anon public key** → `.env.local` dan Vercel.
5. Jangan pernah menyalin service role key ke aplikasi/Vercel.
6. Verifikasi RLS: setiap tabel menampilkan "RLS enabled" dan memiliki policy.

## 11. Risiko dan mitigasi

| # | Risiko | Dampak | Mitigasi |
| --- | --- | --- | --- |
| 1 | Project Supabase di-pause setelah 7 hari tanpa aktivitas | Aplikasi error sampai di-resume | Resume dari dashboard (data utuh); dokumentasikan di README/DEPLOYMENT |
| 2 | Tidak ada backup otomatis di Free Tier | Data hilang bila kesalahan pengguna/DB | Ekspor CSV rutin + panduan `pg_dump` dari dashboard |
| 3 | Batas 500 MB | Tidak bisa menulis data baru | Volume data pribadi kecil; pantau pemakaian di dashboard; tidak menyimpan file |
| 4 | Salah konfigurasi RLS | Data antar pengguna bocor | Uji dua akun di Tahap 5; policy ditulis di migrasi, bukan manual; review setiap policy |
| 5 | Service role key bocor | Seluruh data terekspos | Tidak dipakai di aplikasi; hanya anon key; `.env.local` di-ignore |
| 6 | Pergeseran tanggal karena zona waktu | Transaksi masuk bulan yang salah | `date` tanpa jam; format `timeZone: "UTC"`; periode dihitung dengan `Asia/Jakarta` |
| 7 | Email auth bawaan 2/jam | Reset/konfirmasi gagal | Tidak memakai email; reset lewat dashboard |
| 8 | Vercel Hobby non-komersial | Potensi pelanggaran ToS | Aplikasi pribadi; dokumentasikan batasan |
| 9 | Query daftar membesar | Halaman lambat | Default bulan berjalan, pagination 25, index tanggal |
| 10 | Agregat RPC salah hitung | Laporan tidak akurat | Uji manual dengan data kecil di Tahap 3–4; bandingkan dengan query langsung |
| 11 | Kompatibilitas Next.js 16 (`middleware` → `proxy`) | Sesi tidak refresh | Pakai `proxy.ts` sejak awal; uji login/logout/refresh di Tahap 2 |
| 12 | shadcn/Tailwind v4 berubah | Build gagal | Versi dipin di `package.json`; commit lockfile |

## 12. Konvensi

- Nama variabel/fungsi/tabel dalam bahasa Inggris; teks UI dalam Bahasa Indonesia.
- Uang: `amount: number` (integer rupiah) di TypeScript; `bigint` di Postgres.
- Tanggal: string `YYYY-MM-DD` antar lapisan; konversi hanya di `lib/format.ts`/`lib/period.ts`.
- Server Action mengembalikan `{ ok: true }` atau `{ ok: false, error: string, fieldErrors?: Record<string,string> }`.
- Pesan error untuk pengguna, bukan stack trace; detail teknis hanya di `console.error`.
- Komponen UI tidak tahu Supabase; menerima props/DTO.
- Tidak menambah dependency tanpa alasan yang dicatat di PR/commit.

## 13. Rencana pengujian arsitektur

- Build produksi (`next build`) tanpa error.
- Login → refresh halaman → sesi tetap; logout → halaman terlindungi redirect.
- Dua akun: A tidak bisa melihat/mengubah data B (UI dan API langsung).
- Mutasi tidak sah (nominal 0, kategori orang lain, jenis tidak cocok) ditolak server.
- CSV untuk periode kosong menghasilkan file header saja.
- Uji lebar 375/768/1280 px.
- Lighthouse dasar: tidak ada error console, layout tidak bergeser.
