"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

function collectFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !result[field]) {
      result[field] = issue.message;
    }
  }

  return result;
}

export async function login(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Periksa kembali isian Anda.",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.error("login gagal:", error.message);
    return { ok: false, error: "Email atau password salah." };
  }

  redirect("/dashboard");
}

export async function register(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Periksa kembali isian Anda.",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    console.error("registrasi gagal:", error.message);

    const sudahTerdaftar = /already|registered|exists/i.test(error.message);

    return {
      ok: false,
      error: sudahTerdaftar
        ? "Email sudah terdaftar. Silakan masuk."
        : "Pendaftaran gagal. Coba lagi sebentar lagi.",
    };
  }

  // Bila konfirmasi email tidak sengaja aktif, sesi tidak terbentuk.
  if (!data.session) {
    return {
      ok: false,
      error:
        "Akun dibuat, tetapi konfirmasi email masih aktif di Supabase. " +
        "Matikan Confirm email lalu coba masuk.",
    };
  }

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
