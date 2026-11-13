-- 0003_triggers.sql
-- updated_at, profil otomatis, dan 15 kategori default untuk pengguna baru.
-- Jalankan setelah 0002_rls.sql.

-- updated_at -----------------------------------------------------------
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

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists budgets_set_updated_at on public.budgets;
create trigger budgets_set_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

-- Profil + kategori default saat pengguna baru -------------------------
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
    btrim(coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  )
  on conflict (id) do nothing;

  insert into public.categories (user_id, name, kind)
  select new.id, v.name, v.kind
  from (values
    ('Gaji',         'income'::public.transaction_kind),
    ('Bisnis',       'income'),
    ('Investasi',    'income'),
    ('Bonus',        'income'),
    ('Lainnya',      'income'),
    ('Makanan',      'expense'),
    ('Transportasi', 'expense'),
    ('Belanja',      'expense'),
    ('Tagihan',      'expense'),
    ('Kesehatan',    'expense'),
    ('Pendidikan',   'expense'),
    ('Hiburan',      'expense'),
    ('Rumah Tangga', 'expense'),
    ('Cicilan',      'expense'),
    ('Lainnya',      'expense')
  ) as v(name, kind)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
