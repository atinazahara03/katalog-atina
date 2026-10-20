"use client";

import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  if (!produk) return null;

  const pesan = `Halo, saya ingin memesan ${produk.nama} seharga ${formatRupiah(produk.harga)}.`;
  const href = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

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
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={catatKlik}
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}
