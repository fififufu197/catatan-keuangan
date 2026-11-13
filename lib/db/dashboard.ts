import { createClient } from "@/lib/supabase/server";
import type {
  CategoryTotal,
  DailyPoint,
  PeriodSummary,
  TransactionWithCategory,
} from "@/lib/types";
import { getRecentTransactions } from "@/lib/db/transactions";
import { fillDailySeries } from "@/lib/db/series";
import type { DateRange } from "@/lib/period";

export type DashboardData = {
  balance: number;
  summary: PeriodSummary;
  daily: DailyPoint[];
  expenseByCategory: CategoryTotal[];
  recent: TransactionWithCategory[];
  availableYears: number[];
};

/**
 * Semua data dashboard dalam satu gelombang permintaan.
 * Saldo sengaja tidak memakai rentang tanggal (total sejak transaksi pertama).
 */
export async function getDashboardData(
  range: DateRange,
): Promise<DashboardData> {
  const supabase = await createClient();

  const [balanceResult, summaryResult, dailyResult, categoryResult, yearsResult, recent] =
    await Promise.all([
      supabase.rpc("get_balance"),
      supabase.rpc("get_period_summary", {
        p_from: range.from,
        p_to: range.to,
      }),
      supabase.rpc("get_daily_series", {
        p_from: range.from,
        p_to: range.to,
      }),
      supabase.rpc("get_category_totals", {
        p_from: range.from,
        p_to: range.to,
        p_kind: "expense",
      }),
      supabase.rpc("get_available_years"),
      getRecentTransactions(range.from, range.to, 5),
    ]);

  for (const [label, error] of [
    ["saldo", balanceResult.error],
    ["ringkasan periode", summaryResult.error],
    ["seri harian", dailyResult.error],
    ["total kategori", categoryResult.error],
    ["tahun tersedia", yearsResult.error],
  ] as const) {
    if (error) {
      console.error(`gagal mengambil ${label}:`, error.message);
    }
  }

  const summary = summaryResult.data?.[0];

  return {
    balance: Number(balanceResult.data ?? 0),
    summary: {
      income: Number(summary?.income ?? 0),
      expense: Number(summary?.expense ?? 0),
    },
    daily: fillDailySeries(
      (dailyResult.data ?? []).map((point) => ({
        day: point.day,
        income: Number(point.income),
        expense: Number(point.expense),
      })),
      range,
    ),
    expenseByCategory: (categoryResult.data ?? []).map((row) => ({
      categoryId: row.category_id,
      name: row.name,
      total: Number(row.total),
    })),
    recent,
    availableYears: (yearsResult.data ?? []).map((row) => row.year),
  };
}
