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
- [ ] **Persetujuan pengguna atas Tahap 1.**

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

- [ ] `npx create-next-app@16.4.6` dengan TypeScript, Tailwind, App Router, `src/` tidak dipakai.
- [ ] Pasang dependency: `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `recharts`, `next-themes`, `lucide-react`, `sonner`.
- [ ] Inisialisasi shadcn/ui dan tambahkan komponen dasar: button, input, label, card, dialog, select, dropdown-menu, table, tabs, badge, progress, sheet, skeleton, sonner, form-error.
- [ ] Pin versi di `package.json`, commit lockfile.
- [ ] `.gitignore` memuat `.env*.local`, `.next`, `node_modules`.
- [ ] `.env.example` berisi dua nama variabel tanpa nilai.
- [ ] `next.config.ts`: header keamanan (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`).
- [ ] `vercel.json`: `{ "regions": ["sin1"] }`.
- [ ] `git init`, commit awal, push ke repo GitHub baru.

### 2.3 Supabase client & sesi

- [ ] `lib/supabase/server.ts` — `createServerClient` dengan cookie adapter (`getAll`/`setAll`).
- [ ] `lib/supabase/client.ts` — `createBrowserClient` (hanya bila diperlukan).
- [ ] `lib/supabase/proxy.ts` — `updateSession()`.
- [ ] `proxy.ts` di root — memanggil `updateSession()`, matcher mengecualikan aset statis.
- [ ] `lib/auth.ts` — `requireUser()` (pakai `getUser()`), `getUserOrNull()`.
- [ ] `lib/env.ts` — validasi env dengan Zod agar build gagal cepat bila env kosong.

### 2.4 Utilitas dasar

- [ ] `lib/format.ts` — `formatRupiah` (`Rp1.000.000`), `formatTanggal` (`13 November 2026`, `timeZone: "UTC"`), `formatBulan`, `formatPersen`, `formatRingkas` (`Rp1,5 jt`).
- [ ] `lib/period.ts` — bulan/tahun berjalan `Asia/Jakarta`, `rentangBulan`, `rentangTahun`, `rentangHari`, validasi `YYYY-MM-DD`.
- [ ] `lib/constants.ts` — label jenis, label metode pembayaran, batas nominal/panjang, daftar navigasi.
- [ ] `lib/types.ts` — tipe baris DB + DTO (`TransactionRow`, `CategoryRow`, `BudgetRow`, `PeriodSummary`, dst.).
- [ ] Uji cepat fungsi format & periode (manual + contoh di komentar).

### 2.5 Autentikasi

- [ ] `app/(auth)/layout.tsx` — layout bersih tanpa sidebar, redirect ke `/dashboard` bila sudah login.
- [ ] `app/(auth)/login/page.tsx` + form client (`useActionState`).
- [ ] `app/(auth)/register/page.tsx` + form client.
- [ ] `lib/validation/auth.ts` — Zod: email valid, password min. 8, `full_name` 1–80.
- [ ] `lib/actions/auth.ts` — `login`, `register`, `logout` (Server Action, pesan error Bahasa Indonesia).
- [ ] `app/page.tsx` — redirect ke `/dashboard` (atau `/login` bila tanpa sesi).
- [ ] `app/not-found.tsx`.

### 2.6 Layout aplikasi

- [ ] `app/layout.tsx` — font, `ThemeProvider`, `Toaster`, `lang="id"`, metadata.
- [ ] `app/globals.css` — token warna Tailwind v4 (hijau income, merah expense, netral).
- [ ] `app/(app)/layout.tsx` — `requireUser()`, sidebar desktop, sheet + bottom nav mobile.
- [ ] `components/layout/sidebar.tsx`, `mobile-nav.tsx`, `theme-toggle.tsx`, `page-header.tsx`, `user-menu.tsx`.
- [ ] `components/shared/empty-state.tsx`, `confirm-dialog.tsx`, `money-input.tsx`, `period-filter.tsx`.
- [ ] Halaman placeholder `/dashboard`, `/transaksi`, `/anggaran`, `/laporan`, `/pengaturan` yang bisa dibuka tanpa error.
- [ ] Dark mode berfungsi dan tersimpan; default terang.

### 2.7 Pengaturan profil & logout

- [ ] `lib/validation/profile.ts`, `lib/actions/profile.ts` — update `full_name`.
- [ ] `lib/db/profile.ts` — ambil profil.
- [ ] `/pengaturan` bagian Profil (email read-only) + tombol Logout.

**Gate 2:**
- [ ] `npm run build`, `tsc --noEmit`, dan lint bersih.
- [ ] Register akun pertama → profil + 15 kategori default otomatis dibuat di database.
- [ ] Logout lalu membuka `/dashboard` mengarah ke `/login`; tombol Back tidak membuka data.
- [ ] Refresh halaman tetap login (cookie sesi diperbarui `proxy.ts`).
- [ ] Signup dimatikan di dashboard Supabase setelah akun pertama dibuat.
- [ ] **Persetujuan pengguna.**

