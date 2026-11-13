import { createClient } from "@/lib/supabase/server";
import { fillDailySeries, fillMonthlySeries } from "@/lib/db/series";
import { listAllTransactionsInRange } from "@/lib/db/transactions";
import {
  rentangBulan,
  rentangHari,
  rentangTahun,
} from "@/lib/period";
import type {
  CategoryTotal,
  DailyPoint,
  MonthlyPoint,
  TransactionWithCategory,
} from "@/lib/types";
import type { DateRange } from "@/lib/period";

export type ReportSummary = {
  income: number;
  expense: number;
  difference: number;
};

export type ReportBase = {
  range: DateRange;
  summary: ReportSummary;
  categories: CategoryTotal[];
  availableYears: number[];
};

export type DailyReport = ReportBase & {
  tab: "harian";
  date: string;
  transactions: TransactionWithCategory[];
};

export type MonthlyReport = ReportBase & {
  tab: "bulanan";
  year: number;
  month: number;
  daily: DailyPoint[];
};

export type YearlyReport = ReportBase & {
  tab: "tahunan";
  year: number;
  monthly: MonthlyPoint[];
};

export type ReportData = DailyReport | MonthlyReport | YearlyReport;

async function getReportBase(range: DateRange): Promise<ReportBase> {
  const supabase = await createClient();

  const [summaryResult, categoriesResult, yearsResult] = await Promise.all([
    supabase.rpc("get_period_summary", {
      p_from: range.from,
      p_to: range.to,
    }),
    supabase.rpc("get_category_totals", {
      p_from: range.from,
      p_to: range.to,
      p_kind: "expense",
    }),
    supabase.rpc("get_available_years"),
  ]);

  if (summaryResult.error) {
    console.error("gagal mengambil ringkasan laporan:", summaryResult.error.message);
  }

  if (categoriesResult.error) {
    console.error("gagal mengambil kategori laporan:", categoriesResult.error.message);
  }

  if (yearsResult.error) {
    console.error("gagal mengambil tahun laporan:", yearsResult.error.message);
  }

  const row = summaryResult.data?.[0];
  const income = Number(row?.income ?? 0);
  const expense = Number(row?.expense ?? 0);

  return {
    range,
    summary: {
      income,
      expense,
      difference: income - expense,
    },
    categories: (categoriesResult.data ?? []).map((item) => ({
      categoryId: item.category_id,
      name: item.name,
      total: Number(item.total),
    })),
    availableYears: (yearsResult.data ?? []).map((item) => item.year),
  };
}

export async function getDailyReport(date: string): Promise<DailyReport> {
  const range = rentangHari(date);

  const [base, transactions] = await Promise.all([
    getReportBase(range),
    listAllTransactionsInRange(range.from, range.to),
  ]);

  return {
    tab: "harian",
    date,
    ...base,
    transactions,
  };
}

export async function getMonthlyReport(
  year: number,
  month: number,
): Promise<MonthlyReport> {
  const range = rentangBulan(year, month);
  const supabase = await createClient();

  const [base, dailyResult] = await Promise.all([
    getReportBase(range),
    supabase.rpc("get_daily_series", {
      p_from: range.from,
      p_to: range.to,
    }),
  ]);

  if (dailyResult.error) {
    console.error("gagal mengambil seri harian laporan:", dailyResult.error.message);
  }

  return {
    tab: "bulanan",
    year,
    month,
    ...base,
    daily: fillDailySeries(
      (dailyResult.data ?? []).map((point) => ({
        day: point.day,
        income: Number(point.income),
        expense: Number(point.expense),
      })),
      range,
    ),
  };
}

export async function getYearlyReport(year: number): Promise<YearlyReport> {
  const range = rentangTahun(year);
  const supabase = await createClient();

  const [base, monthlyResult] = await Promise.all([
    getReportBase(range),
    supabase.rpc("get_monthly_series", { p_year: year }),
  ]);

  if (monthlyResult.error) {
    console.error(
      "gagal mengambil seri bulanan laporan:",
      monthlyResult.error.message,
    );
  }

  return {
    tab: "tahunan",
    year,
    ...base,
    monthly: fillMonthlySeries(
      (monthlyResult.data ?? []).map((point) => ({
        month: point.month,
        income: Number(point.income),
        expense: Number(point.expense),
      })),
    ),
  };
}
