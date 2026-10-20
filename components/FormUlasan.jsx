"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { tambahUlasan } from "@/app/produk/actions";

export default function FormUlasan({ produkId }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const formRef = useRef(null);

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    return await tambahUlasan(prevState, formData);
  }, null);

  useEffect(() => {
    if (state?.sukses && formRef.current) {
      formRef.current.reset();
      setRating(5);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-garis bg-permukaan p-5 sm:p-6"
    >
      <div>
        <h3 className="text-lg font-bold">Beri Ulasan</h3>
        <p className="mt-0.5 text-xs text-teks-lembut">
          Bagikan pendapatmu tentang produk ini untuk membantu pembeli lain.
        </p>
      </div>

      {state?.error && (
        <div className="rounded-xl border border-garis bg-latar p-3 text-sm text-bahaya">
          {state.error}
        </div>
      )}

      {state?.sukses && (
        <div className="rounded-xl border border-garis bg-latar p-3 text-sm font-semibold text-utama">
          {state.pesan}
        </div>
      )}

      <input type="hidden" name="produk_id" value={produkId} />
      <input type="hidden" name="rating" value={rating} />
      {/* Honeypot untuk anti-spam */}
      <input type="text" name="website_url" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">Rating Bintang</span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const aktif = (hoverRating || rating) >= star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="cursor-pointer text-2xl transition-transform hover:scale-115 focus:outline-none"
                aria-label={`${star} bintang`}
              >
                <span className={aktif ? "text-amber-500" : "text-gray-300"}>★</span>
              </button>
            );
          })}
          <span className="ml-2 text-xs font-semibold text-teks-lembut">
            {rating} dari 5 bintang
          </span>
        </div>
      </div>

      <Input
        label="Nama"
        name="nama"
        placeholder="Tulis nama kamu"
        required
        maxLength={100}
      />

      <Input
        label="Ulasan"
        name="komentar"
        textarea
        placeholder="Tulis ulasan produk ini..."
        required
        maxLength={1000}
      />

      <div className="pt-1">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Mengirim..." : "Kirim ulasan"}
        </Tombol>
      </div>
    </form>
  );
}

