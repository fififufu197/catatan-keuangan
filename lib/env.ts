import { z } from "zod";

/**
 * Dua variabel ini hanya dibaca di sisi server (Server Component, Server
 * Action, dan proxy). Tanpa prefix NEXT_PUBLIC_, nilainya tidak ikut ke
 * bundle browser; akses data tetap dijaga RLS.
 */
const envSchema = z.object({
  SUPABASE_URL: z
    .string()
    .trim()
    .url("SUPABASE_URL harus berupa URL yang valid"),
  SUPABASE_ANON_KEY: z
    .string()
    .trim()
    .min(20, "SUPABASE_ANON_KEY tidak boleh kosong"),
});

const parsed = envSchema.safeParse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
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
