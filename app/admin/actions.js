"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Memastikan admin sudah login di server sebelum menjalankan Server Action.
 * Jika belum login, dialihkan ke /admin/login.
 */
export async function requireAdmin() {
  const supabase = await createSessionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login?error=" + encodeURIComponent("Silakan login terlebih dahulu."));
  }

  return { supabase, user };
}

export async function login(arg1, arg2) {
  const isActionState = arg2 instanceof FormData;
  const formData = isActionState ? arg2 : arg1;

  const email = formData?.get("email");
  const password = formData?.get("password");

  if (!email || !password) {
    const pesan = "Email dan password wajib diisi.";
    if (isActionState) return { error: pesan };
    redirect("/admin/login?error=" + encodeURIComponent(pesan));
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    const pesan =
      error.message === "Invalid login credentials"
        ? "Email atau password salah. Silakan periksa kembali."
        : error.message;

    if (isActionState) return { error: pesan };
    redirect("/admin/login?error=" + encodeURIComponent(pesan));
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(arg1, arg2) {
  const isActionState = arg2 instanceof FormData;
  const formData = isActionState ? arg2 : arg1;

  const passwordBaru = formData?.get("password_baru");
  const konfirmasiPassword = formData?.get("konfirmasi_password");

  // Validasi login di server
  const { supabase } = await requireAdmin();

  if (!passwordBaru || String(passwordBaru).length < 8) {
    const pesan = "Password baru minimal 8 karakter.";
    if (isActionState) return { error: pesan };
    redirect("/admin/password?error=" + encodeURIComponent(pesan));
  }

  if (passwordBaru !== konfirmasiPassword) {
    const pesan = "Konfirmasi password tidak cocok dengan password baru.";
    if (isActionState) return { error: pesan };
    redirect("/admin/password?error=" + encodeURIComponent(pesan));
  }

  const { error } = await supabase.auth.updateUser({
    password: String(passwordBaru),
  });

  if (error) {
    const pesan = error.message;
    if (isActionState) return { error: pesan };
    redirect("/admin/password?error=" + encodeURIComponent(pesan));
  }

  const pesanBerhasil = "Password berhasil diperbarui.";
  if (isActionState) return { berhasil: pesanBerhasil };
  redirect("/admin/password?berhasil=" + encodeURIComponent(pesanBerhasil));
}

export async function tambahProduk(arg1, arg2) {
  const isActionState = arg2 instanceof FormData;
  const formData = isActionState ? arg2 : arg1;

  // Pastikan admin login di server
  const { supabase } = await requireAdmin();

  const nama = String(formData?.get("nama") || "").trim();
  const hargaRaw = formData?.get("harga");
  const kategori = String(formData?.get("kategori") || "").trim();
  const foto_url = String(formData?.get("foto_url") || "").trim();
  const deskripsi = String(formData?.get("deskripsi") || "").trim();

  // Validasi nama produk
  if (!nama) {
    const pesan = "Nama produk wajib diisi.";
    if (isActionState) return { error: pesan };
    redirect("/admin/produk/baru?error=" + encodeURIComponent(pesan));
  }

  // Validasi harga produk
  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    const pesan = "Harga harus berupa angka dan tidak boleh bernilai negatif.";
    if (isActionState) return { error: pesan };
    redirect("/admin/produk/baru?error=" + encodeURIComponent(pesan));
  }

  // Simpan ke tabel produk di Supabase
  const { error: insertError } = await supabase.from("produk").insert([
    {
      nama,
      harga,
      kategori: kategori || null,
      foto_url: foto_url || "/produk/kopi.svg",
      deskripsi: deskripsi || null,
    },
  ]);

  if (insertError) {
    const pesan = insertError.message || "Gagal menyimpan produk ke database.";
    if (isActionState) return { error: pesan };
    redirect("/admin/produk/baru?error=" + encodeURIComponent(pesan));
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export const masuk = login;
export const keluar = logout;
export const updatePassword = gantiPassword;
export const verifikasiLoginAdmin = requireAdmin;
