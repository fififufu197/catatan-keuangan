"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/shared/form-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory, renameCategory } from "@/lib/actions/categories";
import {
  KIND_LABELS,
  MAX_CATEGORY_NAME_LENGTH,
} from "@/lib/constants";
import type { ActionState, CategoryRow, TransactionKind } from "@/lib/types";

const initialState: ActionState = { ok: false, error: "" };

export function CategoryFormDialog({
  trigger,
  kind,
  category,
}: {
  trigger: React.ReactNode;
  kind?: TransactionKind;
  category?: CategoryRow;
}) {
  const isEdit = Boolean(category);
  const activeKind = category?.kind ?? kind ?? "expense";
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [state, setState] = useState<ActionState>(initialState);
  const [, startTransition] = useTransition();

  const action = isEdit ? renameCategory : createCategory;

  const fieldErrors = state.ok ? {} : (state.fieldErrors ?? {});
  const inputId = isEdit ? `rename-${category?.id}` : `create-${activeKind}`;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(initialState, formData);

      if (!result.ok) {
        setState(result);
        return;
      }

      setState(initialState);
      toast.success(
        isEdit ? "Nama kategori diperbarui." : "Kategori ditambahkan.",
      );
      setOpen(false);
      if (!isEdit) {
        setName("");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setName(category?.name ?? "");
          setState(initialState);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Ganti nama kategori" : "Tambah kategori"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Jenis kategori tidak bisa diubah."
              : `Kategori baru untuk ${KIND_LABELS[activeKind].toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4" noValidate>
          {isEdit ? (
            <input type="hidden" name="id" value={category?.id} />
          ) : (
            <input type="hidden" name="kind" value={activeKind} />
          )}

          <div className="space-y-2">
            <Label htmlFor={inputId}>Nama kategori</Label>
            <Input
              id={inputId}
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={MAX_CATEGORY_NAME_LENGTH}
              placeholder="Contoh: Makanan"
              aria-invalid={Boolean(fieldErrors.name)}
              autoComplete="off"
              required
            />
            {fieldErrors.name ? (
              <p className="text-destructive text-sm">{fieldErrors.name}</p>
            ) : null}
            <p className="text-muted-foreground text-xs">
              Maksimal {MAX_CATEGORY_NAME_LENGTH} karakter, unik per jenis.
            </p>
          </div>

          {!state.ok ? <FormError message={state.error} /> : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <SubmitButton>{isEdit ? "Simpan" : "Tambah"}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
