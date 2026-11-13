import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { CategoryBreakdown } from "@/components/reports/category-breakdown";
import { DailyTransactions } from "@/components/reports/daily-transactions";
import { ExportButton } from "@/components/reports/export-button";
import { PeriodSummaryCards } from "@/components/reports/period-summary";
import { ReportPeriod } from "@/components/reports/report-period";
import { ReportTabs } from "@/components/reports/report-tabs";
import { TrendChart } from "@/components/reports/trend-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { REPORT_TABS } from "@/lib/constants";
import {
  getDailyReport,
  getMonthlyReport,
  getYearlyReport,
} from "@/lib/db/reports";
import { formatBulan, formatRupiah, formatTanggal } from "@/lib/format";
import { resolveDate, resolvePeriod, resolveYear } from "@/lib/period";
import type { ReportData } from "@/lib/db/reports";
import type { ReportTab } from "@/lib/types";

export const metadata: Metadata = {
  title: "Laporan",
};

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function resolveTab(value: string | undefined): ReportTab {
  const match = REPORT_TABS.find((item) => item.value === value);
  return match?.value ?? "bulanan";
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tab = resolveTab(single(params.tab));

  const date = resolveDate(single(params.tanggal));
  const period = resolvePeriod(single(params.tahun), single(params.bulan));
  const year = resolveYear(single(params.tahun));

  let data: ReportData;

  if (tab === "harian") {
    data = await getDailyReport(date);
  } else if (tab === "tahunan") {
    data = await getYearlyReport(year);
  } else {
    data = await getMonthlyReport(period.year, period.month);
  }

  const description =
    data.tab === "harian"
      ? `Rekap keuangan tanggal ${formatTanggal(data.date)}.`
      : data.tab === "bulanan"
        ? `Rekap keuangan ${formatBulan(data.year, data.month)}.`
        : `Rekap keuangan tahun ${data.year}.`;

  const periodText =
    data.tab === "harian"
      ? formatTanggal(data.date)
      : data.tab === "bulanan"
        ? formatBulan(data.year, data.month)
        : `tahun ${data.year}`;

  const hasTransactions = data.summary.income > 0 || data.summary.expense > 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan" description={description}>
        <ExportButton
          tab={data.tab}
          date={data.tab === "harian" ? data.date : undefined}
          year={data.tab === "bulanan" || data.tab === "tahunan" ? data.year : undefined}
          month={data.tab === "bulanan" ? data.month : undefined}
        />
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <ReportTabs tab={tab} />
        <ReportPeriod
          tab={tab}
          date={date}
          year={data.tab === "tahunan" ? data.year : period.year}
          month={data.tab === "bulanan" ? data.month : period.month}
          years={data.availableYears}
        />
      </div>

      <PeriodSummaryCards
        summary={data.summary}
        differenceLabel={data.tab === "harian" ? "Saldo" : "Selisih"}
      />

      {!hasTransactions ? (
        <EmptyState
          icon={BarChart3}
          title={`Belum ada transaksi pada ${periodText}`}
          description="Pilih periode lain atau catat transaksi terlebih dahulu. Ekspor CSV tetap menghasilkan file berisi header."
          action={
            <Button asChild variant="outline">
              <Link href={`/transaksi?dari=${data.range.from}&sampai=${data.range.to}`}>
                Buka halaman transaksi
              </Link>
            </Button>
          }
        />
      ) : data.tab === "harian" ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <DailyTransactions date={data.date} items={data.transactions} />
          </div>
          <CategoryBreakdown
            data={data.categories}
            description={`Total pengeluaran ${formatRupiah(data.summary.expense)}.`}
          />
        </div>
      ) : data.tab === "bulanan" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tren Harian</CardTitle>
              <CardDescription>
                Pemasukan dan pengeluaran setiap tanggal pada bulan ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart
                mode="daily"
                points={data.daily.map((point) => ({
                  label: point.day,
                  income: point.income,
                  expense: point.expense,
                }))}
              />
            </CardContent>
          </Card>

          <CategoryBreakdown
            data={data.categories}
            description={`Total pengeluaran ${formatRupiah(data.summary.expense)}.`}
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tren Bulanan</CardTitle>
              <CardDescription>
                Pemasukan dan pengeluaran setiap bulan pada tahun ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart
                mode="monthly"
                points={data.monthly.map((point) => ({
                  label: `${data.year}-${String(point.month).padStart(2, "0")}`,
                  income: point.income,
                  expense: point.expense,
                }))}
              />
            </CardContent>
          </Card>

          <CategoryBreakdown
            data={data.categories}
            description={`Total pengeluaran ${formatRupiah(data.summary.expense)}.`}
          />
        </div>
      )}
    </div>
  );
}
