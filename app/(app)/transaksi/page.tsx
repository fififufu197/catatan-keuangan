import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/shared/pagination";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { TransactionList } from "@/components/transactions/transaction-list";
import { PAGE_SIZE, SORT_OPTIONS } from "@/lib/constants";
import { listAllCategories } from "@/lib/db/categories";
import { listTransactions } from "@/lib/db/transactions";
import {
  isValidDateString,
  rentangBulan,
  resolvePeriod,
} from "@/lib/period";
import type {
  TransactionKind,
  TransactionSort,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "Transaksi",
};

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  const result = Array.isArray(value) ? value[0] : value;
  const trimmed = result?.trim();
  return trimmed ? trimmed : undefined;
}

function resolveKind(value: string | undefined): TransactionKind | undefined {
  return value === "income" || value === "expense" ? value : undefined;
}

function resolveSort(value: string | undefined): TransactionSort {
  const match = SORT_OPTIONS.find((option) => option.value === value);
  return match?.value ?? "terbaru";
}

export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const period = resolvePeriod(
    single(params.tahun),
    single(params.bulan),
  );
  const monthRange = rentangBulan(period.year, period.month);

  const dariParam = single(params.dari);
  const sampaiParam = single(params.sampai);

  let from =
    dariParam && isValidDateString(dariParam) ? dariParam : monthRange.from;
  let to =
    sampaiParam && isValidDateString(sampaiParam) ? sampaiParam : monthRange.to;

  if (from > to) {
    [from, to] = [to, from];
  }

  const q = single(params.q);
  const kind = resolveKind(single(params.jenis));
  const sort = resolveSort(single(params.urut));
  const halaman = Number(single(params.halaman));
  const page = Number.isInteger(halaman) && halaman > 0 ? halaman : 1;

  const categories = await listAllCategories();

  const categoryId = categories.some(
    (category) => category.id === single(params.kategori),
  )
    ? single(params.kategori)
    : undefined;

  const result = await listTransactions({
    q,
    from,
    to,
    categoryId,
    kind,
    sort,
    page,
  });

  if (result.total > 0 && page > result.pageCount) {
    const next = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          next.append(key, item);
        }
      } else if (value) {
        next.set(key, value);
      }
    }

    next.set("halaman", String(result.pageCount));
    redirect(`/transaksi?${next.toString()}`);
  }

  const filtered = Boolean(
    q ||
      categoryId ||
      kind ||
      from !== monthRange.from ||
      to !== monthRange.to ||
      dariParam ||
      sampaiParam,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaksi"
        description="Catat dan telusuri pemasukan serta pengeluaran Anda."
      >
        <TransactionFormDialog categories={categories} />
      </PageHeader>

      <div className="space-y-4">
        <TransactionFilters
          categories={categories}
          q={q ?? ""}
          from={from}
          to={to}
          categoryId={categoryId}
          kind={kind}
          sort={sort}
        />

        <TransactionList
          items={result.items}
          categories={categories}
          filtered={filtered}
        />

        {result.total > 0 ? (
          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            pageSize={PAGE_SIZE}
          />
        ) : null}
      </div>
    </div>
  );
}
