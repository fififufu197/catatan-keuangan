# supabase/

Skema database dan panduan menjalankannya.

## Isi folder

| File | Isi |
| --- | --- |
| `migrations/0001_schema.sql` | Enum, 4 tabel, index |
| `migrations/0002_rls.sql` | Enable RLS, policy, grant/revoke |
| `migrations/0003_triggers.sql` | `updated_at`, profil + 15 kategori default |
| `migrations/0004_functions.sql` | 6 fungsi agregat + grant execute |

## Cara menjalankan (SQL Editor)

1. Buka project Supabase → **SQL Editor** → **New query**.
2. Buka `0001_schema.sql`, salin seluruh isi, tempel, klik **Run**.
3. Ulangi berurutan untuk `0002_rls.sql`, `0003_triggers.sql`, `0004_functions.sql`.
4. Jangan mengubah urutan: policy butuh tabel, fungsi butuh tabel + enum.

File boleh dijalankan ulang; DDL memakai `if not exists` / `create or replace`,
policy dan trigger di-`drop if exists` lebih dulu. Data yang sudah ada tidak dihapus.

## Verifikasi

```sql
-- Semua tabel harus rowsecurity = true
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- Setiap tabel harus punya policy
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Semua fungsi agregat harus security invoker (prosecdef = false)
select proname, prosecdef
from pg_proc
join pg_namespace n on n.oid = pg_proc.pronamespace
where n.nspname = 'public' and proname like 'get\_%';
```

Hasil yang diharapkan: 4 tabel dengan `rowsecurity = true`, 15 policy
(profiles 3, categories 4, transactions 4, budgets 4), dan 6 fungsi dengan
`prosecdef = false`.

## Uji cepat setelah migrasi

1. Daftar satu akun di aplikasi (signup masih terbuka).
2. Cek di **Table Editor**:
   - `profiles` berisi 1 baris dengan `full_name` dari form.
   - `categories` berisi 15 baris untuk user tersebut.
3. Setelah akun selesai dibuat, matikan **Allow new users to sign up** di
   **Authentication → Sign In / Providers**.

## Reset (hati-hati, menghapus data)

Hanya untuk lingkungan uji:

```sql
drop table if exists public.budgets;
drop table if exists public.transactions;
drop table if exists public.categories;
drop table if exists public.profiles;
drop function if exists public.get_balance();
drop function if exists public.get_period_summary(date, date);
drop function if exists public.get_daily_series(date, date);
drop function if exists public.get_monthly_series(int);
drop function if exists public.get_category_totals(date, date, public.transaction_kind);
drop function if exists public.get_available_years();
drop function if exists public.handle_new_user();
drop function if exists public.set_updated_at();
drop type if exists public.payment_method;
drop type if exists public.transaction_kind;
```
