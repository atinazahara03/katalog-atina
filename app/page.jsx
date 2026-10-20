import BannerPromo from "@/components/BannerPromo";
import DaftarProdukDenganPaginasi from "@/components/DaftarProdukDenganPaginasi";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PER_HALAMAN = 12;

export default async function HalamanKatalog() {
  let produkAwal = [];
  let totalHalaman = 1;
  let adaLagi = false;
  let pesanError = null;
  let bannerPromo = null;

  try {
    const supabase = createServerClient();

    // Ambil halaman pertama produk dengan pembatasan di query database (US-16)
    const { data, error, count } = await supabase
      .from("produk")
      .select("*", { count: "exact" })
      .order("id", { ascending: true })
      .range(0, PER_HALAMAN - 1);

    if (error) {
      pesanError = error.message;
    } else {
      produkAwal = data ?? [];
      const totalProduk = count ?? 0;
      totalHalaman = Math.ceil(totalProduk / PER_HALAMAN);
      adaLagi = totalHalaman > 1;
    }

    // Ambil banner promo aktif dari Supabase jika tersedia
    const { data: bannerData, error: bannerError } = await supabase
      .from("banner")
      .select("*")
      .eq("is_aktif", true)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!bannerError && bannerData) {
      bannerPromo = bannerData;
    } else if (bannerError && bannerError.message?.includes("Could not find the table")) {
      bannerPromo = {
        judul: `Promo Spesial ${toko.nama}`,
        teks: "Nikmati penawaran produk terbaik dengan kualitas terjamin. Pesan langsung dengan mudah dan cepat melalui WhatsApp!",
        gambar_url: "/produk/kopi.svg",
        tautan: "#judul-produk",
        label_tombol: "Pesan Sekarang",
      };
    }
  } catch (err) {
    pesanError = err.message || "Gagal terhubung ke database.";
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      {/* Banner Promo Beranda */}
      {bannerPromo && (
        <section aria-label="Banner Promosi" className="mb-12">
          <BannerPromo banner={bannerPromo} />
        </section>
      )}

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-4 text-sm text-bahaya">
            Gagal memuat daftar produk: {pesanError}
          </div>
        ) : (
          <DaftarProdukDenganPaginasi
            produkAwal={produkAwal}
            totalHalamanAwal={totalHalaman}
            adaLagiAwal={adaLagi}
          />
        )}
      </section>
    </>
  );
}
