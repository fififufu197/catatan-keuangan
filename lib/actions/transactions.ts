"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState, TransactionKind } from "@/lib/types";
import { uuidSchema } from "@/lib/validation/common";
import {
  transactionSchema,
  updateTransactionSchema,
} from "@/lib/validation/transaction";

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

function revalidateTransactionPages() {
  revalidatePath("/dashboard");
  revalidatePath("/transaksi");
  revalidatePath("/anggaran");
  revalidatePath("/laporan");
}

/**
 * Memastikan kategori milik pengguna (RLS), jenisnya cocok, dan belum diarsipkan.
 * Mengembalikan pesan error bila tidak memenuhi syarat.
 */
async function validateCategory(
  categoryId: string,
  kind: TransactionKind,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, kind, archived")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) {
    console.error("gagal memeriksa kategori:", error.message);
    return "Kategori gagal diperiksa. Coba lagi.";
  }

  if (!data) {
    return "Kategori tidak ditemukan.";
  }

  if (data.kind !== kind) {
    return "Kategori tidak sesuai dengan jenis transaksi.";
  }

  if (data.archived) {
    return "Kategori sudah diarsipkan. Pilih kategori lain.";
  }

  return null;
}

function dbError(code: string | undefined, message: string): string {
  console.error("operasi transaksi gagal:", code, message);
  return "Transaksi gagal disimpan. Coba lagi.";
}

export async function createTransaction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = transactionSchema.safeParse({
    occurredOn: String(formData.get("occurredOn") ?? ""),
    kind: String(formData.get("kind") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    description: String(formData.get("description") ?? ""),
    paymentMethod: String(formData.get("paymentMethod") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Periksa kembali isian Anda.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const categoryError = await validateCategory(
    parsed.data.categoryId,
    parsed.data.kind,
  );

  if (categoryError) {
    return { ok: false, error: categoryError };
  }

  const supabase = await createClient();
  const { occurredOn, categoryId, paymentMethod, ...values } = parsed.data;

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    ...values,
    category_id: categoryId,
    occurred_on: occurredOn,
    payment_method: paymentMethod,
  });

  if (error) {
    return { ok: false, error: dbError(error.code, error.message) };
  }

  revalidateTransactionPages();
  return { ok: true };
}

export async function updateTransaction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = updateTransactionSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    occurredOn: String(formData.get("occurredOn") ?? ""),
    kind: String(formData.get("kind") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    description: String(formData.get("description") ?? ""),
    paymentMethod: String(formData.get("paymentMethod") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Periksa kembali isian Anda.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const categoryError = await validateCategory(
    parsed.data.categoryId,
    parsed.data.kind,
  );

  if (categoryError) {
    return { ok: false, error: categoryError };
  }

  const supabase = await createClient();
  const { id, occurredOn, categoryId, paymentMethod, ...values } = parsed.data;

  const { error } = await supabase
    .from("transactions")
    .update({
      ...values,
      category_id: categoryId,
      occurred_on: occurredOn,
      payment_method: paymentMethod,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: dbError(error.code, error.message) };
  }

  revalidateTransactionPages();
  return { ok: true };
}

export async function deleteTransaction(
  transactionId: string,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = uuidSchema.safeParse(transactionId);

  if (!parsed.success) {
    return { ok: false, error: "Transaksi tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  if (error) {
    console.error("gagal menghapus transaksi:", error.message);
    return { ok: false, error: "Transaksi gagal dihapus. Coba lagi." };
  }

  revalidateTransactionPages();
  return { ok: true };
}
