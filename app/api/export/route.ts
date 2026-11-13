import { requireUser } from "@/lib/auth";
import { KIND_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { buildCsv } from "@/lib/csv";
import { listAllTransactionsInRange } from "@/lib/db/transactions";
import {
  rentangBulan,
  rentangHari,
  rentangTahun,
  resolveDate,
  resolvePeriod,
  resolveYear,
  todayWib,
} from "@/lib/period";
import type { DateRange } from "@/lib/period";
import type { ReportTab } from "@/lib/types";

export const dynamic = "force-dynamic";

const TABS: ReportTab[] = ["harian", "bulanan", "tahunan"];

export async function GET(request: Request) {
  await requireUser();

  const { searchParams } = new URL(request.url);
  const tabParam = searchParams.get("tab");
  const tab: ReportTab = TABS.includes(tabParam as ReportTab)
    ? (tabParam as ReportTab)
    : "bulanan";

  let range: DateRange;

  if (tab === "harian") {
    range = rentangHari(resolveDate(searchParams.get("tanggal")));
  } else if (tab === "tahunan") {
    range = rentangTahun(resolveYear(searchParams.get("tahun")));
  } else {
    const period = resolvePeriod(
      searchParams.get("tahun"),
      searchParams.get("bulan"),
    );
    range = rentangBulan(period.year, period.month);
  }

  const transactions = await listAllTransactionsInRange(range.from, range.to);

  const rows: (string | number)[][] = [
    ["Tanggal", "Jenis", "Kategori", "Nominal", "Metode", "Deskripsi"],
    ...transactions.map((transaction) => [
      transaction.occurred_on,
      KIND_LABELS[transaction.kind],
      transaction.category?.name ?? "Tanpa kategori",
      transaction.amount,
      PAYMENT_METHOD_LABELS[transaction.payment_method],
      transaction.description,
    ]),
  ];

  return new Response(buildCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transaksi-${todayWib()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
