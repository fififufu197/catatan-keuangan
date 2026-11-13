import { createClient } from "@/lib/supabase/server";
import type { CategoryRow, TransactionKind } from "@/lib/types";

/** Daftar kategori milik pengguna yang sedang login. */
export async function listCategories(options?: {
  kind?: TransactionKind;
  includeArchived?: boolean;
}): Promise<CategoryRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("categories")
    .select("*")
    .order("kind", { ascending: true })
    .order("name", { ascending: true });

  if (options?.kind) {
    query = query.eq("kind", options.kind);
  }

  if (!options?.includeArchived) {
    query = query.eq("archived", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("gagal mengambil kategori:", error.message);
    return [];
  }

  return data ?? [];
}

/** Semua kategori, termasuk yang diarsipkan. */
export async function listAllCategories(): Promise<CategoryRow[]> {
  return listCategories({ includeArchived: true });
}

/** Jumlah pemakaian kategori di transaksi dan anggaran. */
export async function countCategoryUsage(
  categoryId: string,
): Promise<{ transactions: number; budgets: number }> {
  const supabase = await createClient();

  const [transactions, budgets] = await Promise.all([
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId),
    supabase
      .from("budgets")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId),
  ]);

  if (transactions.error) {
    console.error("gagal menghitung transaksi kategori:", transactions.error.message);
  }

  if (budgets.error) {
    console.error("gagal menghitung anggaran kategori:", budgets.error.message);
  }

  return {
    transactions: transactions.count ?? 0,
    budgets: budgets.count ?? 0,
  };
}
