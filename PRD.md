# PRD — Catatan Keuangan Pribadi

## 1. Ringkasan

Aplikasi web untuk mencatat pemasukan dan pengeluaran pribadi, memantau saldo, mengatur anggaran bulanan per kategori, dan melihat laporan keuangan. Aplikasi berjalan sepenuhnya di Vercel Free Tier dengan Supabase (PostgreSQL + Auth) sebagai backend, tanpa server yang harus menyala terus dan tanpa background worker.

Seluruh antarmuka menggunakan Bahasa Indonesia, mata uang IDR, dan format tanggal Indonesia.

## 2. Tujuan

- Mencatat transaksi keuangan pribadi dengan cepat dan rapi.
- Mengetahui kondisi keuangan bulan berjalan: pemasukan, pengeluaran, selisih, dan saldo.
- Mengendalikan pengeluaran lewat anggaran per kategori.
- Menyediakan laporan harian, bulanan, dan tahunan yang bisa diekspor ke CSV.
- Menjaga data tetap privat: setiap pengguna hanya dapat mengakses datanya sendiri.

## 3. Pengguna dan model akses

- Aplikasi bersifat multi-user secara teknis (Supabase Auth + RLS).
- Dalam praktik, aplikasi dipakai oleh **satu akun pemilik**.
- Pendaftaran akun baru dibuka hanya sampai akun pertama dibuat, lalu dinonaktifkan di dashboard Supabase.
- Setiap baris data (`profiles`, `categories`, `transactions`, `budgets`) terikat pada `user_id` dan dilindungi RLS.
- Tidak ada peran admin, berbagi data, atau akses publik tanpa login.

## 4. Ruang lingkup MVP

### 4.1 Autentikasi

- Halaman `/login` dan `/register`: email + password.
- Konfirmasi email **dinonaktifkan** (SMTP bawaan Supabase hanya 2 email/jam dan bukan untuk produksi).
- Tidak ada fitur lupa password mandiri. Reset password dilakukan lewat dashboard Supabase bila diperlukan.
- Setelah login, pengguna diarahkan ke `/dashboard`; halaman aplikasi tidak dapat diakses tanpa sesi.
- Logout tersedia di halaman Pengaturan dan menu profil.

### 4.2 Dashboard

Filter: **bulan** dan **tahun** (default bulan berjalan, zona Asia/Jakarta).

Kartu statistik:

| Kartu | Definisi |
| --- | --- |
| Total Saldo | Seluruh pemasukan − seluruh pengeluaran, sejak transaksi pertama (tidak ikut filter bulan) |
| Pemasukan | Total pemasukan pada bulan/tahun terpilih |
| Pengeluaran | Total pengeluaran pada bulan/tahun terpilih |
| Selisih | Pemasukan − pengeluaran pada bulan/tahun terpilih (boleh negatif) |

Konten lain:

- Grafik batang harian pemasukan vs pengeluaran dalam bulan terpilih.
- Ringkasan pengeluaran per kategori (donut + legenda nominal dan persentase).
- Daftar **5 transaksi terakhir** pada bulan terpilih, urut tanggal lalu waktu input terbaru.
- Empty state jelas bila belum ada transaksi.

### 4.3 Transaksi

Field transaksi:

| Field | Aturan |
| --- | --- |
| Tanggal | Wajib, `date` tanpa jam, default hari ini (WIB), rentang 2000–2100 |
| Jenis | Pemasukan atau Pengeluaran |
| Nominal | Wajib, integer rupiah > 0, maksimum 999.999.999.999 |
| Kategori | Wajib, harus milik pengguna, jenisnya sama dengan jenis transaksi, dan tidak diarsipkan |
| Deskripsi | Opsional, maksimal 200 karakter |
| Metode pembayaran | Wajib: Tunai, Transfer Bank, E-Wallet, Lainnya |

Fitur:

