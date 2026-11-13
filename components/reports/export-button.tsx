import Link from "next/link";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ReportTab } from "@/lib/types";

export function ExportButton({
  tab,
  date,
  year,
  month,
}: {
  tab: ReportTab;
  date?: string;
  year?: number;
  month?: number;
}) {
  const params = new URLSearchParams({ tab });

  if (tab === "harian" && date) {
    params.set("tanggal", date);
  } else if (tab === "bulanan" && year && month) {
    params.set("tahun", String(year));
    params.set("bulan", String(month));
  } else if (tab === "tahunan" && year) {
    params.set("tahun", String(year));
  }

  return (
    <Button asChild variant="outline">
      <Link href={`/api/export?${params.toString()}`}>
        <Download className="size-4" aria-hidden />
        Ekspor CSV
      </Link>
    </Button>
  );
}
