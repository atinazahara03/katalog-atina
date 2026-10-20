"use client";

import { useState, useTransition } from "react";
import KartuProduk from "@/components/KartuProduk";

export default function DaftarProdukDenganPaginasi({ produkAwal, totalHalamanAwal, adaLagiAwal }) {
  const [daftarProduk, setDaftarProduk] = useState(produkAwal);
  const [halaman, setHalaman] = useState(1);
  const [adaLagi, setAdaLagi] = useState(adaLagiAwal);
  const [pesanError, setPesanError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const muatLebihBanyak = () => {
    const halamanBerikutnya = halaman + 1;
    startTransition(async () => {
      setPesanError(null);
      try {
        const res = await fetch(`/api/produk?halaman=${halamanBerikutnya}`);
        const data = await res.json();

        if (!res.ok || data.error) {
          setPesanError(data.error || "Gagal memuat produk.");
          return;
        }

        // Gabungkan produk baru, hindari duplikasi berdasarkan id
        const idSudahAda = new Set(daftarProduk.map((p) => p.id));
        const produkBaru = (data.produk || []).filter((p) => !idSudahAda.has(p.id));

        setDaftarProduk((prev) => [...prev, ...produkBaru]);
        setHalaman(halamanBerikutnya);
        setAdaLagi(data.adaLagi);
      } catch (err) {
        setPesanError("Gagal memuat produk. Periksa koneksi internet Anda.");
      }
    });
  };

  if (daftarProduk.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-garis py-12 text-center text-sm text-teks-lembut">
        Belum ada produk
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {daftarProduk.map((produk) => (
          <KartuProduk key={produk.id} produk={produk} />
        ))}
      </div>

      {pesanError && (
        <div className="rounded-xl border border-garis bg-permukaan p-3 text-center text-sm text-bahaya">
          {pesanError}
        </div>
      )}

      {adaLagi && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={muatLebihBanyak}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-garis bg-latar px-6 py-3 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-garis border-t-utama" />
                Memuat...
              </>
            ) : (
              "Muat lebih banyak"
            )}
          </button>
        </div>
      )}

      {!adaLagi && daftarProduk.length > 0 && (
        <p className="text-center text-xs text-teks-lembut">
          Semua {daftarProduk.length} produk telah ditampilkan
        </p>
      )}
    </div>
  );
}