- Tambah, edit, dan hapus (dengan konfirmasi).
- Cari berdasarkan deskripsi (tidak peka huruf besar/kecil).
- Filter rentang tanggal, kategori, dan jenis.
- Urutkan terbaru atau terlama berdasarkan tanggal transaksi.
- Default daftar: bulan berjalan.
- Daftar menampilkan 25 baris per halaman (kebutuhan teknis agar halaman tetap ringan, bukan fitur baru).
- Seluruh state filter/cari/urutan/halaman disimpan di URL agar bisa di-refresh dan dibagikan.
- Nominal pemasukan ditampilkan hijau dengan tanda `+`, pengeluaran merah dengan tanda `−`.

### 4.4 Kategori

- Kategori default dibuat otomatis untuk setiap pengguna baru.
- Pemasukan: Gaji, Bisnis, Investasi, Bonus, Lainnya.
- Pengeluaran: Makanan, Transportasi, Belanja, Tagihan, Kesehatan, Pendidikan, Hiburan, Rumah Tangga, Cicilan, Lainnya.
- Pengguna dapat menambah, mengganti nama, mengarsipkan/mengaktifkan, dan menghapus kategori.
- Nama wajib 1–40 karakter dan unik per pengguna per jenis (tanpa membedakan huruf besar/kecil).
- Jenis kategori tidak dapat diubah setelah dibuat (menjaga integritas transaksi).
- Kategori yang sudah dipakai transaksi atau anggaran **diarsipkan**, bukan dihapus, agar riwayat utuh.
- Hapus permanen hanya diizinkan jika kategori belum pernah dipakai.

### 4.5 Anggaran bulanan

- Anggaran dibuat per **kategori pengeluaran** per **bulan + tahun**.
- Satu anggaran per kategori per bulan (unik).
- Tidak ada carry-over sisa anggaran antar bulan.
- Nominal wajib integer > 0.

Tampilan per baris:

- Nama kategori.
- Anggaran.
- Total pengeluaran aktual bulan itu.
- Sisa anggaran (boleh negatif).
- Persentase penggunaan (boleh > 100%).
- Progress bar dengan indikator:
  - `< 80%` — normal (hijau).
  - `80% – < 100%` — mendekati batas (kuning).
  - `≥ 100%` — melewati anggaran (merah).

Ringkasan atas: total anggaran, total aktual, total sisa.
Kategori yang diarsipkan tetap ditampilkan bila memiliki anggaran atau pengeluaran pada bulan tersebut, dengan label "Diarsipkan".

### 4.6 Laporan

Satu halaman `/laporan` dengan tiga tab:

| Tab | Isi |
| --- | --- |
| Harian | Pilih tanggal; total pemasukan, pengeluaran, saldo hari itu; rincian pengeluaran per kategori; daftar transaksi hari itu |
| Bulanan | Pilih bulan/tahun; total pemasukan, pengeluaran, selisih; grafik harian; rincian pengeluaran per kategori |
| Tahunan | Pilih tahun; total pemasukan, pengeluaran, selisih; grafik 12 bulan; rincian pengeluaran per kategori |

- Pilihan tahun diambil dari tahun yang memiliki transaksi (default tahun berjalan).
- Grafik tren memakai Recharts.
- Ekspor CSV mengikuti periode tab yang aktif.
- Kolom CSV: `Tanggal,Jenis,Kategori,Nominal,Metode,Deskripsi`.
- CSV memakai UTF-8 BOM agar karakter Indonesia tampil benar di Excel; nama file `transaksi-YYYY-MM-DD.csv`.
- Tidak ada ekspor PDF/Excel.

### 4.7 Pengaturan

- **Profil**: ubah nama lengkap (1–80 karakter), email ditampilkan sebagai read-only, tombol simpan.
- **Kategori**: pengelolaan kategori yang sama dengan bagian 4.4.
- **Tampilan**: pilihan tema Terang/Gelap/Sistem, default Terang.
- **Logout**.

## 5. Aturan perhitungan dan definisi

