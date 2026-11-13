import { z } from "zod";

import {
  MAX_AMOUNT,
  MAX_YEAR,
  MIN_YEAR,
} from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { uuidSchema } from "@/lib/validation/common";

const amount = z
  .string()
  .trim()
  .min(1, "Nominal anggaran wajib diisi")
  .regex(/^\d+$/, "Nominal harus angka bulat tanpa titik atau koma")
  .transform((value) => Number(value))
  .refine((value) => Number.isSafeInteger(value) && value > 0, {
    message: "Nominal anggaran harus lebih dari 0",
  })
  .refine((value) => value <= MAX_AMOUNT, {
    message: `Nominal anggaran maksimal ${formatRupiah(MAX_AMOUNT)}`,
  });

export const budgetSchema = z.object({
  categoryId: uuidSchema,
  year: z.coerce
    .number()
    .int("Tahun tidak valid")
    .min(MIN_YEAR, `Tahun minimal ${MIN_YEAR}`)
    .max(MAX_YEAR, `Tahun maksimal ${MAX_YEAR}`),
  month: z.coerce
    .number()
    .int("Bulan tidak valid")
    .min(1, "Bulan tidak valid")
    .max(12, "Bulan tidak valid"),
  amount,
});

export type BudgetInput = z.infer<typeof budgetSchema>;
