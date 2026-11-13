-- 0001_schema.sql
-- Tabel, enum, dan index untuk Catatan Keuangan Pribadi.
-- Jalankan di Supabase SQL Editor, urut dari file ini.

create extension if not exists pgcrypto;

-- Enum -----------------------------------------------------------------
do $$
begin
  create type public.transaction_kind as enum ('income', 'expense');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_method as enum ('cash', 'bank_transfer', 'e_wallet', 'other');
exception
  when duplicate_object then null;
end
$$;

-- 1) Profil pengguna ---------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default ''
             check (full_name = btrim(full_name) and char_length(full_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Kategori ----------------------------------------------------------
create table if not exists public.categories (
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

create unique index if not exists categories_user_kind_name_ci_key
  on public.categories (user_id, kind, lower(name));

create index if not exists categories_user_kind_active_idx
  on public.categories (user_id, kind)
  where archived = false;

-- 3) Transaksi ---------------------------------------------------------
create table if not exists public.transactions (
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
                 check (description = btrim(description) and char_length(description) <= 200),
  payment_method public.payment_method not null default 'other',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- Menjamin kategori yang dipakai benar-benar milik jenis transaksi tersebut.
  constraint transactions_category_fk
    foreign key (category_id, kind)
    references public.categories (id, kind)
    on update restrict on delete restrict
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc);

create index if not exists transactions_user_kind_date_idx
  on public.transactions (user_id, kind, occurred_on desc);

create index if not exists transactions_user_category_idx
  on public.transactions (user_id, category_id);

-- 4) Anggaran bulanan --------------------------------------------------
create table if not exists public.budgets (
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

create index if not exists budgets_user_period_idx
  on public.budgets (user_id, year, month);
