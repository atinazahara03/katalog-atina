import Link from "next/link";
import { notFound } from "next/navigation";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import FormUlasan from "@/components/FormUlasan";
import { formatRupiah } from "@/lib/format";
import { createServerClient } from "@/lib/supabase/server";

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  // Mengambil data ulasan produk dari Supabase
  let ulasan = [];
  try {
    const { data: daftarUlasan, error: ulasanError } = await supabase
      .from("ulasan")
      .select("*")
      .eq("produk_id", id)
      .order("created_at", { ascending: false });

    if (!ulasanError && daftarUlasan) {
      ulasan = daftarUlasan;
    }
  } catch {
    ulasan = [];
  }

  const jumlahUlasan = ulasan.length;
  const totalRating = ulasan.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
  const rataRataRating = jumlahUlasan > 0 ? (totalRating / jumlahUlasan).toFixed(1) : null;

  return (
    <div className="py-8 md:py-12">
      <article className="grid gap-8 md:grid-cols-2">
        <img
          src={produk.foto_url}
          alt={produk.nama}
          className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
        />
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
          >
            Kembali ke katalog
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-sm text-teks-lembut">
            <span>{produk.kategori}</span>
            <span>•</span>
            {jumlahUlasan > 0 ? (
              <div className="flex items-center gap-1 font-semibold text-teks">
                <span className="text-amber-500">★</span>
                <span>{rataRataRating}</span>
                <span className="font-normal text-teks-lembut">({jumlahUlasan} ulasan)</span>
              </div>
            ) : (
              <span>Belum ada ulasan</span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>

          <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
            {formatRupiah(produk.harga)}
          </p>

          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>

          <TombolWhatsApp produk={produk} />
        </div>
      </article>

      {/* Bagian Ulasan dan Rating Produk */}
      <section className="mt-12 border-t border-garis pt-8">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Ulasan & Rating</h2>
            <div className="mt-2">
              {jumlahUlasan > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold">{rataRataRating}</span>
                  <div className="flex flex-col">
                    <div className="flex text-amber-500" aria-label={`Rata-rata ${rataRataRating} bintang`}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s}>
                          {Math.round(Number(rataRataRating)) >= s ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-teks-lembut">Berdasarkan {jumlahUlasan} ulasan</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-teks-lembut">Belum ada ulasan</p>
              )}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <FormUlasan produkId={produk.id} />
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold">Daftar Ulasan ({jumlahUlasan})</h3>
              {jumlahUlasan === 0 ? (
                <p className="rounded-2xl border border-dashed border-garis py-12 text-center text-sm text-teks-lembut">
                  Belum ada ulasan
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {ulasan.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 rounded-2xl border border-garis bg-latar p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.nama}</span>
                          <div
                            className="flex text-sm text-amber-500"
                            aria-label={`${item.rating} dari 5 bintang`}
                          >
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s}>{item.rating >= s ? "★" : "☆"}</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-teks-lembut">
                          {new Date(item.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-teks">{item.komentar}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
