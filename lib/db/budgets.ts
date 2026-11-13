import { createClient } from "@/lib/supabase/server";
import { rentangBulan } from "@/lib/period";
import type { CategoryRow } from "@/lib/types";

export type BudgetItem = {
  id: string | null;
  categoryId: string;
  name: string;
  archived: boolean;
  hasBudget: boolean;
  budget: number;
  actual: number;
  remaining: number;
  percentage: number | null;
};

export type BudgetSummary = {
  budget: number;
  actual: number;
  remaining: number;
};

export type BudgetsForPeriod = {
  items: BudgetItem[];
  summary: BudgetSummary;
};

/**
 * Anggaran bulan terpilih beserta realisasi pengeluaran per kategori.
 * Kategori yang punya pengeluaran tanpa anggaran tetap ditampilkan
 * (termasuk kategori yang sudah diarsipkan).
 */
export async function getBudgetsForPeriod(
  year: number,
  month: number,
): Promise<BudgetsForPeriod> {
  const supabase = await createClient();
  const range = rentangBulan(year, month);

  const [budgetsResult, categoriesResult, totalsResult] = await Promise.all([
    supabase
      .from("budgets")
      .select("id, category_id, amount")
      .eq("year", year)
      .eq("month", month),
    supabase
      .from("categories")
      .select("id, name, archived")
      .eq("kind", "expense"),
    supabase.rpc("get_category_totals", {
      p_from: range.from,
      p_to: range.to,
      p_kind: "expense",
    }),
  ]);

  if (budgetsResult.error) {
    console.error("gagal mengambil anggaran:", budgetsResult.error.message);
  }

  if (categoriesResult.error) {
    console.error("gagal mengambil kategori:", categoriesResult.error.message);
  }

  if (totalsResult.error) {
    console.error("gagal mengambil total kategori:", totalsResult.error.message);
  }

  const budgetMap = new Map(
    (budgetsResult.data ?? []).map((row) => [
      row.category_id,
      { id: row.id, amount: Number(row.amount) },
    ]),
  );
  const actualMap = new Map(
    (totalsResult.data ?? []).map((row) => [
      row.category_id,
      Number(row.total),
    ]),
  );
  const categoryMap = new Map<string, Pick<CategoryRow, "id" | "name" | "archived">>(
    (categoriesResult.data ?? []).map((row) => [row.id, row]),
  );

  const ids = new Set<string>([
    ...budgetMap.keys(),
    ...actualMap.keys(),
  ]);

  const items: BudgetItem[] = Array.from(ids).map((categoryId) => {
    const category = categoryMap.get(categoryId);
    const row = budgetMap.get(categoryId);
    const budget = row?.amount ?? 0;
    const actual = actualMap.get(categoryId) ?? 0;
    const hasBudget = Boolean(row);

    return {
      id: row?.id ?? null,
      categoryId,
      name: category?.name ?? "Tanpa kategori",
      archived: category?.archived ?? false,
      hasBudget,
      budget,
      actual,
      remaining: budget - actual,
      percentage: hasBudget && budget > 0 ? (actual / budget) * 100 : null,
    };
  });

  items.sort((a, b) => {
    if (a.hasBudget !== b.hasBudget) {
      return a.hasBudget ? -1 : 1;
    }

    if (a.archived !== b.archived) {
      return a.archived ? 1 : -1;
    }

    return a.name.localeCompare(b.name, "id");
  });

  const summary = items.reduce<BudgetSummary>(
    (accumulator, item) => ({
      budget: accumulator.budget + item.budget,
      actual: accumulator.actual + item.actual,
      remaining: accumulator.remaining + item.remaining,
    }),
    { budget: 0, actual: 0, remaining: 0 },
  );

  return { items, summary };
}
