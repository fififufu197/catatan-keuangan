# DATABASE_SCHEMA — Catatan Keuangan Pribadi

Supabase PostgreSQL. Semua tabel berada di schema `public`, memiliki `user_id` (kecuali `profiles` yang memakai `id`), dan dilindungi Row Level Security.

## 1. ERD

```
auth.users (Supabase)
   │ 1
   ├──────────── 1  profiles            (id = auth.users.id)
   ├──────────── N  categories          (user_id)
   ├──────────── N  transactions        (user_id)
   └──────────── N  budgets             (user_id)

categories
   ├──────────── N  transactions        (category_id, kind)
   └──────────── N  budgets             (category_id, kind)
```

Aturan hapus:

| Relasi | on delete |
| --- | --- |
| `auth.users` → profiles/categories/transactions/budgets | CASCADE |
| categories → transactions | RESTRICT |
| categories → budgets | RESTRICT |

Kategori tidak dihapus selama masih dipakai; aplikasi mengarsipkannya.

## 2. Enum

```sql
create type public.transaction_kind as enum ('income', 'expense');
create type public.payment_method as enum ('cash', 'bank_transfer', 'e_wallet', 'other');
```

Label UI:

| Nilai DB | Label |
| --- | --- |
| `income` | Pemasukan |
| `expense` | Pengeluaran |
| `cash` | Tunai |
| `bank_transfer` | Transfer Bank |
| `e_wallet` | E-Wallet |
| `other` | Lainnya |

## 3. DDL — `0001_schema.sql`

```sql
-- Ekstensi untuk gen_random_uuid() (biasanya sudah aktif di Supabase).
create extension if not exists pgcrypto;

create type public.transaction_kind as enum ('income', 'expense');
create type public.payment_method as enum ('cash', 'bank_transfer', 'e_wallet', 'other');

-- 1) Profil pengguna
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default ''
             check (char_length(full_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Kategori (milik pengguna, per jenis)
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null
             check (name = btrim(name) and char_length(name) between 1 and 40),
  kind       public.transaction_kind not null,
  archived   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Dibutuhkan foreign key komposit dari transactions & budgets.
  constraint categories_id_kind_key unique (id, kind)
);

create unique index categories_user_kind_name_ci_key
  on public.categories (user_id, kind, lower(name));

create index categories_user_kind_active_idx
  on public.categories (user_id, kind)
  where archived = false;

-- 3) Transaksi
create table public.transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  category_id    uuid not null,
  kind           public.transaction_kind not null,
  amount         bigint not null
                 check (amount > 0 and amount <= 999999999999),
  occurred_on    date not null default current_date
                 constraint transactions_occurred_on_range
                 check (occurred_on between date '2000-01-01' and date '2100-12-31'),
  description    text not null default ''
                 check (char_length(description) <= 200),
  payment_method public.payment_method not null default 'other',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- Menjamin kategori yang dipakai benar-benar milik jenis transaksi tersebut.
  constraint transactions_category_fk
    foreign key (category_id, kind)
    references public.categories (id, kind)
    on update restrict on delete restrict
);

create index transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc);

create index transactions_user_kind_date_idx
  on public.transactions (user_id, kind, occurred_on desc);

create index transactions_user_category_idx
  on public.transactions (user_id, category_id);

-- 4) Anggaran bulanan per kategori pengeluaran
create table public.budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null,
  kind        public.transaction_kind not null default 'expense'
              check (kind = 'expense'),
  year        smallint not null check (year between 2000 and 2100),
  month       smallint not null check (month between 1 and 12),
  amount      bigint not null
              check (amount > 0 and amount <= 999999999999),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint budgets_user_category_period_key
    unique (user_id, category_id, year, month),
  constraint budgets_category_fk
    foreign key (category_id, kind)
    references public.categories (id, kind)
    on update restrict on delete restrict
);

create index budgets_user_period_idx
  on public.budgets (user_id, year, month);
```

## 4. Trigger — `0003_triggers.sql`

### 4.1 `updated_at`

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

