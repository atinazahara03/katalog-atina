import Link from "next/link";
import TombolTema from "@/components/TombolTema";
import { toko } from "@/lib/toko";

export default function Header() {
  return (
    <header className="border-b border-garis bg-latar transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama hover:opacity-90">
          {toko.nama}
        </Link>
        <div className="flex items-center gap-3">
          <TombolTema />
        </div>
      </div>
    </header>
  );
}
