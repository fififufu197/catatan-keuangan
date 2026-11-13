import { z } from "zod";

import { MAX_FULL_NAME_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/constants";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Format email tidak valid"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(
      MAX_FULL_NAME_LENGTH,
      `Nama lengkap maksimal ${MAX_FULL_NAME_LENGTH} karakter`,
    ),
  email,
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password minimal ${MIN_PASSWORD_LENGTH} karakter`,
    )
    // Batas maksimum bcrypt di Supabase Auth.
    .max(72, "Password maksimal 72 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
