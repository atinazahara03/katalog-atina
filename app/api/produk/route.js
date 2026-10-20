import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const PER_HALAMAN = 12;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const halaman = Math.max(1, parseInt(searchParams.get("halaman") || "1", 10));
    const from = (halaman - 1) * PER_HALAMAN;
    const to = from + PER_HALAMAN - 1;

    const supabase = createServerClient();
    const { data, error, count } = await supabase
      .from("produk")
      .select("*", { count: "exact" })
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalProduk = count ?? 0;
    const totalHalaman = Math.ceil(totalProduk / PER_HALAMAN);

    return NextResponse.json({
      produk: data,
      halaman,
      totalHalaman,
      totalProduk,
      adaLagi: halaman < totalHalaman,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

