import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import type { Database } from "@/lib/types";

/**
 * Client Supabase untuk Server Component, Server Action, dan Route Handler.
 * Wajib dibuat ulang di setiap request; cookie sesi dibaca dari next/headers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component tidak boleh menulis cookie.
            // proxy.ts yang memperbarui sesi pada request berikutnya.
          }
        },
      },
    },
  );
}