---

## Tahap 3 — Transaksi, kategori, dashboard

### 3.1 Kategori

- [ ] `lib/validation/category.ts` — nama 1–40, trim, jenis enum.
- [ ] `lib/db/categories.ts` — daftar kategori aktif per jenis, daftar semua (termasuk arsip), cek pemakaian.
- [ ] `lib/actions/categories.ts` — `createCategory`, `renameCategory`, `setArchived`, `deleteCategory` (hanya bila belum dipakai).
- [ ] Normalisasi duplikat: tangani error unique index menjadi pesan "Nama kategori sudah dipakai".
- [ ] `components/categories/category-manager.tsx` + `category-form-dialog.tsx`.
- [ ] Integrasi pengelolaan kategori di `/pengaturan`.

### 3.2 Transaksi — data layer

- [ ] `lib/validation/transaction.ts` — tanggal, jenis, nominal, kategori UUID, deskripsi ≤ 200, metode enum.
- [ ] `lib/db/transactions.ts` — `listTransactions(filters)` (paginated 25, `count: "exact"`), `getTransaction(id)`, `getRecentTransactions(period, 5)`.
- [ ] `lib/actions/transactions.ts` — `createTransaction`, `updateTransaction`, `deleteTransaction`; setiap aksi `requireUser()` + Zod + `revalidatePath` dashboard/transaksi/anggaran/laporan.
- [ ] Pastikan update/delete memakai filter `id` + `user_id` (RLS lapis kedua).
- [ ] Tolak kategori arsip atau beda jenis dengan pesan jelas.

### 3.3 Transaksi — UI

- [ ] `app/(app)/transaksi/page.tsx` — baca `searchParams`, panggil data layer, render tabel desktop & kartu mobile.
- [ ] `components/transactions/transaction-filters.tsx` — pencarian (debounce/enter), rentang tanggal, kategori, jenis, urutan; sinkron ke URL.
- [ ] `components/transactions/transaction-form-dialog.tsx` — tambah/edit, pilihan kategori difilter per jenis, `money-input` dengan format ribuan.
- [ ] `components/transactions/transaction-delete-dialog.tsx` — konfirmasi hapus.
- [ ] `components/transactions/transaction-list.tsx` — nominal hijau `+`, merah `−`, tanggal Indonesia.
- [ ] Pagination 25 baris dengan info "Menampilkan x–y dari z".
- [ ] Empty state dan skeleton.
- [ ] Toast sukses/gagal.

### 3.4 Dashboard

- [ ] `lib/db/dashboard.ts` — panggil `get_balance`, `get_period_summary`, `get_daily_series`, `get_category_totals` untuk periode terpilih + 5 transaksi terakhir.
- [ ] `app/(app)/dashboard/page.tsx` — filter bulan/tahun dari URL (default bulan berjalan WIB).
- [ ] `components/dashboard/stat-cards.tsx` — 4 kartu (Total Saldo, Pemasukan, Pengeluaran, Selisih).
- [ ] `components/dashboard/daily-chart.tsx` — Recharts bar chart harian (client component).
- [ ] `components/dashboard/category-donut.tsx` — donut + legenda nominal & persentase.
- [ ] `components/dashboard/recent-transactions.tsx` — maksimal 5 baris.
- [ ] Empty state bila belum ada transaksi pada periode itu.
- [ ] Format ringkas sumbu grafik (`Rp250 rb`, `Rp1,5 jt`).

**Gate 3:**
- [ ] CRUD transaksi dan kategori berfungsi; perubahan langsung terlihat di dashboard.
- [ ] Pencarian, filter tanggal/kategori/jenis, urutan, dan pagination menghasilkan data benar dan state ada di URL.
- [ ] Input tidak sah ditolak (nominal 0/negatif/desimal, kategori beda jenis, tanggal di luar 2000–2100).
- [ ] Total dashboard cocok dengan hitungan manual.
- [ ] Saldo tidak berubah saat filter bulan diganti.
- [ ] Uji cepat 2 akun: data tidak saling terlihat.
- [ ] `npm run build` bersih.
- [ ] **Persetujuan pengguna.**

---

## Tahap 4 — Anggaran, laporan, CSV

### 4.1 Anggaran

- [ ] `lib/validation/budget.ts` — kategori pengeluaran, tahun 2000–2100, bulan 1–12, nominal > 0.
- [ ] `lib/db/budgets.ts` — daftar anggaran + aktual per kategori untuk periode; hitung sisa & persentase.
- [ ] `lib/actions/budgets.ts` — `upsertBudget` (unique per user+kategori+periode), `deleteBudget`.
- [ ] `app/(app)/anggaran/page.tsx` — filter bulan/tahun, ringkasan total anggaran/aktual/sisa.
- [ ] `components/budgets/budget-list.tsx` + `budget-form-dialog.tsx` + `budget-progress.tsx`.
- [ ] Indikator warna: hijau `< 80%`, kuning `80–<100%`, merah `≥ 100%`.
- [ ] Kategori diarsipkan tetap tampil bila punya anggaran/pengeluaran bulan itu, berlabel "Diarsipkan".

