import type { Metadata } from "next";
import { Coins, TrendingDown, Wallet } from "lucide-react";

import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { BudgetList } from "@/components/budgets/budget-list";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PeriodFilter } from "@/components/shared/period-filter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listCategories } from "@/lib/db/categories";
import { getBudgetsForPeriod } from "@/lib/db/budgets";
import { formatRupiah } from "@/lib/format";
import { resolvePeriod } from "@/lib/period";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Anggaran",
};

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AnggaranPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const period = resolvePeriod(single(params.tahun), single(params.bulan));

  const [{ items, summary }, categories] = await Promise.all([
    getBudgetsForPeriod(period.year, period.month),
    listCategories({ kind: "expense", includeArchived: true }),
  ]);

  const summaryCards = [
    {
      title: "Total Anggaran",
      description: "Jumlah anggaran bulan ini",
      value: summary.budget,
      icon: Wallet,
      valueClass: undefined,
    },
    {
      title: "Total Aktual",
      description: "Pengeluaran yang tercatat",
      value: summary.actual,
      icon: TrendingDown,
      valueClass: "text-expense",
    },
    {
      title: "Total Sisa",
      description: "Anggaran − aktual",
      value: summary.remaining,
      icon: Coins,
      valueClass: summary.remaining < 0 ? "text-expense" : "text-income",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anggaran"
        description="Batas pengeluaran per kategori setiap bulan."
      >
        <PeriodFilter
          basePath="/anggaran"
          year={period.year}
          month={period.month}
        />
        <BudgetFormDialog
          categories={categories}
          year={period.year}
          month={period.month}
        />
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="text-muted-foreground size-4" aria-hidden />
                  {card.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {card.description}
                </CardDescription>
                <p
                  className={cn(
                    "text-xl font-semibold tabular-nums",
                    card.valueClass,
                  )}
                >
                  {formatRupiah(card.value)}
                </p>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Belum ada anggaran atau pengeluaran"
          description="Atur anggaran pertama untuk kategori pengeluaran, lalu bandingkan dengan realisasinya."
          action={
            <BudgetFormDialog
              categories={categories}
              year={period.year}
              month={period.month}
              trigger={
                <Button>Atur anggaran pertama</Button>
              }
            />
          }
        />
      ) : (
        <BudgetList
          items={items}
          categories={categories}
          year={period.year}
          month={period.month}
        />
      )}
    </div>
  );
}
