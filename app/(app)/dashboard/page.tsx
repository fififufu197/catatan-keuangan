import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight, Wallet } from "lucide-react";

import { CategoryDonut } from "@/components/dashboard/category-donut";
import { DailyChart } from "@/components/dashboard/daily-chart";
import { BalanceOverview } from "@/components/dashboard/balance-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PeriodFilter } from "@/components/shared/period-filter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardData } from "@/lib/db/dashboard";
import { formatBulan, formatRupiah } from "@/lib/format";
import { rentangBulan, resolvePeriod } from "@/lib/period";

export const metadata: Metadata = {
  title: "Dashboard",
};

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const period = resolvePeriod(single(params.tahun), single(params.bulan));
  const range = rentangBulan(period.year, period.month);

  const data = await getDashboardData(range);
  const hasTransactions =
    data.summary.income > 0 ||
    data.summary.expense > 0 ||
    data.recent.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Ringkasan keuangan ${formatBulan(period.year, period.month)}.`}
      >
        <PeriodFilter
          basePath="/dashboard"
          year={period.year}
          month={period.month}
          years={data.availableYears}
        />
      </PageHeader>

      <BalanceOverview
        balance={data.balance}
        summary={data.summary}
        periodLabel={formatBulan(period.year, period.month)}
      />

      {hasTransactions ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Pemasukan vs Pengeluaran Harian</CardTitle>
                <CardDescription>
                  Nilai transaksi untuk setiap tanggal pada bulan ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DailyChart data={data.daily} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pengeluaran per Kategori</CardTitle>
                <CardDescription>
                  Total {formatRupiah(data.summary.expense)} pada bulan ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.expenseByCategory.length > 0 ? (
                  <CategoryDonut data={data.expenseByCategory} />
                ) : (
                  <p className="text-muted-foreground py-10 text-center text-sm">
                    Belum ada pengeluaran pada periode ini.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <RecentTransactions
            items={data.recent}
            from={range.from}
            to={range.to}
          />
        </>
      ) : (
        <EmptyState
          icon={Wallet}
          title={`Belum ada transaksi pada ${formatBulan(period.year, period.month)}`}
          description="Grafik dan ringkasan akan tampil setelah Anda mencatat transaksi pertama."
          action={
            <Button asChild>
              <Link href={`/transaksi?dari=${range.from}&sampai=${range.to}`}>
                <ArrowLeftRight className="size-4" aria-hidden />
                Catat transaksi
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
