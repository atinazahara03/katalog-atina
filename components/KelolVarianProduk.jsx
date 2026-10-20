"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { tambahVarian, hapusVarian } from "@/app/admin/produk/[id]/varian/actions";
import { formatRupiah } from "@/lib/format";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

export default function KelolVarianProduk({ produkId, varianAwal }) {
  const [daftarVarian, setDaftarVarian] = useState(varianAwal);
  const formRef = useRef(null);
  const [pesanHapus, setPesanHapus] = useState({});

  const tambahAction = tambahVarian.bind(null, produkId);
  const [state, formAction, isPending] = useActionState(async (_, formData) => {
    const result = await tambahAction(formData);
    return result;
  }, null);

  useEffect(() => {
    if (state?.sukses) {
      formRef.current?.reset();
      // Muat ulang halaman untuk refresh daftar varian
      window.location.reload();
    }
  }, [state]);

  const handleHapus = async (varianId) => {
    if (!confirm("Hapus varian ini?")) return;
    setPesanHapus((prev) => ({ ...prev, [varianId]: "Menghapus..." }));
    const result = await hapusVarian(varianId, produkId);
    if (result?.error) {
      setPesanHapus((prev) => ({ ...prev, [varianId]: result.error }));
    } else {
      setDaftarVarian((prev) => prev.filter((v) => v.id !== varianId));
      setPesanHapus((prev) => {
        const next = { ...prev };
        delete next[varianId];
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Daftar Varian Saat Ini */}
      <div>
        <h3 className="mb-3 text-base font-bold">Varian yang tersedia</h3>
        {daftarVarian.length === 0 ? (
          <p className="rounded-xl border border-dashed border-garis py-8 text-center text-sm text-teks-lembut">
            Belum ada varian untuk produk ini
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-garis">
            <table className="w-full text-left text-sm">
              <thead className="bg-permukaan text-teks-lembut">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama Varian</th>
                  <th className="px-4 py-3 font-semibold">Harga</th>
                  <th className="px-4 py-3 font-semibold">Stok</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {daftarVarian.map((v) => (
                  <tr key={v.id} className="border-t border-garis">
                    <td className="px-4 py-3 font-semibold">{v.nama_varian}</td>
                    <td className="px-4 py-3">{formatRupiah(v.harga)}</td>
                    <td className="px-4 py-3">
                      {v.stok !== null && v.stok !== undefined ? (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            v.stok <= 0
                              ? "bg-bahaya/10 text-bahaya"
                              : "bg-utama/10 text-utama"
                          }`}
                        >
                          {v.stok <= 0 ? "Habis" : `${v.stok} tersedia`}
                        </span>
                      ) : (
                        <span className="text-teks-lembut">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {pesanHapus[v.id] ? (
                        <span className="text-xs text-teks-lembut">{pesanHapus[v.id]}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleHapus(v.id)}
                          className="text-sm font-semibold text-bahaya hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Tambah Varian Baru */}
      <div>
        <h3 className="mb-3 text-base font-bold">Tambah varian baru</h3>
        <form ref={formRef} action={formAction} className="max-w-md">
          <div className="flex flex-col gap-4">
            {state?.error && (
              <div className="rounded-xl border border-garis bg-permukaan p-3 text-sm text-bahaya">
                {state.error}
              </div>
            )}
            <Input
              label="Nama varian (misal: Ukuran S, 250 g, Merah)"
              name="nama_varian"
              required
              placeholder="Contoh: Kemasan 250 g"
            />
            <Input
              label="Harga (Rp)"
              name="harga"
              type="number"
              min="0"
              required
              placeholder="Contoh: 45000"
            />
            <Input
              label="Stok (kosongkan jika tidak dibatasi)"
              name="stok"
              type="number"
              min="0"
              placeholder="Contoh: 20"
            />
            <div className="flex gap-3">
              <Tombol type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Tambah varian"}
              </Tombol>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

