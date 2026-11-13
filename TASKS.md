# TASKS — Catatan Keuangan Pribadi

Rencana kerja per tahap. Setiap tahap berhenti dan menunggu persetujuan sebelum tahap berikutnya dikerjakan.

Legenda: `[ ]` belum, `[x]` selesai. Setiap tahap punya **Gate** yang harus lulus sebelum lanjut.

---

## Tahap 0 — Prasyarat dari pemilik akun

Dikerjakan pengguna, bukan agen (agen tidak bisa membuat akun).

- [ ] Buat akun GitHub (bila belum ada).
- [ ] Buat akun Vercel, hubungkan dengan GitHub.
- [ ] Buat project Supabase baru, region **Southeast Asia (Singapore)**.
- [ ] Simpan **Project URL** dan **anon public key** (jangan service role key).
- [ ] Berikan URL + anon key lewat `.env.local` (atau tempel saat Tahap 2).
- [ ] Siapkan email + password untuk akun aplikasi (min. 8 karakter).

**Gate 0:** project Supabase kosong tersedia dan kredensial anon bisa diakses.

---

## Tahap 1 — Perencanaan (SELESAI, menunggu persetujuan)

- [x] Grilling keputusan produk & teknis (12 keputusan terkunci).
- [x] Verifikasi batas Supabase Free Tier dan Vercel Hobby (Nov 2026).
- [x] `PRD.md` — kebutuhan, ruang lingkup, kriteria penerimaan, non-goals.
- [x] `ARCHITECTURE.md` — stack, alur data, keamanan, performa, konfigurasi.
- [x] `DATABASE_SCHEMA.md` — DDL, RLS, trigger, RPC, rencana uji.
- [x] `TASKS.md` — dokumen ini.
- [x] Struktur folder ditentukan (lihat bagian Struktur Folder).
- [x] Risiko dan kebutuhan konfigurasi Vercel/Supabase diidentifikasi.
- [x] **Persetujuan pengguna atas Tahap 1.**

**Gate 1:** pengguna menyetujui PRD, arsitektur, skema, dan rencana kerja. Tidak ada kode aplikasi ditulis sebelum gate ini lulus.

---

## Tahap 2 — Fondasi aplikasi

### 2.1 Database

- [x] Tulis `supabase/migrations/0001_schema.sql` sesuai `DATABASE_SCHEMA.md` §3.
- [x] Tulis `0002_rls.sql` (enable RLS, policy, grant/revoke).
- [x] Tulis `0003_triggers.sql` (`updated_at`, profil + 15 kategori default).
- [x] Tulis `0004_functions.sql` (6 fungsi agregat + grant execute).
- [x] Tulis `supabase/README.md` berisi urutan menjalankan migrasi di SQL Editor.
- [ ] Pengguna menjalankan keempat file berurutan di Supabase SQL Editor.
- [ ] Verifikasi: semua tabel `rowsecurity = true`, setiap tabel punya policy, semua fungsi `prosecdef = false`.

### 2.2 Scaffold Next.js

- [x] `npx create-next-app@16.4.6` dengan TypeScript, Tailwind, App Router, `src/` tidak dipakai.
- [x] Pasang dependency: `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `recharts`, `next-themes`, `lucide-react`, `sonner`.
- [x] Inisialisasi shadcn/ui dan tambahkan komponen dasar: button, input, label, card, dialog, select, dropdown-menu, table, tabs, badge, progress, sheet, skeleton, sonner.
- [x] Pin versi di `package.json`, commit lockfile.
- [x] `.gitignore` memuat `.env*.local`, `.next`, `node_modules`.
- [x] `.env.example` berisi dua nama variabel tanpa nilai.
- [x] `next.config.ts`: header keamanan (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`).
- [x] `vercel.json`: `{ "regions": ["sin1"] }`.
- [x] `git init`, commit awal.
- [ ] Push ke repo GitHub baru.

### 2.3 Supabase client & sesi

- [x] `lib/supabase/server.ts` — `createServerClient` dengan cookie adapter (`getAll`/`setAll`).
- [x] `lib/supabase/client.ts` — `createBrowserClient` (hanya bila diperlukan).
- [x] `lib/supabase/proxy.ts` — `updateSession()`.
- [x] `proxy.ts` di root — memanggil `updateSession()`, matcher mengecualikan aset statis.
- [x] `lib/auth.ts` — `requireUser()` (pakai `getUser()`), `getUserOrNull()`.
- [x] `lib/env.ts` — validasi env dengan Zod agar build gagal cepat bila env kosong.

