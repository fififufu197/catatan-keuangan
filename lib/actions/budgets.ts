"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { budgetSchema } from "@/lib/validation/budget";
import { uuidSchema } from "@/lib/validation/common";

function fieldErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !result[field]) {
      result[field] = issue.message;
    }
  }

  return result;
}

export async function upsertBudget(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = budgetSchema.safeParse({
    categoryId: String(formData.get("categoryId") ?? ""),
    year: String(formData.get("year") ?? ""),
    month: String(formData.get("month") ?? ""),
    amount: String(formData.get("amount") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Periksa kembali isian Anda.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, kind")
    .eq("id", parsed.data.categoryId)
    .maybeSingle();

  if (categoryError) {
    console.error("gagal memeriksa kategori anggaran:", categoryError.message);
    return { ok: false, error: "Kategori gagal diperiksa. Coba lagi." };
  }

  if (!category) {
    return { ok: false, error: "Kategori tidak ditemukan." };
  }

  if (category.kind !== "expense") {
    return {
      ok: false,
      error: "Anggaran hanya bisa dibuat untuk kategori pengeluaran.",
    };
  }

  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: user.id,
      category_id: parsed.data.categoryId,
      kind: "expense",
      year: parsed.data.year,
      month: parsed.data.month,
      amount: parsed.data.amount,
    },
    { onConflict: "user_id,category_id,year,month" },
  );

  if (error) {
    console.error("gagal menyimpan anggaran:", error.code, error.message);
    return { ok: false, error: "Anggaran gagal disimpan. Coba lagi." };
  }

  revalidatePath("/anggaran");
  return { ok: true };
}

export async function deleteBudget(budgetId: string): Promise<ActionState> {
  const user = await requireUser();

  const parsed = uuidSchema.safeParse(budgetId);

  if (!parsed.success) {
    return { ok: false, error: "Anggaran tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  if (error) {
    console.error("gagal menghapus anggaran:", error.message);
    return { ok: false, error: "Anggaran gagal dihapus. Coba lagi." };
  }

  revalidatePath("/anggaran");
  return { ok: true };
}
