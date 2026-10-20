"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/actions";
import { createServerClient } from "@/lib/supabase/server";

export async function tambahVarian(produkId, formData) {
  const { supabase } = await requireAdmin();

  const nama_varian = String(formData.get("nama_varian") || "").trim();
  const hargaRaw = formData.get("harga");
  const stokRaw = formData.get("stok");

  if (!nama_varian) return { error: "Nama varian wajib diisi." };

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga harus berupa angka dan tidak boleh negatif." };
  }

  const stok = stokRaw !== "" && stokRaw !== null ? parseInt(stokRaw, 10) : null;
  if (stok !== null && (isNaN(stok) || stok < 0)) {
    return { error: "Stok harus berupa angka tidak negatif, atau kosongkan jika tidak diatur." };
  }

  const { error } = await supabase.from("varian").insert([
    { produk_id: Number(produkId), nama_varian, harga, stok: stok ?? null },
  ]);

  if (error) {
    if (error.message?.includes("Could not find the table")) {
      return { error: "Tabel 'varian' belum dibuat. Jalankan skrip docs/varian.sql di Supabase SQL Editor." };
    }
    return { error: error.message || "Gagal menyimpan varian." };
  }

  revalidatePath(`/produk/${produkId}`);
  revalidatePath(`/admin/produk/${produkId}/varian`);
  return { sukses: true };
}

export async function hapusVarian(varianId, produkId) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("varian").delete().eq("id", Number(varianId));

  if (error) return { error: error.message || "Gagal menghapus varian." };

  revalidatePath(`/produk/${produkId}`);
  revalidatePath(`/admin/produk/${produkId}/varian`);
  return { sukses: true };
}

export async function getVarianProduk(produkId) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("varian")
    .select("*")
    .eq("produk_id", Number(produkId))
    .order("harga", { ascending: true });

  if (error) return { varian: [], error: error.message };
  return { varian: data ?? [], error: null };
}

