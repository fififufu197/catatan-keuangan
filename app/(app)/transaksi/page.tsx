import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Transaksi",
};

export default function TransaksiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaksi"
        description="Daftar pemasukan dan pengeluaran."
      />
      <EmptyState
        icon={ArrowLeftRight}
        title="Belum ada transaksi"
        description="Form tambah transaksi tersedia pada Tahap 3."
      />
    </div>
  );
}
