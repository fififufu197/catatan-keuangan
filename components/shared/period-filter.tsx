"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNamaBulan } from "@/lib/format";
import { currentPeriodWib } from "@/lib/period";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export function PeriodFilter({
  basePath,
  year,
  month,
  years,
  mode = "bulan",
}: {
  basePath: string;
  year: number;
  month: number;
  years?: number[];
  mode?: "bulan" | "tahun";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const yearOptions = useMemo(() => {
    const current = currentPeriodWib().year;
    const all = new Set<number>([current, year, ...(years ?? [])]);
    return Array.from(all).sort((a, b) => b - a);
  }, [year, years]);

  function update(next: { year?: number; month?: number }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.year !== undefined) {
      params.set("tahun", String(next.year));
    }

    if (next.month !== undefined) {
      params.set("bulan", String(next.month));
    }

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {mode === "bulan" ? (
        <Select
          value={String(month)}
          onValueChange={(value) => update({ month: Number(value) })}
        >
          <SelectTrigger className="w-[9.5rem]" aria-label="Pilih bulan">
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((value) => (
              <SelectItem key={value} value={String(value)}>
                {formatNamaBulan(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Select
        value={String(year)}
        onValueChange={(value) => update({ year: Number(value) })}
      >
        <SelectTrigger className="w-[7.5rem]" aria-label="Pilih tahun">
          <SelectValue placeholder="Tahun" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((value) => (
            <SelectItem key={value} value={String(value)}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
