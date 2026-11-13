"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteTransaction } from "@/lib/actions/transactions";

export function TransactionDeleteDialog({
  id,
  description,
}: {
  id: string;
  description: string;
}) {
  return (
    <ConfirmDialog
      title="Hapus transaksi?"
      description={`Transaksi "${
        description || "(tanpa deskripsi)"
      }" akan dihapus permanen dan tidak bisa dikembalikan.`}
      onConfirm={() => deleteTransaction(id)}
      onSuccess={() => toast.success("Transaksi dihapus.")}
      trigger={
        <Button variant="ghost" size="icon" title="Hapus transaksi">
          <Trash2 className="size-4" aria-hidden />
          <span className="sr-only">Hapus transaksi</span>
        </Button>
      }
    />
  );
}
