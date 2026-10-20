import Tombol from "@/components/Tombol";

export default function BannerPromo({ banner }) {
  if (!banner) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-garis bg-gradient-to-br from-permukaan via-latar to-harga-latar/35 p-6 sm:p-8 md:p-10 shadow-xs">
      <div className="flex flex-col-reverse items-center justify-between gap-6 md:flex-row md:gap-10">
        <div className="flex flex-1 flex-col items-start gap-3 text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-harga-latar px-3 py-1 text-xs font-bold text-harga">
            <span>🏷️</span> Penawaran Spesial
          </span>

          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-teks">
            {banner.judul}
          </h2>

          <p className="max-w-xl text-sm leading-relaxed text-teks-lembut sm:text-base">
            {banner.teks}
          </p>

          <div className="pt-2">
            <Tombol href={banner.tautan || "#judul-produk"}>
              {banner.label_tombol || "Lihat Promo"}
            </Tombol>
          </div>
        </div>

        {banner.gambar_url && (
          <div className="flex shrink-0 items-center justify-center">
            <img
              src={banner.gambar_url}
              alt={banner.judul}
              className="aspect-square h-36 w-36 rounded-2xl border border-garis bg-latar object-cover shadow-sm sm:h-48 sm:w-48"
            />
          </div>
        )}
      </div>
    </div>
  );
}

