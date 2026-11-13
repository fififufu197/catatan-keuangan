"use client";

import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  BudgetEditButton,
  BudgetFormDialog,
} from "@/components/budgets/budget-form-dialog";
import { BudgetProgress } from "@/components/budgets/budget-progress";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteBudget } from "@/lib/actions/budgets";
import type { BudgetItem } from "@/lib/db/budgets";
import { formatPersen, formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategoryRow } from "@/lib/types";

export function BudgetList({
  items,
  categories,
  year,
  month,
}: {
  items: BudgetItem[];
  categories: CategoryRow[];
  year: number;
  month: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rincian Anggaran</CardTitle>
        <CardDescription>
          Realisasi dihitung dari transaksi pengeluaran bulan ini. Kategori
          berlabel arsip tetap ditampilkan agar riwayat utuh.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.categoryId} className="space-y-3 py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "truncate font-medium",
                      item.archived && "text-muted-foreground",
                    )}
                  >
                    {item.name}
                  </span>
                  {item.archived ? (
                    <Badge variant="secondary">Diarsipkan</Badge>
                  ) : null}
                  {!item.hasBudget ? (
                    <Badge variant="outline">Belum dianggarkan</Badge>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {item.hasBudget && item.id ? (
                    <>
                      <BudgetEditButton
                        categories={categories}
                        year={year}
                        month={month}
                        item={item}
                      />
                      <ConfirmDialog
                        title={`Hapus anggaran ${item.name}?`}
                        description="Anggaran bulan ini akan dihapus. Transaksi yang sudah tercatat tidak terpengaruh."
                        onConfirm={() => deleteBudget(item.id ?? "")}
                        onSuccess={() => toast.success("Anggaran dihapus.")}
                        trigger={
                          <Button variant="ghost" size="icon" title="Hapus anggaran">
                            <Trash2 className="size-4" aria-hidden />
                            <span className="sr-only">
                              Hapus anggaran {item.name}
                            </span>
                          </Button>
                        }
                      />
                    </>
                  ) : (
                    <BudgetFormDialog
                      categories={categories}
                      year={year}
                      month={month}
                      item={item}
                      defaultCategoryId={item.categoryId}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Atur anggaran kategori ini"
                        >
                          <Plus className="size-4" aria-hidden />
                          <span className="sr-only">
                            Atur anggaran {item.name}
                          </span>
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground text-xs">Anggaran</dt>
                  <dd className="font-medium tabular-nums">
                    {item.hasBudget ? formatRupiah(item.budget) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Aktual</dt>
                  <dd className="font-medium tabular-nums">
                    {formatRupiah(item.actual)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Sisa</dt>
                  <dd
                    className={cn(
                      "font-medium tabular-nums",
                      item.hasBudget && item.remaining < 0
                        ? "text-expense"
                        : undefined,
                    )}
                  >
                    {item.hasBudget ? formatRupiah(item.remaining) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Penggunaan</dt>
                  <dd className="font-medium tabular-nums">
                    {item.percentage !== null
                      ? formatPersen(item.percentage)
                      : "—"}
                  </dd>
                </div>
              </dl>

              {item.percentage !== null ? (
                <BudgetProgress percentage={item.percentage} />
              ) : (
                <p className="text-muted-foreground text-xs">
                  Ada pengeluaran tanpa anggaran. Atur anggaran agar
                  penggunaannya bisa dipantau.
                </p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