create trigger budgets_set_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();
```

### 4.2 Profil + kategori default saat pengguna baru

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );

  insert into public.categories (user_id, name, kind) values
    (new.id, 'Gaji', 'income'),
    (new.id, 'Bisnis', 'income'),
    (new.id, 'Investasi', 'income'),
    (new.id, 'Bonus', 'income'),
    (new.id, 'Lainnya', 'income'),
    (new.id, 'Makanan', 'expense'),
    (new.id, 'Transportasi', 'expense'),
    (new.id, 'Belanja', 'expense'),
    (new.id, 'Tagihan', 'expense'),
    (new.id, 'Kesehatan', 'expense'),
    (new.id, 'Pendidikan', 'expense'),
    (new.id, 'Hiburan', 'expense'),
    (new.id, 'Rumah Tangga', 'expense'),
    (new.id, 'Cicilan', 'expense'),
    (new.id, 'Lainnya', 'expense');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

Catatan: `security definer` diperlukan karena trigger berjalan saat `auth.users` diisi oleh Supabase Auth, sebelum pengguna punya sesi. Semua referensi tabel ditulis lengkap karena `search_path` dikosongkan.

## 5. RLS — `0002_rls.sql`

```sql
alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets      enable row level security;

-- PROFILES ------------------------------------------------------------
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- CATEGORIES ----------------------------------------------------------
create policy categories_select_own on public.categories
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy categories_insert_own on public.categories
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy categories_update_own on public.categories
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy categories_delete_own on public.categories
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- TRANSACTIONS --------------------------------------------------------
create policy transactions_select_own on public.transactions
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy transactions_insert_own on public.transactions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.categories c
      where c.id = transactions.category_id
        and c.user_id = (select auth.uid())
        and c.kind = transactions.kind
    )
  );

create policy transactions_update_own on public.transactions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.categories c
      where c.id = transactions.category_id
        and c.user_id = (select auth.uid())
        and c.kind = transactions.kind
    )
  );

create policy transactions_delete_own on public.transactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- BUDGETS -------------------------------------------------------------
create policy budgets_select_own on public.budgets
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy budgets_insert_own on public.budgets
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.categories c
      where c.id = budgets.category_id
        and c.user_id = (select auth.uid())
        and c.kind = 'expense'
    )
  );

create policy budgets_update_own on public.budgets
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.categories c
      where c.id = budgets.category_id
        and c.user_id = (select auth.uid())
        and c.kind = 'expense'
    )
  );

create policy budgets_delete_own on public.budgets
  for delete to authenticated
  using (user_id = (select auth.uid()));
```

### 5.1 Grants

```sql
revoke all on public.profiles, public.categories,
              public.transactions, public.budgets from anon;

grant select, insert, update         on public.profiles     to authenticated;
grant select, insert, update, delete on public.categories   to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.budgets      to authenticated;
```

Tidak ada policy `DELETE` pada `profiles`; penghapusan akun dilakukan lewat Supabase Auth (cascade).

## 6. Fungsi agregat — `0004_functions.sql`

Semua fungsi `security invoker` (default), sehingga RLS tetap berlaku. `search_path` dikosongkan dan semua objek ditulis lengkap.

```sql
-- Saldo seluruh waktu
create or replace function public.get_balance()
returns bigint
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    sum(case when t.kind = 'income' then t.amount else -t.amount end),
    0
  )::bigint
  from public.transactions t
  where t.user_id = auth.uid();
$$;

-- Total pemasukan & pengeluaran pada rentang tanggal (inklusif)
create or replace function public.get_period_summary(p_from date, p_to date)
returns table (income bigint, expense bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce(sum(t.amount) filter (where t.kind = 'income'), 0)::bigint  as income,
    coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0)::bigint as expense
  from public.transactions t
  where t.user_id = auth.uid()
    and t.occurred_on between p_from and p_to;
$$;

-- Seri harian dalam rentang tanggal
create or replace function public.get_daily_series(p_from date, p_to date)
returns table (day date, income bigint, expense bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    t.occurred_on as day,
    coalesce(sum(t.amount) filter (where t.kind = 'income'), 0)::bigint  as income,
    coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0)::bigint as expense
  from public.transactions t
  where t.user_id = auth.uid()
    and t.occurred_on between p_from and p_to
  group by t.occurred_on
  order by t.occurred_on;
