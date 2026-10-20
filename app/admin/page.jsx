import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { produkContoh } from "@/lib/data-contoh";
import { formatRupiah } from "@/lib/format";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  const supabase = createServerClient();

  // 1. Ambil daftar produk dari Supabase (fallback ke produkContoh jika belum terhubung)
  let daftarProduk = produkContoh;
  try {
    const { data: dbProduk, error: errProduk } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (!errProduk && dbProduk && dbProduk.length > 0) {
      daftarProduk = dbProduk;
    }
  } catch {
    daftarProduk = produkContoh;
  }

  // 2. Ambil data pencatatan klik pesan / penjualan dari Supabase (US-41)
  let produkTerlaris = [];
  try {
    const { data: klikData, error: klikError } = await supabase
      .from("klik_pesan")
      .select("produk_id");

    if (!klikError && klikData && klikData.length > 0) {
      // Hitung jumlah klik/pesanan per produk_id
      const counts = {};
      for (const item of klikData) {
        if (item.produk_id) {
          counts[item.produk_id] = (counts[item.produk_id] || 0) + 1;
        }
      }

      // Urutkan produk_id dari jumlah terbanyak dan ambil maksimal 5
      const topIds = Object.keys(counts)
        .map(Number)
        .sort((a, b) => counts[b] - counts[a])
        .slice(0, 5);

      if (topIds.length > 0) {
        const { data: produkList, error: errTop } = await supabase
          .from("produk")
          .select("id, nama, harga, foto_url, kategori")
          .in("id", topIds);

        if (!errTop && produkList) {
          const mapProduk = new Map(produkList.map((p) => [p.id, p]));
          produkTerlaris = topIds
            .filter((id) => mapProduk.has(id))
            .map((id) => ({
              ...mapProduk.get(id),
              total_terjual: counts[id],
            }));
        }
      }
    }
  } catch {
    produkTerlaris = [];
  }

  return (
    <div className="flex flex-col gap-8 py-8">
      <NavAdmin />

      {/* Bagian Produk Terlaris (US-41) */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Produk Terlaris</h2>
          <p className="mt-0.5 text-xs text-teks-lembut">
            5 produk dengan jumlah pemesanan tertinggi berdasarkan data nyata di database.
          </p>
        </div>

        {produkTerlaris.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-garis bg-permukaan/40 py-10 text-center">
            <p className="text-sm font-semibold text-teks-lembut">Belum ada data penjualan</p>
            <p className="mt-1 text-xs text-teks-lembut">
              Data produk terlaris akan otomatis terhitung saat pengunjung menekan tombol pesan produk.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-garis bg-latar">
            <div className="divide-y divide-garis">
              {produkTerlaris.map((p, index) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-permukaan/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0
                          ? "bg-amber-100 text-amber-800"
                          : index === 1
                          ? "bg-gray-200 text-gray-700"
                          : index === 2
                          ? "bg-amber-700/10 text-amber-900"
                          : "bg-permukaan text-teks-lembut"
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <img
                      src={p.foto_url}
                      alt={p.nama}
                      className="h-12 w-12 rounded-lg border border-garis bg-permukaan object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold leading-snug sm:text-base">
                        {p.nama}
                      </span>
                      <span className="text-xs text-teks-lembut">{p.kategori}</span>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-3 sm:ml-0">
                    <span className="rounded-md bg-harga-latar px-2.5 py-0.5 text-sm font-bold text-harga">
                      {formatRupiah(p.harga)}
                    </span>
                    <span className="rounded-full bg-utama/10 px-3 py-1 text-xs font-bold text-utama">
                      {p.total_terjual} pesanan
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Bagian Kelola Produk */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Daftar Produk</h1>
            <p className="mt-0.5 text-xs text-teks-lembut">
              Kelola seluruh produk yang tersedia di katalog tokomu.
            </p>
          </div>
          <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
        </div>
        <TabelProduk daftarProduk={daftarProduk} />
      </section>
    </div>
  );
}
