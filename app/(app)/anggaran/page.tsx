import type { Metadata } from "next";
import { Wallet } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Anggaran",
};

export default function AnggaranPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Anggaran"
        description="Batas pengeluaran per kategori setiap bulan."
      />
      <EmptyState
        icon={Wallet}
        title="Belum ada anggaran"
        description="Pengaturan anggaran tersedia pada Tahap 4."
      />
    </div>
  );
}
