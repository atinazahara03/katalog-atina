import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function bersihkanUrl(url) {
  if (!url) return "";
  let clean = url.trim().replace(/\/+$/, "");
  if (clean.endsWith("/rest/v1")) {
    clean = clean.slice(0, -"/rest/v1".length);
  }
  return clean;
}

/**
 * Koneksi server untuk pengunjung (SUPABASE_SECRET_KEY).
 * Melewati RLS, dipakai untuk membaca katalog dan detail produk.
 */
export function createServerClient() {
  const supabaseUrl = bersihkanUrl(process.env.SUPABASE_URL);
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Koneksi sesi admin (SUPABASE_PUBLISHABLE_KEY + cookie login).
 * Dipakai untuk login, keluar, ganti password, dan aksi kelola produk.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  const supabaseUrl = bersihkanUrl(process.env.SUPABASE_URL);
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  return createSSRClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dipanggil saat Server Component me-render, abaikan jika tidak bisa set cookie
        }
      },
    },
  });
}

export { createServerClient as createClient, createSessionClient as createAdminClient };
export default createServerClient;
