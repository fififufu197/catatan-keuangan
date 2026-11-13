import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TransactionWithCategory } from "@/lib/types";

function Amount({ transaction }: { transaction: TransactionWithCategory }) {
  const income = transaction.kind === "income";

  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        income ? "text-income" : "text-expense",
      )}
    >
      {income ? "+" : "−"}
      {formatRupiah(transaction.amount)}
    </span>
  );
}

export function DailyTransactions({
  date,
  items,
}: {
  date: string;
  items: TransactionWithCategory[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi {formatTanggal(date)}</CardTitle>
        <CardDescription>
          {items.length === 0
            ? "Tidak ada transaksi pada tanggal ini."
            : `${items.length} transaksi, urut waktu pencatatan.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Belum ada transaksi pada tanggal ini.
          </p>
        ) : (
          <>
            <div className="hidden rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {transaction.category?.name ?? "Tanpa kategori"}
                      </TableCell>
                      <TableCell className="max-w-[18rem] truncate">
                        {transaction.description || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {PAYMENT_METHOD_LABELS[transaction.payment_method]}
                      </TableCell>
                      <TableCell className="text-right">
                        <Amount transaction={transaction} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <ul className="space-y-2 md:hidden">
              {items.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-medium">
                      {transaction.description ||
                        transaction.category?.name ||
                        "Tanpa deskripsi"}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {transaction.category?.name ?? "Tanpa kategori"} ·{" "}
                      {PAYMENT_METHOD_LABELS[transaction.payment_method]}
                    </p>
                  </div>
                  <Amount transaction={transaction} />
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
