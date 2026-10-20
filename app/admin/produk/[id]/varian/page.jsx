import { notFound } from "next/navigation";
import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import KelolVarianProduk from "@/components/KelolVarianProduk";
import { createSessionClient, createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/app/admin/actions";

export default async function HalamanVarianProduk({ params }) {
  const { id } = await params;

  // Pastikan admin sudah login
  await requireAdmin();

  const supabase = createServerClient();

  // Ambil data produk
  const { data: produk, error: errProduk } = await supabase
    .from("produk")
    .select("id, nama, harga, kategori")
    .eq("id", id)
    .maybeSingle();

  if (errProduk || !produk) {
    notFound();
  }

  // Ambil daftar varian produk
  let daftarVarian = [];
  let pesanError = null;
  try {
    const { data: vData, error: vError } = await supabase
      .from("varian")
      .select("*")
      .eq("produk_id", id)
      .order("harga", { ascending: true });

    if (!vError) {
      daftarVarian = vData ?? [];
    } else if (vError.message?.includes("Could not find the table")) {
      pesanError = "Tabel 'varian' belum dibuat di Supabase. Jalankan skrip docs/varian.sql terlebih dahulu.";
    } else {
      pesanError = vError.message;
    }
  } catch (err) {
    pesanError = err.message;
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-teks-lembut">
            <Link href="/admin" className="hover:text-utama">
              Daftar Produk
            </Link>
            <span>›</span>
            <span className="font-semibold text-teks">{produk.nama}</span>
          </div>
          <h1 className="text-2xl font-extrabold">Kelola Varian Produk</h1>
          <p className="mt-0.5 text-sm text-teks-lembut">
            Atur pilihan ukuran atau tipe beserta harga dan stok untuk produk ini.
          </p>
        </div>
        <Link
          href={`/produk/${id}`}
          className="text-sm font-semibold text-teks-lembut underline underline-offset-4 hover:text-utama"
          target="_blank"
        >
          Lihat di katalog ↗
        </Link>
      </div>

      {pesanError && (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-sm text-bahaya">
          {pesanError}
        </div>
      )}

      {!pesanError && (
        <KelolVarianProduk produkId={produk.id} varianAwal={daftarVarian} />
      )}
    </div>
  );
}

