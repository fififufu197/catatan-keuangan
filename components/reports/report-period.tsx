"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PeriodFilter } from "@/components/shared/period-filter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReportTab } from "@/lib/types";

export function ReportPeriod({
  tab,
  date,
  year,
  month,
  years,
}: {
  tab: ReportTab;
  date: string;
  year: number;
  month: number;
  years: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeDate(value: string) {
    if (!value) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("tanggal", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  if (tab === "harian") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="report-date" className="text-xs">
          Tanggal
        </Label>
        <Input
          id="report-date"
          type="date"
          value={date}
          min="2000-01-01"
          max="2100-12-31"
          onChange={(event) => changeDate(event.target.value)}
          className="w-[11rem]"
        />
      </div>
    );
  }

  return (
    <PeriodFilter
      basePath="/laporan"
      year={year}
      month={month}
      years={years}
      mode={tab === "tahunan" ? "tahun" : "bulan"}
    />
  );
}
