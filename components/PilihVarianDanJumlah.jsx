"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";

export default function PilihVarianDanJumlah({ produk, daftarVarian = [], nomorWhatsApp }) {
  const [varianTerpilih, setVarianTerpilih] = useState(
    daftarVarian.length > 0 ? daftarVarian[0] : null
  );
  const [jumlah, setJumlah] = useState(1);

  // Tentukan harga satuan berdasarkan varian yang aktif
  const hargaSatuan = varianTerpilih ? varianTerpilih.harga : produk.harga;
  const totalHarga = hargaSatuan * jumlah;

  // Cek ketersediaan stok
  const stokTersedia =
    varianTerpilih?.stok !== undefined && varianTerpilih?.stok !== null
      ? varianTerpilih.stok
      : produk?.stok !== undefined && produk?.stok !== null
      ? produk.stok
      : null;

  const isHabis = stokTersedia !== null && stokTersedia <= 0;

  const handlePilihVarian = (v) => {
    setVarianTerpilih(v);
    if (v.stok !== null && v.stok !== undefined) {
      if (jumlah > v.stok) {
        setJumlah(Math.max(1, v.stok));
      }
    }
  };

  const handleKurang = () => {
    if (jumlah > 1) {
      setJumlah(jumlah - 1);
    }
  };

  const handleTambah = () => {
    if (stokTersedia !== null && jumlah >= stokTersedia) {
      return;
    }
    setJumlah(jumlah + 1);
  };

  const handleUbahInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setJumlah(1);
    } else if (stokTersedia !== null && val > stokTersedia) {
      setJumlah(stokTersedia);
    } else {
      setJumlah(val);
    }
  };

  // Pesan WhatsApp otomatis sesuai varian, jumlah, dan total harga
  const namaVarian = varianTerpilih ? ` (Varian: ${varianTerpilih.nama_varian})` : "";
  const teksPesan = `Halo, saya ingin memesan ${produk.nama}${namaVarian} sebanyak ${jumlah} pcs seharga total ${formatRupiah(totalHarga)}.`;
  const hrefWhatsApp = `https://wa.me/${nomorWhatsApp}?text=${encodeURIComponent(teksPesan)}`;

  const catatKlik = () => {
    try {
      fetch("/api/catat-klik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produk_id: produk.id }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Abaikan agar pembukaan WhatsApp tidak terganggu
    }
  };

  return (
    <div className="flex flex-col gap-5 pt-2">
      {/* Label Harga Produk / Varian */}
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="rounded-md bg-harga-latar px-3 py-1 text-2xl font-bold text-harga">
          {formatRupiah(hargaSatuan)}
        </span>
        {daftarVarian.length > 0 && (
          <span className="text-xs text-teks-lembut">per unit pilihan</span>
        )}
      </div>

      {/* Pilihan Varian (jika tersedia data varian di Supabase) */}
      {daftarVarian.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-teks">Pilih Varian:</label>
          <div className="flex flex-wrap gap-2">
            {daftarVarian.map((v) => {
              const isSelected = varianTerpilih?.id === v.id;
              const habis = v.stok !== null && v.stok <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={habis}
                  onClick={() => handlePilihVarian(v)}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all focus:outline-none ${
                    isSelected
                      ? "border-utama bg-utama/10 font-bold text-utama ring-1 ring-utama"
                      : "border-garis bg-latar text-teks hover:border-utama/50"
                  } ${habis ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <span>{v.nama_varian}</span>
                  <span className="text-xs font-semibold text-teks-lembut">
                    ({formatRupiah(v.harga)})
                  </span>
                  {habis && (
                    <span className="rounded bg-bahaya/10 px-1.5 py-0.5 text-[10px] font-bold text-bahaya">
                      Habis
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Kontrol Jumlah (Quantity) & Validasi Stok */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-teks">Jumlah:</label>
          {stokTersedia !== null && (
            <span
              className={`text-xs font-semibold ${
                isHabis ? "text-bahaya" : "text-teks-lembut"
              }`}
            >
              {isHabis ? "Stok Habis" : `Sisa stok: ${stokTersedia}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-xl border border-garis bg-latar">
            <button
              type="button"
              onClick={handleKurang}
              disabled={jumlah <= 1 || isHabis}
              className="flex h-10 w-10 items-center justify-center text-lg font-bold text-teks transition-colors hover:bg-permukaan disabled:opacity-40"
              aria-label="Kurangi jumlah"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max={stokTersedia !== null ? stokTersedia : undefined}
              value={jumlah}
              onChange={handleUbahInput}
              disabled={isHabis}
              className="h-10 w-14 text-center font-bold text-teks focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label="Jumlah produk"
            />
            <button
              type="button"
              onClick={handleTambah}
              disabled={isHabis || (stokTersedia !== null && jumlah >= stokTersedia)}
              className="flex h-10 w-10 items-center justify-center text-lg font-bold text-teks transition-colors hover:bg-permukaan disabled:opacity-40"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>

          <div className="flex flex-col text-sm">
            <span className="text-xs text-teks-lembut">Total Harga:</span>
            <span className="text-lg font-extrabold text-utama">
              {formatRupiah(totalHarga)}
            </span>
          </div>
        </div>
      </div>

      {/* Tombol Pesan via WhatsApp */}
      <div className="pt-2">
        {isHabis ? (
          <button
            type="button"
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-garis px-5 py-3 font-semibold text-teks-lembut sm:w-auto"
          >
            Stok Habis
          </button>
        ) : (
          <a
            href={hrefWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={catatKlik}
            className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white transition-colors hover:bg-utama-gelap sm:w-auto"
          >
            Pesan via WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

