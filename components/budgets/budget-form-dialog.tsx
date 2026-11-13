"use client";

import { Pencil, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/shared/form-error";
import { MoneyInput } from "@/components/shared/money-input";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertBudget } from "@/lib/actions/budgets";
import type { BudgetItem } from "@/lib/db/budgets";
import { formatBulan } from "@/lib/format";
import type { ActionState, CategoryRow } from "@/lib/types";

const initialState: ActionState = { ok: false, error: "" };

export function BudgetFormDialog({
  categories,
  year,
  month,
  item,
  defaultCategoryId,
  trigger,
}: {
  categories: CategoryRow[];
  year: number;
  month: number;
  item?: BudgetItem;
  defaultCategoryId?: string;
  trigger?: React.ReactNode;
}) {
  const isEdit = Boolean(item?.hasBudget && item.id);
  const initialCategoryId =
    item?.categoryId ?? defaultCategoryId ?? "";
  const initialAmount = item?.hasBudget ? String(item.budget) : "";

  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [amount, setAmount] = useState(initialAmount);
  const [state, setState] = useState<ActionState>(initialState);
  const [, startTransition] = useTransition();

  const fieldErrors = state.ok ? {} : (state.fieldErrors ?? {});

  function reset() {
    setCategoryId(initialCategoryId);
    setAmount(initialAmount);
    setState(initialState);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await upsertBudget(initialState, formData);

      if (!result.ok) {
        setState(result);
        return;
      }

      setState(initialState);
      toast.success(
        isEdit ? "Anggaran diperbarui." : "Anggaran disimpan.",
      );
      setOpen(false);
      if (!isEdit) {
        setCategoryId(defaultCategoryId ?? "");
        setAmount("");
      }
    });
  }

  const selectedCategory = categories.find(
    (category) => category.id === categoryId,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" aria-hidden />
            Atur anggaran
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Ubah anggaran" : "Atur anggaran"}
          </DialogTitle>
          <DialogDescription>
            Anggaran pengeluaran untuk {formatBulan(year, month)}. Satu
            kategori hanya punya satu anggaran per bulan.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4" noValidate>
          <input type="hidden" name="categoryId" value={categoryId} />
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="month" value={month} />
          <input type="hidden" name="amount" value={amount} />

          <div className="space-y-2">
            <Label>Kategori pengeluaran</Label>
            {isEdit ? (
              <p className="bg-muted rounded-lg border px-3 py-2 text-sm">
                {selectedCategory?.name ?? item?.name ?? "Kategori"}
              </p>
            ) : (
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      Belum ada kategori pengeluaran
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                        {category.archived ? " (diarsipkan)" : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {fieldErrors.categoryId ? (
              <p className="text-destructive text-sm">
                {fieldErrors.categoryId}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-amount">Nominal anggaran</Label>
            <div className="relative">
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                Rp
              </span>
              <MoneyInput
                id="budget-amount"
                value={amount}
                onValueChange={setAmount}
                placeholder="0"
                className="pl-9"
                aria-invalid={Boolean(fieldErrors.amount)}
              />
            </div>
            {fieldErrors.amount ? (
              <p className="text-destructive text-sm">{fieldErrors.amount}</p>
            ) : null}
          </div>

          {!state.ok ? <FormError message={state.error} /> : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <SubmitButton>{isEdit ? "Simpan" : "Atur"}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BudgetEditButton({
  categories,
  year,
  month,
  item,
}: {
  categories: CategoryRow[];
  year: number;
  month: number;
  item: BudgetItem;
}) {
  return (
    <BudgetFormDialog
      categories={categories}
      year={year}
      month={month}
      item={item}
      trigger={
        <Button variant="ghost" size="icon" title="Ubah anggaran">
          <Pencil className="size-4" aria-hidden />
          <span className="sr-only">Ubah anggaran {item.name}</span>
        </Button>
      }
    />
  );
}