### 4.2 Laporan

- [ ] `lib/db/reports.ts` — data harian, bulanan, tahunan (`get_period_summary`, `get_daily_series`, `get_monthly_series`, `get_category_totals`, `get_available_years`).
- [ ] `app/(app)/laporan/page.tsx` — tab Harian / Bulanan / Tahunan; tab & periode di URL.
- [ ] `components/reports/report-tabs.tsx`, `period-summary.tsx`, `trend-chart.tsx`, `category-breakdown.tsx`.
- [ ] Isi Harian: pilih tanggal, total, rincian kategori, daftar transaksi hari itu.
- [ ] Isi Bulanan: pilih bulan/tahun, total, grafik harian, rincian kategori.
- [ ] Isi Tahunan: pilih tahun, total, grafik 12 bulan, rincian kategori.
- [ ] Tahun diambil dari `get_available_years()` (default tahun berjalan).

### 4.3 Ekspor CSV

- [ ] `app/api/export/route.ts` — `GET` dengan parameter periode sesuai tab aktif.
- [ ] `requireUser()`; query memakai filter yang sama dengan laporan; urut tanggal naik.
- [ ] Escape koma, kutip, dan newline; UTF-8 BOM; `Content-Disposition: attachment`.
- [ ] Nama file `transaksi-YYYY-MM-DD.csv`.
- [ ] `components/reports/export-button.tsx` — mengikuti filter aktif.
- [ ] Periode kosong tetap menghasilkan file berisi header.

**Gate 4:**
- [ ] Anggaran hanya bisa dibuat untuk kategori pengeluaran; satu anggaran per kategori per bulan.
- [ ] Aktual, sisa, dan persentase cocok dengan transaksi bulan tersebut; warna berubah di 80% dan 100%.
- [ ] Ketiga tab laporan menampilkan total yang benar.
- [ ] CSV berisi data sesuai periode aktif dan terbuka rapi di Excel (karakter Indonesia benar).
- [ ] `npm run build` bersih.
- [ ] **Persetujuan pengguna.**

---

## Tahap 5 — Pengujian, keamanan, deployment

### 5.1 Pengujian fungsi & tampilan

- [ ] Uji manual seluruh alur: register → login → tambah transaksi → dashboard → anggaran → laporan → CSV → logout.
- [ ] Uji validasi: setiap field wajib, batas panjang, nominal ekstrem, tanggal tidak valid.
- [ ] Uji empty state pada setiap halaman.
- [ ] Uji responsif 375 px, 768 px, 1280 px; tidak ada scroll horizontal.
- [ ] Uji dark mode di semua halaman.
- [ ] Cek console browser tanpa error; cek tidak ada layout shift besar.
- [ ] `npm run build`, `tsc --noEmit`, lint bersih.

### 5.2 Uji keamanan RLS

- [ ] Buat akun B sementara (signup masih terbuka sementara).
- [ ] B tidak melihat data A di UI maupun lewat REST langsung.
- [ ] B gagal update/delete baris milik A (0 baris terpengaruh).
- [ ] B gagal insert dengan `user_id`/`category_id` milik A.
- [ ] Request tanpa JWT (anon key saja) ditolak/dikembalikan kosong.
- [ ] RPC mengembalikan hanya data pemilik token.
- [ ] Hapus akun B dan data uji setelah selesai.
- [ ] Pastikan tidak ada service role key di repo, build output, atau env Vercel.
- [ ] Matikan kembali signup di Supabase.

### 5.3 Dokumentasi & konfigurasi deploy

- [ ] `.env.example` final (hanya dua variabel publik).
- [ ] `README.md` — ringkasan, stack, cara menjalankan lokal, struktur folder.
- [ ] `DEPLOYMENT.md` — langkah Supabase (migrasi, auth, RLS), langkah Vercel (import repo, env, region, deploy), pengaturan redirect URL.
- [ ] Bagian **Backup & pemulihan** — ekspor CSV rutin + panduan `pg_dump` dari Supabase.
- [ ] Bagian **Project pause** — cara resume setelah 7 hari tanpa aktivitas.
- [ ] Bagian **Reset password** — lewat dashboard Supabase.
- [ ] Bagian **Batasan Free Tier** — 500 MB, 5 GB egress, tanpa backup otomatis, non-komersial.
- [ ] Commit terakhir dan push ke GitHub.
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
| Env vars | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
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
| 1 — Perencanaan | Selesai, **menunggu persetujuan** |
| 2 — Fondasi | Belum mulai |
| 3 — Transaksi & dashboard | Belum mulai |
| 4 — Anggaran, laporan, CSV | Belum mulai |
| 5 — Uji & deploy | Belum mulai |
