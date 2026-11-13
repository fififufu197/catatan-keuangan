import { z } from "zod";

/**
 * Dua variabel ini satu-satunya konfigurasi rahasia aplikasi.
 * Service role key sengaja tidak dipakai (lihat ARCHITECTURE.md §7).
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .trim()
    .url("NEXT_PUBLIC_SUPABASE_URL harus berupa URL yang valid"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .trim()
    .min(20, "NEXT_PUBLIC_SUPABASE_ANON_KEY tidak boleh kosong"),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  const detail = parsed.error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Konfigurasi environment tidak lengkap.\n${detail}\n` +
      "Salin .env.example menjadi .env.local lalu isi nilainya.",
  );
}

export const env = parsed.data;