### 2.4 Utilitas dasar

- [x] `lib/format.ts` — `formatRupiah` (`Rp1.000.000`), `formatTanggal` (`13 November 2026`, `timeZone: "UTC"`), `formatBulan`, `formatPersen`, `formatRingkas` (`Rp1,5 jt`).
- [x] `lib/period.ts` — bulan/tahun berjalan `Asia/Jakarta`, `rentangBulan`, `rentangTahun`, `rentangHari`, validasi `YYYY-MM-DD`.
- [x] `lib/constants.ts` — label jenis, label metode pembayaran, batas nominal/panjang, daftar navigasi.
- [x] `lib/types.ts` — tipe baris DB + DTO (`TransactionRow`, `CategoryRow`, `BudgetRow`, `PeriodSummary`, dst.).
- [x] Uji cepat fungsi format & periode (manual + contoh di komentar).

### 2.5 Autentikasi

- [x] `app/(auth)/layout.tsx` — layout bersih tanpa sidebar, redirect ke `/dashboard` bila sudah login.
- [x] `app/(auth)/login/page.tsx` + form client (`useActionState`).
- [x] `app/(auth)/register/page.tsx` + form client.
- [x] `lib/validation/auth.ts` — Zod: email valid, password min. 8, `full_name` 1–80.
- [x] `lib/actions/auth.ts` — `login`, `register`, `logout` (Server Action, pesan error Bahasa Indonesia).
- [x] `app/page.tsx` — redirect ke `/dashboard` (atau `/login` bila tanpa sesi).
- [x] `app/not-found.tsx`.

### 2.6 Layout aplikasi

- [x] `app/layout.tsx` — font, `ThemeProvider`, `Toaster`, `lang="id"`, metadata.
- [x] `app/globals.css` — token warna Tailwind v4 (hijau income, merah expense, netral).
- [x] `app/(app)/layout.tsx` — `requireUser()`, sidebar desktop, sheet + bottom nav mobile.
- [x] `components/layout/sidebar.tsx`, `mobile-nav.tsx`, `theme-toggle.tsx`, `page-header.tsx`, `user-menu.tsx`.
- [x] `components/shared/empty-state.tsx`, `confirm-dialog.tsx`, `money-input.tsx`, `period-filter.tsx`, `form-error.tsx`.
- [x] Halaman placeholder `/dashboard`, `/transaksi`, `/anggaran`, `/laporan`, `/pengaturan` yang bisa dibuka tanpa error.
- [x] Dark mode berfungsi dan tersimpan; default terang.

### 2.7 Pengaturan profil & logout

- [x] `lib/validation/profile.ts`, `lib/actions/profile.ts` — update `full_name`.
- [x] `lib/db/profile.ts` — ambil profil.
- [x] `/pengaturan` bagian Profil (email read-only) + tombol Logout.

**Gate 2:**
- [x] `npm run build`, `tsc --noEmit`, dan lint bersih.
- [ ] Register akun pertama → profil + 15 kategori default otomatis dibuat di database.
- [ ] Logout lalu membuka `/dashboard` mengarah ke `/login`; tombol Back tidak membuka data.
- [ ] Refresh halaman tetap login (cookie sesi diperbarui `proxy.ts`).
- [ ] Signup dimatikan di dashboard Supabase setelah akun pertama dibuat.
- [ ] **Persetujuan pengguna.**

---

## Tahap 3 — Transaksi, kategori, dashboard

### 3.1 Kategori

- [x] `lib/validation/category.ts` — nama 1–40, trim, jenis enum.
- [x] `lib/db/categories.ts` — daftar kategori aktif per jenis, daftar semua (termasuk arsip), cek pemakaian.
- [x] `lib/actions/categories.ts` — `createCategory`, `renameCategory`, `setArchived`, `deleteCategory` (hanya bila belum dipakai).
- [x] Normalisasi duplikat: tangani error unique index menjadi pesan "Nama kategori sudah dipakai".
- [x] `components/categories/category-manager.tsx` + `category-form-dialog.tsx`.
- [x] Integrasi pengelolaan kategori di `/pengaturan`.

### 3.2 Transaksi — data layer

