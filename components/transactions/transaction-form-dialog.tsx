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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createTransaction,
  updateTransaction,
} from "@/lib/actions/transactions";
import {
  KIND_LABELS,
  MAX_DESCRIPTION_LENGTH,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  TRANSACTION_KINDS,
} from "@/lib/constants";
import { todayWib } from "@/lib/period";
import type {
  ActionState,
  CategoryRow,
  PaymentMethod,
  TransactionKind,
  TransactionWithCategory,
} from "@/lib/types";

const initialState: ActionState = { ok: false, error: "" };

export function TransactionFormDialog({
  categories,
  transaction,
}: {
  categories: CategoryRow[];
  transaction?: TransactionWithCategory;
}) {
  const isEdit = Boolean(transaction);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<TransactionKind>(
    transaction?.kind ?? "expense",
  );
  const [categoryId, setCategoryId] = useState(
    transaction?.category_id ?? "",
  );
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : "",
  );
  const [occurredOn, setOccurredOn] = useState(
    transaction?.occurred_on ?? todayWib(),
  );
  const [description, setDescription] = useState(
    transaction?.description ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    transaction?.payment_method ?? "cash",
  );

  const [state, setState] = useState<ActionState>(initialState);
  const [, startTransition] = useTransition();

  const fieldErrors = state.ok ? {} : (state.fieldErrors ?? {});

  const categoryOptions = categories.filter(
    (category) =>
      category.kind === kind &&
      (!category.archived || category.id === transaction?.category_id),
  );

  const action = isEdit ? updateTransaction : createTransaction;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(initialState, formData);

      if (!result.ok) {
        setState(result);
        return;
      }

      setState(initialState);
      toast.success(
        isEdit ? "Transaksi diperbarui." : "Transaksi ditambahkan.",
      );
      setOpen(false);
      if (!isEdit) {
        setKind("expense");
        setCategoryId("");
        setAmount("");
        setOccurredOn(todayWib());
        setDescription("");
        setPaymentMethod("cash");
      }
    });
  }

  function resetForOpen() {
    if (transaction) {
      return;
    }

    setKind("expense");
    setCategoryId("");
    setAmount("");
    setOccurredOn(todayWib());
    setDescription("");
    setPaymentMethod("cash");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          resetForOpen();
          setState(initialState);
        }
      }}
    >
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" title="Edit transaksi">
            <Pencil className="size-4" aria-hidden />
            <span className="sr-only">Edit transaksi</span>
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" aria-hidden />
            Tambah transaksi
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit transaksi" : "Tambah transaksi"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perubahan langsung tercermin di dashboard dan laporan."
              : "Catat pemasukan atau pengeluaran baru."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4" noValidate>
          {isEdit ? (
            <input type="hidden" name="id" value={transaction?.id} />
          ) : null}
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="categoryId" value={categoryId} />
          <input type="hidden" name="amount" value={amount} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="occurredOn">Tanggal</Label>
              <Input
                id="occurredOn"
                name="occurredOn"
                type="date"
                value={occurredOn}
                min="2000-01-01"
                max="2100-12-31"
                onChange={(event) => setOccurredOn(event.target.value)}
                aria-invalid={Boolean(fieldErrors.occurredOn)}
                required
              />
              {fieldErrors.occurredOn ? (
                <p className="text-destructive text-sm">
                  {fieldErrors.occurredOn}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Jenis</Label>
              <Select
                value={kind}
                onValueChange={(value) => {
                  const nextKind = value as TransactionKind;
                  setKind(nextKind);

                  const currentCategory = categories.find(
                    (category) => category.id === categoryId,
                  );

                  if (currentCategory && currentCategory.kind !== nextKind) {
                    setCategoryId("");
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_KINDS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {KIND_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Nominal</Label>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  Rp
                </span>
                <MoneyInput
                  id="amount"
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

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      Belum ada kategori aktif
                    </SelectItem>
                  ) : (
                    categoryOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                        {category.archived ? " (diarsipkan)" : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {fieldErrors.categoryId ? (
                <p className="text-destructive text-sm">
                  {fieldErrors.categoryId}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Metode pembayaran</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PAYMENT_METHOD_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                name="paymentMethod"
                value={paymentMethod}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={2}
              placeholder="Contoh: Makan siang"
              aria-invalid={Boolean(fieldErrors.description)}
            />
            {fieldErrors.description ? (
              <p className="text-destructive text-sm">
                {fieldErrors.description}
              </p>
            ) : null}
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
