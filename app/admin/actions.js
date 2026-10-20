"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

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

export const masuk = login;
export const keluar = logout;

