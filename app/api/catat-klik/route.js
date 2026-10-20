import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const produkId = body?.produk_id;

    if (!produkId) {
      return NextResponse.json({ error: "produk_id wajib diisi" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("klik_pesan")
      .insert([{ produk_id: Number(produkId) }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sukses: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