- [x] `lib/validation/transaction.ts` — tanggal, jenis, nominal, kategori UUID, deskripsi ≤ 200, metode enum.
- [x] `lib/db/transactions.ts` — `listTransactions(filters)` (paginated 25, `count: "exact"`), `getTransaction(id)`, `getRecentTransactions(period, 5)`.
- [x] `lib/actions/transactions.ts` — `createTransaction`, `updateTransaction`, `deleteTransaction`; setiap aksi `requireUser()` + Zod + `revalidatePath` dashboard/transaksi/anggaran/laporan.
- [x] Pastikan update/delete memakai filter `id` + `user_id` (RLS lapis kedua).
- [x] Tolak kategori arsip atau beda jenis dengan pesan jelas.

### 3.3 Transaksi — UI

- [x] `app/(app)/transaksi/page.tsx` — baca `searchParams`, panggil data layer, render tabel desktop & kartu mobile.
- [x] `components/transactions/transaction-filters.tsx` — pencarian (debounce/enter), rentang tanggal, kategori, jenis, urutan; sinkron ke URL.
- [x] `components/transactions/transaction-form-dialog.tsx` — tambah/edit, pilihan kategori difilter per jenis, `money-input` dengan format ribuan.
- [x] `components/transactions/transaction-delete-dialog.tsx` — konfirmasi hapus.
- [x] `components/transactions/transaction-list.tsx` — nominal hijau `+`, merah `−`, tanggal Indonesia.
- [x] Pagination 25 baris dengan info "Menampilkan x–y dari z".
- [x] Empty state dan skeleton.
- [x] Toast sukses/gagal.

### 3.4 Dashboard

- [x] `lib/db/dashboard.ts` — panggil `get_balance`, `get_period_summary`, `get_daily_series`, `get_category_totals` untuk periode terpilih + 5 transaksi terakhir.
- [x] `app/(app)/dashboard/page.tsx` — filter bulan/tahun dari URL (default bulan berjalan WIB).
- [x] `components/dashboard/stat-cards.tsx` — 4 kartu (Total Saldo, Pemasukan, Pengeluaran, Selisih).
- [x] `components/dashboard/daily-chart.tsx` — Recharts bar chart harian (client component).
- [x] `components/dashboard/category-donut.tsx` — donut + legenda nominal & persentase.
- [x] `components/dashboard/recent-transactions.tsx` — maksimal 5 baris.
- [x] Empty state bila belum ada transaksi pada periode itu.
- [x] Format ringkas sumbu grafik (`Rp250 rb`, `Rp1,5 jt`).

**Gate 3:**
- [ ] CRUD transaksi dan kategori berfungsi; perubahan langsung terlihat di dashboard.
- [ ] Pencarian, filter tanggal/kategori/jenis, urutan, dan pagination menghasilkan data benar dan state ada di URL.
- [ ] Input tidak sah ditolak (nominal 0/negatif/desimal, kategori beda jenis, tanggal di luar 2000–2100).
- [ ] Total dashboard cocok dengan hitungan manual.
- [ ] Saldo tidak berubah saat filter bulan diganti.
- [ ] Uji cepat 2 akun: data tidak saling terlihat.
- [x] `npm run build` bersih.
- [ ] **Persetujuan pengguna.**

---

## Tahap 4 — Anggaran, laporan, CSV

### 4.1 Anggaran

- [x] `lib/validation/budget.ts` — kategori pengeluaran, tahun 2000–2100, bulan 1–12, nominal > 0.
- [x] `lib/db/budgets.ts` — daftar anggaran + aktual per kategori untuk periode; hitung sisa & persentase.
- [x] `lib/actions/budgets.ts` — `upsertBudget` (unique per user+kategori+periode), `deleteBudget`.
- [x] `app/(app)/anggaran/page.tsx` — filter bulan/tahun, ringkasan total anggaran/aktual/sisa.
- [x] `components/budgets/budget-list.tsx` + `budget-form-dialog.tsx` + `budget-progress.tsx`.
- [x] Indikator warna: hijau `< 80%`, kuning `80–<100%`, merah `≥ 100%`.
- [x] Kategori diarsipkan tetap tampil bila punya anggaran/pengeluaran bulan itu, berlabel "Diarsipkan".

### 4.2 Laporan

