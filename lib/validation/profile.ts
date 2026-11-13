import { z } from "zod";

import { MAX_FULL_NAME_LENGTH } from "@/lib/constants";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(
      MAX_FULL_NAME_LENGTH,
      `Nama lengkap maksimal ${MAX_FULL_NAME_LENGTH} karakter`,
    ),
});

export type ProfileInput = z.infer<typeof profileSchema>;
