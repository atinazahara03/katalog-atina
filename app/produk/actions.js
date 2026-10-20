"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export async function tambahUlasan(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState instanceof FormData ? prevState : null;

  if (!data) {
    return { error: "Data form tidak valid." };
  }

  // Proteksi spam dasar: honeypot
  const honeypot = data.get("website_url");
  if (honeypot) {
    return { error: "Permintaan tidak valid." };
  }

  const produkId = data.get("produk_id");
  const nama = String(data.get("nama") || "").trim();
  const ratingStr = data.get("rating");
  const komentar = String(data.get("komentar") || "").trim();

  // Validasi ID produk
  if (!produkId) {
    return { error: "ID produk tidak valid." };
  }

  // Validasi nama
  if (!nama) {
    return { error: "Nama wajib diisi." };
  }
  if (nama.length > 100) {
    return { error: "Nama maksimal 100 karakter." };
  }

  // Validasi rating (1 - 5 bintang)
  const rating = parseInt(ratingStr, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Rating harus bernilai antara 1 sampai 5 bintang." };
  }

  // Validasi ulasan/komentar
  if (!komentar) {
    return { error: "Ulasan tidak boleh kosong." };
  }
  if (komentar.length > 1000) {
    return { error: "Ulasan maksimal 1000 karakter." };
  }

  try {
    const supabase = createServerClient();
    const { error: insertError } = await supabase.from("ulasan").insert([
      {
        produk_id: Number(produkId),
        nama,
        rating,
        komentar,
      },
    ]);

    if (insertError) {
      if (
        insertError.message?.includes("Could not find the table") ||
        insertError.code === "42P01"
      ) {
        return {
          error:
            "Tabel 'ulasan' belum dibuat di database Supabase. Silakan jalankan skrip SQL di docs/ulasan.sql pada Supabase SQL Editor.",
        };
      }
      return { error: insertError.message || "Gagal menyimpan ulasan." };
    }

    revalidatePath(`/produk/${produkId}`);
    return { sukses: true, pesan: "Ulasan dan rating berhasil dikirim. Terima kasih!" };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan pada server." };
  }
}