- [x] `lib/db/reports.ts` — data harian, bulanan, tahunan (`get_period_summary`, `get_daily_series`, `get_monthly_series`, `get_category_totals`, `get_available_years`).
- [x] `app/(app)/laporan/page.tsx` — tab Harian / Bulanan / Tahunan; tab & periode di URL.
- [x] `components/reports/report-tabs.tsx`, `period-summary.tsx`, `trend-chart.tsx`, `category-breakdown.tsx`.
- [x] Isi Harian: pilih tanggal, total, rincian kategori, daftar transaksi hari itu.
- [x] Isi Bulanan: pilih bulan/tahun, total, grafik harian, rincian kategori.
- [x] Isi Tahunan: pilih tahun, total, grafik 12 bulan, rincian kategori.
- [x] Tahun diambil dari `get_available_years()` (default tahun berjalan).

### 4.3 Ekspor CSV

- [x] `app/api/export/route.ts` — `GET` dengan parameter periode sesuai tab aktif.
- [x] `requireUser()`; query memakai filter yang sama dengan laporan; urut tanggal naik.
- [x] Escape koma, kutip, dan newline; UTF-8 BOM; `Content-Disposition: attachment`.
- [x] Nama file `transaksi-YYYY-MM-DD.csv`.
- [x] `components/reports/export-button.tsx` — mengikuti filter aktif.
- [x] Periode kosong tetap menghasilkan file berisi header.

**Gate 4:**
- [x] Anggaran hanya bisa dibuat untuk kategori pengeluaran; satu anggaran per kategori per bulan.
- [x] Aktual, sisa, dan persentase cocok dengan transaksi bulan tersebut; warna berubah di 80% dan 100%.
- [x] Ketiga tab laporan menampilkan total yang benar.
- [x] CSV berisi data sesuai periode aktif dan terbuka rapi di Excel (karakter Indonesia benar).
- [x] `npm run build` bersih.
- [x] **Persetujuan pengguna.**

---

## Tahap 5 — Pengujian, keamanan, deployment

### 5.1 Pengujian fungsi & tampilan

- [ ] Uji manual seluruh alur: register → login → tambah transaksi → dashboard → anggaran → laporan → CSV → logout.
- [x] Uji validasi: setiap field wajib, batas panjang, nominal ekstrem, tanggal tidak valid.
- [x] Uji empty state pada setiap halaman.
- [x] Uji responsif 375 px, 768 px, 1280 px; tidak ada scroll horizontal.
- [x] Uji dark mode di semua halaman.
- [x] Cek console browser tanpa error; cek tidak ada layout shift besar.
- [x] `npm run build`, `tsc --noEmit`, lint bersih.

### 5.2 Uji keamanan RLS

- [x] Buat akun B sementara (signup masih terbuka sementara).
- [x] B tidak melihat data A di UI maupun lewat REST langsung.
- [x] B gagal update/delete baris milik A (0 baris terpengaruh).
- [x] B gagal insert dengan `user_id`/`category_id` milik A.
- [x] Request tanpa JWT (anon key saja) ditolak/dikembalikan kosong.
- [x] RPC mengembalikan hanya data pemilik token.
- [ ] Hapus akun B dan data uji setelah selesai.
- [x] Pastikan tidak ada service role key di repo, build output, atau env Vercel.
- [ ] Matikan kembali signup di Supabase.

### 5.3 Dokumentasi & konfigurasi deploy

- [x] `.env.example` final (hanya dua variabel publik).
- [x] `README.md` — ringkasan, stack, cara menjalankan lokal, struktur folder.
- [x] `DEPLOYMENT.md` — langkah Supabase (migrasi, auth, RLS), langkah Vercel (import repo, env, region, deploy), pengaturan redirect URL.
- [x] Bagian **Backup & pemulihan** — ekspor CSV rutin + panduan `pg_dump` dari Supabase.
- [x] Bagian **Project pause** — cara resume setelah 7 hari tanpa aktivitas.
- [x] Bagian **Reset password** — lewat dashboard Supabase.
- [x] Bagian **Batasan Free Tier** — 500 MB, 5 GB egress, tanpa backup otomatis, non-komersial.
- [x] Commit terakhir dan push ke GitHub.
- [ ] Deploy ke Vercel, isi environment variables, set region `sin1`.
- [ ] Uji produksi: login, satu transaksi, satu anggaran, satu ekspor CSV.
- [ ] Setelah verifikasi, matikan signup Supabase dan hapus akun uji.

**Gate 5:** aplikasi berjalan di domain Vercel, seluruh kriteria penerimaan PRD §10 terpenuhi, dokumentasi lengkap.

---

## Struktur folder akhir