- **Saldo** = Σ pemasukan − Σ pengeluaran, seluruh waktu.
- **Selisih bulan** = pemasukan bulan − pengeluaran bulan.
- **Bulan berjalan** ditentukan dengan zona waktu `Asia/Jakarta`, bukan zona server (Vercel memakai UTC).
- **Tanggal transaksi** disimpan sebagai `date` tanpa konversi zona waktu. Format tampilan memakai `timeZone: "UTC"` agar tidak bergeser satu hari.
- **Persentase anggaran** = `aktual / anggaran × 100`, dibulatkan ke bilangan bulat untuk tampilan; nilai asli dipakai untuk warna indikator.
- **Aktual anggaran** = total transaksi pengeluaran kategori tersebut pada bulan itu, termasuk transaksi yang dibuat setelah anggaran ditetapkan.
- Uang selalu integer rupiah; tidak ada sen, pembulatan, atau kurs.

## 6. Format tampilan

- Mata uang: `Rp1.000.000` (tanpa spasi setelah `Rp`, tanpa desimal).
- Angka ringkas grafik: `Rp1,5 jt`, `Rp250 rb`.
- Tanggal: `13 November 2026`.
- Bulan: `November 2026`.
- Persentase: `85%`; di atas 100% tetap ditampilkan, mis. `112%`.
- Angka negatif: `−Rp250.000` (tanda minus, bukan dalam kurung).

## 7. UI/UX dan responsif

- Gaya: minimalis, profesional, bersih; latar putih/abu-abu terang.
- Warna: hijau untuk pemasukan, merah untuk pengeluaran, netral zinc/slate.
- Desktop: sidebar kiri tetap (fixed) berisi Dashboard, Transaksi, Anggaran, Laporan, Pengaturan.
- Tablet/mobile: sidebar berubah menjadi menu sheet; navigasi bawah (bottom nav) untuk 5 menu utama.
- Konten berupa kartu dengan sudut membulat, tabel responsif (di mobile berubah menjadi daftar kartu).
- Header halaman menampilkan judul, filter periode (bila relevan), dan tombol aksi utama.
- Form transaksi dan anggaran memakai dialog/modal, bukan halaman terpisah.
- Toast untuk sukses/gagal; error validasi ditampilkan dekat field.
- Loading state sederhana (skeleton) dan empty state untuk setiap daftar/grafik.
- Dark mode didukung lewat `next-themes`, default terang.
- Target sentuh minimal 44 px pada mobile.
- Bahasa seluruh antarmuka: Indonesia.

## 8. Non-goals (tidak dikerjakan)

- Multi-currency, kurs, atau crypto.
- Dompet/akun bank terpisah, transfer antar dompet, saldo per akun.
- Transaksi berulang/otomatis, langganan, cicilan terjadwal.
- Notifikasi, email pengingat, push notification.
- Impor mutasi bank, OCR struk, lampiran file.
- Berbagi data, kolaborasi, multi-tenant dengan peran.
- Reset password via email, verifikasi email, OAuth/social login.
- Cron job, background worker, antrian, realtime.
- Ekspor PDF/Excel, cetak laporan.
- PWA/offline mode.
- Audit log, soft delete transaksi, recycle bin.
- Halaman admin, manajemen pengguna, hapus akun dari UI.

## 9. Batasan platform gratis (diverifikasi Nov 2026)

| Layanan | Batas | Dampak |
| --- | --- | --- |
| Supabase Free | 500 MB database, 5 GB egress, 2 project aktif | Cukup untuk data pribadi; perlu pemantauan ukuran jangka panjang |
| Supabase Free | Tanpa backup otomatis | Backup manual lewat ekspor CSV/pg_dump terdokumentasi |
| Supabase Free | Project di-pause setelah 7 hari tanpa aktivitas | Data aman; perlu resume manual dari dashboard |
| Supabase Auth | Email bawaan 2/jam, hanya ke anggota tim | Konfirmasi email & reset password tidak dipakai |
| Vercel Hobby | Gratis untuk penggunaan non-komersial | Sesuai pemakaian pribadi |
| Vercel Hobby | Tanpa cron/worker yang selalu hidup | Arsitektur sepenuhnya request-response |

## 10. Kriteria penerimaan

