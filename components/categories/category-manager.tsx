"use client";

import { Archive, ArchiveRestore, Pencil, Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  deleteCategory,
  setCategoryArchived,
} from "@/lib/actions/categories";
import { KIND_LABELS } from "@/lib/constants";
import type { CategoryRow, TransactionKind } from "@/lib/types";

function CategoryRowItem({
  category,
  onArchive,
  archiving,
}: {
  category: CategoryRow;
  onArchive: (category: CategoryRow) => void;
  archiving: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-2 py-1.5">
      <span className="flex min-w-0 items-center gap-2">
        <span className={category.archived ? "text-muted-foreground truncate" : "truncate"}>
          {category.name}
        </span>
        {category.archived ? <Badge variant="secondary">Diarsipkan</Badge> : null}
      </span>

      <span className="flex shrink-0 items-center gap-1">
        <CategoryFormDialog
          category={category}
          trigger={
            <Button variant="ghost" size="icon" title="Ganti nama">
              <Pencil className="size-4" aria-hidden />
              <span className="sr-only">Ganti nama {category.name}</span>
            </Button>
          }
        />

        <Button
          variant="ghost"
          size="icon"
          title={category.archived ? "Aktifkan" : "Arsipkan"}
          onClick={() => onArchive(category)}
          disabled={archiving}
        >
          {category.archived ? (
            <ArchiveRestore className="size-4" aria-hidden />
          ) : (
            <Archive className="size-4" aria-hidden />
          )}
          <span className="sr-only">
            {category.archived ? "Aktifkan" : "Arsipkan"} {category.name}
          </span>
        </Button>

        <ConfirmDialog
          title={`Hapus kategori "${category.name}"?`}
          description="Kategori hanya bisa dihapus permanen bila belum dipakai transaksi atau anggaran."
          onConfirm={() => deleteCategory(category.id)}
          onSuccess={() => toast.success("Kategori dihapus.")}
          trigger={
            <Button variant="ghost" size="icon" title="Hapus">
              <Trash2 className="size-4" aria-hidden />
              <span className="sr-only">Hapus {category.name}</span>
            </Button>
          }
        />
      </span>
    </li>
  );
}

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const [pending, startTransition] = useTransition();

  function handleArchive(category: CategoryRow) {
    startTransition(async () => {
      const result = await setCategoryArchived(category.id, !category.archived);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(
        category.archived ? "Kategori diaktifkan." : "Kategori diarsipkan.",
      );
    });
  }

  const kinds: TransactionKind[] = ["expense", "income"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori</CardTitle>
        <CardDescription>
          Kategori yang sudah dipakai transaksi diarsipkan, bukan dihapus.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {kinds.map((kind) => {
          const items = categories
            .filter((category) => category.kind === kind)
            .sort((a, b) => {
              if (a.archived !== b.archived) {
                return a.archived ? 1 : -1;
              }
              return a.name.localeCompare(b.name, "id");
            });

          return (
            <section key={kind} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{KIND_LABELS[kind]}</h3>
                <CategoryFormDialog
                  kind={kind}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Plus className="size-4" aria-hidden />
                      Tambah
                    </Button>
                  }
                />
              </div>

              {items.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Belum ada kategori {KIND_LABELS[kind].toLowerCase()}.
                </p>
              ) : (
                <ul className="divide-y">
                  {items.map((category) => (
                    <CategoryRowItem
                      key={category.id}
                      category={category}
                      onArchive={handleArchive}
                      archiving={pending}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
