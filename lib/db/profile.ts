import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types";

/** Profil milik pengguna yang sedang login, atau null bila belum terbentuk. */
export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("gagal mengambil profil:", error.message);
    return null;
  }

  return data;
}
