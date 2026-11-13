import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/lib/types";

/**
 * Client untuk komponen client yang benar-benar butuh auth di browser.
 * Saat ini belum dipakai: semua baca/tulis lewat Server Component & Server Action.
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
