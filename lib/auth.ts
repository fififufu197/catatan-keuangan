import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type AuthUser = {
  id: string;
  email: string;
};

/**
 * Mengembalikan pengguna yang sedang login atau null.
 * Memakai getUser() (validasi ke server Auth), bukan getSession().
 * Di-cache per request agar layout dan Server Action tidak memanggil berulang.
 */
export const getUserOrNull = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
  };
});

/** Wajib login. Redirect ke /login bila belum ada sesi. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getUserOrNull();

  if (!user) {
    redirect("/login");
  }

  return user;
}
