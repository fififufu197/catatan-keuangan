import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Laporan",
};

export default function LaporanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan"
        description="Rekap harian, bulanan, dan tahunan."
      />
      <EmptyState
        icon={BarChart3}
        title="Belum ada laporan"
        description="Laporan dan ekspor CSV tersedia pada Tahap 4."
      />
    </div>
  );
}
