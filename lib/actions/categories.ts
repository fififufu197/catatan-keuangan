"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { countCategoryUsage } from "@/lib/db/categories";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import {
  createCategorySchema,
  renameCategorySchema,
} from "@/lib/validation/category";
import { uuidSchema } from "@/lib/validation/common";
const DUPLICATE = "23505";

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

function categoryDbError(code: string | undefined, message: string): string {
  if (code === DUPLICATE) {
    return "Nama kategori sudah dipakai pada jenis yang sama.";
  }

  console.error("operasi kategori gagal:", message);
  return "Kategori gagal disimpan. Coba lagi.";
}

function revalidateCategoryPages() {
  revalidatePath("/pengaturan");
  revalidatePath("/transaksi");
}

export async function createCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = createCategorySchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Periksa kembali isian Anda.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: parsed.data.name,
    kind: parsed.data.kind,
  });

  if (error) {
    return {
      ok: false,
      error: categoryDbError(error.code, error.message),
    };
  }

  revalidateCategoryPages();
  return { ok: true };
}

export async function renameCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = renameCategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Periksa kembali isian Anda.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name: parsed.data.name })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) {
    return {
      ok: false,
      error: categoryDbError(error.code, error.message),
    };
  }

  revalidateCategoryPages();
  return { ok: true };
}

export async function setCategoryArchived(
  categoryId: string,
  archived: boolean,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = uuidSchema.safeParse(categoryId);

  if (!parsed.success) {
    return { ok: false, error: "Kategori tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ archived })
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  if (error) {
    console.error("gagal mengubah arsip kategori:", error.message);
    return { ok: false, error: "Status kategori gagal diubah. Coba lagi." };
  }

  revalidateCategoryPages();
  return { ok: true };
}

export async function deleteCategory(
  categoryId: string,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = uuidSchema.safeParse(categoryId);

  if (!parsed.success) {
    return { ok: false, error: "Kategori tidak valid." };
  }

  const usage = await countCategoryUsage(parsed.data);

  if (usage.transactions > 0 || usage.budgets > 0) {
    return {
      ok: false,
      error:
        "Kategori sudah dipakai transaksi atau anggaran. Arsipkan saja agar riwayat tetap utuh.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  if (error) {
    console.error("gagal menghapus kategori:", error.message);
    return { ok: false, error: "Kategori gagal dihapus. Coba lagi." };
  }

  revalidateCategoryPages();
  return { ok: true };
}
