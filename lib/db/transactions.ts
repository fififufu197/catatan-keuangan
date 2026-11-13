import { PAGE_SIZE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type {
  CategoryRow,
  TransactionRow,
  TransactionSort,
  TransactionWithCategory,
  TransactionKind,
} from "@/lib/types";

const SELECT = `
  id,
  user_id,
  category_id,
  kind,
  amount,
  occurred_on,
  description,
  payment_method,
  created_at,
  updated_at,
  category:categories(id, name, archived)
`;

type EmbeddedCategory = Pick<CategoryRow, "id" | "name" | "archived">;

type RawTransaction = TransactionRow & {
  category: EmbeddedCategory | EmbeddedCategory[] | null;
};

function normalize(row: RawTransaction): TransactionWithCategory {
  const category = Array.isArray(row.category)
    ? (row.category[0] ?? null)
    : row.category;

  return { ...row, category };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export type TransactionListFilters = {
  q?: string;
  from: string;
  to: string;
  categoryId?: string;
  kind?: TransactionKind;
  sort: TransactionSort;
  page: number;
};

export type TransactionListResult = {
  items: TransactionWithCategory[];
  total: number;
  page: number;
  pageCount: number;
};

/** Daftar transaksi dengan filter, urutan, dan pagination 25 baris. */
export async function listTransactions(
  filters: TransactionListFilters,
): Promise<TransactionListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page);
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  let query = supabase
    .from("transactions")
    .select(SELECT, { count: "exact" })
    .gte("occurred_on", filters.from)
    .lte("occurred_on", filters.to);

  if (filters.q) {
    query = query.ilike("description", `%${escapeLike(filters.q)}%`);
  }

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.kind) {
    query = query.eq("kind", filters.kind);
  }

  if (filters.sort === "terlama") {
    query = query
      .order("occurred_on", { ascending: true })
      .order("created_at", { ascending: true });
  } else if (filters.sort === "nominal") {
    query = query
      .order("amount", { ascending: false })
      .order("occurred_on", { ascending: false });
  } else {
    query = query
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(start, end);

  if (error) {
    console.error("gagal mengambil transaksi:", error.message);
    return { items: [], total: 0, page, pageCount: 0 };
  }

  const rows = (data ?? []) as unknown as RawTransaction[];
  const total = count ?? 0;

  return {
    items: rows.map(normalize),
    total,
    page,
    pageCount: Math.ceil(total / PAGE_SIZE),
  };
}

/** Satu transaksi untuk form edit (null bila bukan milik pengguna). */
export async function getTransaction(
  id: string,
): Promise<TransactionWithCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("gagal mengambil transaksi:", error.message);
    return null;
  }

  return data ? normalize(data as unknown as RawTransaction) : null;
}

/** Transaksi terbaru pada rentang tanggal, untuk dashboard. */
export async function getRecentTransactions(
  from: string,
  to: string,
  limit = 5,
): Promise<TransactionWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(SELECT)
    .gte("occurred_on", from)
    .lte("occurred_on", to)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("gagal mengambil transaksi terbaru:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as RawTransaction[]).map(normalize);
}

/**
 * Semua transaksi pada rentang tanggal, urut tanggal lalu waktu input naik.
 * Dipakai laporan harian dan ekspor CSV; mengambil per 1.000 baris agar
 * tidak terpotong batas maksimum PostgREST.
 */
export async function listAllTransactionsInRange(
  from: string,
  to: string,
): Promise<TransactionWithCategory[]> {
  const supabase = await createClient();
  const chunkSize = 1000;
  const result: TransactionWithCategory[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("transactions")
      .select(SELECT)
      .gte("occurred_on", from)
      .lte("occurred_on", to)
      .order("occurred_on", { ascending: true })
      .order("created_at", { ascending: true })
      .range(offset, offset + chunkSize - 1);

    if (error) {
      console.error("gagal mengambil transaksi laporan:", error.message);
      return result;
    }

    const rows = (data ?? []) as unknown as RawTransaction[];
    result.push(...rows.map(normalize));

    if (rows.length < chunkSize) {
      return result;
    }

    offset += chunkSize;
  }
}
