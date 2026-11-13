import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TransactionWithCategory } from "@/lib/types";

export function RecentTransactions({
  items,
  from,
  to,
}: {
  items: TransactionWithCategory[];
  from: string;
  to: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terakhir</CardTitle>
        <CardDescription>
          Maksimal 5 transaksi terbaru pada periode ini.
        </CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/transaksi?dari=${from}&sampai=${to}`}>
              Lihat semua
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Belum ada transaksi pada periode ini.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((transaction) => {
              const income = transaction.kind === "income";

              return (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-medium">
                      {transaction.description ||
                        transaction.category?.name ||
                        "Tanpa deskripsi"}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {formatTanggal(transaction.occurred_on, {
                        pendek: true,
                      })}{" "}
                      · {transaction.category?.name ?? "Tanpa kategori"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-medium tabular-nums",
                      income ? "text-income" : "text-expense",
                    )}
                  >
                    {income ? "+" : "−"}
                    {formatRupiah(transaction.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
