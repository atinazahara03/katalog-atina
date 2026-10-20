import KartuProduk from "@/components/KartuProduk";
import BannerPromo from "@/components/BannerPromo";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog() {
  let daftarProduk = null;
  let pesanError = null;
  let bannerPromo = null;

  try {
    const supabase = createServerClient();

    // Mengambil daftar produk
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      pesanError = error.message;
    } else {
      daftarProduk = data;
    }

    // Mengambil banner promo aktif dari Supabase jika tersedia
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
      // Fallback banner promo jika tabel belum dibuat di Supabase
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
        ) : daftarProduk && daftarProduk.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-garis py-12 text-center text-sm text-teks-lembut">
            Belum ada produk
          </p>
        )}
      </section>
    </>
  );
}
