import { ArrowLeftRight, TrendingDown, TrendingUp } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ReportSummary } from "@/lib/db/reports";

export function PeriodSummaryCards({
  summary,
  differenceLabel = "Selisih",
}: {
  summary: ReportSummary;
  differenceLabel?: string;
}) {
  const cards = [
    {
      title: "Pemasukan",
      value: summary.income,
      icon: TrendingUp,
      valueClass: "text-income",
      description: "Pada periode terpilih",
    },
    {
      title: "Pengeluaran",
      value: summary.expense,
      icon: TrendingDown,
      valueClass: "text-expense",
      description: "Pada periode terpilih",
    },
    {
      title: differenceLabel,
      value: summary.difference,
      icon: ArrowLeftRight,
      valueClass:
        summary.difference < 0
          ? "text-expense"
          : summary.difference > 0
            ? "text-income"
            : undefined,
      description: "Pemasukan − pengeluaran",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Icon className="text-muted-foreground size-4" aria-hidden />
                  {card.title}
                </span>
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
  );
}
