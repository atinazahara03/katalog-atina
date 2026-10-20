import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Membuat client Supabase untuk server (misalnya Server Component atau Server Action)
 * menggunakan SUPABASE_URL dan SUPABASE_SECRET_KEY.
 * Kunci rahasia melewati RLS, digunakan untuk membaca data katalog dan detail produk.
 */
export function createServerClient() {
  let supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  // Bersihkan trailing slash atau path jika ada
  supabaseUrl = supabaseUrl.trim().replace(/\/+$/, "");
  if (supabaseUrl.endsWith("/rest/v1")) {
    supabaseUrl = supabaseUrl.slice(0, -"/rest/v1".length);
  }

  return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export { createServerClient as createClient };
export default createServerClient;