$$;

-- Seri bulanan dalam satu tahun
create or replace function public.get_monthly_series(p_year int)
returns table (month int, income bigint, expense bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    extract(month from t.occurred_on)::int as month,
    coalesce(sum(t.amount) filter (where t.kind = 'income'), 0)::bigint  as income,
    coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0)::bigint as expense
  from public.transactions t
  where t.user_id = auth.uid()
    and t.occurred_on >= make_date(p_year, 1, 1)
    and t.occurred_on <  make_date(p_year + 1, 1, 1)
  group by 1
  order by 1;
$$;

-- Total per kategori pada rentang tanggal, untuk satu jenis
create or replace function public.get_category_totals(
  p_from date,
  p_to date,
  p_kind public.transaction_kind
)
returns table (category_id uuid, name text, total bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.id,
    c.name,
    coalesce(sum(t.amount), 0)::bigint as total
  from public.transactions t
  join public.categories c
    on c.id = t.category_id
   and c.user_id = auth.uid()
  where t.user_id = auth.uid()
    and t.kind = p_kind
    and t.occurred_on between p_from and p_to
  group by c.id, c.name
  order by total desc;
$$;

-- Tahun yang memiliki transaksi
create or replace function public.get_available_years()
returns table (year int)
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct extract(year from t.occurred_on)::int as year
  from public.transactions t
  where t.user_id = auth.uid()
  order by 1 desc;
$$;

-- Hak eksekusi
revoke execute on function
  public.get_balance(),
  public.get_period_summary(date, date),
  public.get_daily_series(date, date),
  public.get_monthly_series(int),
  public.get_category_totals(date, date, public.transaction_kind),
  public.get_available_years()
from public, anon;

grant execute on function
  public.get_balance(),
  public.get_period_summary(date, date),
  public.get_daily_series(date, date),
  public.get_monthly_series(int),
  public.get_category_totals(date, date, public.transaction_kind),
  public.get_available_years()
to authenticated;
```

Pemakaian dari aplikasi (`supabase-js`):

```ts
const { data, error } = await supabase.rpc("get_period_summary", {
  p_from: "2026-11-01",
  p_to: "2026-11-30",
});
```

## 7. Aturan validasi (server + database)

| Field | Aturan | Lapis |
| --- | --- | --- |
| `transactions.amount` | integer, 1–999.999.999.999 | Zod + CHECK |
| `transactions.occurred_on` | `YYYY-MM-DD`, 2000-01-01 s.d. 2100-12-31 | Zod + `CHECK` |
| `transactions.description` | ≤ 200 karakter, di-trim | Zod + CHECK |
| `transactions.kind` | `income` / `expense`, harus sama dengan jenis kategori | Zod + FK komposit + RLS |
| `categories.name` | 1–40 karakter, tanpa spasi di ujung, unik per user+jenis (case-insensitive) | Zod + CHECK + unique index |
| `categories.kind` | hanya saat create; tidak bisa diubah | Zod (update hanya nama/arsip) |
| `budgets.amount` | integer, 1–999.999.999.999 | Zod + CHECK |
| `budgets.year` | 2000–2100 | Zod + CHECK |
| `budgets.month` | 1–12 | Zod + CHECK |
| `budgets.kind` | selalu `expense` | CHECK + FK |
| `profiles.full_name` | ≤ 80 karakter, di-trim; boleh kosong | Zod + CHECK |

Catatan tanggal: `date` tidak menyimpan zona waktu. Aplikasi mengirim/menerima string `YYYY-MM-DD`; perhitungan "bulan berjalan" memakai `Asia/Jakarta` di `lib/period.ts`.

## 8. Query acuan

### 8.1 Daftar transaksi (PostgREST)

```ts
supabase
  .from("transactions")
  .select("id, occurred_on, kind, amount, description, payment_method, category:categories(id, name)", { count: "exact" })
  .gte("occurred_on", dari)
  .lte("occurred_on", sampai)
  .eq("kind", jenis)              // opsional
  .eq("category_id", kategoriId)  // opsional
  .ilike("description", `%${q}%`) // opsional
  .order("occurred_on", { ascending: urut === "terlama" })
  .order("created_at", { ascending: false })
  .range((halaman - 1) * 25, halaman * 25 - 1);
```

### 8.2 Transaksi terakhir dashboard

```ts
supabase
  .from("transactions")
  .select("id, occurred_on, kind, amount, description, category:categories(name)")
  .gte("occurred_on", awalBulan)
  .lte("occurred_on", akhirBulan)
  .order("occurred_on", { ascending: false })
  .order("created_at", { ascending: false })
  .limit(5);
```

### 8.3 Saldo aktual anggaran

`get_category_totals(awalBulan, akhirBulan, 'expense')` lalu dipetakan ke `budgets.category_id`. Kategori tanpa transaksi dianggap `0`.

### 8.4 Ekspor CSV

Route handler memakai filter yang sama dengan tab laporan aktif, `select("occurred_on, kind, category:categories(name), amount, payment_method, description")`, urut tanggal naik. Hasil diubah menjadi CSV (UTF-8 BOM).

## 9. Urutan migrasi

| File | Isi |
| --- | --- |
| `supabase/migrations/0001_schema.sql` | enum, tabel, index |
| `supabase/migrations/0002_rls.sql` | enable RLS, policy, grant/revoke |
| `supabase/migrations/0003_triggers.sql` | `updated_at`, profil + kategori default |
| `supabase/migrations/0004_functions.sql` | fungsi agregat + grant execute |

Cara menjalankan (dipilih pada grilling): buka **Supabase Dashboard → SQL Editor**, tempel isi file berurutan, jalankan satu per satu. Alternatif CLI (opsional, Tahap 5):

```bash
supabase link --project-ref <ref>
supabase db push
```

## 10. Verifikasi setelah migrasi

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

-- Fungsi harus security invoker
select proname, prosecdef
from pg_proc
join pg_namespace n on n.oid = pg_proc.pronamespace
where n.nspname = 'public' and proname like 'get_%';
```

`prosecdef = false` berarti invoker (RLS berlaku). Jika `true`, hentikan dan perbaiki.

## 11. Rencana uji RLS (Tahap 5)

Persiapan: buat akun A (data contoh), lalu akun B (sementara, saat signup masih terbuka).

1. **Baca lintas pengguna** — login sebagai B, `select * from transactions` hanya mengembalikan data B (idealnya kosong).
2. **Update/delete lintas pengguna** — B mencoba `update transactions set amount = 1 where id = <milik A>`; jumlah baris terpengaruh = 0.
3. **Insert dengan user_id orang lain** — B mengirim `user_id` milik A; ditolak RLS (`with check`).
4. **Insert dengan kategori orang lain** — B memakai `category_id` milik A; ditolak karena `exists` pada policy.
5. **Anon tanpa login** — request REST dengan hanya anon key (tanpa JWT) mengembalikan `[]`/401.
6. **RPC** — B memanggil `get_balance()`; hasilnya hanya milik B.
7. **UI** — membuka `/transaksi` sebagai B tidak menampilkan data A; mengganti ID di URL detail (bila ada) menghasilkan 404.

Contoh uji REST:

```bash
# Token B
curl -s "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"b@example.com","password":"..."}'

# Harus [] (hanya data B)
curl -s "$SUPABASE_URL/rest/v1/transactions?select=id,user_id" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_B"

# Harus 403 / error RLS
curl -s -X POST "$SUPABASE_URL/rest/v1/transactions" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<UUID_A>","category_id":"<UUID_A>","kind":"expense","amount":1000}'
```

## 12. Catatan kapasitas Free Tier

- 500 MB database, tanpa file/gambar → estimasi kasar 1 transaksi ≈ 150–250 byte termasuk index. Puluhan ribu transaksi masih jauh di bawah batas.
- Tidak ada backup otomatis. Ekspor CSV per bulan + panduan `pg_dump` di Tahap 5.
- Project pause setelah 7 hari tanpa aktivitas; data tidak hilang dan bisa di-resume dari dashboard.
- Tidak ada pruning otomatis; penghapusan data hanya lewat aksi pengguna.
