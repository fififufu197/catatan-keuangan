import { z } from "zod";

import { MAX_CATEGORY_NAME_LENGTH } from "@/lib/constants";
import { kindSchema, uuidSchema } from "@/lib/validation/common";

const name = z
  .string()
  .trim()
  .min(1, "Nama kategori wajib diisi")
  .max(
    MAX_CATEGORY_NAME_LENGTH,
    `Nama kategori maksimal ${MAX_CATEGORY_NAME_LENGTH} karakter`,
  );

export const createCategorySchema = z.object({
  name,
  kind: kindSchema,
});

export const renameCategorySchema = z.object({
  id: uuidSchema,
  name,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type RenameCategoryInput = z.infer<typeof renameCategorySchema>;