**Autentikasi**
1. Pengguna tanpa sesi yang membuka halaman aplikasi diarahkan ke `/login`.
2. Login dengan kredensial benar masuk ke dashboard; kredensial salah menampilkan pesan error.
3. Logout menghapus sesi dan tidak bisa kembali lewat tombol Back.

**Dashboard**
4. Empat kartu menampilkan angka yang sama dengan perhitungan manual dari data bulan terpilih.
5. Saldo tidak berubah saat filter bulan diganti.
6. Grafik dan ringkasan kategori hanya memuat data bulan terpilih.
7. Daftar transaksi terakhir berisi maksimal 5 baris bulan terpilih.

**Transaksi**
8. Tambah/edit/hapus transaksi langsung tercermin di dashboard, daftar, anggaran, dan laporan.
9. Nominal 0, negatif, desimal, atau kategori beda jenis ditolak dengan pesan jelas.
10. Cari, filter tanggal/kategori/jenis, urutan, dan pagination menghasilkan daftar yang benar dan state-nya ada di URL.
11. Transaksi milik pengguna lain tidak terlihat dan tidak bisa diubah (diuji dengan 2 akun).

**Kategori**
12. Pengguna baru otomatis mendapat 15 kategori default.
13. Kategori yang sudah dipakai tidak bisa dihapus permanen, hanya diarsipkan.
14. Nama duplikat dalam jenis yang sama ditolak.

**Anggaran**
15. Anggaran hanya bisa dibuat untuk kategori pengeluaran.
16. Aktual, sisa, dan persentase cocok dengan transaksi bulan tersebut.
17. Warna indikator berubah pada 80% dan 100%.

**Laporan & CSV**
18. Tab harian/bulanan/tahunan menampilkan total yang benar untuk periodenya.
19. CSV yang diunduh berisi data sesuai periode aktif, dengan format kolom yang disepakati.

**Kualitas**
20. `npm run build`, typecheck, dan lint bersih.
21. Tampilan dapat dipakai pada lebar 375 px, 768 px, dan 1280 px tanpa scroll horizontal yang mengganggu.
22. Tidak ada service role key atau secret di kode/repositori.

## 11. Keputusan terkunci (hasil grilling)

1. Project di folder terpisah `catatan-keuangan`, repo git sendiri; aplikasi uptime monitor tidak disentuh.
2. Multi-user secara teknis, dipakai satu akun; signup ditutup setelah akun pertama.
3. Email + password tanpa konfirmasi email; reset lewat dashboard Supabase.
4. Nominal integer rupiah (`bigint`), IDR saja, tanpa desimal.
5. Tanggal transaksi `date` tanpa jam; zona acuan Asia/Jakarta.
6. Metode pembayaran daftar tetap 4 pilihan, tanpa CRUD.
7. Kategori yang sudah dipakai diarsipkan; hapus permanen hanya jika belum dipakai.
8. Anggaran per kategori pengeluaran per bulan, tanpa rollover.
9. Saldo all-time; pemasukan/pengeluaran/selisih mengikuti filter bulan.
10. Laporan satu halaman dengan tab; CSV mengikuti filter aktif.
11. Dark mode disertakan.
12. Skema database diberikan sebagai SQL untuk dijalankan di SQL Editor Supabase; kredensial lewat `.env.local`.

## 12. Tahapan dan gate persetujuan

| Tahap | Hasil | Gate |
| --- | --- | --- |
| 1 | `PRD.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `TASKS.md`, struktur folder | Berhenti, minta persetujuan |
| 2 | Next.js, layout, sidebar, login/register, koneksi Supabase, RLS aktif | Berhenti, minta persetujuan |
| 3 | Transaksi, kategori, dashboard, ringkasan | Berhenti, minta persetujuan |
| 4 | Anggaran, laporan, grafik, ekspor CSV | Berhenti, minta persetujuan |
| 5 | Pengujian, uji RLS, mobile, build, panduan deploy, `.env.example` | Selesai |

Tidak ada pekerjaan tahap berikutnya sebelum tahap sebelumnya disetujui.
