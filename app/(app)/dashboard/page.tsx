import type { Metadata } from "next";
import { Wallet } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan keuangan bulan berjalan."
      />
      <EmptyState
        icon={Wallet}
        title="Belum ada data"
        description="Grafik dan ringkasan akan tampil setelah transaksi tersedia (Tahap 3)."
      />
    </div>
  );
}