```
catatan-keuangan/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   ├── not-found.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── transaksi/page.tsx
│   │   ├── anggaran/page.tsx
│   │   ├── laporan/page.tsx
│   │   └── pengaturan/page.tsx
│   └── api/export/route.ts
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── layout/             # sidebar, mobile-nav, theme-toggle, page-header, user-menu
│   ├── dashboard/          # stat-cards, daily-chart, category-donut, recent-transactions
│   ├── transactions/       # filters, list, form-dialog, delete-dialog
│   ├── categories/         # manager, form-dialog
│   ├── budgets/            # list, form-dialog, progress
│   ├── reports/            # tabs, summary, trend-chart, category-breakdown, export-button
│   └── shared/             # empty-state, confirm-dialog, money-input, period-filter
├── lib/
│   ├── supabase/           # server.ts, client.ts, proxy.ts
│   ├── actions/            # auth, transactions, categories, budgets, profile
│   ├── db/                 # transactions, categories, budgets, dashboard, reports, profile
│   ├── validation/         # auth, transaction, category, budget, profile
│   ├── auth.ts
│   ├── env.ts
│   ├── format.ts
│   ├── period.ts
│   ├── constants.ts
│   └── types.ts
├── supabase/
│   ├── migrations/         # 0001_schema.sql … 0004_functions.sql
│   └── README.md
├── public/
├── proxy.ts
├── next.config.ts
├── vercel.json
├── .env.example
├── .env.local              # tidak di-commit
├── .gitignore
├── PRD.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── TASKS.md
├── DEPLOYMENT.md           # Tahap 5
└── README.md               # Tahap 5
```

---

## Urutan ketergantungan

```
Tahap 1 (dokumen)
   └─> Tahap 2.1 (migrasi SQL)  ── dijalankan pengguna di Supabase
          └─> Tahap 2.2–2.7 (scaffold, auth, layout)
                 └─> Tahap 3.1 (kategori)
                        └─> Tahap 3.2–3.3 (transaksi)
                               └─> Tahap 3.4 (dashboard)
                                      └─> Tahap 4.1 (anggaran)
                                             └─> Tahap 4.2 (laporan)
                                                    └─> Tahap 4.3 (CSV)
                                                           └─> Tahap 5 (uji + deploy)
```

Alasan urutan: tabel harus ada sebelum auth diuji; kategori harus ada sebelum transaksi; transaksi harus ada sebelum agregat dashboard/anggaran/laporan bermakna.

---

## Kebutuhan konfigurasi

### Supabase

| Setelan | Nilai |
| --- | --- |
| Region | Southeast Asia (Singapore) |
| Confirm email | Nonaktif |
| Minimum password length | 8 |
| Allow new users to sign up | Aktif sampai akun pertama, lalu nonaktif |
| Site URL | `https://<domain-vercel>` |
| Redirect URLs | `https://<domain-vercel>`, `http://localhost:3000` |
| RLS | Aktif di 4 tabel, policy dari migrasi |
| Service role key | Tidak dipakai di aplikasi |

### Vercel

| Setelan | Nilai |
| --- | --- |
| Framework preset | Next.js |
| Node.js | 22.x |
| Region | `sin1` lewat `vercel.json` |
| Env vars | `SUPABASE_URL`, `SUPABASE_ANON_KEY` (server-only) |
| Cron / worker | Tidak ada |
| Plan | Hobby (non-komersial) |

### Lokal

```bash
npm install
cp .env.example .env.local   # isi dua variabel
npm run dev                  # http://localhost:3000
```

---

## Yang tidak dikerjakan (dikonfirmasi PRD §8)

Multi-currency, dompet terpisah, transaksi berulang, notifikasi, impor mutasi, lampiran file, berbagi data, OAuth, reset password via email, cron/worker, realtime, ekspor PDF/Excel, PWA, audit log, soft delete, halaman admin, hapus akun dari UI.

---

## Status

| Tahap | Status |
| --- | --- |
| 1 — Perencanaan | Selesai (disetujui) |
| 2 — Fondasi | 2.1–2.7 selesai, verifikasi otomatis lolos — **menunggu cek browser Gate 2** |
| 3 — Transaksi & dashboard | Selesai (disetujui) |
| 4 — Anggaran, laporan, CSV | Selesai (disetujui) |
| 5 — Uji & deploy | 5.1–5.2 lolos, repo sudah di GitHub — **menunggu deploy Vercel** |
