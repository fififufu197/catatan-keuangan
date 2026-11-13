"use client";

import { ArrowLeftRight } from "lucide-react";

import { TransactionDeleteDialog } from "@/components/transactions/transaction-delete-dialog";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  KIND_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  CategoryRow,
  TransactionWithCategory,
} from "@/lib/types";

function Amount({
  transaction,
  className,
}: {
  transaction: TransactionWithCategory;
  className?: string;
}) {
  const income = transaction.kind === "income";

  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        income ? "text-income" : "text-expense",
        className,
      )}
    >
      {income ? "+" : "−"}
      {formatRupiah(transaction.amount)}
    </span>
  );
}

function RowActions({
  transaction,
  categories,
}: {
  transaction: TransactionWithCategory;
  categories: CategoryRow[];
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <TransactionFormDialog
        categories={categories}
        transaction={transaction}
      />
      <TransactionDeleteDialog
        id={transaction.id}
        description={transaction.description}
      />
    </div>
  );
}

export function TransactionList({
  items,
  categories,
  filtered,
}: {
  items: TransactionWithCategory[];
  categories: CategoryRow[];
  filtered: boolean;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title={filtered ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi"}
        description={
          filtered
            ? "Coba ubah kata kunci, rentang tanggal, atau filter lainnya."
            : "Tambahkan pemasukan atau pengeluaran pertama Anda untuk mulai mencatat."
        }
        action={
          filtered ? undefined : <TransactionFormDialog categories={categories} />
        }
      />
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead className="w-24 text-right">
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="whitespace-nowrap">
                  {formatTanggal(transaction.occurred_on, { pendek: true })}
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <span className="truncate">
                      {transaction.category?.name ?? "Tanpa kategori"}
                    </span>
                    {transaction.category?.archived ? (
                      <span className="text-muted-foreground text-xs">
                        (arsip)
                      </span>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="max-w-[16rem] truncate">
                  {transaction.description || (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {PAYMENT_METHOD_LABELS[transaction.payment_method]}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Amount transaction={transaction} />
                  <span className="sr-only">
                    {" "}
                    {KIND_LABELS[transaction.kind]}
                  </span>
                </TableCell>
                <TableCell>
                  <RowActions
                    transaction={transaction}
                    categories={categories}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <ul className="space-y-2 md:hidden">
        {items.map((transaction) => (
          <li
            key={transaction.id}
            className="flex items-start justify-between gap-3 rounded-xl border p-3"
          >
            <div className="min-w-0 space-y-1">
              <p className="truncate font-medium">
                {transaction.description || transaction.category?.name || "Tanpa deskripsi"}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {formatTanggal(transaction.occurred_on, { pendek: true })} ·{" "}
                {transaction.category?.name ?? "Tanpa kategori"} ·{" "}
                {PAYMENT_METHOD_LABELS[transaction.payment_method]}
              </p>
              <Amount transaction={transaction} className="text-sm" />
            </div>
            <RowActions transaction={transaction} categories={categories} />
          </li>
        ))}
      </ul>
    </>
  );
}
