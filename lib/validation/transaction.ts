import { z } from "zod";

import { MAX_AMOUNT, MAX_DESCRIPTION_LENGTH } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { isValidDateString } from "@/lib/period";
import { kindSchema, paymentMethodSchema, uuidSchema } from "@/lib/validation/common";

const amount = z
  .string()
  .trim()
  .min(1, "Nominal wajib diisi")
  .regex(/^\d+$/, "Nominal harus angka bulat tanpa titik atau koma")
  .transform((value) => Number(value))
  .refine((value) => Number.isSafeInteger(value) && value > 0, {
    message: "Nominal harus lebih dari 0",
  })
  .refine((value) => value <= MAX_AMOUNT, {
    message: `Nominal maksimal ${formatRupiah(MAX_AMOUNT)}`,
  });

const occurredOn = z
  .string()
  .trim()
  .refine(isValidDateString, "Tanggal tidak valid (gunakan YYYY-MM-DD, tahun 2000–2100)");

const description = z
  .string()
  .trim()
  .max(
    MAX_DESCRIPTION_LENGTH,
    `Deskripsi maksimal ${MAX_DESCRIPTION_LENGTH} karakter`,
  );

export const transactionSchema = z.object({
  occurredOn,
  kind: kindSchema,
  amount,
  categoryId: uuidSchema,
  description,
  paymentMethod: paymentMethodSchema,
});

export const updateTransactionSchema = transactionSchema.extend({
  id: uuidSchema,
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
