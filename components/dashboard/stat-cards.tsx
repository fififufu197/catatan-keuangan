import {
  ArrowLeftRight,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PeriodSummary } from "@/lib/types";

export function StatCards({
  balance,
  summary,
}: {
  balance: number;
  summary: PeriodSummary;
}) {
  const difference = summary.income - summary.expense;

  const cards = [
    {
      title: "Total Saldo",
      value: balance,
      description: "Seluruh transaksi, tidak ikut filter bulan",
      icon: Wallet,
      valueClass: balance < 0 ? "text-expense" : undefined,
    },
    {
      title: "Pemasukan",
      value: summary.income,
      description: "Pada periode terpilih",
      icon: TrendingUp,
      valueClass: "text-income",
    },
    {
      title: "Pengeluaran",
      value: summary.expense,
      description: "Pada periode terpilih",
      icon: TrendingDown,
      valueClass: "text-expense",
    },
    {
      title: "Selisih",
      value: difference,
      description: "Pemasukan − pengeluaran",
      icon: ArrowLeftRight,
      valueClass:
        difference < 0
          ? "text-expense"
          : difference > 0
            ? "text-income"
            : undefined,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {card.description}
              </CardDescription>
              <CardAction>
                <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-4" aria-hidden />
                </span>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p
                className={cn(
                  "text-xl font-semibold tabular-nums",
                  card.valueClass,
                )}
              >
                {formatRupiah(card.value)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
