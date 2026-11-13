"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatAngka } from "@/lib/format";

/** Daftar nomor halaman ringkas: 1 … 4 5 6 … 20 */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  const sorted = Array.from(pages)
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);

  const result: (number | "gap")[] = [];

  for (const value of sorted) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && value - previous > 1) {
      result.push("gap");
    }
    result.push(value);
  }

  return result;
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(target: number): string {
    const params = new URLSearchParams(searchParams.toString());

    if (target <= 1) {
      params.delete("halaman");
    } else {
      params.set("halaman", String(target));
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
      aria-label="Navigasi halaman"
    >
      <p className="text-muted-foreground text-sm">
        Menampilkan {formatAngka(start)}–{formatAngka(end)} dari{" "}
        {formatAngka(total)} transaksi
      </p>

      {pageCount > 1 ? (
        <div className="flex items-center gap-1">
          <Button
            asChild={page > 1}
            variant="outline"
            size="icon"
            disabled={page <= 1}
            aria-label="Halaman sebelumnya"
          >
            {page > 1 ? (
              <Link href={hrefFor(page - 1)} aria-label="Halaman sebelumnya" scroll>
                <ChevronLeft className="size-4" aria-hidden />
              </Link>
            ) : (
              <span>
                <ChevronLeft className="size-4" aria-hidden />
              </span>
            )}
          </Button>

          {pageWindow(page, pageCount).map((value, index) =>
            value === "gap" ? (
              <span
                key={`gap-${index}`}
                className="text-muted-foreground px-1 text-sm"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={value}
                asChild
                variant={value === page ? "default" : "outline"}
                size="icon"
              >
                <Link
                  href={hrefFor(value)}
                  aria-label={`Halaman ${value}`}
                  aria-current={value === page ? "page" : undefined}
                  scroll
                >
                  {value}
                </Link>
              </Button>
            ),
          )}

          <Button
            asChild={page < pageCount}
            variant="outline"
            size="icon"
            disabled={page >= pageCount}
            aria-label="Halaman berikutnya"
          >
            {page < pageCount ? (
              <Link href={hrefFor(page + 1)} aria-label="Halaman berikutnya" scroll>
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <span>
                <ChevronRight className="size-4" aria-hidden />
              </span>
            )}
          </Button>
        </div>
      ) : null}
    </nav>
  );
}
