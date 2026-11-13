import { z } from "zod";

import type { PaymentMethod, TransactionKind } from "@/lib/types";

export const kindSchema = z.enum(["income", "expense"], {
  error: "Jenis transaksi tidak valid",
});

export const paymentMethodSchema = z.enum(
  ["cash", "bank_transfer", "e_wallet", "other"],
  { error: "Metode pembayaran tidak valid" },
);

/** UUID longgar: cukup untuk mencegah string sembarangan, RLS tetap penjaga utama. */
export const uuidSchema = z.uuid("ID tidak valid");

export function isTransactionKind(value: unknown): value is TransactionKind {
  return value === "income" || value === "expense";
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    value === "cash" ||
    value === "bank_transfer" ||
    value === "e_wallet" ||
    value === "other"
  );
}
