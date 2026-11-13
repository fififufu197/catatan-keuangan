-- 0004_functions.sql
-- Fungsi agregat untuk dashboard dan laporan.
-- Semua security invoker (default), sehingga RLS tetap berlaku.
-- Jalankan setelah 0003_triggers.sql.

-- Saldo seluruh waktu ------------------------------------------------
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

-- Total pemasukan & pengeluaran pada rentang tanggal (inklusif) ------
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

-- Seri harian dalam rentang tanggal ----------------------------------
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

-- Seri bulanan dalam satu tahun --------------------------------------
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

-- Total per kategori pada rentang tanggal, untuk satu jenis ----------
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

-- Tahun yang memiliki transaksi --------------------------------------
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

-- Hak eksekusi -------------------------------------------------------
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
